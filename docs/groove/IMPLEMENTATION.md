# Groove

A hardware-style groovebox at `/groove`. Four synth units share one transport, one tempo and a
16-step loop, through a master section with a DJ filter, sidechain and send FX.

**No backend, no database, no persistence.** Everything is synthesised live with the Web Audio API -
no samples, no audio libraries. Nothing here talks to the server.

- Source: `web/src/groove/` - `audio/`, `components/`, `patches.ts`, `params.ts`, `music.ts`
- Tests: `e2e/groove/instrument.spec.ts` only

## Structure

- `audio/engine.ts` - the clock and scheduler; `drums.ts`, `synths.ts`, `master.ts` build the graph.
- `components/Unit.tsx` - one unit: name, knobs, faders, sequencer. `UNIT_META` in `params.ts` names
  them: **RHYTHM** (DR-16), **BASS** (MB-1), **PADS** (PX-4), **LEAD** (LX-2).
- `components/DrumGrid.tsx` - six lanes (kick, snare, clap, closed hat, open hat, perc), each step
  cycling rest / hit / accent.
- `components/NoteGrid.tsx` - melodic steps; drag or scroll a step to change pitch, shift-click for
  chords on pads.
- `components/Transport.tsx` - brand, play/stop, tempo, swing, patch selector. The Bench nav strip
  sits above it as the first row of `.app`, and owns the amber line and the route home.
- `patches.ts` - four built-in patches, each with its own tempo and character.

## Accessibility, and why it matters here

Every sequencer cell used to share one accessible name from a `title` tooltip, leaving ~96 identical
buttons - unusable with assistive tech and impossible to target in a test.

Cells now carry a per-lane, per-step `aria-label` (`KICK step 3`, `BASS step 12`) plus
`aria-pressed`, and each unit is a named region (`RHYTHM`, `BASS`, `PADS`, `LEAD`). Keep that up if
you add controls: an unnamed control here is effectively invisible.

Note `getByRole` matches names as substrings, so `BASS step 1` also matches steps 10-16. Use
`exact: true`.

## What can and cannot be tested

The tests are **deliberately shallow and assert nothing about sound**. They cover: the four units
render, the transport starts and stops, the playhead advances, drum steps toggle, patches change the
tempo, a unit mutes, and nothing logs a console error.

- **The playhead LED is the proxy for "the clock is running"**: `.master-leds .led.on`, its index
  being `-1` when stopped. It is driven by the same transport that schedules the audio, so it proves
  the sequencer runs without reaching into the audio graph. **Read it by accumulating, not by
  sampling** - it is periodic at 134ms a step, and `expect.poll`'s 1s settled interval aliases
  against that badly enough to miss whole regions of the bar. See PROCESS.md.
- **Headless runs open no audio device**, so no test can hear a regression. Whether the kick punches,
  the filter sweep is musical, the sidechain pumps in time, or a patch has character is a manual
  check - see [../../e2e/EXPLORATORY.md](../../e2e/EXPLORATORY.md).
- Going deeper would mean exposing an audio-graph introspection hook so tests could assert on
  parameter values. That is an app change and a deliberate decision, not something to add casually.

**Driving Groove with a visible browser plays sound out loud.** Stop the transport before you walk
away.

## Two languages

What the player presses and what a screen reader hears is translated - PLAY/STOP, REVERT/SAVED,
MUTE, every tooltip, every pad's name (`KICK paso 3`). The printed legends are not, by design:
BPM, STEP, MASTER FILTER, SWEEP OFF, the knob labels, the GROOVEBOX GX-4 badge, and the unit and
patch names. The legends that were JSX text live in `web/src/groove/legends.ts`, so the
literal-text lint rule stays on for every component rather than exempting files. The instrument
e2e spec runs once per language.

## Related

- [REQUIREMENTS.md](./REQUIREMENTS.md) - the original product brief
- [INSTRUMENT.md](./INSTRUMENT.md) - the player's guide: what every control does
- [../PROJECT.md](../PROJECT.md), [../PROCESS.md](../PROCESS.md), [../STANDARDS.md](../STANDARDS.md)
