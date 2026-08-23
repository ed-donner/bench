import { useMemo } from "react";
import { Link } from "react-router";
import { useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import {
  Activity,
  Contact,
  Deal,
  Organization,
  isOpen,
  monthRange,
  monthlyRevenue,
  pipelineFunnel,
  sumExpected,
  sumValue,
  topOrganizations,
  winLoss,
} from "../types";
import {
  RevenueChart,
  RevenueFunnel,
  TopOrganizations,
  WinRateDonut,
} from "../components/DashboardCharts";
import { formatDate, formatDateTime, formatMoney } from "../format";
import ActivityIcon from "../components/ActivityIcon";
import PageHeader from "../components/PageHeader";
import {
  IconDashboard,
  IconDeals,
  IconForecast,
  IconPipeline,
  IconRevenue,
  IconWon,
} from "../components/Icons";

/** Six months behind and six ahead: what landed, then what is forecast to. */
const MONTHS_BACK = 5;
const MONTHS_FORWARD = 6;

/**
 * One headline figure. The tone is the whole point of the row: purple counts deals, blue is the
 * open pipeline, amber is forecast, green is money already won - the same meanings the charts
 * below use.
 */
function StatTile({
  tone,
  icon,
  label,
  value,
  sub,
  testId,
}: {
  tone: "count" | "open" | "forecast" | "won";
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  testId?: string;
}) {
  return (
    <div className={`card stat-tile tone-${tone}`}>
      <div className="stat-top">
        <span className="stat-icon">{icon}</span>
        <span className="stat-label">{label}</span>
      </div>
      <div className="stat-value" data-testid={testId}>
        {value}
      </div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

export default function Dashboard() {
  const t = useT();
  const { data: deals } = useFetch<Deal[]>("/api/crm/deals");
  const { data: contacts } = useFetch<Contact[]>("/api/crm/contacts");
  const { data: orgs } = useFetch<Organization[]>("/api/crm/organizations");
  const { data: activities, reload: reloadActivities } = useFetch<Activity[]>(
    "/api/crm/activities",
  );

  const contactName = useMemo(
    () => new Map((contacts ?? []).map((c) => [c.id, c.name])),
    [contacts],
  );
  const dealName = useMemo(
    () => new Map((deals ?? []).map((d) => [d.id, d.name])),
    [deals],
  );
  const orgName = useMemo(
    () => new Map((orgs ?? []).map((o) => [o.id, o.name])),
    [orgs],
  );

  const months = useMemo(
    () => monthRange(new Date(), MONTHS_BACK, MONTHS_FORWARD),
    [],
  );
  const monthly = useMemo(
    () => monthlyRevenue(deals ?? [], months),
    [deals, months],
  );
  // The tiles say "6 mo" and mean it, so they read the trailing slice rather than the whole range.
  const trailing = monthly.slice(0, MONTHS_BACK + 1);

  const openDeals = useMemo(() => (deals ?? []).filter(isOpen), [deals]);
  const pipelineValue = sumValue(openDeals);
  const expectedRevenue = sumExpected(openDeals);
  const averageDeal = openDeals.length ? pipelineValue / openDeals.length : 0;
  // Counted here rather than from `byOrg`, which is the chart's top five and would cap at 5.
  const orgsInPlay = new Set(
    openDeals.map((d) => d.organization_id).filter((id) => id !== null),
  ).size;
  const weighting = pipelineValue
    ? Math.round((expectedRevenue / pipelineValue) * 100)
    : 0;
  const dealsWon = trailing.reduce((s, m) => s + m.won, 0);
  const revenueWon = trailing.reduce((s, m) => s + m.actual, 0);

  const funnel = useMemo(
    () => pipelineFunnel(deals ?? [], months[0].key),
    [deals, months],
  );
  const rate = useMemo(
    () => winLoss(deals ?? [], months[0].key),
    [deals, months],
  );
  const byOrg = useMemo(
    () => topOrganizations(deals ?? [], orgName, 5),
    [deals, orgName],
  );

  const today = new Date().toISOString().slice(0, 10);
  const tasks = useMemo(
    () =>
      (activities ?? [])
        .filter((a) => a.due_date && !a.done)
        .sort((a, b) => a.due_date!.localeCompare(b.due_date!)),
    [activities],
  );
  const overdue = tasks.filter((task) => task.due_date! < today);
  const upcoming = tasks.filter((task) => task.due_date! >= today);
  const recent = (activities ?? []).slice(0, 8);

  async function toggleDone(task: Activity) {
    await api.patch(`/api/crm/activities/${task.id}`, { done: true });
    reloadActivities();
  }

  function relatedLink(a: Activity) {
    if (a.contact_id && contactName.has(a.contact_id))
      return (
        <Link className="entity-link" to={`/contacts/${a.contact_id}`}>
          {contactName.get(a.contact_id)}
        </Link>
      );
    if (a.deal_id && dealName.has(a.deal_id))
      return (
        <Link className="entity-link" to={`/deals/${a.deal_id}`}>
          {dealName.get(a.deal_id)}
        </Link>
      );
    return null;
  }

  return (
    <>
      <PageHeader
        icon={<IconDashboard size={20} />}
        title={t("crm.dashboard.title")}
        sub={t("crm.dashboard.sub")}
      />
      <div className="stat-row">
        <StatTile
          tone="count"
          icon={<IconDeals size={17} />}
          label={t("crm.dashboard.stat.openDeals")}
          value={String(openDeals.length)}
          sub={t("crm.dashboard.stat.orgsInPlay", { count: orgsInPlay })}
        />
        <StatTile
          tone="open"
          icon={<IconPipeline size={17} />}
          label={t("crm.dashboard.stat.pipelineValue")}
          value={formatMoney(pipelineValue)}
          sub={t("crm.dashboard.stat.averageDeal", {
            amount: formatMoney(averageDeal),
          })}
          testId="dash-total"
        />
        <StatTile
          tone="forecast"
          icon={<IconForecast size={17} />}
          label={t("crm.dashboard.stat.expectedRevenue")}
          value={formatMoney(expectedRevenue)}
          sub={t("crm.dashboard.stat.weighting", { percent: weighting })}
          testId="dash-expected"
        />
        <StatTile
          tone="won"
          icon={<IconWon size={17} />}
          label={t("crm.dashboard.stat.dealsWon6mo")}
          value={String(dealsWon)}
          sub={t("crm.dashboard.stat.winRateClosed", { rate: rate.rate })}
        />
        <StatTile
          tone="won"
          icon={<IconRevenue size={17} />}
          label={t("crm.dashboard.stat.revenueWon6mo")}
          value={formatMoney(revenueWon)}
          sub={
            dealsWon
              ? t("crm.dashboard.stat.perWin", {
                  amount: formatMoney(revenueWon / dealsWon),
                })
              : t("shared.common.emDash")
          }
        />
      </div>
      <div className="dash-grid">
        <div className="card">
          <h2>{t("crm.dashboard.chart.revenueTitle")}</h2>
          <p className="card-sub">{t("crm.dashboard.chart.revenueSub")}</p>
          <RevenueChart data={monthly} />
        </div>
        <div className="card">
          <h2>{t("crm.dashboard.chart.funnelTitle")}</h2>
          <p className="card-sub">{t("crm.dashboard.chart.funnelSub")}</p>
          <RevenueFunnel data={funnel} />
        </div>
        <div className="card">
          <h2>{t("crm.dashboard.chart.winRateTitle")}</h2>
          <p className="card-sub">{t("crm.dashboard.chart.winRateSub")}</p>
          {rate.won + rate.lost === 0 ? (
            <p className="muted">{t("crm.dashboard.chart.winRateEmpty")}</p>
          ) : (
            <WinRateDonut data={rate} />
          )}
        </div>
        <div className="card">
          <h2>{t("crm.dashboard.chart.topOrgsTitle")}</h2>
          <p className="card-sub">{t("crm.dashboard.chart.topOrgsSub")}</p>
          {byOrg.length === 0 ? (
            <p className="muted">{t("crm.dashboard.chart.topOrgsEmpty")}</p>
          ) : (
            <TopOrganizations data={byOrg} />
          )}
        </div>
        <div className="card">
          <h2>{t("crm.dashboard.recentActivity")}</h2>
          <div className="feed-list">
            {recent.map((a) => (
              <div key={a.id} className="feed-item">
                <ActivityIcon type={a.type} />
                <div style={{ flex: 1 }}>
                  <div>{a.description}</div>
                  <div className="timeline-meta">
                    <span>{formatDateTime(a.occurred_at)}</span>
                    {relatedLink(a)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>{t("crm.dashboard.followUps")}</h2>
          {tasks.length === 0 && (
            <p className="muted">{t("crm.dashboard.followUpsEmpty")}</p>
          )}
          <div className="task-list">
            {[...overdue, ...upcoming].map((task) => (
              <div key={task.id} className="task-item">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => void toggleDone(task)}
                  aria-label={t("shared.common.markDone", {
                    description: task.description,
                  })}
                />
                <div style={{ flex: 1 }}>
                  <div>{task.description}</div>
                  <div className="timeline-meta">
                    <span
                      className={`due-chip${task.due_date! < today ? " overdue" : ""}`}
                    >
                      {task.due_date! < today
                        ? t("crm.dashboard.dueOverdue")
                        : t("crm.dashboard.due")}
                      {formatDate(task.due_date)}
                    </span>
                    {relatedLink(task)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
