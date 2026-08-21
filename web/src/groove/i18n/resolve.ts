import { filterLabel } from "../filter";
import type { ParamSpec } from "../types";

const pct = (v: number) => `${Math.round(v * 100)}`;

export type ResolvedParamSpec = ParamSpec & {
  label: string;
  format: (v: number) => string;
};

/** Turn a param spec's i18n keys into display strings for the current locale. */
export function resolveSpec(
  spec: ParamSpec,
  t: (key: string, vars?: Record<string, string | number>) => string,
): ResolvedParamSpec {
  const label = t(spec.labelKey);

  if (spec.optionKeys) {
    const options = spec.optionKeys.map((k) => t(k));
    return {
      ...spec,
      label,
      options,
      format: (v) => options[Math.round(v)] ?? options[0],
    };
  }

  let format: (v: number) => string;
  switch (spec.formatKind) {
    case "filter":
      format = (v) => filterLabel(v, t);
      break;
    case "delay":
      format = (v) => `${Math.round(v)}/16`;
      break;
    case "pct":
    default:
      format = pct;
      break;
  }

  return { ...spec, label, format };
}
