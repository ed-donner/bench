import { useCallback, useRef } from "react";
import { useT } from "../../shared/useLocale";
import { paramLabel, type LabelContext } from "../i18n";
import type { ParamSpec } from "../types";

interface Props {
  spec: ParamSpec;
  value: number;
  onChange: (v: number) => void;
  onTouch?: () => void;
  labelContext?: LabelContext;
}

export function Fader({ spec, value, onChange, onTouch, labelContext }: Props) {
  const t = useT();
  const label = paramLabel(t, spec.key, labelContext);
  const drag = useRef<{ y: number; start: number } | null>(null);
  const range = spec.max - spec.min;
  const norm = (value - spec.min) / range;

  const down = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      drag.current = { y: e.clientY, start: value };
      onTouch?.();
    },
    [value, onTouch],
  );

  const move = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const raw =
        d.start + ((d.y - e.clientY) / (e.shiftKey ? 500 : 150)) * range;
      onChange(Math.max(spec.min, Math.min(spec.max, raw)));
    },
    [onChange, range, spec.max, spec.min],
  );

  const up = useCallback(() => {
    drag.current = null;
  }, []);

  return (
    <div
      className="fader"
      title={t("groove.fader.title", { label })}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      <div className="fader-slot">
        <div className="fader-fill" style={{ height: `${norm * 100}%` }} />
        <div
          className="fader-cap"
          style={{ bottom: `calc(${norm * 100}% - 4px)` }}
        />
      </div>
      <span className="fader-label">{label}</span>
    </div>
  );
}
