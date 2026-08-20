import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderSpace } from "../test/helpers";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";
import SearchModal from "./SearchModal";
import { api, type SearchResult } from "../api";

vi.mock("../api", () => ({
  api: { search: vi.fn() },
}));

const results: SearchResult[] = [
  {
    id: "p1",
    title: "Japan 2026",
    icon: "🗾",
    type: "page",
    parent_title: "Travel",
    parent_type: "page",
  },
  {
    id: "r1",
    title: "Japanese Cooking",
    icon: null,
    type: "row",
    parent_title: "Reading List",
    parent_type: "database",
  },
];

function renderModal(onClose = vi.fn()) {
  renderSpace(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<SearchModal onClose={onClose} />} />
        <Route path="/p/:pageId" element={<div data-testid="dest" />} />
      </Routes>
    </MemoryRouter>,
  );
  return onClose;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SearchModal", () => {
  it("searches as you type and lists results with context", async () => {
    vi.mocked(api.search).mockResolvedValue(results);
    renderModal();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search" }),
      "japan",
    );
    await waitFor(() => expect(api.search).toHaveBeenCalledWith("japan"));
    expect(await screen.findByText("Japan 2026")).toBeInTheDocument();
    expect(screen.getByText("Japanese Cooking")).toBeInTheDocument();
    expect(screen.getByText("Reading List")).toBeInTheDocument();
  });

  it("navigates with arrow keys and Enter", async () => {
    vi.mocked(api.search).mockResolvedValue(results);
    const onClose = renderModal();
    const input = screen.getByRole("textbox", { name: "Search" });
    await userEvent.type(input, "japan");
    await screen.findByText("Japan 2026");
    await userEvent.keyboard("{ArrowDown}");
    expect(
      screen.getByRole("option", { name: /Japanese Cooking/ }),
    ).toHaveAttribute("aria-selected", "true");
    await userEvent.keyboard("{Enter}");
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByTestId("dest")).toBeInTheDocument();
  });

  it("jumps to a clicked result", async () => {
    vi.mocked(api.search).mockResolvedValue(results);
    const onClose = renderModal();
    await userEvent.type(screen.getByRole("textbox", { name: "Search" }), "ja");
    await userEvent.click(await screen.findByText("Japan 2026"));
    expect(onClose).toHaveBeenCalled();
    expect(screen.getByTestId("dest")).toBeInTheDocument();
  });

  it("shows an empty state and closes on Escape", async () => {
    vi.mocked(api.search).mockResolvedValue([]);
    const onClose = renderModal();
    await userEvent.type(
      screen.getByRole("textbox", { name: "Search" }),
      "zzz",
    );
    expect(await screen.findByText(/No matches for/)).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
