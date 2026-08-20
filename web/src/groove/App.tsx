import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DrumLane, MelodicStep, Patch, UnitId } from "./types";
import { UNIT_IDS } from "./types";
import { PATCHES, clonePatch } from "./patches";
import { Engine } from "./audio/engine";
import type { EngineState } from "./audio/engine";
import BenchNav from "../shared/BenchNav";
import { Transport } from "./components/Transport";
import { Unit } from "./components/Unit";
import { Master } from "./components/Master";

type MelodicId = "bass" | "pads" | "lead";

function setUnitParam(
  patch: Patch,
  unit: UnitId,
  key: string,
  v: number,
): Patch {
  switch (unit) {
    case "drums":
      return {
        ...patch,
        drums: { ...patch.drums, params: { ...patch.drums.params, [key]: v } },
      };
    case "bass":
      return {
        ...patch,
        bass: { ...patch.bass, params: { ...patch.bass.params, [key]: v } },
      };
    case "pads":
      return {
        ...patch,
        pads: { ...patch.pads, params: { ...patch.pads.params, [key]: v } },
      };
    case "lead":
      return {
        ...patch,
        lead: { ...patch.lead, params: { ...patch.lead.params, [key]: v } },
      };
  }
}

function setNoteStep(
  patch: Patch,
  unit: MelodicId,
  index: number,
  step: MelodicStep,
): Patch {
  const replace = (steps: MelodicStep[]) =>
    steps.map((s, i) => (i === index ? step : s));
  switch (unit) {
    case "bass":
      return {
        ...patch,
        bass: { ...patch.bass, steps: replace(patch.bass.steps) },
      };
    case "pads":
      return {
        ...patch,
        pads: { ...patch.pads, steps: replace(patch.pads.steps) },
      };
    case "lead":
      return {
        ...patch,
        lead: { ...patch.lead, steps: replace(patch.lead.steps) },
      };
  }
}

function setDrumStep(
  patch: Patch,
  lane: DrumLane,
  index: number,
  value: number,
): Patch {
  return {
    ...patch,
    drums: {
      ...patch.drums,
      steps: {
        ...patch.drums.steps,
        [lane]: patch.drums.steps[lane].map((v, i) =>
          i === index ? value : v,
        ),
      },
    },
  };
}

const NO_MUTES: Record<UnitId, boolean> = {
  drums: false,
  bass: false,
  pads: false,
  lead: false,
};

export default function App() {
  const [patches, setPatches] = useState<Patch[]>(() =>
    PATCHES.map(clonePatch),
  );
  const [index, setIndex] = useState(0);
  const [mutes, setMutes] = useState(NO_MUTES);
  const [volume, setVolume] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState(-1);
  const [engine, setEngine] = useState<Engine | null>(null);
  const [audioHint, setAudioHint] = useState(true);

  const patch = patches[index];
  const stateRef = useRef<EngineState>({ patch, mutes, volume });
  // The engine reads this on every audio tick. Written after the render rather than during it,
  // and declared before the effects below so they see the current value.
  useEffect(() => {
    stateRef.current = { patch, mutes, volume };
  });

  useEffect(() => {
    const e = new Engine(() => stateRef.current);
    e.onStep = setCurrent;
    setEngine(e);
  }, []);

  useEffect(() => {
    engine?.applyParams(stateRef.current);
  }, [engine, patch, mutes, volume]);

  const edit = useCallback(
    (fn: (p: Patch) => Patch) => {
      setPatches((prev) => prev.map((p, i) => (i === index ? fn(p) : p)));
    },
    [index],
  );

  const togglePlay = useCallback(async () => {
    if (!engine) return;
    await engine.resume();
    setAudioHint(false);
    if (engine.playing) {
      engine.stop();
      setPlaying(false);
    } else {
      engine.start();
      setPlaying(true);
    }
  }, [engine]);

  const onParam = useCallback(
    (unit: UnitId, key: string, value: number) =>
      edit((p) => setUnitParam(p, unit, key, value)),
    [edit],
  );

  const onMasterParam = useCallback(
    (key: string, value: number) =>
      edit((p) => ({ ...p, master: { ...p.master, [key]: value } })),
    [edit],
  );

  const onDrumStep = useCallback(
    (lane: DrumLane, i: number, value: number, audition: boolean) => {
      edit((p) => setDrumStep(p, lane, i, value));
      if (audition && value > 0) engine?.auditionDrum(lane, value === 2);
    },
    [edit, engine],
  );

  const onNoteStep = useCallback(
    (unit: MelodicId, i: number, step: MelodicStep) =>
      edit((p) => setNoteStep(p, unit, i, step)),
    [edit],
  );

  const onAudition = useCallback(
    (unit: MelodicId, step: MelodicStep) => engine?.auditionNote(unit, step),
    [engine],
  );

  const edited = useMemo(
    () => JSON.stringify(patch) !== JSON.stringify(PATCHES[index]),
    [patch, index],
  );

  const getFilter = useCallback(
    () => ({
      macro: engine?.playing
        ? engine.filterMacro
        : stateRef.current.patch.master.filter,
      reso: stateRef.current.patch.master.filterReso,
    }),
    [engine],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.code === "Space") {
        e.preventDefault();
        void togglePlay();
      } else if (e.key >= "1" && e.key <= "4") {
        setIndex(Number(e.key) - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [togglePlay]);

  return (
    <div className="app">
      <BenchNav active="groove" />
      <Transport
        patches={patches}
        index={index}
        onSelect={setIndex}
        playing={playing}
        onPlay={() => void togglePlay()}
        bpm={patch.bpm}
        onBpm={(v) => edit((p) => ({ ...p, bpm: v }))}
        swing={patch.swing}
        onSwing={(v) => edit((p) => ({ ...p, swing: v }))}
        current={current}
        edited={edited}
        onRevert={() => edit(() => clonePatch(PATCHES[index]))}
        audioHint={audioHint}
      />

      <main className="deck">
        <Unit
          id="drums"
          patch={patch}
          current={current}
          muted={mutes.drums}
          onMute={() => setMutes((m) => ({ ...m, drums: !m.drums }))}
          onParam={(k, v) => onParam("drums", k, v)}
          onDrumStep={onDrumStep}
          onNoteStep={() => undefined}
          onAudition={() => undefined}
        />
        {(UNIT_IDS.filter((u) => u !== "drums") as MelodicId[]).map((id) => (
          <Unit
            key={id}
            id={id}
            patch={patch}
            current={current}
            muted={mutes[id]}
            onMute={() => setMutes((m) => ({ ...m, [id]: !m[id] }))}
            onParam={(k, v) => onParam(id, k, v)}
            onDrumStep={() => undefined}
            onNoteStep={(i, step) => onNoteStep(id, i, step)}
            onAudition={(step) => onAudition(id, step)}
          />
        ))}
      </main>

      <Master
        params={patch.master}
        onParam={onMasterParam}
        volume={volume}
        onVolume={setVolume}
        analyser={engine?.analyser ?? null}
        getFilter={getFilter}
        liveFilter={
          playing
            ? (engine?.filterMacro ?? patch.master.filter)
            : patch.master.filter
        }
        sweepPhase={engine?.sweepPhase ?? 0}
      />
    </div>
  );
}
