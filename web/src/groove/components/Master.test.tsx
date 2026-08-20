import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Master } from "./Master";
import { PATCHES } from "../patches";
import { MASTER_GROUPS } from "../params";
import { filterLabel } from "../filter";
import { masterGroupLabel, type GrooveT } from "../i18n";
import { t } from "../../shared/useLocale";
import { SWEEP_BARS } from "../types";
import { renderGroove } from "../test/render";

// The scope is a canvas render loop with its own suite; this one is about the master panel.
vi.mock("./Scope", () => ({
  Scope: () => <div data-testid="scope" />,
}));

type MasterProps = Parameters<typeof Master>[0];

function renderMaster(overrides: Partial<MasterProps> = {}) {
  const props: MasterProps = {
    params: { ...PATCHES[0].master },
    onParam: vi.fn(),
    volume: 0.8,
    onVolume: vi.fn(),
    analyser: null,
    getFilter: () => ({ macro: 0.5, reso: 0.2 }),
    liveFilter: 0.5,
    sweepPhase: 0,
    ...overrides,
  };
  const { container, rerender } = renderGroove(<Master {...props} />);
  const show = (next: Partial<MasterProps>) =>
    rerender(<Master {...props} {...next} />);
  return { ...props, container, show };
}

async function dragKnob(knob: Element, pixels: number): Promise<void> {
  await userEvent.pointer([
    { target: knob, coords: { clientY: 100 }, keys: "[MouseLeft>]" },
    { target: knob, coords: { clientY: 100 - pixels } },
    { keys: "[/MouseLeft]" },
  ]);
}

describe("Master", () => {
  it("reads out the live filter position until a control is touched", async () => {
    const { container, onParam } = renderMaster({ liveFilter: 0.75 });
    const display = container.querySelector(".hero-display")!;

    expect(display).toHaveTextContent("Cutoff");
    expect(display).toHaveTextContent(filterLabel(0.75));

    await dragKnob(container.querySelector(".hero-knob .knob")!, 20);
    expect(onParam).toHaveBeenCalledWith("filter", expect.any(Number));
    expect(display).toHaveTextContent("FILTER");
  });

  it("names every master group and its knobs", () => {
    renderMaster();
    const gt = Object.assign((k: Parameters<GrooveT>[0]) => t("groove", k), {
      i: (k: Parameters<GrooveT>[0]) => t("groove", k),
    }) as GrooveT;
    for (const group of MASTER_GROUPS) {
      expect(
        screen.getAllByText(masterGroupLabel(gt, group.titleKey)).length,
      ).toBeGreaterThan(0);
      for (const spec of group.specs) {
        expect(screen.getByText(spec.label)).toBeInTheDocument();
      }
    }
  });

  it("reports which master knob was turned", async () => {
    const { container, onParam } = renderMaster();
    const reso = [...container.querySelectorAll(".knob")].find((knob) =>
      knob.textContent.includes("RESO"),
    )!;

    await dragKnob(reso, 20);
    expect(onParam).toHaveBeenCalledWith("filterReso", expect.any(Number));
  });

  it("shows the sweep as off when no length is selected", () => {
    const { container } = renderMaster({
      params: { ...PATCHES[0].master, sweepBars: 0 },
    });
    expect(container.querySelector(".sweep-meter")).toHaveClass("off");
    expect(screen.getByText("Sweep off")).toBeInTheDocument();
  });

  it("lights the segment the sweep is currently in", () => {
    const bars = SWEEP_BARS.indexOf(4);
    const { container, show } = renderMaster({
      params: { ...PATCHES[0].master, sweepBars: bars },
      sweepPhase: 0,
    });

    const segments = () => [...container.querySelectorAll(".sweep-seg")];
    expect(segments()).toHaveLength(4);
    expect(segments().findIndex((s) => s.classList.contains("on"))).toBe(0);

    show({ sweepPhase: 0.6 });
    expect(segments().findIndex((s) => s.classList.contains("on"))).toBe(2);

    show({ sweepPhase: 1 });
    expect(segments().findIndex((s) => s.classList.contains("on"))).toBe(3);
  });

  it("passes the output fader through to onVolume", async () => {
    const { container, onVolume } = renderMaster({ volume: 0.5 });
    const fader = container.querySelector(".master-out .fader")!;

    await userEvent.pointer([
      { target: fader, coords: { clientY: 100 }, keys: "[MouseLeft>]" },
      { target: fader, coords: { clientY: 70 } },
      { keys: "[/MouseLeft]" },
    ]);
    expect(onVolume).toHaveBeenLastCalledWith(expect.closeTo(0.7, 5));
  });
});
