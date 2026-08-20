import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Unit } from "./Unit";
import { clonePatch, PATCHES } from "../patches";
import { UNIT_PARAMS } from "../params";
import { DRUM_LANES, STEPS, type UnitId } from "../types";
import { renderGroove } from "../test/render";

type UnitProps = Parameters<typeof Unit>[0];

function renderUnit(id: UnitId, overrides: Partial<UnitProps> = {}) {
  const props: UnitProps = {
    id,
    patch: clonePatch(PATCHES[0]),
    current: -1,
    muted: false,
    onMute: vi.fn(),
    onParam: vi.fn(),
    onDrumStep: vi.fn(),
    onNoteStep: vi.fn(),
    onAudition: vi.fn(),
    ...overrides,
  };
  const { container, rerender } = renderGroove(<Unit {...props} />);
  const show = (next: Partial<UnitProps>) =>
    rerender(<Unit {...props} {...next} />);
  return { ...props, container, show };
}

describe("Unit", () => {
  it("gives the drums a pad grid and counts its hits", () => {
    const patch = clonePatch(PATCHES[0]);
    for (const lane of DRUM_LANES) patch.drums.steps[lane].fill(0);
    patch.drums.steps.kick[0] = 1;
    patch.drums.steps.snare[4] = 2;

    const { container } = renderUnit("drums", { patch });
    expect(container.querySelector(".drum-grid")).toBeInTheDocument();
    expect(container.querySelector(".note-grid")).not.toBeInTheDocument();

    const display = container.querySelector(".unit-display")!;
    expect(display).toHaveTextContent("Hits");
    expect(display).toHaveTextContent("2");
  });

  it("gives a melodic unit a note grid, a velocity lane and a step count", () => {
    const patch = clonePatch(PATCHES[0]);
    patch.bass.steps.forEach((step) => (step.on = false));
    patch.bass.steps[0].on = true;
    patch.bass.steps[1].on = true;

    const { container } = renderUnit("bass", { patch });
    expect(container.querySelector(".note-grid")).toBeInTheDocument();
    expect(container.querySelector(".vel-lane")).toBeInTheDocument();
    expect(container.querySelector(".unit-display")).toHaveTextContent(
      `2/${STEPS}`,
    );
  });

  it("shows chord names on the pads only", () => {
    const { container, show } = renderUnit("pads");
    expect(container.querySelector(".note-chord")).toBeInTheDocument();

    show({ id: "lead" });
    expect(container.querySelector(".note-chord")).not.toBeInTheDocument();
  });

  it("names the unit for the accessibility tree", () => {
    renderUnit("bass");
    expect(screen.getByRole("region", { name: "Bass" })).toBeInTheDocument();
  });

  it("mutes on request and shows it", async () => {
    const { onMute, container, show } = renderUnit("bass");
    await userEvent.click(screen.getByRole("button", { name: "Mute" }));
    expect(onMute).toHaveBeenCalledOnce();

    expect(container.querySelector(".unit")).not.toHaveClass("muted");
    show({ muted: true });
    expect(container.querySelector(".unit")).toHaveClass("muted");
  });

  it("lights the signal LED only while a step under the playhead sounds", () => {
    const patch = clonePatch(PATCHES[0]);
    patch.bass.steps.forEach((step) => (step.on = false));
    patch.bass.steps[2].on = true;

    const { container, show } = renderUnit("bass", { patch, current: 2 });
    expect(container.querySelector(".sig-led")).toHaveClass("on");

    show({ current: 3 });
    expect(container.querySelector(".sig-led")).not.toHaveClass("on");

    show({ current: -1 });
    expect(container.querySelector(".sig-led")).not.toHaveClass("on");
  });

  it("reports a turned knob and reads it out on the panel display", async () => {
    const { container, onParam } = renderUnit("bass");
    const spec = UNIT_PARAMS.bass.find((s) => s.kind === "knob")!;
    const knob = [...container.querySelectorAll(".knob")].find((el) =>
      el.textContent.includes(spec.label),
    )!;

    await userEvent.pointer([
      { target: knob, coords: { clientY: 100 }, keys: "[MouseLeft>]" },
      { target: knob, coords: { clientY: 80 } },
      { keys: "[/MouseLeft]" },
    ]);

    expect(onParam).toHaveBeenCalledWith(spec.key, expect.any(Number));
    expect(container.querySelector(".unit-display")).toHaveTextContent(
      spec.label,
    );
  });

  it("splits the spec list into knobs on the face and faders in the strip", () => {
    const { container } = renderUnit("drums");
    const specs = UNIT_PARAMS.drums;

    expect(container.querySelectorAll(".knob-bank .knob")).toHaveLength(
      specs.filter((s) => s.kind === "knob").length,
    );
    expect(container.querySelectorAll(".fader-bank .fader")).toHaveLength(
      specs.filter((s) => s.kind === "slider").length,
    );
  });
});
