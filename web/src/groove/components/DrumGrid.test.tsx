import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DrumGrid } from "./DrumGrid";
import { DRUM_LANES, STEPS, type DrumPattern } from "../types";
import { renderGroove } from "../test/render";

function emptyPattern(): DrumPattern {
  return Object.fromEntries(
    DRUM_LANES.map((lane) => [lane, Array<number>(STEPS).fill(0)]),
  ) as DrumPattern;
}

function renderGrid(pattern = emptyPattern(), current = -1) {
  const onSet = vi.fn();
  const view = renderGroove(
    <DrumGrid pattern={pattern} current={current} onSet={onSet} />,
  );
  const show = (next: DrumPattern) =>
    view.rerender(<DrumGrid pattern={next} current={current} onSet={onSet} />);
  return { onSet, show };
}

const step = (name: string) => screen.getByRole("button", { name });

/** The grid is controlled, so a new value only reaches it as a new pattern prop. */
function withKick(value: number): DrumPattern {
  const pattern = emptyPattern();
  pattern.kick[0] = value;
  return pattern;
}

describe("DrumGrid", () => {
  it("cycles rest, hit, accent and back on each click", async () => {
    const { onSet, show } = renderGrid();

    await userEvent.click(step("Kick step 1"));
    expect(onSet).toHaveBeenLastCalledWith("kick", 0, 1, true);

    show(withKick(1));
    await userEvent.click(step("Kick step 1"));
    expect(onSet).toHaveBeenLastCalledWith("kick", 0, 2, true);

    show(withKick(2));
    await userEvent.click(step("Kick step 1"));
    expect(onSet).toHaveBeenLastCalledWith("kick", 0, 0, true);
  });

  it("reports pressed state from the pattern, not from clicks", () => {
    const pattern = emptyPattern();
    pattern.snare[3] = 2;
    renderGrid(pattern);

    expect(step("Snare step 4")).toHaveAttribute("aria-pressed", "true");
    expect(step("Snare step 5")).toHaveAttribute("aria-pressed", "false");
  });

  it("paints the held value across steps dragged over, without auditioning", async () => {
    const { onSet } = renderGrid();
    await userEvent.pointer([
      { target: step("C hat step 1"), keys: "[MouseLeft>]" },
      { target: step("C hat step 2") },
      { target: step("C hat step 3") },
    ]);

    expect(onSet).toHaveBeenNthCalledWith(1, "hat", 0, 1, true);
    expect(onSet).toHaveBeenNthCalledWith(2, "hat", 1, 1, false);
    expect(onSet).toHaveBeenNthCalledWith(3, "hat", 2, 1, false);
  });

  it("stops painting once the pointer is released", async () => {
    const { onSet } = renderGrid();
    await userEvent.pointer([
      { target: step("Perc step 1"), keys: "[MouseLeft>]" },
      { keys: "[/MouseLeft]" },
    ]);
    onSet.mockClear();

    await userEvent.hover(step("Perc step 2"));
    expect(onSet).not.toHaveBeenCalled();
  });

  it("labels every lane and step", () => {
    renderGrid();
    expect(screen.getAllByRole("button")).toHaveLength(
      DRUM_LANES.length * STEPS,
    );
    expect(step("C hat step 16")).toBeInTheDocument();
  });
});
