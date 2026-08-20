import { useCallback, useRef } from "react";
import { useT } from "../../shared/useLocale";
import type { MelodicStep } from "../types";
import { STEPS } from "../types";
import { CHORD_SHAPES, clampNote, noteName } from "../music";

interface Props {
  unit: string;
  steps: MelodicStep[];
  current: number;
  showChord: boolean;
  onChange: (index: number, step: MelodicStep) => void;
  onAudition: (step: MelodicStep) => void;
}

export function NoteGrid({
  unit,
  steps,
  current,
  showChord,
  onChange,
  onAudition,
}: Props) {
  const t = useT("groove");
  const drag = useRef<{
    index: number;
    y: number;
    note: number;
    moved: boolean;
  } | null>(null);

  const down = useCallback(
    (e: React.PointerEvent, i: number) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      const step = steps[i];
      if (showChord && e.shiftKey) {
        const next = {
          ...step,
          on: true,
          chord: (step.chord + 1) % CHORD_SHAPES.length,
        };
        onChange(i, next);
        onAudition(next);
        return;
      }
      drag.current = { index: i, y: e.clientY, note: step.note, moved: false };
    },
    [steps, showChord, onChange, onAudition],
  );

  const move = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d || !steps[d.index].on) return;
      const semis = Math.round((d.y - e.clientY) / 8);
      const note = clampNote(d.note + semis);
      if (note === steps[d.index].note) return;
      d.moved = true;
      onChange(d.index, { ...steps[d.index], note });
    },
    [steps, onChange],
  );

  const up = useCallback(() => {
    const d = drag.current;
    drag.current = null;
    if (!d) return;
    const step = steps[d.index];
    if (d.moved) {
      onAudition(step);
      return;
    }
    const next = { ...step, on: !step.on };
    onChange(d.index, next);
    if (next.on) onAudition(next);
  }, [steps, onChange, onAudition]);

  const wheel = useCallback(
    (e: React.WheelEvent, i: number) => {
      const step = steps[i];
      if (!step.on) return;
      e.preventDefault();
      onChange(i, {
        ...step,
        note: clampNote(step.note + (e.deltaY < 0 ? 1 : -1)),
      });
    },
    [steps, onChange],
  );

  const padTitle = t("notePadHint") + (showChord ? t("notePadHintChord") : "");

  return (
    <div className="note-grid">
      {Array.from({ length: STEPS }, (_, i) => {
        const step = steps[i];
        return (
          <button
            key={i}
            type="button"
            className={`pad note-pad${step.on ? " on" : ""}${i === current ? " playing" : ""}${
              i % 4 === 0 ? " beat" : ""
            }`}
            aria-label={t.i("noteStepLabel", { unit, n: i + 1 })}
            aria-pressed={step.on}
            title={padTitle}
            onPointerDown={(e) => down(e, i)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            onWheel={(e) => wheel(e, i)}
          >
            <span className="note-name">
              {step.on ? noteName(step.note) : ""}
            </span>
            {showChord && (
              <span className="note-chord">
                {step.on ? CHORD_SHAPES[step.chord].name : ""}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
