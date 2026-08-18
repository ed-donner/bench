/**
 * The navigation strip, in every document. `app.crm` and its siblings are product names and read
 * the same in both languages; only Home is a word.
 */
export default {
  app: {
    home: "Home",
    crm: "CRM",
    space: "Space",
    rolodex: "Rolodex",
    groove: "Groove",
  },
  theme: {
    toLight: "Switch to light",
    toDark: "Switch to dark",
  },
  // The button always switches to the other language, so one key covers both directions: which
  // way it goes is already decided by the language you are reading it in.
  language: {
    switch: "Switch language to Spanish",
    code: "ES",
  },
};
