import { useT } from "../../shared/useLocale";
import type { Params } from "../types";
import { SWEEP_BARS } from "../types";
import { FILTER_SPEC, MASTER_GROUPS } from "../params";
import { filterDisplayLabel, masterGroupLabel } from "../i18n";
import { Knob } from "./Knob";
import { Fader } from "./Fader";
import { Scope } from "./Scope";
import { useReadout } from "./useReadout";

interface Props {
  params: Params;
  onParam: (key: string, value: number) => void;
  volume: number;
  onVolume: (v: number) => void;
  analyser: AnalyserNode | null;
  getFilter: () => { macro: number; reso: number };
  /** live macro position, which follows the sweep while playing */
  liveFilter: number;
  sweepPhase: number;
}

/** Segmented phrase counter showing where the sweep is in its cycle. */
function SweepMeter({ bars, phase }: { bars: number; phase: number }) {
  const t = useT();

  if (bars === 0) {
    return (
      <div className="sweep-meter off">
        <span className="sweep-off">{t("groove.master.sweepOff")}</span>
      </div>
    );
  }
  const active = Math.min(bars - 1, Math.floor(phase * bars));
  return (
    <div className="sweep-meter">
      {Array.from({ length: bars }, (_, i) => (
        <span key={i} className={`sweep-seg${i === active ? " on" : ""}`}>
          {i === active && (
            <span
              className="sweep-fill"
              style={{ width: `${(phase * bars - i) * 100}%` }}
            />
          )}
        </span>
      ))}
    </div>
  );
}

export function Master(p: Props) {
  const t = useT();
  const readout = useReadout("master");
  const bars = SWEEP_BARS[Math.round(p.params.sweepBars)] ?? 0;

  return (
    <section className="master">
      <div className="master-hero">
        <div className="hero-knob">
          <Knob
            spec={FILTER_SPEC}
            value={p.params.filter}
            labelContext="master"
            onChange={(v) => {
              p.onParam("filter", v);
              readout.show(FILTER_SPEC, v);
            }}
          />
        </div>
        <div className="hero-side">
          <span className="bank-label">{t("groove.master.filter")}</span>
          <div className="hero-display">
            <span className="disp-label">
              {readout.value ? readout.value.label : t("groove.master.cutoff")}
            </span>
            <span className="disp-value">
              {readout.value
                ? readout.value.value
                : filterDisplayLabel(t, p.liveFilter)}
            </span>
          </div>
          <SweepMeter bars={bars} phase={p.sweepPhase} />
        </div>
      </div>

      {MASTER_GROUPS.map((group) => (
        <div className="master-group" key={group.id}>
          <span className="bank-label">{masterGroupLabel(t, group.id)}</span>
          <div className="master-knobs">
            {group.specs.map((spec) => (
              <Knob
                key={spec.key}
                spec={spec}
                value={p.params[spec.key]}
                labelContext="master"
                onChange={(v) => {
                  p.onParam(spec.key, v);
                  readout.show(spec, v);
                }}
              />
            ))}
          </div>
        </div>
      ))}

      <Scope analyser={p.analyser} getFilter={p.getFilter} />

      <div className="master-out">
        <span className="bank-label">{t("groove.master.out")}</span>
        <Fader
          spec={{
            key: "volume",
            label: "VOL",
            kind: "slider",
            min: 0,
            max: 1,
          }}
          value={p.volume}
          labelContext="master"
          onChange={p.onVolume}
        />
      </div>
    </section>
  );
}
