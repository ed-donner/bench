import type { DrumLane, MelodicStep, Patch, UnitId } from "../types";
import { DRUM_LANES } from "../types";
import { useT } from "../../shared/useLocale";
import { paramLabel, unitLabel } from "../i18n";
import { UNIT_META, UNIT_PARAMS } from "../params";
import { Knob } from "./Knob";
import { Fader } from "./Fader";
import { LedStrip } from "./LedStrip";
import { DrumGrid } from "./DrumGrid";
import { NoteGrid } from "./NoteGrid";
import { VelocityLane } from "./VelocityLane";
import { useReadout } from "./useReadout";

interface Props {
  id: UnitId;
  patch: Patch;
  current: number;
  muted: boolean;
  onMute: () => void;
  onParam: (key: string, value: number) => void;
  onDrumStep: (
    lane: DrumLane,
    index: number,
    value: number,
    audition: boolean,
  ) => void;
  onNoteStep: (index: number, step: MelodicStep) => void;
  onAudition: (step: MelodicStep) => void;
}

function activeCount(patch: Patch, id: UnitId): number {
  if (id === "drums") {
    return DRUM_LANES.reduce(
      (n, lane) => n + patch.drums.steps[lane].filter(Boolean).length,
      0,
    );
  }
  return patch[id].steps.filter((s) => s.on).length;
}

function isHitting(patch: Patch, id: UnitId, current: number): boolean {
  if (current < 0) return false;
  if (id === "drums")
    return DRUM_LANES.some((lane) => patch.drums.steps[lane][current] > 0);
  return patch[id].steps[current].on;
}

export function Unit(props: Props) {
  const { id, patch, current, muted, onMute, onParam } = props;
  const t = useT("groove");
  const meta = UNIT_META[id];
  const specs = UNIT_PARAMS[id];
  const params = patch[id].params;
  const readout = useReadout();
  const unitName = unitLabel(t, id);

  const knobs = specs.filter((s) => s.kind === "knob");
  const faders = specs.filter((s) => s.kind === "slider");
  const hits = activeCount(patch, id);
  const idleLabel = id === "drums" ? t("displayHits") : t("displaySteps");
  const idleValue = id === "drums" ? `${hits}` : `${hits}/16`;
  const labeled = (spec: (typeof specs)[number]) => ({
    ...spec,
    label: paramLabel(t, spec.key, spec.label),
  });

  return (
    <section
      className={`unit u-${id}${muted ? " muted" : ""}`}
      aria-label={unitName}
    >
      <header className="unit-head">
        <span
          className={`sig-led${isHitting(patch, id, current) ? " on" : ""}`}
        />
        <span className="unit-name">{unitName}</span>
        <span className="unit-model">{meta.model}</span>
        <div className="unit-display">
          <span className="disp-label">
            {readout.value ? readout.value.label : idleLabel}
          </span>
          <span className="disp-value">
            {readout.value ? readout.value.value : idleValue}
          </span>
        </div>
        <button
          type="button"
          className={`mute-btn${muted ? " active" : ""}`}
          onClick={onMute}
        >
          {t("mute")}
        </button>
      </header>

      <div className="unit-controls">
        <div className="knob-bank">
          {knobs.map((spec) => {
            const labeledSpec = labeled(spec);
            return (
              <Knob
                key={spec.key}
                spec={labeledSpec}
                value={params[spec.key]}
                onChange={(v) => {
                  onParam(spec.key, v);
                  readout.show(labeledSpec, v);
                }}
              />
            );
          })}
        </div>
        <div className="fader-bank">
          {faders.map((spec) => {
            const labeledSpec = labeled(spec);
            return (
              <Fader
                key={spec.key}
                spec={labeledSpec}
                value={params[spec.key]}
                onChange={(v) => {
                  onParam(spec.key, v);
                  readout.show(labeledSpec, v);
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="unit-seq">
        <LedStrip current={current} />
        {id === "drums" ? (
          <DrumGrid
            pattern={patch.drums.steps}
            current={current}
            onSet={props.onDrumStep}
          />
        ) : (
          <>
            <NoteGrid
              unit={unitName}
              steps={patch[id].steps}
              current={current}
              showChord={id === "pads"}
              onChange={props.onNoteStep}
              onAudition={props.onAudition}
            />
            <VelocityLane
              steps={patch[id].steps}
              current={current}
              onChange={props.onNoteStep}
            />
          </>
        )}
      </div>
    </section>
  );
}
