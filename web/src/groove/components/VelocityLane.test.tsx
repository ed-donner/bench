import { beforeEach, describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { VelocityLane } from "./VelocityLane";
import { STEPS, type MelodicStep } from "../types";
import { renderWithLocale } from "../i18n/test-utils";

const WIDTH = 320;
const HEIGHT = 100;

function melodic(partial: Partial<MelodicStep> = {}): MelodicStep {
  return { on: false, note: 60, chord: 0, vel: 0.5, ...partial };
}

beforeEach(() => {
  // jsdom lays nothing out, so the lane would be zero-wide and every step index would be NaN.
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    left: 0,
    top: 0,
    width: WIDTH,
    height: HEIGHT,
    right: WIDTH,
    bottom: HEIGHT,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  });
});

function renderLane(steps: MelodicStep[]) {
  const onChange = vi.fn();
  const { container } = renderWithLocale(
    <VelocityLane steps={steps} current={-1} onChange={onChange} />,
  );
  return { onChange, track: container.querySelector(".vel-track")! };
}

/** clientX for the middle of a given step index. */
const xOf = (index: number) => (index + 0.5) * (WIDTH / STEPS);

const liveSteps = () =>
  Array.from({ length: STEPS }, () => melodic({ on: true }));

describe("VelocityLane", () => {
  it("sets velocity from the height of the click", async () => {
    const { onChange, track } = renderLane(liveSteps());
    await userEvent.pointer({
      target: track,
      coords: { clientX: xOf(1), clientY: 20 },
      keys: "[MouseLeft>]",
    });

    expect(onChange).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ vel: 0.8 }),
    );
  });

  it("floors velocity at 0.15 rather than silencing a step", async () => {
    const { onChange, track } = renderLane(liveSteps());
    await userEvent.pointer({
      target: track,
      coords: { clientX: xOf(0), clientY: 200 },
      keys: "[MouseLeft>]",
    });

    expect(onChange).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ vel: 0.15 }),
    );
  });

  it("leaves rests alone", async () => {
    const steps = liveSteps();
    steps[3] = melodic({ on: false });
    const { onChange, track } = renderLane(steps);
    await userEvent.pointer({
      target: track,
      coords: { clientX: xOf(3), clientY: 20 },
      keys: "[MouseLeft>]",
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("paints across steps while held and stops on release", async () => {
    const { onChange, track } = renderLane(liveSteps());
    await userEvent.pointer([
      {
        target: track,
        coords: { clientX: xOf(0), clientY: 20 },
        keys: "[MouseLeft>]",
      },
      { target: track, coords: { clientX: xOf(1), clientY: 30 } },
      { keys: "[/MouseLeft]" },
    ]);
    expect(onChange).toHaveBeenCalledTimes(2);
    expect(onChange).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ vel: 0.7 }),
    );

    onChange.mockClear();
    await userEvent.pointer({
      target: track,
      coords: { clientX: xOf(2), clientY: 40 },
    });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("ignores a move that lands on the same velocity", async () => {
    const steps = liveSteps();
    steps[0] = melodic({ on: true, vel: 0.8 });
    const { onChange, track } = renderLane(steps);
    await userEvent.pointer({
      target: track,
      coords: { clientX: xOf(0), clientY: 20 },
      keys: "[MouseLeft>]",
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it("draws a bar for live steps only, at the step's velocity", () => {
    const steps = Array.from({ length: STEPS }, () => melodic({ on: false }));
    steps[0] = melodic({ on: true, vel: 0.4 });
    const { track } = renderLane(steps);

    const bars = track.querySelectorAll<HTMLElement>(".vel-bar");
    expect(bars).toHaveLength(1);
    expect(bars[0]).toHaveStyle({ height: "40%" });
  });
});
