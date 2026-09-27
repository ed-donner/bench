/**
 * The panel's printed legends. They stay English in both languages, the way the legends on a
 * hardware groovebox do, and the internationalization plan scoped them out: unit and patch names
 * live in patches.ts and types.ts, and these are the rest. Everything else the instrument says -
 * buttons, tooltips, what a screen reader hears - is in locales/.
 */
export const LEGEND = {
  brand: "GROOVEBOX",
  model: "GX-4",
  bpm: "BPM",
  step: "STEP",
  sweepOff: "SWEEP OFF",
  masterFilter: "MASTER FILTER",
  out: "OUT",
  scope: "SPECTRUM · FILTER",
  velocity: "VELOCITY",
} as const;
