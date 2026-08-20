import { useCallback, useRef } from "react";
import { useT } from "../../shared/useLocale";
import type { MelodicStep } from "../types";
import { STEPS } from "../types";

interface Props {
  steps: MelodicStep[];
  current: number;
  onChange: (index: number, step: MelodicStep) => void;
}

/** Draw per-step dynamics by dragging across the lane. Rests are left alone. */
export function VelocityLane({ steps, current, onChange }: Props) {
  const t = useT("groove");
  const ref = useRef<HTMLDivElement>(null);
  const painting = useRef(false);

  const apply = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const i = Math.floor(((clientX - r.left) / r.width) * STEPS);
      if (i < 0 || i >= STEPS || !steps[i].on) return;
      const vel = Math.max(0.15, Math.min(1, 1 - (clientY - r.top) / r.height));
      if (Math.abs(vel - steps[i].vel) < 0.005) return;
      onChange(i, { ...steps[i], vel });
    },
    [steps, onChange],
  );

  return (
    <div className="vel-lane">
      <span className="vel-caption">{t("velocity")}</span>
      <div
        ref={ref}
        className="vel-track"
        title={t("velocityHint")}
        onPointerDown={(e) => {
          e.preventDefault();
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
          painting.current = true;
          apply(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (painting.current) apply(e.clientX, e.clientY);
        }}
        onPointerUp={() => {
          painting.current = false;
        }}
        onPointerCancel={() => {
          painting.current = false;
        }}
      >
        {steps.map((step, i) => (
          <div key={i} className={`vel-slot${i % 4 === 0 ? " beat" : ""}`}>
            {step.on && (
              <div
                className={`vel-bar${i === current ? " playing" : ""}`}
                style={{ height: `${step.vel * 100}%` }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
