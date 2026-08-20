import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NoteGrid } from "./NoteGrid";
import { STEPS, type MelodicStep } from "../types";
import { CHORD_SHAPES, noteName } from "../music";
import { renderGroove } from "../test/render";

function melodic(partial: Partial<MelodicStep> = {}): MelodicStep {
  return { on: false, note: 60, chord: 0, vel: 0.8, ...partial };
}

function renderGrid(steps: MelodicStep[], showChord = false) {
  const onChange = vi.fn();
  const onAudition = vi.fn();
  renderGroove(
    <NoteGrid
      unit="BASS"
      steps={steps}
      current={-1}
      showChord={showChord}
      onChange={onChange}
      onAudition={onAudition}
    />,
  );
  return { onChange, onAudition };
}

const restSteps = () => Array.from({ length: STEPS }, () => melodic());

const pad = (n: number) =>
  screen.getByRole("button", { name: `BASS step ${n}` });

describe("NoteGrid", () => {
  it("toggles a rest on and auditions it", async () => {
    const { onChange, onAudition } = renderGrid(restSteps());
    await userEvent.click(pad(1));

    expect(onChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ on: true }),
    );
    expect(onAudition).toHaveBeenCalledWith(
      expect.objectContaining({ on: true }),
    );
  });

  it("toggles a live step off without auditioning it", async () => {
    const steps = restSteps();
    steps[2] = melodic({ on: true });
    const { onChange, onAudition } = renderGrid(steps);
    await userEvent.click(pad(3));

    expect(onChange).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ on: false }),
    );
    expect(onAudition).not.toHaveBeenCalled();
  });

  it("drags pitch a semitone per 8 pixels and auditions on release", async () => {
    const steps = restSteps();
    steps[0] = melodic({ on: true, note: 60 });
    const { onChange, onAudition } = renderGrid(steps);

    await userEvent.pointer([
      { target: pad(1), coords: { clientY: 100 }, keys: "[MouseLeft>]" },
      { target: pad(1), coords: { clientY: 76 } },
      { keys: "[/MouseLeft]" },
    ]);

    expect(onChange).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ note: 63 }),
    );
    expect(onAudition).toHaveBeenCalledOnce();
  });

  it("leaves a rest's pitch alone while dragging", async () => {
    const { onChange } = renderGrid(restSteps());
    await userEvent.pointer([
      { target: pad(1), coords: { clientY: 100 }, keys: "[MouseLeft>]" },
      { target: pad(1), coords: { clientY: 60 } },
    ]);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("scrolls pitch up and down on a live step only", async () => {
    const steps = restSteps();
    steps[1] = melodic({ on: true, note: 60 });
    const { onChange } = renderGrid(steps);

    await userEvent.pointer({ target: pad(2) });
    pad(2).dispatchEvent(
      new WheelEvent("wheel", { deltaY: -1, bubbles: true, cancelable: true }),
    );
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ note: 61 }),
    );

    pad(2).dispatchEvent(
      new WheelEvent("wheel", { deltaY: 1, bubbles: true, cancelable: true }),
    );
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ note: 59 }),
    );

    onChange.mockClear();
    pad(1).dispatchEvent(
      new WheelEvent("wheel", { deltaY: -1, bubbles: true, cancelable: true }),
    );
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shift-clicking cycles the chord, but only where chords are shown", async () => {
    const steps = restSteps();
    steps[0] = melodic({ on: true, chord: 0 });
    const { onChange, onAudition } = renderGrid(steps, true);

    const user = userEvent.setup();
    await user.keyboard("{Shift>}");
    await user.pointer({ target: pad(1), keys: "[MouseLeft]" });
    await user.keyboard("{/Shift}");

    expect(onChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ chord: 1, on: true }),
    );
    expect(onAudition).toHaveBeenCalled();
  });

  it("names the note and chord on live steps only", () => {
    const steps = restSteps();
    steps[0] = melodic({ on: true, note: 62, chord: 2 });
    renderGrid(steps, true);

    expect(pad(1)).toHaveTextContent(noteName(62));
    expect(pad(1)).toHaveTextContent(CHORD_SHAPES[2].name);
    expect(pad(2)).toHaveTextContent("");
  });

  it("marks live steps as pressed", () => {
    const steps = restSteps();
    steps[4] = melodic({ on: true });
    renderGrid(steps);
    expect(pad(5)).toHaveAttribute("aria-pressed", "true");
    expect(pad(6)).toHaveAttribute("aria-pressed", "false");
  });
});
