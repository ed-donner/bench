import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App";
import { api } from "./api";
import { node, pageData, renderSpace } from "./test/helpers";

vi.mock("./api", () => ({
  api: {
    tree: vi.fn(),
    getPage: vi.fn(),
    createBlock: vi.fn().mockResolvedValue({}),
    updateBlock: vi.fn().mockResolvedValue({}),
    search: vi.fn().mockResolvedValue([]),
  },
}));

describe("App", () => {
  it("loads the tree and redirects to the first page", async () => {
    vi.mocked(api.tree).mockResolvedValue([
      node({ id: "home", title: "Home", icon: "🏠" }),
    ]);
    vi.mocked(api.getPage).mockResolvedValue(
      pageData({ id: "home", title: "Home", icon: "🏠" }),
    );
    renderSpace(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    expect(screen.getByText("Personal Space")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Home")).toBeInTheDocument();
  });

  it("opens and closes quick-find with the keyboard shortcut", async () => {
    vi.mocked(api.tree).mockResolvedValue([
      node({ id: "home", title: "Home", icon: "🏠" }),
    ]);
    vi.mocked(api.getPage).mockResolvedValue(
      pageData({ id: "home", title: "Home", icon: "🏠" }),
    );
    const user = userEvent.setup();
    renderSpace(
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>,
    );
    await user.keyboard("{Meta>}k{/Meta}");
    expect(
      screen.getByRole("dialog", { name: "Quick find" }),
    ).toBeInTheDocument();
    await user.keyboard("{Control>}k{/Control}");
    expect(
      screen.queryByRole("dialog", { name: "Quick find" }),
    ).not.toBeInTheDocument();
  });
});
