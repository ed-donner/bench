import { locale } from "../shared/i18n";

export const DEAL_STAGES = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
  "Won",
  "Lost",
] as const;
export type DealStage = (typeof DEAL_STAGES)[number];

export const CONTACT_STATUSES = ["lead", "qualified", "customer"] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const ACTIVITY_TYPES = ["note", "call", "email"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export interface Organization {
  id: number;
  name: string;
  website: string | null;
  industry: string | null;
  notes: string | null;
  created_at: string;
}

export interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  organization_id: number | null;
  status: ContactStatus;
  created_at: string;
}

export interface Deal {
  id: number;
  name: string;
  organization_id: number | null;
  contact_id: number | null;
  stage: DealStage;
  value: number;
  probability: number;
  close_date: string | null;
  /** Position within the deal's own pipeline column, ascending. */
  board_order: number;
  created_at: string;
}

/** Default win likelihood per stage; the server re-bases a deal on this when it moves. */
export const STAGE_PROBABILITY: Record<DealStage, number> = {
  New: 10,
  Qualified: 25,
  Proposal: 50,
  Negotiation: 75,
  Won: 100,
  Lost: 0,
};

/** Stage colours, drawn from the app palette so the pipeline matches the rest of the UI. */
export const STAGE_COLOR: Record<DealStage, string> = {
  New: "#6b7280",
  Qualified: "#209dd7",
  Proposal: "#753991",
  Negotiation: "#ecad0a",
  Won: "#2f9e5f",
  Lost: "#c94f42",
};

/** Stages a deal can still be won from. */
const OPEN_STAGES: DealStage[] = [
  "New",
  "Qualified",
  "Proposal",
  "Negotiation",
];

export function isOpen(deal: Deal): boolean {
  return OPEN_STAGES.includes(deal.stage);
}

/** Value weighted by the odds of winning it. */
export function expectedValue(
  deal: Pick<Deal, "value" | "probability">,
): number {
  return (deal.value * deal.probability) / 100;
}

export function sumValue(deals: Deal[]): number {
  return deals.reduce((total, d) => total + d.value, 0);
}

export function sumExpected(deals: Deal[]): number {
  return deals.reduce((total, d) => total + expectedValue(d), 0);
}

/** The board's own order: grouped by stage, each column in the order it is drawn. */
export function boardOrder(deals: Deal[]): Deal[] {
  return [...deals].sort(
    (a, b) =>
      DEAL_STAGES.indexOf(a.stage) - DEAL_STAGES.indexOf(b.stage) ||
      a.board_order - b.board_order ||
      a.id - b.id,
  );
}

/**
 * A deal dropped into `stage` at `index`, against a list already in board order. Crossing into
 * another column re-bases the probability the way the server does, so the totals move with the
 * card; reordering inside one leaves it alone.
 */
export function moveDeal(
  deals: Deal[],
  id: number,
  stage: DealStage,
  index: number,
): Deal[] {
  const deal = deals.find((d) => d.id === id)!;
  const moved =
    deal.stage === stage
      ? deal
      : { ...deal, stage, probability: STAGE_PROBABILITY[stage] };
  const columns = new Map(DEAL_STAGES.map((s) => [s, [] as Deal[]]));
  for (const d of deals) if (d.id !== id) columns.get(d.stage)!.push(d);
  columns.get(stage)!.splice(index, 0, moved);
  return DEAL_STAGES.flatMap((s) => columns.get(s)!);
}

export interface FunnelRow {
  /** The stage as it reads on screen, which is the language's business rather than the data's. */
  name: string;
  /** Says the row covers this stage and everything past it, which the stage name alone does not. */
  label: string;
  value: number;
  count: number;
  inStage: number;
  fill: string;
}

/**
 * Rows for the pipeline funnel: value at or past each stage, so the shape narrows the way a funnel
 * should. A won deal counts towards every row, so wins are capped at `sinceMonth` ('YYYY-MM') -
 * without a horizon every win ever recorded would keep widening the top and the funnel would drift
 * away from describing the pipeline. Open deals are all included, whenever they are due to close,
 * since most of them close beyond that window. Lost deals never appear: a deal that dies overwrites
 * the stage it reached, so there is nothing to place it at.
 */
