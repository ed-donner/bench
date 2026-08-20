import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Scope } from "./Scope";
import { renderWithLocale } from "../i18n/test-utils";

/**
 * jsdom has no 2D context and lays nothing out, so the canvas is faked. These tests cover the
 * render loop's lifecycle and the data it reads - not what the spectrum looks like, which only an
 * eye can judge. EXPLORATORY.md records that gap.
 */
function fakeContext() {
  return {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    strokeStyle: "",
    fillStyle: "",
    lineWidth: 0,
    shadowColor: "",
    shadowBlur: 0,
  };
}

let ctx: ReturnType<typeof fakeContext>;
let frames: FrameRequestCallback[];
let cancelled: number[];

beforeEach(() => {
  ctx = fakeContext();
  frames = [];
  cancelled = [];
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
    ctx as unknown as CanvasRenderingContext2D,
  );
  for (const [prop, value] of [
    ["clientWidth", 400],
    ["clientHeight", 120],
  ] as const) {
    Object.defineProperty(HTMLCanvasElement.prototype, prop, {
      configurable: true,
      value,
    });
  }
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
    frames.push(cb);
    return frames.length;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation((id) => {
    cancelled.push(id);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const filter = () => ({ macro: 0.5, reso: 0.3 });

function analyserStub(bins = 64) {
  const getByteFrequencyData = vi.fn((array: Uint8Array) => array.fill(128));
  const analyser = {
    frequencyBinCount: bins,
    getByteFrequencyData,
    context: { sampleRate: 48000 },
  } as unknown as AnalyserNode;
  return { analyser, getByteFrequencyData };
}

/** Run the frame the component has queued. */
const drawOnce = () => frames.pop()!(0);

describe("Scope", () => {
  it("keeps requesting frames and cancels the loop on unmount", () => {
    const { unmount } = renderWithLocale(
      <Scope analyser={null} getFilter={filter} />,
    );
    expect(frames).toHaveLength(1);

    drawOnce();
    expect(frames).toHaveLength(1); // each frame queues the next

    unmount();
    expect(cancelled).toHaveLength(1);
  });

  it("reads the filter fresh on every frame, so a sweep tracks", () => {
    const getFilter = vi.fn(filter);
    renderWithLocale(<Scope analyser={null} getFilter={getFilter} />);

    drawOnce();
    drawOnce();
    expect(getFilter).toHaveBeenCalledTimes(2);
  });

  it("draws the filter curve without an analyser", () => {
    renderWithLocale(<Scope analyser={null} getFilter={filter} />);
    drawOnce();

    expect(ctx.clearRect).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.fill).not.toHaveBeenCalled();
  });

  it("fills the spectrum from the analyser when one is connected", () => {
    const { analyser, getByteFrequencyData } = analyserStub();
    renderWithLocale(<Scope analyser={analyser} getFilter={filter} />);
    drawOnce();

    expect(getByteFrequencyData).toHaveBeenCalledWith(expect.any(Uint8Array));
    expect(ctx.fill).toHaveBeenCalled();
  });

  it("sizes the backing store to the device pixel ratio", () => {
    vi.stubGlobal("devicePixelRatio", 2);
    const { container } = renderWithLocale(
      <Scope analyser={null} getFilter={filter} />,
    );
    drawOnce();

    const canvas = container.querySelector("canvas")!;
    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(240);
    expect(ctx.setTransform).toHaveBeenCalledWith(2, 0, 0, 2, 0, 0);
    vi.unstubAllGlobals();
  });
});
