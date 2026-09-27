import { useCallback, useRef } from "react";
import { IconGroove } from "../../shared/AppIcons";
import type { Patch } from "../types";
import { Knob } from "./Knob";
import { LedStrip } from "./LedStrip";
import { LEGEND } from "../legends";
import { useT } from "../strings";

interface Props {
  patches: Patch[];
  index: number;
  onSelect: (i: number) => void;
  playing: boolean;
  onPlay: () => void;
  bpm: number;
  onBpm: (v: number) => void;
  swing: number;
  onSwing: (v: number) => void;
  current: number;
  edited: boolean;
  onRevert: () => void;
}

function TempoDial({
  bpm,
  onBpm,
}: {
  bpm: number;
  onBpm: (v: number) => void;
}) {
  const drag = useRef<{ y: number; start: number } | null>(null);
  const down = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault();
      (e.target as Element).setPointerCapture(e.pointerId);
      drag.current = { y: e.clientY, start: bpm };
    },
    [bpm],
  );
  const move = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      if (!d) return;
      const next = d.start + (d.y - e.clientY) / (e.shiftKey ? 12 : 3);
      onBpm(Math.max(60, Math.min(180, Math.round(next))));
    },
    [onBpm],
  );
  const up = useCallback(() => {
    drag.current = null;
  }, []);
  const t = useT();

  return (
    <div className="tempo">
      <button
        type="button"
        className="tempo-step"
        onClick={() => onBpm(Math.max(60, bpm - 1))}
      >
        −
      </button>
      <div
        className="tempo-read"
        title={t("tempo.drag")}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="tempo-value">{bpm}</span>
        <span className="tempo-unit">{LEGEND.bpm}</span>
      </div>
      <button
        type="button"
        className="tempo-step"
        onClick={() => onBpm(Math.min(180, bpm + 1))}
      >
        +
      </button>
    </div>
  );
}

export function Transport(p: Props) {
  const t = useT();
  return (
    <header className="transport">
      <div className="brand">
        <IconGroove />
        <span className="brand-name">{LEGEND.brand}</span>
        <span className="brand-model">{LEGEND.model}</span>
      </div>

      <button
        type="button"
        className={`play-btn${p.playing ? " playing" : ""}`}
        title={t("play.key")}
        onClick={p.onPlay}
      >
        <span className="play-glyph">{p.playing ? "■" : "▶"}</span>
        {p.playing ? t("play.stop") : t("play.play")}
      </button>

      <TempoDial bpm={p.bpm} onBpm={p.onBpm} />

      <div className="swing-bank">
        <Knob
          spec={{ key: "swing", label: "SWING", kind: "knob", min: 0, max: 1 }}
          value={p.swing}
          onChange={p.onSwing}
        />
      </div>

      <div className="master-leds">
        <LedStrip current={p.current} />
        <span className="master-leds-label">{LEGEND.step}</span>
      </div>

      <div className="patch-bank">
        {p.patches.map((patch, i) => (
          <button
            key={patch.name}
            type="button"
            className={`patch-btn${i === p.index ? " active" : ""}`}
            title={t("patch.title", {
              name: patch.name,
              subtitle: patch.subtitle,
              key: i + 1,
            })}
            onClick={() => p.onSelect(i)}
          >
            <span className="patch-slot">{"ABCD"[i]}</span>
            <span className="patch-text">
              <span className="patch-name">{patch.name}</span>
              <span className="patch-sub">{patch.subtitle}</span>
            </span>
          </button>
        ))}
        <button
          type="button"
          className="revert-btn"
          onClick={p.onRevert}
          disabled={!p.edited}
          title={t("patch.revertTitle")}
        >
          {p.edited ? t("patch.revert") : t("patch.saved")}
        </button>
      </div>
    </header>
  );
}
