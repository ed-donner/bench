import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { PATCHES } from "./patches";
import { renderGroove } from "./test/render";

/**
 * The engine owns an AudioContext, which jsdom has no implementation of, and the scope draws to a
 * canvas. Both are stubbed so these tests can cover what App actually does: hold the patch state
 * and wire the panels to it.
 */
const { EngineStub, built } = vi.hoisted(() => {
  class EngineStub {
    playing = false;
    filterMacro = 0.5;
    sweepPhase = 0;
    analyser = null;
    onStep: (step: number) => void = () => undefined;
    resume = vi.fn(() => Promise.resolve());
    start = vi.fn(() => {
      this.playing = true;
    });
    stop = vi.fn(() => {
      this.playing = false;
    });
    applyParams = vi.fn();
    auditionDrum = vi.fn();
    auditionNote = vi.fn();

    constructor() {
      built.push(this);
    }
  }
  const built: EngineStub[] = [];
  return { EngineStub, built };
});

vi.mock("./audio/engine", () => ({ Engine: EngineStub }));

vi.mock("./components/Scope", () => ({
  Scope: () => <div data-testid="scope" />,
}));

beforeEach(() => {
  built.length = 0;
});

/** App builds exactly one engine on mount; this is it. */
const engineOf = () => built[built.length - 1];

const press = async (init: KeyboardEventInit) => {
  await act(async () => {
    window.dispatchEvent(
      new KeyboardEvent("keydown", { ...init, bubbles: true }),
    );
    await Promise.resolve();
  });
};

const unit = (name: string) => screen.getByRole("region", { name });

describe("Groove App", () => {
  it("lays out the transport, all four units and the master section", () => {
    renderGroove(<App />);
    for (const name of ["Rhythm", "Bass", "Pads", "Lead"]) {
      expect(unit(name)).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: /Play/ })).toBeInTheDocument();
    expect(screen.getByTestId("scope")).toBeInTheDocument();
  });

  it("starts and stops the engine from the play button", async () => {
    renderGroove(<App />);
    await userEvent.click(screen.getByRole("button", { name: /Play/ }));

    expect(engineOf().resume).toHaveBeenCalled();
    expect(engineOf().start).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Stop/ })).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /Stop/ }));
    expect(engineOf().stop).toHaveBeenCalledOnce();
    expect(screen.getByRole("button", { name: /Play/ })).toBeInTheDocument();
  });

  it("toggles the transport with the spacebar", async () => {
    renderGroove(<App />);
    await press({ code: "Space" });
    expect(engineOf().start).toHaveBeenCalledOnce();

    await press({ code: "Space" });
    expect(engineOf().stop).toHaveBeenCalledOnce();
  });

  it("switches patch with the number keys and the patch buttons", async () => {
    const { container } = renderGroove(<App />);
    const active = () =>
      container.querySelector(".patch-btn.active")!.textContent;

    expect(active()).toContain(PATCHES[0].name);

    await press({ key: "3" });
    expect(active()).toContain(PATCHES[2].name);

    await userEvent.click(container.querySelectorAll(".patch-btn")[1]);
    expect(active()).toContain(PATCHES[1].name);
  });

  it("ignores the keyboard while a text field has focus", async () => {
    renderGroove(<App />);
    const input = document.createElement("input");
    document.body.append(input);
    input.focus();

    await act(async () => {
      input.dispatchEvent(
        new KeyboardEvent("keydown", { code: "Space", bubbles: true }),
      );
      await Promise.resolve();
    });

    expect(engineOf().start).not.toHaveBeenCalled();
    input.remove();
  });

  it("edits a step, offers a revert, and restores the factory patch", async () => {
    renderGroove(<App />);
    const step = within(unit("Rhythm")).getByRole("button", {
      name: "Kick step 2",
    });

    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
    await userEvent.click(step);

    const revert = screen.getByRole("button", { name: "Revert" });
    expect(revert).toBeEnabled();

    await userEvent.click(revert);
    expect(screen.getByRole("button", { name: "Saved" })).toBeDisabled();
  });

  it("auditions a drum step as it is switched on, but not as it is cleared", async () => {
    renderGroove(<App />);
    const step = within(unit("Rhythm")).getByRole("button", {
      name: "Clap step 2",
    });

    await userEvent.click(step);
    expect(engineOf().auditionDrum).toHaveBeenCalledWith("clap", false);

    engineOf().auditionDrum.mockClear();
    await userEvent.click(step); // accent
    await userEvent.click(step); // back to rest
    expect(engineOf().auditionDrum).toHaveBeenCalledTimes(1);
  });

  it("auditions a melodic step as it is switched on, but not as it is cleared", async () => {
    renderGroove(<App />);
    const pads = within(unit("Bass")).getAllByRole("button", {
      name: /Bass step/,
    });
    const rest = pads.find(
      (pad) => pad.getAttribute("aria-pressed") === "false",
    )!;

    await userEvent.click(rest);
    expect(engineOf().auditionNote).toHaveBeenCalledWith(
      "bass",
      expect.objectContaining({ on: true }),
    );

    engineOf().auditionNote.mockClear();
    await userEvent.click(rest);
    expect(engineOf().auditionNote).not.toHaveBeenCalled();
  });

  it("mutes a single unit without touching the others", async () => {
    const { container } = renderGroove(<App />);
    const bass = unit("Bass");
    await userEvent.click(within(bass).getByRole("button", { name: "Mute" }));

    expect(bass).toHaveClass("muted");
    expect(unit("Lead")).not.toHaveClass("muted");
    expect(container.querySelectorAll(".unit.muted")).toHaveLength(1);
  });

  it("pushes every change down to the engine", async () => {
    renderGroove(<App />);
    engineOf().applyParams.mockClear();

    await userEvent.click(
      within(unit("Pads")).getByRole("button", { name: "Mute" }),
    );
    expect(engineOf().applyParams).toHaveBeenCalled();
  });

  it("follows the playhead the engine reports", () => {
    const { container } = renderGroove(<App />);
    act(() => engineOf().onStep(5));

    const lit = container.querySelectorAll(".master-leds .led.on");
    expect(lit).toHaveLength(1);
    expect(
      [...container.querySelectorAll(".master-leds .led")].indexOf(lit[0]),
    ).toBe(5);
  });
});
