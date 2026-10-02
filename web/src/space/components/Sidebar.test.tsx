import { describe, expect, it, vi, beforeEach } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import Sidebar from "./Sidebar";
import { subtreeContains } from "../tree";
import { api } from "../api";
import { node, pageData, renderSpace } from "../test/helpers";

vi.mock("../api", () => ({
  api: {
    createPage: vi.fn(),
    updatePage: vi.fn(),
    deletePage: vi.fn(),
  },
}));

const tree = [
  node({
    id: "root1",
    title: "Projects",
    icon: "🗂️",
    children: [node({ id: "child1", title: "Garden", icon: "🌱" })],
  }),
  node({ id: "root2", title: "Notes", icon: "🧠" }),
];

function renderSidebar(
  onChange = vi.fn(),
  initialPath = "/",
  onSearch = vi.fn(),
) {
  renderSpace(
    <MemoryRouter initialEntries={[initialPath]}>
      <Sidebar tree={tree} onChange={onChange} onSearch={onSearch} />
    </MemoryRouter>,
  );
  return { onChange, onSearch };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Sidebar", () => {
  it("renders root pages with icons, children hidden until expanded", async () => {
    renderSidebar();
    expect(screen.getByText("Projects")).toBeInTheDocument();
    expect(screen.getByText("🗂️")).toBeInTheDocument();
    expect(screen.queryByText("Garden")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Expand Projects" }),
    );
    expect(screen.getByText("Garden")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Collapse Projects" }),
    );
    expect(screen.queryByText("Garden")).not.toBeInTheDocument();
  });

  it("remembers expanded state in localStorage", async () => {
    renderSidebar();
    await userEvent.click(
      screen.getByRole("button", { name: "Expand Projects" }),
    );
    expect(JSON.parse(localStorage.getItem("ps.expanded")!)).toContain("root1");
  });

  it("marks the active page from the URL", () => {
    renderSidebar(vi.fn(), "/p/root2");
    expect(screen.getByRole("treeitem", { name: /Notes/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("treeitem", { name: /Projects/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
  });

  it("creates a root page from the footer button", async () => {
    vi.mocked(api.createPage).mockResolvedValue(
      pageData({ id: "new1", title: "" }),
    );
    const onChange = vi.fn();
    renderSidebar(onChange);
    await userEvent.click(screen.getByRole("button", { name: "New page" }));
    expect(api.createPage).toHaveBeenCalledWith({
      parentId: null,
      title: "",
      type: "page",
    });
    expect(onChange).toHaveBeenCalled();
  });

  it("creates a nested page via the row plus button", async () => {
    vi.mocked(api.createPage).mockResolvedValue(
      pageData({ id: "new2", title: "" }),
    );
    renderSidebar();
    await userEvent.click(
      screen.getByRole("button", { name: "Add page inside Notes" }),
    );
    expect(api.createPage).toHaveBeenCalledWith({
      parentId: "root2",
      title: "",
      type: "page",
    });
  });

  it("renames a page inline through the options menu", async () => {
    vi.mocked(api.updatePage).mockResolvedValue(
      pageData({ id: "root2", title: "Journal" }),
    );
    const onChange = vi.fn();
    renderSidebar(onChange);
    await userEvent.click(
      screen.getByRole("button", { name: "Page options for Notes" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    const input = screen.getByRole("textbox", { name: "Rename page" });
    await userEvent.clear(input);
    await userEvent.type(input, "Journal{Enter}");
    expect(api.updatePage).toHaveBeenCalledWith("root2", { title: "Journal" });
    expect(onChange).toHaveBeenCalled();
  });

  it("cancels a rename with Escape", async () => {
    renderSidebar();
    await userEvent.click(
      screen.getByRole("button", { name: "Page options for Notes" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Rename" }));
    await userEvent.type(
      screen.getByRole("textbox", { name: "Rename page" }),
      "X{Escape}",
    );
    expect(api.updatePage).not.toHaveBeenCalled();
    expect(screen.getByText("Notes")).toBeInTheDocument();
  });

  it("deletes a page after confirmation, warning about nested pages", async () => {
    vi.mocked(api.deletePage).mockResolvedValue({ ok: true });
    const onChange = vi.fn();
    renderSidebar(onChange);
    await userEvent.click(
      screen.getByRole("button", { name: "Page options for Projects" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("everything nested inside it");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "Delete" }),
    );
    expect(api.deletePage).toHaveBeenCalledWith("root1");
    expect(onChange).toHaveBeenCalled();
  });

  it("does not delete when the confirmation is cancelled", async () => {
    renderSidebar();
    await userEvent.click(
      screen.getByRole("button", { name: "Page options for Notes" }),
    );
    await userEvent.click(screen.getByRole("menuitem", { name: "Delete" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(api.deletePage).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("Sidebar search", () => {
  it("opens quick-find from the visible Search control", async () => {
    const { onSearch } = renderSidebar();
    await userEvent.click(screen.getByRole("button", { name: /Search/ }));
    expect(onSearch).toHaveBeenCalled();
  });
});

describe("subtreeContains", () => {
  it("finds ids at any depth", () => {
    expect(subtreeContains(tree[0], "child1")).toBe(true);
    expect(subtreeContains(tree[0], "root2")).toBe(false);
  });
});
