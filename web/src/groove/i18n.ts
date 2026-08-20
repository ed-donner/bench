import type { MessageKey, TranslateFn } from "../shared/i18n";
import { filterLabel, highpassHz, lowpassHz } from "./filter";
import type { DrumLane, ParamSpec, UnitId } from "./types";
import { PATCH_IDS } from "./patches";

export type LabelContext = UnitId | "master";

const PARAM_LABEL: Record<string, MessageKey> = {
  kickTune: "groove.param.kickTune",
  kickDecay: "groove.param.kickDecay",
  kickPunch: "groove.param.punch",
  kickSub: "groove.param.kickSub",
  snareTune: "groove.param.snareTune",
  snareSnap: "groove.param.snareSnap",
  snareDecay: "groove.param.snareDecay",
  hatTone: "groove.param.hatTone",
  hatDecay: "groove.param.hatDecay",
  percTune: "groove.param.percTune",
  percDecay: "groove.param.percDecay",
  crush: "groove.param.crush",
  drive: "groove.param.drive",
  space: "groove.param.space",
  echo: "groove.param.echo",
  lvKick: "groove.param.lvKick",
  lvSnare: "groove.param.lvSnare",
  lvClap: "groove.param.lvClap",
  lvHat: "groove.param.lvHat",
  lvOhat: "groove.param.lvOhat",
  lvPerc: "groove.param.lvPerc",
  wave: "groove.param.wave",
  pw: "groove.param.width",
  sub: "groove.param.sub",
  cutoff: "groove.param.cutoff",
  reso: "groove.param.reso",
  env: "groove.param.envAmt",
  decay: "groove.param.decay",
  accent: "groove.param.accent",
  lfo: "groove.param.wobble",
  lfoRate: "groove.param.wobRate",
  glide: "groove.param.glide",
  voicing: "groove.param.voicing",
  detune: "groove.param.detune",
  width: "groove.param.width",
  attack: "groove.param.attack",
  release: "groove.param.release",
  motion: "groove.param.motion",
  rate: "groove.param.rate",
  shimmer: "groove.param.shimmer",
  tone: "groove.param.shape",
  sustain: "groove.param.sustain",
  vibrato: "groove.param.vibrato",
  vibRate: "groove.param.vibRate",
  filter: "groove.master.filterKnob",
  filterReso: "groove.param.filterReso",
  filterDrive: "groove.param.filterDrive",
  sweepDepth: "groove.param.sweepDepth",
  sweepBars: "groove.param.sweepLength",
  sweepShape: "groove.param.sweepShape",
  pump: "groove.param.pump",
  pumpTime: "groove.param.pumpTime",
  delaySteps: "groove.param.delay",
  delayFeedback: "groove.param.repeats",
  delayTone: "groove.param.delayTone",
  reverbSize: "groove.param.reverb",
  volume: "groove.master.vol",
  swing: "groove.transport.swing",
};

const SWEEP_LENGTH_KEYS = [
  "off",
  "1bar",
  "2bar",
  "4bar",
  "8bar",
  "16bar",
] as const;

const SWEEP_SHAPE_KEYS = ["rise", "fall", "tri", "sine"] as const;

const VOICING_KEYS = ["triad", "seventh", "ninth", "open", "lush"] as const;

const WAVE_KEYS: Record<string, MessageKey> = {
  SAW: "groove.param.wave.saw",
  SQUARE: "groove.param.wave.square",
  PULSE: "groove.param.wave.pulse",
  TRI: "groove.param.wave.tri",
  FM: "groove.param.wave.fm",
};

const UNIT_NAME: Record<UnitId, MessageKey> = {
  drums: "groove.unit.drums.name",
  bass: "groove.unit.bass.name",
  pads: "groove.unit.pads.name",
  lead: "groove.unit.lead.name",
};

const UNIT_MODEL: Record<UnitId, MessageKey> = {
  drums: "groove.unit.drums.model",
  bass: "groove.unit.bass.model",
  pads: "groove.unit.pads.model",
  lead: "groove.unit.lead.model",
};

const DRUM_LANE: Record<DrumLane, MessageKey> = {
  kick: "groove.drum.kick",
  snare: "groove.drum.snare",
  clap: "groove.drum.clap",
  hat: "groove.drum.hat",
  ohat: "groove.drum.ohat",
  perc: "groove.drum.perc",
};

