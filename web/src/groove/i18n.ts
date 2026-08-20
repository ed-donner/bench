import type { MessageKey } from "../shared/locales";
import type { DrumLane, UnitId } from "./types";

export interface GrooveT {
  (key: MessageKey<"groove">): string;
  i: (
    key: MessageKey<"groove">,
    vars: Record<string, string | number>,
  ) => string;
}

const UNIT_NAME_KEYS: Record<UnitId, MessageKey<"groove">> = {
  drums: "unitRhythm",
  bass: "unitBass",
  pads: "unitPads",
  lead: "unitLead",
};

/** Panel header name for each synth unit. */
export function unitLabel(t: GrooveT, unit: UnitId): string {
  return t(UNIT_NAME_KEYS[unit]);
}

/** Technical param labels stay English in every locale. */
const PARAM_LABELS: Record<string, string> = {
  kickTune: "KICK TUNE",
  kickDecay: "KICK DECAY",
  kickPunch: "PUNCH",
  kickSub: "KICK SUB",
  snareTune: "SNR TUNE",
  snareSnap: "SNR SNAP",
  snareDecay: "SNR DECAY",
  hatTone: "HAT TONE",
  hatDecay: "HAT DECAY",
  percTune: "PERC TUNE",
  percDecay: "PERC DECAY",
  crush: "CRUSH",
  drive: "DRIVE",
  glue: "GLUE",
  space: "SPACE",
  echo: "ECHO",
  level: "LEVEL",
  lvKick: "BD",
  lvSnare: "SD",
  lvClap: "CP",
  lvHat: "CH",
  lvOhat: "OH",
  lvPerc: "PC",
  wave: "WAVE",
  pw: "WIDTH",
  sub: "SUB",
  cutoff: "CUTOFF",
  reso: "RESO",
  env: "ENV AMT",
  decay: "DECAY",
  accent: "ACCENT",
  lfo: "WOBBLE",
  lfoRate: "WOB RATE",
  glide: "GLIDE",
  voicing: "VOICING",
  detune: "DETUNE",
  width: "WIDTH",
  attack: "ATTACK",
  release: "RELEASE",
  motion: "MOTION",
  rate: "RATE",
  shimmer: "SHIMMER",
  tone: "SHAPE",
  sustain: "SUSTAIN",
  vibrato: "VIBRATO",
  vibRate: "VIB RATE",
  filter: "FILTER",
  filterReso: "RESO",
  filterDrive: "BITE",
  sweepDepth: "DEPTH",
  sweepBars: "LENGTH",
  sweepShape: "SHAPE",
  pump: "PUMP",
  pumpTime: "RELEASE",
  delaySteps: "DELAY",
  delayFeedback: "REPEATS",
  delayTone: "TONE",
  reverbSize: "REVERB",
  volume: "VOL",
  swing: "SWING",
};

export function paramLabel(
  _t: GrooveT,
  key: string,
  fallback?: string,
): string {
  if (fallback !== undefined) return fallback;
  return PARAM_LABELS[key] ?? key.toUpperCase();
}

const MASTER_GROUP_KEYS = {
  filter: "masterGroupFilter",
  sweep: "masterGroupSweep",
  sidechain: "masterGroupSidechain",
  sendFx: "masterGroupSendFx",
} as const satisfies Record<string, MessageKey<"groove">>;

export type MasterGroupKey = keyof typeof MASTER_GROUP_KEYS;

export function masterGroupLabel(t: GrooveT, group: MasterGroupKey): string {
  return t(MASTER_GROUP_KEYS[group]);
}

const DRUM_LANE_KEYS: Record<DrumLane, MessageKey<"groove">> = {
  kick: "drumLaneKick",
  snare: "drumLaneSnare",
  clap: "drumLaneClap",
  hat: "drumLaneHat",
  ohat: "drumLaneOhat",
  perc: "drumLanePerc",
};

export function drumLaneLabel(t: GrooveT, lane: DrumLane): string {
  return t(DRUM_LANE_KEYS[lane]);
}
