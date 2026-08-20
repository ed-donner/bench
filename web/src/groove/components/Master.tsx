import { useT } from "../../shared/useLocale";
import { filterLabel } from "../filter";
import { masterGroupLabel, paramLabel } from "../i18n";
import { FILTER_SPEC, MASTER_GROUPS } from "../params";
import type { Params } from "../types";
import { SWEEP_BARS } from "../types";
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

function SweepMeter({
  bars,
  phase,
  offLabel,
}: {
  bars: number;
  phase: number;
  offLabel: string;
}) {
  if (bars === 0) {
    return (
      <div className="sweep-meter off">
        <span className="sweep-off">{offLabel}</span>
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
  const t = useT("groove");
  const readout = useReadout();
  const bars = SWEEP_BARS[Math.round(p.params.sweepBars)] ?? 0;
  const filterSpec = {
    ...FILTER_SPEC,
    label: paramLabel(t, FILTER_SPEC.key, FILTER_SPEC.label),
  };
  const labeled = (spec: (typeof MASTER_GROUPS)[number]["specs"][number]) => ({
    ...spec,
    label: paramLabel(t, spec.key, spec.label),
  });

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
          <span className="bank-label">{t("masterFilterTitle")}</span>
          <div className="hero-display">
            <span className="disp-label">
              {readout.value ? readout.value.label : t("masterCutoff")}
            </span>
            <span className="disp-value">
              {readout.value ? readout.value.value : filterLabel(p.liveFilter)}
            </span>
          </div>
          <SweepMeter
            bars={bars}
            phase={p.sweepPhase}
            offLabel={t("sweepOff")}
          />
        </div>
      </div>

      {MASTER_GROUPS.map((group) => (
        <div className="master-group" key={group.titleKey}>
          <span className="bank-label">
            {masterGroupLabel(t, group.titleKey)}
          </span>
          <div className="master-knobs">
            {group.specs.map((spec) => {
              const labeledSpec = labeled(spec);
              return (
                <Knob
                  key={spec.key}
                  spec={labeledSpec}
                  value={p.params[spec.key]}
                  onChange={(v) => {
                    p.onParam(spec.key, v);
                    readout.show(labeledSpec, v);
                  }}
                />
              );
            })}
          </div>
        </div>
      ))}

      <Scope analyser={p.analyser} getFilter={p.getFilter} />

      <div className="master-out">
        <span className="bank-label">{t("masterOut")}</span>
        <Fader
          spec={{
            key: "volume",
            label: t("masterVol"),
            kind: "slider",
            min: 0,
            max: 1,
          }}
          value={p.volume}
          onChange={p.onVolume}
        />
      </div>
    </section>
  );
}
