/**
 * Groove's prose only. The panel keeps its own language: knob and unit labels, waveform names,
 * note names and BPM read the same on a Spanish groovebox as on an English one, and translating
 * them would mean translating the instrument rather than the app around it.
 */
export default {
  step: "{{unit}} step {{index}}",
  tip: {
    tempo: "Drag up/down to change tempo",
    play: "Spacebar",
    revert: "Restore this patch to its factory settings",
    patch: "{{name}} — {{subtitle}} (key {{index}})",
    velocity: "Drag across to draw per-step dynamics",
    drumPad: "Click to cycle rest / hit / accent · drag across to paint",
    notePad: "Click to toggle · drag up/down or scroll to change pitch",
    notePadChord: " · shift-click to change chord",
    knob: "{{label}} — drag up/down, hold shift for fine",
    fader: "{{label}} — drag up/down",
  },
};
