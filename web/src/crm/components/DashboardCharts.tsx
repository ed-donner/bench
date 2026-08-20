import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Funnel,
  FunnelChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useLocale, useT } from "../../shared/useLocale";
import { FunnelRow, MonthlyRow, OrgPipeline, WinLoss } from "../types";
import { formatMoney } from "../format";

/**
 * The dashboard's colour language, shared with the tiles above these charts: green is money
 * already won, amber is forecast, blue is the open pipeline, purple counts deals, red is lost.
 */
const BLUE = "#1b86b8";
const PURPLE = "#753991";
const AMBER = "#ecad0a";
const GREEN = "#2f9e5f";
const RED = "#c94f42";
const AXIS = { fill: "#6b7280", fontSize: 12 };
const GRID = "#e5e8ec";

const tooltipStyle = {
  border: "1px solid #d4d8de",
  borderRadius: 6,
  fontSize: 13,
};

const shortMoney = (v: number) => {
  const amount = v >= 1000 ? `${Math.round(v / 1000)}k` : String(v);
  return `$${amount}`;
};

/**
 * Money as stacked bars, deal volume as a line on its own axis. Won and expected stack rather than
 * sit side by side because a month is nearly always one or the other, which keeps the bars wide
 * enough to read across a twelve-month span.
 */
export function RevenueChart({ data }: { data: MonthlyRow[] }) {
  const { locale } = useLocale();
  const tc = useT("crm");
  const revenueLabel: Record<string, string> = {
    actual: tc("chartWon"),
    expected: tc("chartExpected"),
    count: tc("chartDealsClosing"),
  };
  const firstFuture = data.find((m) => m.future);
  return (
    <ResponsiveContainer width="100%" height={240}>
      <ComposedChart
        data={data}
        margin={{ top: 8, right: 4, left: 4, bottom: 0 }}
      >
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          interval={0}
        />
        <YAxis
          yAxisId="money"
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          tickFormatter={shortMoney}
          width={50}
        />
        <YAxis
          yAxisId="count"
          orientation="right"
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          width={28}
        />
        <Tooltip
          cursor={{ fill: "#f2f4f6" }}
          contentStyle={tooltipStyle}
          formatter={(value, name) => [
            name === "count" ? value : formatMoney(Number(value), locale),
            revenueLabel[String(name)],
          ]}
        />
        <Legend
          formatter={(value) => revenueLabel[String(value)]}
          wrapperStyle={{ fontSize: 12, color: "#6b7280" }}
        />
        {firstFuture && (
          <ReferenceLine
            yAxisId="money"
            x={firstFuture.label}
            stroke="#b6bcc6"
            strokeDasharray="3 3"
            label={{
              value: tc("chartForecast"),
              position: "insideTopLeft",
              fill: "#8a919c",
              fontSize: 11,
            }}
          />
        )}
        <Bar
          yAxisId="money"
          dataKey="actual"
          stackId="money"
          fill={GREEN}
          maxBarSize={26}
          isAnimationActive={false}
        />
        <Bar
          yAxisId="money"
          dataKey="expected"
          stackId="money"
          fill={AMBER}
          radius={[4, 4, 0, 0]}
          maxBarSize={26}
          isAnimationActive={false}
        />
        <Line
          yAxisId="count"
          type="monotone"
          dataKey="count"
          stroke={PURPLE}
          strokeWidth={2}
          dot={{ r: 3 }}
          isAnimationActive={false}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

export function RevenueFunnel({ data }: { data: FunnelRow[] }) {
  const { locale } = useLocale();
  const tc = useT("crm");
  return (
    <ResponsiveContainer width="100%" height={240}>
      <FunnelChart margin={{ top: 8, right: 96, left: 96, bottom: 8 }}>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value, _name, item) => {
            const row = item.payload as FunnelRow;
            return [
              tc.i("funnelTooltip", {
                amount: formatMoney(Number(value), locale),
                count: row.count,
                inStage: row.inStage,
              }),
              row.label,
            ];
          }}
        />
        {/* Each row carries its own `fill`, which is what replaces the deprecated <Cell>. */}
        <Funnel
          dataKey="value"
          data={data}
          isAnimationActive={false}
          lastShapeType="rectangle"
        >
          <LabelList
            position="right"
            dataKey="label"
            stroke="none"
            fill="#454c58"
            fontSize={12}
            offset={12}
          />
          <LabelList
            position="left"
            dataKey="value"
            stroke="none"
            fill="#454c58"
            fontSize={12}
            offset={12}
            formatter={(v: unknown) => formatMoney(Number(v), locale)}
          />
        </Funnel>
      </FunnelChart>
    </ResponsiveContainer>
  );
}

/** Won against lost, with the rate itself in the middle where it is the first thing read. */
export function WinRateDonut({ data }: { data: WinLoss }) {
  const { locale } = useLocale();
  const tc = useT("crm");
  const slices = [
    {
      name: tc("chartWon"),
      value: data.won,
      money: data.wonValue,
      fill: GREEN,
    },
    {
      name: tc("chartLost"),
      value: data.lost,
      money: data.lostValue,
      fill: RED,
    },
  ];
  return (
    <div className="donut-wrap">
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value, name, item) => {
              const slice = item.payload as (typeof slices)[number];
              return [
                tc.i("dealsAndMoney", {
                  count: Number(value),
                  amount: formatMoney(slice.money, locale),
                }),
                name,
              ];
            }}
          />
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            isAnimationActive={false}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#6b7280" }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="donut-centre">
        <div className="donut-rate">{data.rate}%</div>
        <div className="donut-caption">
          {tc.i("wonLostCaption", { won: data.won, lost: data.lost })}
        </div>
      </div>
    </div>
  );
}

export function TopOrganizations({ data }: { data: OrgPipeline[] }) {
  const { locale } = useLocale();
  const tc = useT("crm");
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 8, right: 16, left: 8, bottom: 0 }}
      >
        <CartesianGrid horizontal={false} stroke={GRID} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          tickFormatter={shortMoney}
        />
        <YAxis
          type="category"
          dataKey="name"
          tickLine={false}
          axisLine={false}
          tick={AXIS}
          width={118}
        />
        <Tooltip
          cursor={{ fill: "#f2f4f6" }}
          contentStyle={tooltipStyle}
          formatter={(value, _name, item) => {
            const org = item.payload as OrgPipeline;
            return [
              tc.i("orgPipelineTooltip", {
                amount: formatMoney(Number(value), locale),
                count: org.count,
              }),
              org.name,
            ];
          }}
        />
        <Bar
          dataKey="value"
          fill={BLUE}
          radius={[0, 4, 4, 0]}
          maxBarSize={22}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
