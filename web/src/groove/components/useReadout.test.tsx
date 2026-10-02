import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { useReadout } from "./useReadout";
import type { ResolvedParamSpec } from "../i18n/resolve";

const spec: ResolvedParamSpec = {
  key: "cutoff",
  labelKey: "groove.param.cutoff",
  label: "CUTOFF",
  kind: "knob",
  min: 0,
  max: 1,
  format: (v) => `${Math.round(v * 100)}`,
};

const raw: ResolvedParamSpec = {
  key: "raw",
  labelKey: "groove.param.cutoff",
  label: "RAW",
  kind: "knob",
  min: 0,
  max: 1,
  format: (v) => v.toFixed(2),
};

function Panel({ show }: { show: ResolvedParamSpec }) {
  const readout = useReadout();
  return (
    <div>
      <span data-testid="label">{readout.value?.label ?? "idle"}</span>
      <span data-testid="value">{readout.value?.value ?? "-"}</span>
      <button type="button" onClick={() => readout.show(show, 0.42)}>
        touch
      </button>
    </div>
  );
}

afterEach(() => {
  vi.useRealTimers();
});

describe("useReadout", () => {
  it("shows the touched control, then falls back after the hold", () => {
    vi.useFakeTimers();
    render(<Panel show={spec} />);
    expect(screen.getByTestId("label")).toHaveTextContent("idle");

    act(() => {
      screen.getByRole("button").click();
    });
    expect(screen.getByTestId("label")).toHaveTextContent("CUTOFF");
    expect(screen.getByTestId("value")).toHaveTextContent("42");

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByTestId("label")).toHaveTextContent("idle");
  });

  it("formats a spec with no formatter to two decimals", () => {
    vi.useFakeTimers();
    render(<Panel show={raw} />);
    act(() => {
      screen.getByRole("button").click();
    });
    expect(screen.getByTestId("value")).toHaveTextContent("0.42");
  });

  it("restarts the hold on each touch", () => {
    vi.useFakeTimers();
    render(<Panel show={spec} />);

    act(() => {
      screen.getByRole("button").click();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    act(() => {
      screen.getByRole("button").click();
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId("label")).toHaveTextContent("CUTOFF");
  });

  it("drops its pending timer when the panel unmounts", () => {
    vi.useFakeTimers();
    const clear = vi.spyOn(window, "clearTimeout");
    const { unmount } = render(<Panel show={spec} />);

    act(() => {
      screen.getByRole("button").click();
    });
    unmount();
    expect(clear).toHaveBeenCalled();
  });
});
