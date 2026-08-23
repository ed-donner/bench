import { useEffect, useRef, useState } from "react";
import { useT } from "../../shared/useLocale";
import type { DrumLane, DrumPattern } from "../types";
import { DRUM_LANES, STEPS } from "../types";
import { drumLaneLabel } from "../i18n";

interface Props {
  pattern: DrumPattern;
  current: number;
  onSet: (
    lane: DrumLane,
    index: number,
    value: number,
    audition: boolean,
  ) => void;
}

export function DrumGrid({ pattern, current, onSet }: Props) {
  const t = useT();
  const paint = useRef<number | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const up = () => {
      paint.current = null;
      setDragging(false);
    };
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, []);

  return (
    <div className="drum-grid">
      {DRUM_LANES.map((lane) => {
        const laneLabel = drumLaneLabel(t, lane);
        return (
          <div className="drum-row" key={lane}>
            <span className="lane-name">{laneLabel}</span>
            <div className="lane-steps">
              {Array.from({ length: STEPS }, (_, i) => {
                const v = pattern[lane][i];
                return (
                  <button
                    key={i}
                    type="button"
                    className={`pad v${v}${i === current ? " playing" : ""}${i % 4 === 0 ? " beat" : ""}`}
                    aria-label={t("groove.drum.stepAria", {
                      lane: laneLabel,
                      step: i + 1,
                    })}
                    aria-pressed={v > 0}
                    title={t("groove.drum.stepTitle")}
                    onPointerDown={() => {
                      const next = (v + 1) % 3;
                      paint.current = next;
                      setDragging(true);
                      onSet(lane, i, next, true);
                    }}
                    onPointerEnter={() => {
                      if (dragging && paint.current !== null)
                        onSet(lane, i, paint.current, false);
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