const CHORD_KEY: Record<string, MessageKey> = {
  min: "groove.chord.min",
  maj: "groove.chord.maj",
  sus: "groove.chord.sus",
  dim: "groove.chord.dim",
  aug: "groove.chord.aug",
};

const MASTER_GROUP: Record<string, MessageKey> = {
  filter: "groove.masterGroup.filter",
  sweep: "groove.masterGroup.sweep",
  sidechain: "groove.masterGroup.sidechain",
  sendFx: "groove.masterGroup.sendFx",
};

function hz(v: number): string {
  if (v < 1000) return `${Math.round(v)}`;
  const decimals = v >= 10000 ? 0 : 1;
  return `${(v / 1000).toFixed(decimals)}k`;
}

/** User-facing filter readout; filterLabel() stays English for unit tests. */
export function filterDisplayLabel(t: TranslateFn, macro: number): string {
  if (macro < 0.485)
    return t("groove.filter.lowpass", { hz: hz(lowpassHz(macro)) });
  if (macro > 0.515)
    return t("groove.filter.highpass", { hz: hz(highpassHz(macro)) });
  return t("groove.filter.open");
}

export function paramLabel(
  t: TranslateFn,
  key: string,
  context?: LabelContext,
): string {
  if (key === "level") {
    return t(context === "drums" ? "groove.param.level" : "groove.param.lvl");
  }
  if (key === "space" && context && context !== "drums") {
    return t("groove.param.spc");
  }
  if (key === "drive" && context === "master") {
    return t("groove.param.glue");
  }
  return t(PARAM_LABEL[key] ?? (`groove.param.${key}` as MessageKey));
}

function formatSelectorOption(
  t: TranslateFn,
  spec: ParamSpec,
  index: number,
): string {
  const options = spec.options!;
  const opt = options[Math.round(index)] ?? options[0];
  if (spec.key === "wave") {
    return t(WAVE_KEYS[opt] ?? "groove.param.wave.saw");
  }
  if (spec.key === "voicing") {
    const voicingKey = VOICING_KEYS[Math.round(index)] ?? VOICING_KEYS[0];
    return t(`groove.voicing.${voicingKey}`);
  }
  if (spec.key === "sweepBars") {
    const lengthKey =
      SWEEP_LENGTH_KEYS[Math.round(index)] ?? SWEEP_LENGTH_KEYS[0];
    return t(`groove.sweep.length.${lengthKey}`);
  }
  if (spec.key === "sweepShape") {
    const shapeKey = SWEEP_SHAPE_KEYS[Math.round(index)] ?? SWEEP_SHAPE_KEYS[0];
    return t(`groove.sweep.shape.${shapeKey}`);
  }
  return opt;
}

export function formatParamValue(
  t: TranslateFn,
  spec: ParamSpec,
  value: number,
): string {
  if (spec.options) return formatSelectorOption(t, spec, value);
  if (spec.key === "filter" || spec.format === filterLabel) {
    return filterDisplayLabel(t, value);
  }
  if (spec.key === "delaySteps") {
    return t("groove.param.delayStepsFormat", { n: Math.round(value) });
  }
  if (spec.format) return spec.format(value);
  return value.toFixed(2);
}

export function unitName(t: TranslateFn, id: UnitId): string {
  return t(UNIT_NAME[id]);
}

export function unitModel(t: TranslateFn, id: UnitId): string {
  return t(UNIT_MODEL[id]);
}

export function drumLaneLabel(t: TranslateFn, lane: DrumLane): string {
  return t(DRUM_LANE[lane]);
}

export function chordLabel(t: TranslateFn, name: string): string {
  return t(CHORD_KEY[name] ?? (`groove.chord.${name}` as MessageKey));
}

export function masterGroupLabel(t: TranslateFn, id: string): string {
  return t(MASTER_GROUP[id] ?? (`groove.masterGroup.${id}` as MessageKey));
}

export function patchName(t: TranslateFn, index: number): string {
  const id = PATCH_IDS[index] ?? PATCH_IDS[0];
  return t(`groove.patch.${id}.name` as MessageKey);
}

export function patchSubtitle(t: TranslateFn, index: number): string {
  const id = PATCH_IDS[index] ?? PATCH_IDS[0];
  return t(`groove.patch.${id}.subtitle` as MessageKey);
}
