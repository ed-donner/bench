import type { ParamSpec, UnitId } from "./types";

function knob(
  key: string,
  labelKey: string,
  formatKind: ParamSpec["formatKind"] = "pct",
): ParamSpec {
  return { key, labelKey, kind: "knob", min: 0, max: 1, formatKind };
}

function slider(key: string, labelKey: string): ParamSpec {
  return { key, labelKey, kind: "slider", min: 0, max: 1, formatKind: "pct" };
}

function selector(
  key: string,
  labelKey: string,
  optionKeys: string[],
): ParamSpec {
  return {
    key,
    labelKey,
    kind: "knob",
    min: 0,
    max: optionKeys.length - 1,
    optionKeys,
  };
}

const WAVE_BASS = [
  "groove.option.wave.saw",
  "groove.option.wave.square",
  "groove.option.wave.pulse",
];

const WAVE_LEAD = [
  "groove.option.wave.saw",
  "groove.option.wave.pulse",
  "groove.option.wave.tri",
  "groove.option.wave.fm",
];

const VOICING_KEYS = [
  "groove.option.voicing.triad",
  "groove.option.voicing.seventh",
  "groove.option.voicing.ninth",
  "groove.option.voicing.open",
  "groove.option.voicing.lush",
];

const SWEEP_LENGTH = [
  "groove.option.sweep.off",
  "groove.option.sweep.1bar",
  "groove.option.sweep.2bar",
  "groove.option.sweep.4bar",
  "groove.option.sweep.8bar",
  "groove.option.sweep.16bar",
];

const SWEEP_SHAPE = [
  "groove.option.sweepShape.rise",
  "groove.option.sweepShape.fall",
  "groove.option.sweepShape.tri",
  "groove.option.sweepShape.sine",
];

const DRUMS: ParamSpec[] = [
  knob("kickTune", "groove.param.kickTune"),
  knob("kickDecay", "groove.param.kickDecay"),
  knob("kickPunch", "groove.param.kickPunch"),
  knob("kickSub", "groove.param.kickSub"),
  knob("snareTune", "groove.param.snareTune"),
  knob("snareSnap", "groove.param.snareSnap"),
  knob("snareDecay", "groove.param.snareDecay"),
  knob("hatTone", "groove.param.hatTone"),
  knob("hatDecay", "groove.param.hatDecay"),
  knob("percTune", "groove.param.percTune"),
  knob("percDecay", "groove.param.percDecay"),
  knob("crush", "groove.param.crush"),
  knob("drive", "groove.param.drive"),
  knob("space", "groove.param.space"),
  knob("echo", "groove.param.echo"),
  knob("level", "groove.param.level"),
  slider("lvKick", "groove.param.lvKick"),
  slider("lvSnare", "groove.param.lvSnare"),
  slider("lvClap", "groove.param.lvClap"),
  slider("lvHat", "groove.param.lvHat"),
  slider("lvOhat", "groove.param.lvOhat"),
  slider("lvPerc", "groove.param.lvPerc"),
];

const BASS: ParamSpec[] = [
  selector("wave", "groove.param.wave", WAVE_BASS),
  knob("pw", "groove.param.pw"),
  knob("sub", "groove.param.sub"),
  knob("cutoff", "groove.param.cutoff"),
  knob("reso", "groove.param.reso"),
  knob("env", "groove.param.env"),
  knob("decay", "groove.param.decay"),
  knob("accent", "groove.param.accent"),
  knob("lfo", "groove.param.lfo"),
  knob("lfoRate", "groove.param.lfoRate"),
  knob("glide", "groove.param.glide"),
  knob("drive", "groove.param.drive"),
  slider("level", "groove.param.lvl"),
  slider("echo", "groove.param.echo"),
  slider("space", "groove.param.spc"),
];

