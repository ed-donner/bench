import { useCallback, useEffect, useRef, useState } from "react";
import type { ResolvedParamSpec } from "../i18n/resolve";

export interface Readout {
  value: { label: string; value: string } | null;
  show: (spec: ResolvedParamSpec, v: number) => void;
}

/** Shows the last touched control on a panel display, then fades back. */
export function useReadout(holdMs = 1600): Readout {
  const [value, setValue] = useState<{ label: string; value: string } | null>(
    null,
  );
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = useCallback(
    (spec: ResolvedParamSpec, v: number) => {
      setValue({
        label: spec.label,
        value: spec.format(v),
      });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setValue(null), holdMs);
    },
    [holdMs],
  );

  return { value, show };
}
