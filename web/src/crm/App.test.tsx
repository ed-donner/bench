import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App";
import { api } from "./api";
import { renderCrm, deal, routes } from "./test/helpers";

vi.mock("./api", () => ({ api: { get: vi.fn() }, query: () => "" }));

beforeEach(() => {
  vi.mocked(api.get).mockImplementation(
    routes({
      "/api/crm/deals/1": deal({ id: 1, name: "Platform rollout" }),
      "/api/crm/deals": [],
      "/api/crm/contacts": [],
      "/api/crm/organizations": [],
      "/api/crm/activities": [],
    }),
  );
});

afterEach(() => {
  vi.clearAllMocks();
});

const show = (path = "/") =>
  renderCrm(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );

describe("CRM App", () => {
  it("opens on the dashboard and links out to the launcher", () => {
    show();
    expect(
      screen.getByRole("heading", { name: "Dashboard", level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Home" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("navigates to each section from the sidebar", async () => {
    show();
    for (const section of ["Organizations", "Contacts", "Deals", "Pipeline"]) {
      await userEvent.click(screen.getByRole("link", { name: section }));
      expect(
        screen.getByRole("heading", { name: section, level: 1 }),
      ).toBeInTheDocument();
    }
  });

  it("marks only the section being shown as current", async () => {
    show();
    await userEvent.click(screen.getByRole("link", { name: "Contacts" }));

    expect(screen.getByRole("link", { name: "Contacts" })).toHaveClass(
      "active",
    );
    // The dashboard link is `end`, or every route below / would light it up too.
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveClass(
      "active",
    );
  });

  it("renders a deep link straight into a detail page", async () => {
    show("/deals/1");
    expect(
      await screen.findByRole("heading", {
        name: "Platform rollout",
        level: 1,
      }),
    ).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith("/api/crm/deals/1");
  });
});