export function pipelineFunnel(
  deals: Deal[],
  sinceMonth: string,
  stageLabel: (stage: DealStage) => string,
): FunnelRow[] {
  const stages: DealStage[] = [...OPEN_STAGES, "Won"];
  const live = deals.filter(
    (d) =>
      isOpen(d) || (d.stage === "Won" && (d.close_date ?? "") >= sinceMonth),
  );
  return stages.map((stage, i) => {
    const reached = live.filter((d) => stages.indexOf(d.stage) >= i);
    return {
      name: stageLabel(stage),
      // No space before the plus: recharts breaks a funnel label onto a second line at whitespace.
      label:
        i === stages.length - 1 ? stageLabel(stage) : `${stageLabel(stage)}+`,
      value: sumValue(reached),
      count: reached.length,
      inStage: live.filter((d) => d.stage === stage).length,
      fill: STAGE_COLOR[stage],
    };
  });
}

export interface Month {
  key: string;
  label: string;
  future: boolean;
}

/** Months from `back` before `from` to `forward` after it, oldest first, keyed 'YYYY-MM'. */
export function monthRange(from: Date, back: number, forward: number): Month[] {
  const months: Month[] = [];
  for (let i = -back; i <= forward; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    months.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: d.toLocaleDateString(locale(), { month: "short" }),
      future: i > 0,
    });
  }
  return months;
}

export interface MonthlyRow extends Month {
  actual: number;
  expected: number;
  won: number;
  /** Deals closing that month, won or still open. Lost deals are not volume. */
  count: number;
}

/**
 * Revenue by month. Won value is what actually landed, so it only fills months that have already
 * happened; expected value is the weighted open pipeline, so it mostly falls ahead. Running the
 * range across both is what makes the chart read as one timeline rather than two.
 */
export function monthlyRevenue(deals: Deal[], months: Month[]): MonthlyRow[] {
  return months.map((month) => {
    const closing = deals.filter((d) => d.close_date?.startsWith(month.key));
    const won = closing.filter((d) => d.stage === "Won");
    const open = closing.filter(isOpen);
    return {
      ...month,
      actual: sumValue(won),
      expected: sumExpected(open),
      won: won.length,
      count: won.length + open.length,
    };
  });
}

export interface WinLoss {
  won: number;
  lost: number;
  wonValue: number;
  lostValue: number;
  /** Percent of closed deals won, 0 when nothing has closed yet. */
  rate: number;
}

/** Win rate over deals that closed on or after `sinceMonth` ('YYYY-MM'). */
export function winLoss(deals: Deal[], sinceMonth: string): WinLoss {
  const closed = deals.filter(
    (d) =>
      (d.stage === "Won" || d.stage === "Lost") &&
      (d.close_date ?? "") >= sinceMonth,
  );
  const won = closed.filter((d) => d.stage === "Won");
  const lost = closed.filter((d) => d.stage === "Lost");
  return {
    won: won.length,
    lost: lost.length,
    wonValue: sumValue(won),
    lostValue: sumValue(lost),
    rate: closed.length ? Math.round((won.length / closed.length) * 100) : 0,
  };
}

export interface OrgPipeline {
  name: string;
  value: number;
  count: number;
}

/** Organizations holding the most open pipeline, largest first. Deals with no organization drop out. */
export function topOrganizations(
  deals: Deal[],
  orgName: Map<number, string>,
  limit: number,
): OrgPipeline[] {
  const totals = new Map<string, OrgPipeline>();
  for (const deal of deals.filter(isOpen)) {
    const name = orgName.get(deal.organization_id ?? -1);
    if (!name) continue;
    const row = totals.get(name) ?? { name, value: 0, count: 0 };
    row.value += deal.value;
    row.count += 1;
    totals.set(name, row);
  }
  return [...totals.values()].sort((a, b) => b.value - a.value).slice(0, limit);
}

export interface Activity {
  id: number;
  type: ActivityType;
  contact_id: number | null;
  deal_id: number | null;
  description: string;
  occurred_at: string;
  due_date: string | null;
  done: 0 | 1;
  created_at: string;
}
