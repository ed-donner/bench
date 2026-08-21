export type UnitId = "drums" | "bass" | "pads" | "lead";

export const UNIT_IDS: UnitId[] = ["drums", "bass", "pads", "lead"];

export const DRUM_LANES = [
  "kick",
  "snare",
  "clap",
  "hat",
  "ohat",
  "perc",
] as const;
export type DrumLane = (typeof DRUM_LANES)[number];

/** 0 = off, 1 = normal, 2 = accent */
export type DrumPattern = Record<DrumLane, number[]>;

export interface MelodicStep {
  on: boolean;
  /** MIDI note number */
  note: number;
  /** index into CHORD_SHAPES, used by the pads unit only */
  chord: number;
  /** 0..1 */
  vel: number;
}

/** Flat bag of normalised control values, keyed by param spec id. */
export type Params = Record<string, number>;

export interface Patch {
  name: string;
  subtitle: string;
  bpm: number;
  swing: number;
  drums: { params: Params; steps: DrumPattern };
  bass: { params: Params; steps: MelodicStep[] };
  pads: { params: Params; steps: MelodicStep[] };
  lead: { params: Params; steps: MelodicStep[] };
  /** master filter, sidechain pump and send FX */
  master: Params;
}

/** Bar lengths selectable for the master filter sweep; index 0 disables it. */
export const SWEEP_BARS = [0, 1, 2, 4, 8, 16];

export interface ParamSpec {
  key: string;
  /** i18n key resolved to a display label in components */
  labelKey: string;
  /** knobs sit on the panel face, sliders in the mixer strip */
  kind: "knob" | "slider";
  min: number;
  max: number;
  /** discrete option i18n keys; when present the value is an index */
  optionKeys?: string[];
  /** resolved at render time for knobs and readouts */
  options?: string[];
  label?: string;
  /** snap to whole numbers without naming each position */
  integer?: boolean;
  /** how to format the value for the unit display */
  formatKind?: "pct" | "filter" | "delay";
  format?: (v: number) => string;
}

export const STEPS = 16;
