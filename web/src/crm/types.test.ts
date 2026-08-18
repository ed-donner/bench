import { describe, expect, it } from "vitest";
import {
  Deal,
  DealStage,
  STAGE_PROBABILITY,
  boardOrder,
  monthRange,
  monthlyRevenue,
  moveDeal,
  pipelineFunnel,
  topOrganizations,
  winLoss,
} from "./types";
import { deal as makeDeal } from "./test/helpers";

let nextId = 1;

function deal(
  stage: DealStage,
  value: number,
  close_date: string | null = null,
  organization_id: number | null = null,
): Deal {
  return {
    id: nextId++,
    name: `Deal ${nextId}`,
    organization_id,
    contact_id: null,
    stage,
    value,
    probability: STAGE_PROBABILITY[stage],
    close_date,
    board_order: 0,
    created_at: "2026-01-01 00:00:00",
  };
}

const SINCE = "2026-03";

const rowFor = (rows: ReturnType<typeof pipelineFunnel>, stage: DealStage) =>
  rows.find((r) => r.name === stage)!;

describe("pipeline funnel", () => {
  it("counts a deal towards its own stage and every stage before it", () => {
    const rows = pipelineFunnel([deal("Negotiation", 1000)], SINCE, (s) => s);
    expect(rowFor(rows, "New").value).toBe(1000);
    expect(rowFor(rows, "Negotiation").value).toBe(1000);
    expect(rowFor(rows, "Won").value).toBe(0);
  });

  it("narrows from top to bottom", () => {
    const rows = pipelineFunnel(
      [
        deal("New", 100),
        deal("Qualified", 100),
        deal("Proposal", 100),
        deal("Negotiation", 100),
      ],
      SINCE,
      (s) => s,
    );
    expect(rows.map((r) => r.value)).toEqual([400, 300, 200, 100, 0]);
  });

  it("separates the count at or past a stage from the count sitting in it", () => {
    const rows = pipelineFunnel(
      [deal("Proposal", 100), deal("Negotiation", 100)],
      SINCE,
      (s) => s,
    );
    expect(rowFor(rows, "Proposal").count).toBe(2);
    expect(rowFor(rows, "Proposal").inStage).toBe(1);
  });

  it("leaves lost deals out of every row", () => {
    const rows = pipelineFunnel(
      [deal("New", 500), deal("Lost", 900)],
      SINCE,
      (s) => s,
    );
    expect(rowFor(rows, "New").value).toBe(500);
    expect(rowFor(rows, "New").count).toBe(1);
  });

  it("counts a win from inside the window at every stage", () => {
    const rows = pipelineFunnel(
      [deal("Won", 700, "2026-05-14")],
      SINCE,
      (s) => s,
    );
    expect(rows.map((r) => r.value)).toEqual([700, 700, 700, 700, 700]);
  });

  it("drops a win that closed before the window, so old wins stop inflating the top", () => {
    const recent = deal("Won", 700, "2026-05-14");
    const ancient = deal("Won", 9000, "2025-11-02");
    expect(
      pipelineFunnel([recent, ancient], SINCE, (s) => s).map((r) => r.value),
    ).toEqual([700, 700, 700, 700, 700]);
  });

  it("keeps an open deal closing beyond the window, where most of the pipeline sits", () => {
    const rows = pipelineFunnel(
      [deal("Qualified", 300, "2026-12-01")],
      SINCE,
      (s) => s,
    );
    expect(rowFor(rows, "Qualified").value).toBe(300);
  });

  it("ignores a won deal with no close date, as the monthly charts do", () => {
    expect(
      rowFor(
        pipelineFunnel([deal("Won", 400)], SINCE, (s) => s),
        "Won",
      ).value,
    ).toBe(0);
  });

  it("marks every row but the last as covering the stages past it", () => {
    expect(pipelineFunnel([], SINCE, (s) => s).map((r) => r.label)).toEqual([
      "New+",
      "Qualified+",
      "Proposal+",
      "Negotiation+",
      "Won",
    ]);
  });
});

