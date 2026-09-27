import { useEffect, useRef, useState } from "react";
import type { DrumLane, DrumPattern } from "../types";
import { DRUM_LANES, STEPS } from "../types";
import { useT } from "../strings";

const LANE_LABEL: Record<DrumLane, string> = {
  kick: "KICK",
  snare: "SNARE",
  clap: "CLAP",
  hat: "C HAT",
  ohat: "O HAT",
  perc: "PERC",
};

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
      {DRUM_LANES.map((lane) => (
        <div className="drum-row" key={lane}>
          <span className="lane-name">{LANE_LABEL[lane]}</span>
          <div className="lane-steps">
            {Array.from({ length: STEPS }, (_, i) => {
              const v = pattern[lane][i];
              return (
                <button
                  key={i}
                  type="button"
                  className={`pad v${v}${i === current ? " playing" : ""}${i % 4 === 0 ? " beat" : ""}`}
                  aria-label={t("pad.step", {
                    unit: LANE_LABEL[lane],
                    step: i + 1,
                  })}
                  aria-pressed={v > 0}
                  title={t("pad.drumTip")}
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
      ))}
    </div>
  );
}
