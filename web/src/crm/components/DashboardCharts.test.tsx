import { cloneElement, isValidElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { within } from "@testing-library/react";
import {
  RevenueChart,
  RevenueFunnel,
  TopOrganizations,
  WinRateDonut,
} from "./DashboardCharts";
import { pipelineFunnel, type MonthlyRow } from "../types";
import { deal, renderCrm } from "../test/helpers";

/**
 * ResponsiveContainer measures its parent, and jsdom lays nothing out, so every chart would render
 * empty. Giving the chart a fixed size instead is what recharts does once it has measured one.
 */
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) =>
      isValidElement<{ width: number; height: number }>(children)
        ? cloneElement(children, { width: 640, height: 240 })
        : children,
  };
});

/**
 * Query the chart, not the page: recharts sizes a label by writing it into a measurement span on
 * `document.body`, which survives cleanup still holding the last text it measured.
 */
const show = (ui: React.ReactElement) => within(renderCrm(ui).container);

const month = (partial: Partial<MonthlyRow>): MonthlyRow => ({
  key: "2026-06",
  label: "Jun",
  future: false,
  actual: 0,
  expected: 0,
  won: 0,
  count: 0,
  ...partial,
});

describe("RevenueChart", () => {
  it("labels every month and shortens the money axis to thousands", () => {
    const chart = show(
      <RevenueChart
        data={[
          month({ label: "May", actual: 40000, won: 1, count: 1 }),
          month({ label: "Jun", expected: 12000, count: 2 }),
        ]}
      />,
    );
    expect(chart.getByText("May")).toBeInTheDocument();
    expect(chart.getByText("Jun")).toBeInTheDocument();
    expect(chart.getByText("$40k")).toBeInTheDocument();
  });

  it("marks where the forecast starts", () => {
    const chart = show(
      <RevenueChart
        data={[
          month({ label: "May", actual: 40000 }),
          month({ label: "Jun", future: true, expected: 12000 }),
        ]}
      />,
    );
    expect(chart.getByText("forecast")).toBeInTheDocument();
  });

  it("leaves the forecast line off a range that is all in the past", () => {
    const chart = show(
      <RevenueChart data={[month({ label: "May", actual: 40000 })]} />,
    );
    expect(chart.queryByText("forecast")).not.toBeInTheDocument();
  });
});

describe("RevenueFunnel", () => {
  it("labels each stage with the value at or past it, so the funnel narrows", () => {
    const deals = [
      deal({ id: 1, stage: "Proposal", value: 40000 }),
      deal({ id: 2, stage: "Negotiation", value: 20000 }),
    ];
    const chart = show(
      <RevenueFunnel data={pipelineFunnel(deals, "2026-01")} />,
    );

    expect(chart.getByText("New+")).toBeInTheDocument();
    expect(chart.getByText("Won")).toBeInTheDocument();
    expect(chart.getAllByText("$60,000")).toHaveLength(3);
    expect(chart.getByText("$20,000")).toBeInTheDocument();
    expect(chart.getByText("$0")).toBeInTheDocument();
  });
});

describe("WinRateDonut", () => {
  it("puts the rate and the counts in the middle", () => {
    const chart = show(
      <WinRateDonut
        data={{ won: 3, lost: 1, wonValue: 90000, lostValue: 20000, rate: 75 }}
      />,
    );
    expect(chart.getByText("75%")).toBeInTheDocument();
    expect(chart.getByText("3 won · 1 lost")).toBeInTheDocument();
  });
});

describe("TopOrganizations", () => {
  it("names each organization down the axis", () => {
    const chart = show(
      <TopOrganizations
        data={[
          { name: "Bluepeak Software", value: 40000, count: 2 },
          { name: "Alderway", value: 10000, count: 1 },
        ]}
      />,
    );
    expect(chart.getByText("Bluepeak Software")).toBeInTheDocument();
    expect(chart.getByText("Alderway")).toBeInTheDocument();
  });
});
