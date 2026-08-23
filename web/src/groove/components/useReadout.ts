import { useCallback, useEffect, useRef, useState } from "react";
import { useT } from "../../shared/useLocale";
import { formatParamValue, paramLabel, type LabelContext } from "../i18n";
import type { ParamSpec } from "../types";

export interface Readout {
  value: { label: string; value: string } | null;
  show: (spec: ParamSpec, v: number) => void;
}

/** Shows the last touched control on a panel display, then fades back. */
export function useReadout(context?: LabelContext, holdMs = 1600): Readout {
  const t = useT();
  const [value, setValue] = useState<{ label: string; value: string } | null>(
    null,
  );
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const show = useCallback(
    (spec: ParamSpec, v: number) => {
      setValue({
        label: paramLabel(t, spec.key, context),
        value: formatParamValue(t, spec, v),
      });
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setValue(null), holdMs);
    },
    [context, holdMs, t],
  );

  return { value, show };
}
