import type { ParamSpec, UnitId } from "./types";
import { VOICINGS } from "./music";
import { filterLabel } from "./filter";

const pct = (v: number) => `${Math.round(v * 100)}`;

function knob(key: string, label: string, format = pct): ParamSpec {
  return { key, label, kind: "knob", min: 0, max: 1, format };
}

function slider(key: string, label: string): ParamSpec {
  return { key, label, kind: "slider", min: 0, max: 1, format: pct };
}

function selector(key: string, label: string, options: string[]): ParamSpec {
  return {
    key,
    label,
    kind: "knob",
    min: 0,
    max: options.length - 1,
    options,
    format: (v) => options[Math.round(v)] ?? options[0],
  };
}

const DRUMS: ParamSpec[] = [
  knob("kickTune", "KICK TUNE"),
  knob("kickDecay", "KICK DECAY"),
  knob("kickPunch", "PUNCH"),
  knob("kickSub", "KICK SUB"),
  knob("snareTune", "SNR TUNE"),
  knob("snareSnap", "SNR SNAP"),
  knob("snareDecay", "SNR DECAY"),
  knob("hatTone", "HAT TONE"),
  knob("hatDecay", "HAT DECAY"),
  knob("percTune", "PERC TUNE"),
  knob("percDecay", "PERC DECAY"),
  knob("crush", "CRUSH"),
  knob("drive", "DRIVE"),
  knob("space", "SPACE"),
  knob("echo", "ECHO"),
  knob("level", "LEVEL"),
  slider("lvKick", "BD"),
  slider("lvSnare", "SD"),
  slider("lvClap", "CP"),
  slider("lvHat", "CH"),
  slider("lvOhat", "OH"),
  slider("lvPerc", "PC"),
];

const BASS: ParamSpec[] = [
  selector("wave", "WAVE", ["SAW", "SQUARE", "PULSE"]),
  knob("pw", "WIDTH"),
  knob("sub", "SUB"),
  knob("cutoff", "CUTOFF"),
  knob("reso", "RESO"),
  knob("env", "ENV AMT"),
  knob("decay", "DECAY"),
  knob("accent", "ACCENT"),
  knob("lfo", "WOBBLE"),
  knob("lfoRate", "WOB RATE"),
  knob("glide", "GLIDE"),
  knob("drive", "DRIVE"),
  slider("level", "LVL"),
  slider("echo", "ECHO"),
  slider("space", "SPC"),
];

const PADS: ParamSpec[] = [
  selector("voicing", "VOICING", VOICINGS),
  knob("detune", "DETUNE"),
  knob("width", "WIDTH"),
  knob("cutoff", "CUTOFF"),
  knob("reso", "RESO"),
  knob("attack", "ATTACK"),
  knob("release", "RELEASE"),
  knob("motion", "MOTION"),
  knob("rate", "RATE"),
  knob("shimmer", "SHIMMER"),
  knob("sub", "SUB"),
  knob("drive", "DRIVE"),
  slider("level", "LVL"),
  slider("echo", "ECHO"),
  slider("space", "SPC"),
];

const LEAD: ParamSpec[] = [
  selector("wave", "WAVE", ["SAW", "PULSE", "TRI", "FM"]),
  knob("tone", "SHAPE"),
  knob("detune", "DETUNE"),
  knob("cutoff", "CUTOFF"),
  knob("reso", "RESO"),
  knob("env", "ENV AMT"),
  knob("decay", "DECAY"),
  knob("sustain", "SUSTAIN"),
  knob("vibrato", "VIBRATO"),
  knob("vibRate", "VIB RATE"),
  knob("glide", "GLIDE"),
  knob("drive", "DRIVE"),
  slider("level", "LVL"),
  slider("echo", "ECHO"),
  slider("space", "SPC"),
];

export const UNIT_PARAMS: Record<UnitId, ParamSpec[]> = {
  drums: DRUMS,
  bass: BASS,
  pads: PADS,
  lead: LEAD,
};

export const UNIT_META: Record<UnitId, { name: string; model: string }> = {
  drums: { name: "RHYTHM", model: "DR-16" },
  bass: { name: "BASS", model: "MB-1" },
  pads: { name: "PADS", model: "PX-4" },
  lead: { name: "LEAD", model: "LX-2" },
};

/** The hero control: a full-range DJ filter across the whole mix. */
export const FILTER_SPEC: ParamSpec = {
  key: "filter",
  label: "FILTER",
  kind: "knob",
  min: 0,
  max: 1,
  format: filterLabel,
};

export const MASTER_GROUPS: {
  id: string;
  /** English fallback for param specs / tests */
  title: string;
  specs: ParamSpec[];
}[] = [
  {
    id: "filter",
    title: "FILTER",
    specs: [knob("filterReso", "RESO"), knob("filterDrive", "BITE")],
  },
  {
    id: "sweep",
    title: "SWEEP",
    specs: [
      knob("sweepDepth", "DEPTH"),
      selector("sweepBars", "LENGTH", [
        "OFF",
        "1 BAR",
        "2 BAR",
        "4 BAR",
        "8 BAR",
        "16 BAR",
      ]),
      selector("sweepShape", "SHAPE", ["RISE", "FALL", "TRI", "SINE"]),
    ],
  },
  {
    id: "sidechain",
    title: "SIDECHAIN",
    specs: [knob("pump", "PUMP"), knob("pumpTime", "RELEASE")],
  },
  {
    id: "sendFx",
    title: "SEND FX",
    specs: [
      {
        key: "delaySteps",
        label: "DELAY",
        kind: "knob",
        min: 1,
        max: 8,
        integer: true,
        format: (v) => `${Math.round(v)}/16`,
      },
      {
        key: "delayFeedback",
        label: "REPEATS",
        kind: "knob",
        min: 0,
        max: 0.85,
        format: pct,
      },
      knob("delayTone", "TONE"),
      knob("reverbSize", "REVERB"),
      knob("drive", "GLUE"),
    ],
  },
];

export const MASTER_PARAMS: ParamSpec[] = [
  FILTER_SPEC,
  ...MASTER_GROUPS.flatMap((g) => g.specs),
];
