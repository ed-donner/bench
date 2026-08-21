import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Knob } from "./Knob";
import type { ParamSpec } from "../types";
import { renderWithLocale } from "../i18n/test-utils";

const cutoff: ParamSpec & { label: string } = {
  key: "cutoff",
  labelKey: "groove.param.cutoff",
  label: "CUTOFF",
  kind: "knob",
  min: 0,
  max: 1,
};

const wave: ParamSpec & { label: string } = {
  key: "wave",
  labelKey: "groove.param.wave",
  label: "WAVE",
  kind: "knob",
  min: 0,
  max: 3,
  options: ["SAW", "SQUARE", "TRI", "SINE"],
};

function renderKnob(spec: ParamSpec & { label: string }, value: number) {
  const onChange = vi.fn();
  const onTouch = vi.fn();
  const { container } = renderWithLocale(
    <Knob spec={spec} value={value} onChange={onChange} onTouch={onTouch} />,
  );
  return { onChange, onTouch, knob: container.querySelector(".knob")! };
}

async function drag(
  target: Element,
  from: number,
  to: number,
  shift = false,
): Promise<void> {
  const user = userEvent.setup();
  if (shift) await user.keyboard("{Shift>}");
  await user.pointer([
    { target, coords: { clientY: from }, keys: "[MouseLeft>]" },
    { target, coords: { clientY: to } },
    { keys: "[/MouseLeft]" },
  ]);
  if (shift) await user.keyboard("{/Shift}");
}

describe("Knob", () => {
  it("labels itself and announces the drag gesture", () => {
    const { knob } = renderKnob(cutoff, 0.5);
    expect(screen.getByText("CUTOFF")).toBeInTheDocument();
    expect(knob).toHaveAttribute(
      "title",
      "CUTOFF — drag up/down, hold shift for fine",
    );
  });

  it("passes a continuous value through unrounded", async () => {
    const { onChange, onTouch, knob } = renderKnob(cutoff, 0.5);
    await drag(knob, 100, 62);

    expect(onTouch).toHaveBeenCalledOnce();
    // 38px up over the 190px full-scale throw, on a 0..1 range.
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.7, 5));
  });

  it("snaps to whole options when the spec names them", async () => {
    const { onChange, knob } = renderKnob(wave, 0);
    await drag(knob, 100, 80);

    // 20px up on a 0..3 range is 0.315 of a step, which must land back on option 0.
    expect(onChange).toHaveBeenLastCalledWith(0);

    const far = renderKnob(wave, 0);
    await drag(far.knob, 100, 60);
    expect(far.onChange).toHaveBeenLastCalledWith(1);
  });

  it("clamps at both ends of the range", async () => {
    const top = renderKnob(cutoff, 0.9);
    await drag(top.knob, 100, 0);
    expect(top.onChange).toHaveBeenLastCalledWith(1);

    const bottom = renderKnob(cutoff, 0.1);
    await drag(bottom.knob, 100, 400);
    expect(bottom.onChange).toHaveBeenLastCalledWith(0);
  });

  it("moves less per pixel while shift is held", async () => {
    const { onChange, knob } = renderKnob(cutoff, 0.5);
    await drag(knob, 100, 62, true);
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.561, 3));
  });

  it("ignores pointer movement that did not start on the knob", async () => {
    const { onChange, knob } = renderKnob(cutoff, 0.5);
    await userEvent.pointer({ target: knob, coords: { clientY: 20 } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("sweeps the pointer and the value arc as the value rises", () => {
    const { container, rerender } = renderWithLocale(
      <Knob spec={cutoff} value={0} onChange={vi.fn()} />,
    );
    const pointer = () =>
      container.querySelector(".knob-pointer")!.getAttribute("x2");
    const arc = () => container.querySelector(".knob-value")!.getAttribute("d");

    const atMin = { x: pointer(), d: arc() };
    rerender(<Knob spec={cutoff} value={1} onChange={vi.fn()} />);

    expect(pointer()).not.toBe(atMin.x);
    expect(arc()).not.toBe(atMin.d);
  });
});
