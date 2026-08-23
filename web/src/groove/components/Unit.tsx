import { useT } from "../../shared/useLocale";
import type { DrumLane, MelodicStep, Patch, UnitId } from "../types";
import { DRUM_LANES } from "../types";
import { UNIT_PARAMS } from "../params";
import { unitModel, unitName } from "../i18n";
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
  const t = useT();
  const { id, patch, current, muted, onMute, onParam } = props;
  const specs = UNIT_PARAMS[id];
  const params = patch[id].params;
  const readout = useReadout(id);

  const knobs = specs.filter((s) => s.kind === "knob");
  const faders = specs.filter((s) => s.kind === "slider");
  const hits = activeCount(patch, id);
  const idleLabel =
    id === "drums"
      ? t("groove.unit.display.hits")
      : t("groove.unit.display.steps");
  const idleValue =
    id === "drums" ? `${hits}` : t("groove.unit.display.stepsCount", { hits });

  return (
    <section
      className={`unit u-${id}${muted ? " muted" : ""}`}
      aria-label={unitName(t, id)}
    >
      <header className="unit-head">
        <span
          className={`sig-led${isHitting(patch, id, current) ? " on" : ""}`}
        />
        <span className="unit-name">{unitName(t, id)}</span>
        <span className="unit-model">{unitModel(t, id)}</span>
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
          {t("groove.unit.mute")}
        </button>
      </header>

      <div className="unit-controls">
        <div className="knob-bank">
          {knobs.map((spec) => (
            <Knob
              key={spec.key}
              spec={spec}
              value={params[spec.key]}
              labelContext={id}
              onChange={(v) => {
                onParam(spec.key, v);
                readout.show(spec, v);
              }}
            />
          ))}
        </div>
        <div className="fader-bank">
          {faders.map((spec) => (
            <Fader
              key={spec.key}
              spec={spec}
              value={params[spec.key]}
              labelContext={id}
              onChange={(v) => {
                onParam(spec.key, v);
                readout.show(spec, v);
              }}
            />
          ))}
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
              unit={unitName(t, id)}
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
