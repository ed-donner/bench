import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Sparkles } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { StatsPayload } from "../../api";

const AXIS = { fontSize: 11, fill: "var(--muted)" };
const TOOLTIP = {
  borderRadius: 10,
  border: "1px solid var(--border)",
  background: "var(--surface)",
  color: "var(--text)",
  fontSize: 12,
};

/** Both charts share their frame; only the series differ. */
function Frame({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div>
      <div className="small muted chart-title">{title}</div>
      <ResponsiveContainer width="100%" height={210}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function TodayCharts({ stats }: { stats: StatsPayload | null }) {
  const { t } = useTranslation("rolodex");
  return (
    <div className="card card-pad span2">
      <h2 className="card-title chart-heading">
        <Sparkles size={16} /> {t("charts.heading")}
      </h2>
      {stats ? (
        <div className="chart-pair">
          <Frame title={t("charts.perMonth")}>
            <BarChart
              data={stats.months}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-2)" }}
                contentStyle={TOOLTIP}
              />
              <Bar
                dataKey="count"
                name={t("charts.interactions")}
                fill="var(--blue)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </Frame>
          <Frame title={t("charts.perCircle")}>
            <BarChart
              data={stats.circles}
              margin={{ top: 4, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={AXIS}
                tickLine={false}
                axisLine={{ stroke: "var(--border)" }}
              />
              <YAxis
                allowDecimals={false}
                tick={AXIS}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--surface-2)" }}
                contentStyle={TOOLTIP}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar
                dataKey="in_touch"
                name={t("status.in_touch")}
                stackId="s"
                fill="var(--green)"
              />
              <Bar
                dataKey="due_soon"
                name={t("status.due_soon")}
                stackId="s"
                fill="var(--amber)"
              />
              <Bar
                dataKey="overdue"
                name={t("status.overdue")}
                stackId="s"
                fill="var(--red)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="snoozed"
                name={t("status.snoozed")}
                stackId="s"
                fill="var(--slate)"
              />
            </BarChart>
          </Frame>
        </div>
      ) : (
        <div className="muted small">{t("charts.loading")}</div>
      )}
    </div>
  );
}
