import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ContactList, DealList } from "./RelatedLists";
import { renderCrm, contact, deal } from "../test/helpers";

const show = (ui: React.ReactElement) =>
  renderCrm(<MemoryRouter>{ui}</MemoryRouter>);

describe("DealList", () => {
  it("says so when there are none", () => {
    show(<DealList deals={[]} />);
    expect(screen.getByText("No deals yet.")).toBeInTheDocument();
  });

  it("links each deal and shows its value and stage", () => {
    show(<DealList deals={[deal({ id: 7, value: 40000 })]} />);
    expect(
      screen.getByRole("link", { name: "Platform rollout" }),
    ).toHaveAttribute("href", "/deals/7");
    expect(screen.getByText("$40,000")).toBeInTheDocument();
    expect(screen.getByText("Proposal")).toBeInTheDocument();
  });
});

describe("ContactList", () => {
  it("says so when there are none", () => {
    show(<ContactList contacts={[]} />);
    expect(screen.getByText("No contacts yet.")).toBeInTheDocument();
  });

  it("links each contact and shows its status", () => {
    show(<ContactList contacts={[contact({ id: 3, status: "customer" })]} />);
    expect(
      screen.getByRole("link", { name: "Dana Whitfield" }),
    ).toHaveAttribute("href", "/contacts/3");
    expect(screen.getByText("customer")).toBeInTheDocument();
  });

  it("falls back to the email when there is no job title, and to nothing when there is neither", () => {
    show(
      <ContactList
        contacts={[
          contact({ id: 1, job_title: null }),
          contact({ id: 2, name: "Sam Reyes", job_title: null, email: null }),
        ]}
      />,
    );
    expect(screen.getByText("dana@example.com")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sam Reyes" })).toBeInTheDocument();
  });
});
