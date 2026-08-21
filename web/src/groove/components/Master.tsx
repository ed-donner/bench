import type { Params } from "../types";
import { SWEEP_BARS } from "../types";
import { FILTER_SPEC, MASTER_GROUPS } from "../params";
import { filterLabel } from "../filter";
import { useLocale } from "../../shared/useLocale";
import { resolveSpec } from "../i18n/resolve";
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
  const { t } = useLocale();
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
  const { t } = useLocale();
  const readout = useReadout();
  const bars = SWEEP_BARS[Math.round(p.params.sweepBars)] ?? 0;
  const filterSpec = resolveSpec(FILTER_SPEC, t);
  const volSpec = resolveSpec(
    {
      key: "volume",
      labelKey: "groove.master.vol",
      kind: "slider",
      min: 0,
      max: 1,
      formatKind: "pct",
    },
    t,
  );

  return (
    <section className="master">
      <div className="master-hero">
        <div className="hero-knob">
          <Knob
            spec={filterSpec}
            value={p.params.filter}
            onChange={(v) => {
              p.onParam("filter", v);
              readout.show(filterSpec, v);
            }}
          />
        </div>
        <div className="hero-side">
          <span className="bank-label">{t("groove.master.filter")}</span>
          <div className="hero-display">
            <span className="disp-label">
              {readout.value ? readout.value.label : t("groove.display.cutoff")}
            </span>
            <span className="disp-value">
              {readout.value
                ? readout.value.value
                : filterLabel(p.liveFilter, t)}
            </span>
          </div>
          <SweepMeter bars={bars} phase={p.sweepPhase} />
        </div>
      </div>

      {MASTER_GROUPS.map((group) => (
        <div className="master-group" key={group.titleKey}>
          <span className="bank-label">{t(group.titleKey)}</span>
          <div className="master-knobs">
            {group.specs.map((raw) => {
              const spec = resolveSpec(raw, t);
              return (
                <Knob
                  key={spec.key}
                  spec={spec}
                  value={p.params[spec.key]}
                  onChange={(v) => {
                    p.onParam(spec.key, v);
                    readout.show(spec, v);
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}

      <Scope analyser={p.analyser} getFilter={p.getFilter} />

      <div className="master-out">
        <span className="bank-label">{t("groove.master.out")}</span>
        <Fader spec={volSpec} value={p.volume} onChange={p.onVolume} />
      </div>
    </section>
  );
}
