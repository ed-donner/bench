import { useCallback, useRef } from "react";
import { IconGroove } from "../../shared/AppIcons";
import { useT } from "../../shared/useLocale";
import type { Patch } from "../types";
import { paramLabel } from "../i18n";
import { Knob } from "./Knob";
import { LedStrip } from "./LedStrip";

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
  audioHint?: boolean;
}

function TempoDial({
  bpm,
  onBpm,
  dragHint,
  bpmUnit,
}: {
  bpm: number;
  onBpm: (v: number) => void;
  dragHint: string;
  bpmUnit: string;
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
        title={dragHint}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      >
        <span className="tempo-value">{bpm}</span>
        <span className="tempo-unit">{bpmUnit}</span>
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
  const t = useT("groove");
  const swingSpec = {
    key: "swing",
    label: paramLabel(t, "swing", "SWING"),
    kind: "knob" as const,
    min: 0,
    max: 1,
  };

  return (
    <header className="transport">
      <div className="brand">
        <IconGroove />
        <span className="brand-name">{t("brandName")}</span>
        <span className="brand-model">{t("brandModel")}</span>
      </div>

      <button
        type="button"
        className={`play-btn${p.playing ? " playing" : ""}`}
        title={p.audioHint ? t("initAudio") : t("playShortcut")}
        onClick={p.onPlay}
      >
        <span className="play-glyph">{p.playing ? "■" : "▶"}</span>
        {p.playing ? t("transportStop") : t("transportPlay")}
      </button>

      <TempoDial
        bpm={p.bpm}
        onBpm={p.onBpm}
        dragHint={t("tempoDragHint")}
        bpmUnit={t("transportBpm")}
      />

      <div className="swing-bank">
        <Knob spec={swingSpec} value={p.swing} onChange={p.onSwing} />
      </div>

      <div className="master-leds">
        <LedStrip current={p.current} />
        <span className="master-leds-label">{t("transportStep")}</span>
      </div>

      <div className="patch-bank">
        {p.patches.map((patch, i) => (
          <button
            key={patch.name}
            type="button"
            className={`patch-btn${i === p.index ? " active" : ""}`}
            title={t.i("patchKeyHint", {
              name: patch.name,
              subtitle: patch.subtitle,
              n: i + 1,
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
          title={t("revertHint")}
        >
          {p.edited ? t("revert") : t("saved")}
        </button>
      </div>
    </header>
  );
}
