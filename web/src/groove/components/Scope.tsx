import { useEffect, useRef } from "react";
import { useT } from "../../shared/useLocale";
import { filterGainAt } from "../filter";

const MIN_HZ = 30;
const MAX_HZ = 18000;
const GRID = [100, 1000, 10000];

interface Props {
  analyser: AnalyserNode | null;
  /** read fresh every frame so the curve tracks the sweep, not React state */
  getFilter: () => { macro: number; reso: number };
}

/** Live spectrum with the master filter's response drawn over it. */
export function Scope({ analyser, getFilter }: Props) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const bins = analyser ? new Uint8Array(analyser.frequencyBinCount) : null;
    let raf = 0;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const xOf = (f: number) =>
        (Math.log(f / MIN_HZ) / Math.log(MAX_HZ / MIN_HZ)) * w;

      ctx.strokeStyle = "rgba(120,132,150,0.16)";
      ctx.lineWidth = 1;
      for (const f of GRID) {
        const x = Math.round(xOf(f)) + 0.5;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      if (analyser && bins) {
        analyser.getByteFrequencyData(bins);
        const nyquist = analyser.context.sampleRate / 2;
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let x = 0; x <= w; x += 2) {
          const f = MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, x / w);
          const bin = Math.min(
            bins.length - 1,
            Math.round((f / nyquist) * bins.length),
          );
          const v = bins[bin] / 255;
          ctx.lineTo(x, h - v * h * 0.95);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fillStyle = "rgba(46,166,223,0.28)";
        ctx.fill();
        ctx.strokeStyle = "rgba(80,196,255,0.75)";
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      const { macro, reso } = getFilter();
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const f = MIN_HZ * Math.pow(MAX_HZ / MIN_HZ, x / w);
        const db =
          20 * Math.log10(Math.max(1e-4, filterGainAt(macro, reso, f)));
        const y = h * (1 - (Math.max(-48, Math.min(12, db)) + 48) / 60);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = "#ecad0a";
      ctx.lineWidth = 1.8;
      ctx.shadowColor = "rgba(236,173,10,0.55)";
      ctx.shadowBlur = 7;
      ctx.stroke();
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [analyser, getFilter]);

  return (
    <div className="scope">
      <canvas ref={canvasRef} className="scope-canvas" />
      <span className="scope-tag">{t("groove.master.scopeTag")}</span>
    </div>
  );
}
