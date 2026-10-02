import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Fader } from "./Fader";
import type { ParamSpec } from "../types";
import { renderWithLocale } from "../i18n/test-utils";

const spec: ParamSpec & { label: string } = {
  key: "lvKick",
  labelKey: "groove.param.lvKick",
  label: "BD",
  kind: "slider",
  min: 0,
  max: 1,
};

function renderFader(value = 0.5) {
  const onChange = vi.fn();
  const onTouch = vi.fn();
  const { container } = renderWithLocale(
    <Fader spec={spec} value={value} onChange={onChange} onTouch={onTouch} />,
  );
  const fader = container.querySelector(".fader");
  return { onChange, onTouch, fader };
}

/** Pointer drag from one clientY to another over the fader body. */
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

describe("Fader", () => {
  it("shows the value as fill height", () => {
    const { container } = renderWithLocale(
      <Fader spec={spec} value={0.25} onChange={vi.fn()} />,
    );
    expect(container.querySelector<HTMLElement>(".fader-fill")).toHaveStyle({
      height: "25%",
    });
  });

  it("labels itself from the spec", () => {
    renderFader();
    expect(screen.getByText("BD")).toBeInTheDocument();
  });

  it("raises the value when dragged up and reports the touch", async () => {
    const { onChange, onTouch, fader } = renderFader(0.5);
    await drag(fader!, 100, 70);

    expect(onTouch).toHaveBeenCalledOnce();
    // 30px up over the 150px full-scale throw, on a 0..1 range.
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.7, 5));
  });

  it("lowers the value when dragged down", async () => {
    const { onChange, fader } = renderFader(0.5);
    await drag(fader!, 100, 130);
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.3, 5));
  });

  it("clamps to the spec range", async () => {
    const { onChange, fader } = renderFader(0.9);
    await drag(fader!, 100, 0);
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("moves less per pixel while shift is held", async () => {
    const { onChange, fader } = renderFader(0.5);
    await drag(fader!, 100, 70, true);
    expect(onChange).toHaveBeenLastCalledWith(expect.closeTo(0.56, 5));
  });

  it("ignores pointer movement that did not start on the fader", async () => {
    const { onChange, fader } = renderFader();
    await userEvent.pointer({ target: fader!, coords: { clientY: 40 } });
    expect(onChange).not.toHaveBeenCalled();
  });
});