const PADS: ParamSpec[] = [
  selector("voicing", "groove.param.voicing", VOICING_KEYS),
  knob("detune", "groove.param.detune"),
  knob("width", "groove.param.width"),
  knob("cutoff", "groove.param.cutoff"),
  knob("reso", "groove.param.reso"),
  knob("attack", "groove.param.attack"),
  knob("release", "groove.param.release"),
  knob("motion", "groove.param.motion"),
  knob("rate", "groove.param.rate"),
  knob("shimmer", "groove.param.shimmer"),
  knob("sub", "groove.param.sub"),
  knob("drive", "groove.param.drive"),
  slider("level", "groove.param.lvl"),
  slider("echo", "groove.param.echo"),
  slider("space", "groove.param.spc"),
];

const LEAD: ParamSpec[] = [
  selector("wave", "groove.param.wave", WAVE_LEAD),
  knob("tone", "groove.param.tone"),
  knob("detune", "groove.param.detune"),
  knob("cutoff", "groove.param.cutoff"),
  knob("reso", "groove.param.reso"),
  knob("env", "groove.param.env"),
  knob("decay", "groove.param.decay"),
  knob("sustain", "groove.param.sustain"),
  knob("vibrato", "groove.param.vibrato"),
  knob("vibRate", "groove.param.vibRate"),
  knob("glide", "groove.param.glide"),
  knob("drive", "groove.param.drive"),
  slider("level", "groove.param.lvl"),
  slider("echo", "groove.param.echo"),
  slider("space", "groove.param.spc"),
];

export const UNIT_PARAMS: Record<UnitId, ParamSpec[]> = {
  drums: DRUMS,
  bass: BASS,
  pads: PADS,
  lead: LEAD,
};

export const UNIT_META: Record<UnitId, { nameKey: string; model: string }> = {
  drums: { nameKey: "groove.unit.rhythm", model: "DR-16" },
  bass: { nameKey: "groove.unit.bass", model: "MB-1" },
  pads: { nameKey: "groove.unit.pads", model: "PX-4" },
  lead: { nameKey: "groove.unit.lead", model: "LX-2" },
};

/** The hero control: a full-range DJ filter across the whole mix. */
export const FILTER_SPEC: ParamSpec = {
  key: "filter",
  labelKey: "groove.param.filter",
  kind: "knob",
  min: 0,
  max: 1,
  formatKind: "filter",
};

export const MASTER_GROUPS: { titleKey: string; specs: ParamSpec[] }[] = [
  {
    titleKey: "groove.group.filter",
    specs: [
      knob("filterReso", "groove.param.filterReso"),
      knob("filterDrive", "groove.param.filterDrive"),
    ],
  },
  {
    titleKey: "groove.group.sweep",
    specs: [
      knob("sweepDepth", "groove.param.sweepDepth"),
      selector("sweepBars", "groove.param.sweepBars", SWEEP_LENGTH),
      selector("sweepShape", "groove.param.sweepShape", SWEEP_SHAPE),
    ],
  },
  {
    titleKey: "groove.group.sidechain",
    specs: [
      knob("pump", "groove.param.pump"),
      knob("pumpTime", "groove.param.pumpTime"),
    ],
  },
  {
    titleKey: "groove.group.sendFx",
    specs: [
      {
        key: "delaySteps",
        labelKey: "groove.param.delaySteps",
        kind: "knob",
        min: 1,
        max: 8,
        integer: true,
        formatKind: "delay",
      },
      {
        key: "delayFeedback",
        labelKey: "groove.param.delayFeedback",
        kind: "knob",
        min: 0,
        max: 0.85,
        formatKind: "pct",
      },
      knob("delayTone", "groove.param.delayTone"),
      knob("reverbSize", "groove.param.reverbSize"),
      knob("drive", "groove.param.glue"),
    ],
  },
];

export const MASTER_PARAMS: ParamSpec[] = [
  FILTER_SPEC,
  ...MASTER_GROUPS.flatMap((g) => g.specs),
];
