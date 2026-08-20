import type { DrumPattern, MelodicStep, Patch } from "./types";
import { STEPS } from "./types";
import { CHORD_SHAPES } from "./music";

const NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const FLATS: Record<string, string> = {
  Db: "C#",
  Eb: "D#",
  Gb: "F#",
  Ab: "G#",
  Bb: "A#",
};

function parseNote(token: string): number {
  const m = /^([A-G][#b]?)(-?\d)$/.exec(token);
  if (!m) throw new Error(`bad note: ${token}`);
  const letter = FLATS[m[1]] ?? m[1];
  return NAMES.indexOf(letter) + (Number(m[2]) + 1) * 12;
}

/** "X" = accent, "x" = hit, anything else = rest. */
function hit(char: string | undefined): number {
  if (char === "X") return 2;
  return char === "x" ? 1 : 0;
}

/** "!" plays the step hard, "~" plays it as a ghost note. */
function velocity(accent: boolean, ghost: boolean): number {
  if (accent) return 1;
  return ghost ? 0.42 : 0.76;
}

function row(spec: string): number[] {
  const chars = spec.replace(/\s+/g, "").split("");
  return Array.from({ length: STEPS }, (_, i) => hit(chars[i]));
}

function drums(spec: Record<keyof DrumPattern, string>): DrumPattern {
  return {
    kick: row(spec.kick),
    snare: row(spec.snare),
    clap: row(spec.clap),
    hat: row(spec.hat),
    ohat: row(spec.ohat),
    perc: row(spec.perc),
  };
}

/**
 * 16 whitespace-separated tokens: "." rests, "F#2" plays, "F#2!" accents,
 * "F#2~" ghosts, "C3:maj" picks a chord shape for the pad unit. Rests inherit
 * the last note so switching a step on always lands in key.
 */
function mel(spec: string): MelodicStep[] {
  const tokens = spec.trim().split(/\s+/);
  const steps: MelodicStep[] = [];
  let lastNote = 48;
  let lastChord = 0;
  for (let i = 0; i < STEPS; i++) {
    const token = tokens[i] ?? ".";
    if (token === ".") {
      steps.push({ on: false, note: lastNote, chord: lastChord, vel: 0.85 });
      continue;
    }
    const accent = token.endsWith("!");
    const ghost = token.endsWith("~");
    const [noteText, chordText] = token.replace(/[!~]$/, "").split(":");
    lastNote = parseNote(noteText);
    if (chordText) {
      const found = CHORD_SHAPES.findIndex((c) => c.name === chordText);
      lastChord = found < 0 ? 0 : found;
    }
    steps.push({
      on: true,
      note: lastNote,
      chord: lastChord,
      vel: velocity(accent, ghost),
    });
  }
  // A leading rest should inherit the loop's first real note, not the default.
  const first = steps.find((s) => s.on);
  if (first)
    for (const s of steps) if (!s.on && s.note === 48) s.note = first.note;
  return steps;
}

const NEON_RIVIERA: Patch = {
  name: "NEON RIVIERA",
  subtitle: "SYNTHWAVE · F MINOR",
  bpm: 112,
  swing: 0,
  master: {
    filter: 0.5,
    filterReso: 0.3,
    filterDrive: 0.2,
    sweepDepth: 0,
    sweepBars: 0,
    sweepShape: 0,
    pump: 0.22,
    pumpTime: 0.4,
    delaySteps: 3,
    delayFeedback: 0.36,
    delayTone: 0.55,
    reverbSize: 0.6,
    drive: 0.2,
  },
  drums: {
    params: {
      kickTune: 0.34,
      kickDecay: 0.52,
      kickPunch: 0.46,
      kickSub: 0.3,
      snareTune: 0.42,
      snareSnap: 0.5,
      snareDecay: 0.62,
      hatTone: 0.5,
      hatDecay: 0.3,
      percTune: 0.55,
      percDecay: 0.34,
      crush: 0,
      drive: 0.28,
      space: 0.42,
      echo: 0.08,
      level: 0.85,
      lvKick: 0.95,
      lvSnare: 0.62,
      lvClap: 0.7,
      lvHat: 0.5,
      lvOhat: 0.42,
      lvPerc: 0.4,
    },
    steps: drums({
      kick: "X . . . . . . . X . . x . . . .",
      snare: ". . . . X . . . . . . . X . . .",
      clap: ". . . . x . . . . . . . x . . x",
      hat: "X . x . X . x . X . x . X . x x",
      ohat: ". . . . . . x . . . . . . . x .",
      perc: ". . x . . . . . . . x . . . . .",
    }),
  },
  bass: {
    params: {
      wave: 0,
      pw: 0.3,
      sub: 0.55,
      cutoff: 0.32,
      reso: 0.28,
      env: 0.4,
      decay: 0.24,
      accent: 0.45,
      lfo: 0,
      lfoRate: 0.3,
      glide: 0.1,
      drive: 0.35,
      level: 0.82,
      echo: 0,
      space: 0.08,
    },
    steps: mel("F1! . F1~ . F1 . F2 C2~ Db1! . Db1~ . Db1 . Ab1 C2~"),
  },
  pads: {
    params: {
      voicing: 2,
      detune: 0.45,
      width: 0.6,
      cutoff: 0.52,
      reso: 0.16,
      attack: 0.22,
      release: 0.5,
      motion: 0.35,
      rate: 0.22,
      shimmer: 0.2,
      sub: 0.15,
      drive: 0.1,
      level: 0.6,
      echo: 0.12,
      space: 0.5,
    },
    steps: mel("F3:min . . . . . . . Db3:maj . . . . . . ."),
  },
  lead: {
    params: {
      wave: 0,
      tone: 0.4,
      detune: 0.4,
      cutoff: 0.6,
      reso: 0.22,
      env: 0.35,
      decay: 0.3,
      sustain: 0.2,
      vibrato: 0.12,
      vibRate: 0.35,
      glide: 0.06,
      drive: 0.2,
      level: 0.62,
      echo: 0.45,
      space: 0.3,
    },
    steps: mel(". . . . C5! . Ab4~ C5 Db5! . C5 . Ab4~ . G4 F4~"),
  },
};

const BASALT: Patch = {
  name: "BASALT",
  subtitle: "DARK TECHNO · A PHRYGIAN",
  bpm: 130,
  swing: 0,
  master: {
    filter: 0.5,
    filterReso: 0.42,
    filterDrive: 0.35,
    sweepDepth: 0.2,
    sweepBars: 3,
    sweepShape: 3,
    pump: 0.44,
    pumpTime: 0.26,
    delaySteps: 3,
    delayFeedback: 0.48,
    delayTone: 0.38,
    reverbSize: 0.42,
    drive: 0.34,
  },
  drums: {
    params: {
      kickTune: 0.2,
      kickDecay: 0.42,
      kickPunch: 0.62,
      kickSub: 0.45,
      snareTune: 0.6,
      snareSnap: 0.72,
      snareDecay: 0.3,
      hatTone: 0.62,
      hatDecay: 0.24,
      percTune: 0.72,
      percDecay: 0.2,
      crush: 0.18,
      drive: 0.55,
      space: 0.3,
      echo: 0.12,
      level: 0.88,
      lvKick: 1,
      lvSnare: 0.34,
      lvClap: 0.6,
      lvHat: 0.42,
      lvOhat: 0.5,
      lvPerc: 0.44,
    },
    steps: drums({
      kick: "X . . . X . . . X . . . X . . .",
      snare: ". . . . . . . . . . . . . . x .",
      clap: ". . . . x . . . . . . . x . . .",
      hat: ". . . x . . . x . . . x . . . x",
      ohat: ". . x . . . x . . . x . . . x .",
      perc: ". . . . . x . . . . . x . . . .",
    }),
  },
  bass: {
    params: {
      wave: 2,
      pw: 0.62,
      sub: 0.32,
      cutoff: 0.24,
      reso: 0.72,
      env: 0.72,
      decay: 0.16,
      accent: 0.7,
      lfo: 0,
      lfoRate: 0.5,
      glide: 0.34,
      drive: 0.55,
      level: 0.8,
      echo: 0.08,
      space: 0.05,
    },
    steps: mel("A1! . . A1~ A2 . A1~ C2 A1! . Bb1~ . A1 . E2 G1~"),
  },
  pads: {
    params: {
      voicing: 3,
      detune: 0.6,
      width: 0.75,
      cutoff: 0.3,
      reso: 0.3,
      attack: 0.4,
      release: 0.38,
      motion: 0.7,
      rate: 0.12,
      shimmer: 0,
      sub: 0.3,
      drive: 0.25,
      level: 0.46,
      echo: 0.1,
      space: 0.55,
    },
    steps: mel("A3:min . . . . . . . . . . . Bb3:maj . . ."),
  },
  lead: {
    params: {
      wave: 3,
      tone: 0.52,
      detune: 0.3,
      cutoff: 0.72,
      reso: 0.3,
      env: 0.5,
      decay: 0.12,
      sustain: 0,
      vibrato: 0,
      vibRate: 0.4,
      glide: 0,
      drive: 0.3,
      level: 0.5,
      echo: 0.62,
      space: 0.4,
    },
    steps: mel(". . E5! . . . A4~ . . . E5 . . Bb4! . ."),
  },
};

const SUNROOM: Patch = {
  name: "SUNROOM",
  subtitle: "LO-FI SOUL · C MINOR",
  bpm: 94,
  swing: 0.56,
  master: {
    filter: 0.47,
    filterReso: 0.16,
    filterDrive: 0.15,
    sweepDepth: 0,
    sweepBars: 0,
    sweepShape: 0,
    pump: 0.14,
    pumpTime: 0.5,
    delaySteps: 6,
    delayFeedback: 0.3,
    delayTone: 0.32,
    reverbSize: 0.78,
    drive: 0.16,
  },
  drums: {
    params: {
      kickTune: 0.5,
      kickDecay: 0.34,
      kickPunch: 0.24,
      kickSub: 0.5,
      snareTune: 0.3,
      snareSnap: 0.34,
      snareDecay: 0.5,
      hatTone: 0.34,
      hatDecay: 0.18,
      percTune: 0.3,
      percDecay: 0.4,
      crush: 0.42,
      drive: 0.14,
      space: 0.5,
      echo: 0.1,
      level: 0.8,
      lvKick: 0.86,
      lvSnare: 0.5,
      lvClap: 0.28,
      lvHat: 0.34,
      lvOhat: 0.3,
      lvPerc: 0.36,
    },
    steps: drums({
      kick: "X . . . . . x . . . X . . . . .",
      snare: ". . . . x . . . . . . . X . . x",
      clap: ". . . . . . . . . . . . x . . .",
      hat: "x . x x x . x . x . x x x . x .",
      ohat: ". . . . . . x . . . . . . . . .",
      perc: ". . x . . . . . . . x . . x . .",
    }),
  },
  bass: {
    params: {
      wave: 1,
      pw: 0.1,
      sub: 0.7,
      cutoff: 0.2,
      reso: 0.14,
      env: 0.26,
      decay: 0.34,
      accent: 0.3,
      lfo: 0,
      lfoRate: 0.2,
      glide: 0.18,
      drive: 0.12,
      level: 0.85,
      echo: 0,
      space: 0.1,
    },
    steps: mel("C2! . . C2~ . Eb2 . . Ab1! . . Ab1~ . Bb1 . G1~"),
  },
  pads: {
    params: {
      voicing: 4,
      detune: 0.3,
      width: 0.5,
      cutoff: 0.42,
      reso: 0.1,
      attack: 0.42,
      release: 0.66,
      motion: 0.22,
      rate: 0.1,
      shimmer: 0.35,
      sub: 0.2,
      drive: 0.08,
      level: 0.66,
      echo: 0.18,
      space: 0.68,
    },
    steps: mel("C3:min . . . . . . . Ab2:maj . . . . . . ."),
  },
  lead: {
    params: {
      wave: 2,
      tone: 0.24,
      detune: 0.25,
      cutoff: 0.5,
      reso: 0.12,
      env: 0.3,
      decay: 0.42,
      sustain: 0.3,
      vibrato: 0.28,
      vibRate: 0.28,
      glide: 0.12,
      drive: 0.08,
      level: 0.5,
      echo: 0.4,
      space: 0.55,
    },
    steps: mel(". . G4 . . Bb4~ . . C5! . . Bb4~ . G4 . Eb4~"),
  },
};

/**
 * Built around the master filter: an eight-bar triangle sweep closes the whole
 * mix down to a resonant hum and opens it back up, with a hard sidechain pump.
 */
const LATE_ORBIT: Patch = {
  name: "LATE ORBIT",
  subtitle: "FILTER HOUSE · F# MINOR",
  bpm: 126,
  swing: 0,
  master: {
    filter: 0.5,
    filterReso: 0.58,
    filterDrive: 0.4,
    sweepDepth: 0.44,
    sweepBars: 4,
    sweepShape: 2,
    pump: 0.66,
    pumpTime: 0.34,
    delaySteps: 3,
    delayFeedback: 0.42,
    delayTone: 0.5,
    reverbSize: 0.56,
    drive: 0.28,
  },
  drums: {
    params: {
      kickTune: 0.28,
      kickDecay: 0.4,
      kickPunch: 0.5,
      kickSub: 0.62,
      snareTune: 0.5,
      snareSnap: 0.62,
      snareDecay: 0.34,
      hatTone: 0.56,
      hatDecay: 0.2,
      percTune: 0.62,
      percDecay: 0.26,
      crush: 0.1,
      drive: 0.3,
      space: 0.34,
      echo: 0.14,
      level: 0.86,
      lvKick: 0.98,
      lvSnare: 0.3,
      lvClap: 0.66,
      lvHat: 0.4,
      lvOhat: 0.52,
      lvPerc: 0.4,
    },
    steps: drums({
      kick: "X . . . X . . . X . . . X . . .",
      snare: ". . . . . . . . . . . . . . . x",
      clap: ". . . . x . . . . . . . x . . .",
      hat: ". x . x . x . x . x . x . x . x",
      ohat: ". . x . . . x . . . x . . . x .",
      perc: ". . . . . . . x . . . . . . x .",
    }),
  },
  bass: {
    params: {
      wave: 0,
      pw: 0.35,
      sub: 0.62,
      cutoff: 0.3,
      reso: 0.4,
      env: 0.5,
      decay: 0.14,
      accent: 0.5,
      lfo: 0,
      lfoRate: 0.25,
      glide: 0.05,
      drive: 0.4,
      level: 0.84,
      echo: 0.05,
      space: 0.06,
    },
    steps: mel(". . F#1! F#1~ . . D1! D1~ . . A1! A1~ . . E1! E1~"),
  },
  pads: {
    params: {
      voicing: 1,
      detune: 0.62,
      width: 0.85,
      cutoff: 0.62,
      reso: 0.24,
      attack: 0.06,
      release: 0.34,
      motion: 0.18,
      rate: 0.16,
      shimmer: 0.28,
      sub: 0.12,
      drive: 0.22,
      level: 0.62,
      echo: 0.16,
      space: 0.42,
    },
    steps: mel("F#3:min . . . D3:maj . . . A3:maj . . . E3:maj . . ."),
  },
  lead: {
    params: {
      wave: 1,
      tone: 0.3,
      detune: 0.35,
      cutoff: 0.66,
      reso: 0.34,
      env: 0.44,
      decay: 0.1,
      sustain: 0,
      vibrato: 0,
      vibRate: 0.3,
      glide: 0,
      drive: 0.24,
      level: 0.52,
      echo: 0.5,
      space: 0.36,
    },
    steps: mel(
      "F#4! A4 C#5 A4~ D4! F#4 A4 F#4~ A4! C#5 E5 C#5~ E4! G#4 B4 G#4~",
    ),
  },
};

export const PATCH_IDS = [
  "neonRiviera",
  "basalt",
  "sunroom",
  "lateOrbit",
] as const;

export const PATCHES: Patch[] = [NEON_RIVIERA, BASALT, SUNROOM, LATE_ORBIT];

export function clonePatch(p: Patch): Patch {
  return structuredClone(p);
}
