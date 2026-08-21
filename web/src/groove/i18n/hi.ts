import type { Messages } from "../../shared/i18n";

/** Formal Hindi (आप). Model codes and patch names stay as proper nouns. */
export const grooveHi: Messages = {
  "groove.brand.name": "GROOVEBOX",

  "groove.transport.play": "चलाएँ",
  "groove.transport.stop": "रोकें",
  "groove.transport.tempoDrag": "टेम्पो बदलने के लिए ऊपर/नीचे खींचें",
  "groove.transport.bpm": "BPM",
  "groove.transport.swing": "SWING",
  "groove.transport.step": "स्टेप",
  "groove.transport.spacebar": "स्पेसबार",
  "groove.transport.revert": "पुनर्स्थापित",
  "groove.transport.saved": "सहेजा",
  "groove.transport.revertTitle":
    "इस पैच को फ़ैक्टरी सेटिंग्स पर पुनर्स्थापित करें",
  "groove.transport.patchTitle": "{{name}} — {{subtitle}} (कुंजी {{key}})",

  "groove.unit.rhythm": "ताल",
  "groove.unit.bass": "बास",
  "groove.unit.pads": "पैड",
  "groove.unit.lead": "लीड",

  "groove.display.hits": "हिट",
  "groove.display.steps": "स्टेप",
  "groove.display.cutoff": "कटऑफ़",
  "groove.display.mute": "म्यूट",

  "groove.master.filter": "मास्टर फ़िल्टर",
  "groove.master.out": "आउट",
  "groove.master.sweepOff": "स्वीप बंद",
  "groove.master.vol": "VOL",

  "groove.scope.tag": "स्पेक्ट्रम · फ़िल्टर",

  "groove.velocity.caption": "वेग",
  "groove.velocity.drag": "प्रति-स्टेप गतिशीलता बनाने के लिए खींचें",

  "groove.lane.kick": "KICK",
  "groove.lane.snare": "SNARE",
  "groove.lane.clap": "CLAP",
  "groove.lane.hat": "C HAT",
  "groove.lane.ohat": "O HAT",
  "groove.lane.perc": "PERC",

  "groove.drum.step": "{{lane}} स्टेप {{step}}",
  "groove.drum.paintTitle":
    "विश्राम / हिट / एक्सेंट चक्रित करने के लिए क्लिक करें · पेंट करने के लिए खींचें",

  "groove.note.step": "{{unit}} स्टेप {{step}}",
  "groove.note.toggleTitle":
    "टॉगल करने के लिए क्लिक करें · पिच बदलने के लिए ऊपर/नीचे खींचें या स्क्रॉल करें",
  "groove.note.toggleChordTitle":
    "टॉगल करने के लिए क्लिक करें · पिच बदलने के लिए खींचें या स्क्रॉल करें · कॉर्ड बदलने के लिए शिफ्ट-क्लिक",

  "groove.knob.title":
    "{{label}} — ऊपर/नीचे खींचें, सूक्ष्म समायोजन के लिए शिफ्ट दबाएँ",
  "groove.fader.title": "{{label}} — ऊपर/नीचे खींचें",

  "groove.filter.open": "खुला",
  "groove.filter.lp": "LP",
  "groove.filter.hp": "HP",

  "groove.group.filter": "फ़िल्टर",
  "groove.group.sweep": "स्वीप",
  "groove.group.sidechain": "साइडचेन",
  "groove.group.sendFx": "SEND FX",

  "groove.param.kickTune": "KICK TUNE",
  "groove.param.kickDecay": "KICK DECAY",
  "groove.param.kickPunch": "PUNCH",
  "groove.param.kickSub": "KICK SUB",
  "groove.param.snareTune": "SNR TUNE",
  "groove.param.snareSnap": "SNR SNAP",
  "groove.param.snareDecay": "SNR DECAY",
  "groove.param.hatTone": "HAT TONE",
  "groove.param.hatDecay": "HAT DECAY",
  "groove.param.percTune": "PERC TUNE",
  "groove.param.percDecay": "PERC DECAY",
  "groove.param.crush": "CRUSH",
  "groove.param.drive": "DRIVE",
  "groove.param.space": "SPACE",
  "groove.param.echo": "ECHO",
  "groove.param.level": "LEVEL",
  "groove.param.lvKick": "BD",
  "groove.param.lvSnare": "SD",
  "groove.param.lvClap": "CP",
  "groove.param.lvHat": "CH",
  "groove.param.lvOhat": "OH",
  "groove.param.lvPerc": "PC",

  "groove.param.wave": "WAVE",
  "groove.param.pw": "WIDTH",
  "groove.param.sub": "SUB",
  "groove.param.cutoff": "CUTOFF",
  "groove.param.reso": "RESO",
  "groove.param.env": "ENV AMT",
  "groove.param.decay": "DECAY",
  "groove.param.accent": "ACCENT",
  "groove.param.lfo": "WOBBLE",
  "groove.param.lfoRate": "WOB RATE",
  "groove.param.glide": "GLIDE",
  "groove.param.lvl": "LVL",
  "groove.param.spc": "SPC",

  "groove.param.voicing": "VOICING",
  "groove.param.detune": "DETUNE",
  "groove.param.width": "WIDTH",
  "groove.param.attack": "ATTACK",
  "groove.param.release": "RELEASE",
  "groove.param.motion": "MOTION",
  "groove.param.rate": "RATE",
  "groove.param.shimmer": "SHIMMER",

  "groove.param.tone": "SHAPE",
  "groove.param.sustain": "SUSTAIN",
  "groove.param.vibrato": "VIBRATO",
  "groove.param.vibRate": "VIB RATE",

  "groove.param.filter": "FILTER",
  "groove.param.filterReso": "RESO",
  "groove.param.filterDrive": "BITE",
  "groove.param.sweepDepth": "DEPTH",
  "groove.param.sweepBars": "LENGTH",
  "groove.param.sweepShape": "SHAPE",
  "groove.param.pump": "PUMP",
  "groove.param.pumpTime": "RELEASE",
  "groove.param.delaySteps": "DELAY",
  "groove.param.delayFeedback": "REPEATS",
  "groove.param.delayTone": "TONE",
  "groove.param.reverbSize": "REVERB",
  "groove.param.glue": "GLUE",

  "groove.option.wave.saw": "SAW",
  "groove.option.wave.square": "SQUARE",
  "groove.option.wave.pulse": "PULSE",
  "groove.option.wave.tri": "TRI",
  "groove.option.wave.fm": "FM",

  "groove.option.voicing.triad": "TRIAD",
  "groove.option.voicing.seventh": "SEVENTH",
  "groove.option.voicing.ninth": "NINTH",
  "groove.option.voicing.open": "OPEN",
  "groove.option.voicing.lush": "LUSH",

  "groove.option.sweep.off": "OFF",
  "groove.option.sweep.1bar": "1 BAR",
  "groove.option.sweep.2bar": "2 BAR",
  "groove.option.sweep.4bar": "4 BAR",
  "groove.option.sweep.8bar": "8 BAR",
  "groove.option.sweep.16bar": "16 BAR",

  "groove.option.sweepShape.rise": "RISE",
  "groove.option.sweepShape.fall": "FALL",
  "groove.option.sweepShape.tri": "TRI",
  "groove.option.sweepShape.sine": "SINE",
};