describe("month range", () => {
  const AUG_2026 = new Date(2026, 7, 14);

  it("runs from back months before to forward months after, oldest first", () => {
    const months = monthRange(AUG_2026, 5, 6);
    expect(months).toHaveLength(12);
    expect(months[0].key).toBe("2026-03");
    expect(months[5].key).toBe("2026-08");
  });

  it("rolls into the next year rather than overflowing the month", () => {
    expect(monthRange(AUG_2026, 5, 6).at(-1)!.key).toBe("2027-02");
  });

  it("marks only the months after the current one as future", () => {
    const months = monthRange(AUG_2026, 5, 6);
    expect(months.filter((m) => m.future).map((m) => m.key)).toEqual([
      "2026-09",
      "2026-10",
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
  });
});

describe("monthly revenue", () => {
  const months = monthRange(new Date(2026, 7, 14), 5, 6);
  const august = (rows: ReturnType<typeof monthlyRevenue>) =>
    rows.find((r) => r.key === "2026-08")!;
  const december = (rows: ReturnType<typeof monthlyRevenue>) =>
    rows.find((r) => r.key === "2026-12")!;

  it("books a won deal as actual revenue in the month it closed", () => {
    const rows = monthlyRevenue([deal("Won", 5000, "2026-08-03")], months);
    expect(august(rows).actual).toBe(5000);
    expect(august(rows).won).toBe(1);
    expect(august(rows).expected).toBe(0);
  });

  it("weights an open deal by its probability and leaves actual alone", () => {
    const rows = monthlyRevenue(
      [deal("Qualified", 4000, "2026-12-09")],
      months,
    );
    expect(december(rows).expected).toBe(1000);
    expect(december(rows).actual).toBe(0);
  });

  it("counts won and open deals as volume but not lost ones", () => {
    const rows = monthlyRevenue(
      [
        deal("Won", 100, "2026-08-01"),
        deal("Proposal", 100, "2026-08-02"),
        deal("Lost", 900, "2026-08-03"),
      ],
      months,
    );
    expect(august(rows).count).toBe(2);
    expect(august(rows).actual).toBe(100);
  });

  it("ignores a deal with no close date, which belongs to no month", () => {
    const rows = monthlyRevenue([deal("Won", 5000)], months);
    expect(rows.every((r) => r.actual === 0 && r.count === 0)).toBe(true);
  });
});

describe("win rate", () => {
  it("counts closed deals either side and rounds the rate", () => {
    const rate = winLoss(
      [
        deal("Won", 100, "2026-05-01"),
        deal("Won", 200, "2026-06-01"),
        deal("Lost", 300, "2026-07-01"),
      ],
      SINCE,
    );
    expect(rate).toMatchObject({
      won: 2,
      lost: 1,
      wonValue: 300,
      lostValue: 300,
      rate: 67,
    });
  });

  it("ignores deals still open", () => {
    expect(
      winLoss([deal("Negotiation", 100, "2026-05-01")], SINCE),
    ).toMatchObject({ won: 0, lost: 0, rate: 0 });
  });

  it("ignores deals that closed before the window", () => {
    expect(winLoss([deal("Won", 100, "2025-12-01")], SINCE).won).toBe(0);
  });

  it("reports zero rather than dividing by nothing when the window is empty", () => {
    expect(winLoss([], SINCE).rate).toBe(0);
  });
});

describe("top organizations", () => {
  const names = new Map([
    [1, "Northwind"],
    [2, "Bluepeak"],
  ]);

  it("totals open value per organization, largest first", () => {
    const rows = topOrganizations(
      [
        deal("New", 100, null, 1),
        deal("Proposal", 900, null, 2),
        deal("Qualified", 50, null, 1),
      ],
      names,
      5,
    );
    expect(rows).toEqual([
      { name: "Bluepeak", value: 900, count: 1 },
      { name: "Northwind", value: 150, count: 2 },
    ]);
  });

  it("leaves out closed deals, since the chart is about open pipeline", () => {
    const rows = topOrganizations(
      [deal("Won", 900, null, 1), deal("Lost", 800, null, 1)],
      names,
      5,
    );
    expect(rows).toEqual([]);
  });

  it("drops a deal whose organization is unknown rather than charting a blank bar", () => {
    expect(
      topOrganizations(
        [deal("New", 100, null, 99), deal("New", 100)],
        names,
        5,
      ),
    ).toEqual([]);
  });

  it("keeps only the requested number of organizations", () => {
    const rows = topOrganizations(
      [deal("New", 100, null, 1), deal("New", 900, null, 2)],
      names,
      1,
    );
    expect(rows.map((r) => r.name)).toEqual(["Bluepeak"]);
  });
});

describe("board order", () => {
  const cards = [
    makeDeal({ id: 1, name: "A", stage: "New", board_order: 1 }),
    makeDeal({ id: 2, name: "B", stage: "New", board_order: 0 }),
    makeDeal({ id: 3, name: "C", stage: "Qualified", board_order: 0 }),
  ];
  const names = (ds: Deal[]) => ds.map((d) => d.name);

  it("groups by stage and sorts each column by its stored position", () => {
    expect(names(boardOrder(cards))).toEqual(["B", "A", "C"]);
  });

  it("drops a deal into another column at the index it was released", () => {
    const next = moveDeal(boardOrder(cards), 1, "Qualified", 0);
    expect(names(next)).toEqual(["B", "A", "C"]);
    expect(next[1].stage).toBe("Qualified");
  });

  it("re-bases the probability when the column changes, but not when it does not", () => {
    const hand = makeDeal({ id: 4, stage: "New", probability: 42 });
    const across = moveDeal([hand], 4, "Proposal", 0);
    expect(across[0].probability).toBe(50);
    const within = moveDeal([hand], 4, "New", 0);
    expect(within[0].probability).toBe(42);
  });

  it("reorders within one column", () => {
    expect(names(moveDeal(boardOrder(cards), 1, "New", 0))).toEqual([
      "A",
      "B",
      "C",
    ]);
  });
});
