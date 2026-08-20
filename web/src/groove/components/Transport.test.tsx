import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Transport } from "./Transport";
import { PATCHES } from "../patches";
import { renderGroove } from "../test/render";

type TransportProps = Parameters<typeof Transport>[0];

function renderTransport(overrides: Partial<TransportProps> = {}) {
  const props: TransportProps = {
    patches: PATCHES,
    index: 0,
    onSelect: vi.fn(),
    playing: false,
    onPlay: vi.fn(),
    bpm: 120,
    onBpm: vi.fn(),
    swing: 0.2,
    onSwing: vi.fn(),
    current: 3,
    edited: false,
    onRevert: vi.fn(),
    ...overrides,
  };
  const { container, rerender } = renderGroove(<Transport {...props} />);
  const show = (next: Partial<TransportProps>) =>
    rerender(<Transport {...props} {...next} />);
  return { ...props, container, show };
}

describe("Transport", () => {
  it("offers Play when stopped and Stop when playing", async () => {
    const { onPlay, show } = renderTransport();
    await userEvent.click(screen.getByRole("button", { name: /Play/ }));
    expect(onPlay).toHaveBeenCalledOnce();

    show({ playing: true });
    expect(screen.getByRole("button", { name: /Stop/ })).toBeInTheDocument();
  });

  it("steps the tempo one BPM at a time", async () => {
    const { onBpm } = renderTransport({ bpm: 120 });
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(onBpm).toHaveBeenLastCalledWith(121);

    await userEvent.click(screen.getByRole("button", { name: "−" }));
    expect(onBpm).toHaveBeenLastCalledWith(119);
  });

  it("clamps the tempo steps to the 60-180 range", async () => {
    const { onBpm, show } = renderTransport({ bpm: 180 });
    await userEvent.click(screen.getByRole("button", { name: "+" }));
    expect(onBpm).toHaveBeenLastCalledWith(180);

    show({ bpm: 60 });
    await userEvent.click(screen.getByRole("button", { name: "−" }));
    expect(onBpm).toHaveBeenLastCalledWith(60);
  });

  it("drags the tempo readout at one BPM per three pixels", async () => {
    const { onBpm, container } = renderTransport({ bpm: 120 });
    const readout = container.querySelector(".tempo-read")!;

    await userEvent.pointer([
      { target: readout, coords: { clientY: 100 }, keys: "[MouseLeft>]" },
      { target: readout, coords: { clientY: 70 } },
      { keys: "[/MouseLeft]" },
    ]);
    expect(onBpm).toHaveBeenLastCalledWith(130);
  });

  it("shows the current step on the master LEDs", () => {
    const { container } = renderTransport({ current: 3 });
    const lit = container.querySelectorAll(".led.on");
    expect(lit).toHaveLength(1);
    expect([...container.querySelectorAll(".led")].indexOf(lit[0])).toBe(3);
  });

  it("selects a patch and marks the current one active", async () => {
    const { onSelect, container } = renderTransport({ index: 1 });
    const buttons = container.querySelectorAll(".patch-btn");
    expect(buttons[1]).toHaveClass("active");
    expect(buttons[0]).not.toHaveClass("active");

    await userEvent.click(buttons[2]);
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it("only offers revert once the patch has been edited", async () => {
    const { onRevert, show } = renderTransport({ edited: false });
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();

    show({ edited: true });
    await userEvent.click(screen.getByRole("button", { name: "Revert" }));
    expect(onRevert).toHaveBeenCalledOnce();
  });
});
