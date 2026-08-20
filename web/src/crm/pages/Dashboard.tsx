import { useMemo } from "react";
import { Link } from "react-router";
import { useLocale, useT } from "../../shared/useLocale";
import { api } from "../api";
import { useFetch } from "../hooks";
import { dealStageLabel } from "../i18n";
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
  const { locale } = useLocale();
  const tc = useT("crm");
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
    () => monthRange(new Date(), MONTHS_BACK, MONTHS_FORWARD, locale),
    [locale],
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

  const funnel = useMemo(() => {
    const rows = pipelineFunnel(deals ?? [], months[0].key);
    return rows.map((row, i) => ({
      ...row,
      label:
        i === rows.length - 1
          ? dealStageLabel(tc, row.name)
          : `${dealStageLabel(tc, row.name)}+`,
    }));
  }, [deals, months, tc]);
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
  const overdue = tasks.filter((t) => t.due_date! < today);
  const upcoming = tasks.filter((t) => t.due_date! >= today);
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
        title={tc("dashboardTitle")}
        sub={tc("dashboardSub")}
      />
      <div className="stat-row">
        <StatTile
          tone="count"
          icon={<IconDeals size={17} />}
          label={tc("openDeals")}
          value={String(openDeals.length)}
          sub={tc.i("orgsInPlay", { n: orgsInPlay })}
        />
        <StatTile
          tone="open"
          icon={<IconPipeline size={17} />}
          label={tc("pipelineValue")}
          value={formatMoney(pipelineValue, locale)}
          sub={tc.i("averageDeal", {
            amount: formatMoney(averageDeal, locale),
          })}
          testId="dash-total"
        />
        <StatTile
          tone="forecast"
          icon={<IconForecast size={17} />}
          label={tc("expectedRevenue")}
          value={formatMoney(expectedRevenue, locale)}
          sub={tc.i("percentOpenPipeline", { n: weighting })}
          testId="dash-expected"
        />
        <StatTile
          tone="won"
          icon={<IconWon size={17} />}
          label={tc("dealsWon6Mo")}
          value={String(dealsWon)}
          sub={tc.i("percentClosed", { n: rate.rate })}
        />
        <StatTile
          tone="won"
          icon={<IconRevenue size={17} />}
          label={tc("revenueWon6Mo")}
          value={formatMoney(revenueWon, locale)}
          sub={
            dealsWon
              ? tc.i("perWin", {
                  amount: formatMoney(revenueWon / dealsWon, locale),
                })
              : tc("emDash")
          }
        />
      </div>
      <div className="dash-grid">
        <div className="card">
          <h2>{tc("revenueAndVolume")}</h2>
          <p className="card-sub">{tc("revenueVolumeSub")}</p>
          <RevenueChart data={monthly} />
        </div>
        <div className="card">
          <h2>{tc("revenueFunnelTitle")}</h2>
          <p className="card-sub">{tc("revenueFunnelSub")}</p>
          <RevenueFunnel data={funnel} />
        </div>
        <div className="card">
          <h2>{tc("winRate")}</h2>
          <p className="card-sub">{tc("winRateSub")}</p>
          {rate.won + rate.lost === 0 ? (
            <p className="muted">{tc("nothingClosed6Mo")}</p>
          ) : (
            <WinRateDonut data={rate} />
          )}
        </div>
        <div className="card">
          <h2>{tc("topOrganizationsTitle")}</h2>
          <p className="card-sub">{tc("topOrganizationsSub")}</p>
          {byOrg.length === 0 ? (
            <p className="muted">{tc("noOpenDealsForOrg")}</p>
          ) : (
            <TopOrganizations data={byOrg} />
          )}
        </div>
        <div className="card">
          <h2>{tc("recentActivities")}</h2>
          <div className="feed-list">
            {recent.map((a) => (
              <div key={a.id} className="feed-item">
                <ActivityIcon type={a.type} />
                <div style={{ flex: 1 }}>
                  <div>{a.description}</div>
                  <div className="timeline-meta">
                    <span>{formatDateTime(a.occurred_at, locale)}</span>
                    {relatedLink(a)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="card">
          <h2>{tc("followUps")}</h2>
          {tasks.length === 0 && <p className="muted">{tc("nothingDue")}</p>}
          <div className="task-list">
            {[...overdue, ...upcoming].map((t) => (
              <div key={t.id} className="task-item">
                <input
                  type="checkbox"
                  checked={false}
                  onChange={() => void toggleDone(t)}
                  aria-label={tc.i("markDoneAria", {
                    description: t.description,
                  })}
                />
                <div style={{ flex: 1 }}>
                  <div>{t.description}</div>
                  <div className="timeline-meta">
                    <span
                      className={`due-chip${t.due_date! < today ? " overdue" : ""}`}
                    >
                      {t.due_date! < today
                        ? tc("overduePrefix")
                        : tc("duePrefix")}
                      {formatDate(t.due_date, locale)}
                    </span>
                    {relatedLink(t)}
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
