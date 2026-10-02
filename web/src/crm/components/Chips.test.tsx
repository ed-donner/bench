import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderCrm } from "../test/helpers";
import { StageChip, StatusChip } from "./Chips";

describe("chips", () => {
  it("names the status and carries its class, which is what colours it", () => {
    renderCrm(<StatusChip status="customer" />);
    const chip = screen.getByText("customer");
    expect(chip).toHaveClass("chip", "chip-customer");
  });

  it("names the stage and carries its class", () => {
    renderCrm(<StageChip stage="Negotiation" />);
    expect(screen.getByText("Negotiation")).toHaveClass(
      "chip",
      "stage-Negotiation",
    );
  });
});
