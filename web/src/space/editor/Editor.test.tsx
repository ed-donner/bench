import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { renderSpace } from "../test/helpers";
import userEvent from "@testing-library/user-event";
import Editor from "./Editor";
import { applyReorder } from "./reorder";
import { api, type Block } from "../api";
import { block, containing } from "../test/helpers";

vi.mock("../api", () => ({
  api: {
    createBlock: vi.fn().mockResolvedValue({}),
    updateBlock: vi.fn().mockResolvedValue({}),
    deleteBlock: vi.fn().mockResolvedValue({ ok: true }),
    reorderBlocks: vi.fn().mockResolvedValue({ ok: true }),
  },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

const makeBlocks = (): Block[] => [
  block({
    id: "b1",
    type: "paragraph",
    content: { text: "First paragraph" },
    position: 0,
  }),
  block({
    id: "b2",
    type: "todo",
    content: { text: "A task", checked: false },
    position: 1,
  }),
  block({ id: "b3", type: "divider", content: {}, position: 2 }),
  block({
    id: "b4",
    type: "code",
    content: { text: "console.log(1)" },
    position: 3,
  }),
];

function renderEditor(blocks = makeBlocks()) {
  return renderSpace(<Editor pageId="p1" initialBlocks={blocks} />);
}

function blockText(id: string): HTMLElement {
  return document.querySelector(`[data-block-id="${id}"] [contenteditable]`)!;
}

describe("Editor rendering", () => {
  it("renders every block type with distinct structure", () => {
    renderEditor([
      block({ id: "h1", type: "heading1", content: { text: "H1" } }),
      block({ id: "h2", type: "heading2", content: { text: "H2" } }),
      block({ id: "h3", type: "heading3", content: { text: "H3" } }),
      block({ id: "p", type: "paragraph", content: { text: "Para" } }),
      block({ id: "bu", type: "bulleted", content: { text: "Bullet" } }),
      block({ id: "n1", type: "numbered", content: { text: "NumA" } }),
      block({ id: "n2", type: "numbered", content: { text: "NumB" } }),
      block({
        id: "td",
        type: "todo",
        content: { text: "Todo", checked: true },
      }),
      block({ id: "q", type: "quote", content: { text: "Quote" } }),
      block({ id: "d", type: "divider", content: {} }),
      block({ id: "c", type: "code", content: { text: "code()" } }),
      block({ id: "ca", type: "callout", content: { text: "Callout" } }),
    ]);
    expect(blockText("h1").className).toContain("b-h1");
    expect(blockText("h2").className).toContain("b-h2");
    expect(blockText("h3").className).toContain("b-h3");
    expect(blockText("p").className).toContain("b-paragraph");
    expect(
      document.querySelector('[data-block-id="bu"] .b-bullet'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-block-id="n1"] .b-number'),
    ).toHaveTextContent("1.");
    expect(
      document.querySelector('[data-block-id="n2"] .b-number'),
    ).toHaveTextContent("2.");
    expect(screen.getByRole("checkbox", { name: "Todo" })).toBeChecked();
    expect(
      document.querySelector('[data-block-id="q"] .b-quote'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-block-id="d"] hr.b-divider'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-block-id="c"] .b-code'),
    ).toBeInTheDocument();
    expect(
      document.querySelector('[data-block-id="ca"] .b-callout'),
    ).toBeInTheDocument();
  });

  it("creates a starter paragraph for an empty page", async () => {
    renderEditor([]);
    await waitFor(() =>
      expect(api.createBlock).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ type: "paragraph", index: 0 }),
      ),
    );
    expect(document.querySelectorAll(".block-row")).toHaveLength(1);
  });
});

describe("editing", () => {
  it("debounce-saves typed text", async () => {
    renderEditor();
    const el = blockText("b1");
    el.textContent = "First paragraph edited";
    fireEvent.input(el);
    expect(api.updateBlock).not.toHaveBeenCalled();
    await waitFor(
      () =>
        expect(api.updateBlock).toHaveBeenCalledWith("b1", {
          content: { text: "First paragraph edited" },
        }),
      { timeout: 2000 },
    );
  });

  it("flushes the pending save on blur", async () => {
    renderEditor();
    const el = blockText("b1");
    el.textContent = "Changed";
    fireEvent.input(el);
    fireEvent.blur(el);
    await waitFor(() =>
      expect(api.updateBlock).toHaveBeenCalledWith("b1", {
        content: { text: "Changed" },
      }),
    );
  });

  it("Enter at the end creates a paragraph below", async () => {
    renderEditor();
    const el = blockText("b1");
    el.focus();
    fireEvent.keyDown(el, { key: "Enter" });
    await waitFor(() =>
      expect(api.createBlock).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ type: "paragraph", index: 1 }),
      ),
    );
    expect(document.querySelectorAll(".block-row")).toHaveLength(5);
  });

  it("Enter in a todo continues with another todo", async () => {
    renderEditor();
    const el = blockText("b2");
    el.focus();
    fireEvent.keyDown(el, { key: "Enter" });
    await waitFor(() =>
      expect(api.createBlock).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({
          type: "todo",
          content: containing({ checked: false }),
        }),
      ),
    );
  });

  it("Enter on an empty list block converts it back to a paragraph", async () => {
    renderEditor([
      block({ id: "b1", type: "bulleted", content: { text: "" } }),
    ]);
    const el = blockText("b1");
    el.focus();
    fireEvent.keyDown(el, { key: "Enter" });
    await waitFor(() =>
      expect(api.updateBlock).toHaveBeenCalledWith("b1", {
        type: "paragraph",
        content: { text: "" },
      }),
    );
    expect(api.createBlock).not.toHaveBeenCalled();
  });

  it("Backspace in an empty paragraph removes it", async () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "Keep me" } }),
      block({ id: "b2", type: "paragraph", content: { text: "" } }),
    ]);
    const el = blockText("b2");
    el.focus();
    fireEvent.keyDown(el, { key: "Backspace" });
    await waitFor(() => expect(api.deleteBlock).toHaveBeenCalledWith("b2"));
    expect(document.querySelectorAll(".block-row")).toHaveLength(1);
  });

  it("Backspace on an empty non-paragraph turns it into a paragraph first", async () => {
    renderEditor([block({ id: "b1", type: "quote", content: { text: "" } })]);
    const el = blockText("b1");
    el.focus();
    fireEvent.keyDown(el, { key: "Backspace" });
    await waitFor(() =>
      expect(api.updateBlock).toHaveBeenCalledWith("b1", {
        type: "paragraph",
        content: { text: "" },
      }),
    );
    expect(api.deleteBlock).not.toHaveBeenCalled();
  });

  it("Backspace merges a non-empty block into the previous one", async () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "Hello " } }),
      block({ id: "b2", type: "paragraph", content: { text: "world" } }),
    ]);
    const el = blockText("b2");
    el.focus();
    fireEvent.keyDown(el, { key: "Backspace" });
    await waitFor(() => expect(api.deleteBlock).toHaveBeenCalledWith("b2"));
    expect(api.updateBlock).toHaveBeenCalledWith("b1", {
      content: { text: "Hello world" },
    });
  });

  it("Backspace at the start removes a divider sitting above", async () => {
    renderEditor();
    const el = blockText("b4");
    el.focus();
    fireEvent.keyDown(el, { key: "Backspace" });
    await waitFor(() => expect(api.deleteBlock).toHaveBeenCalledWith("b3"));
  });

  it("does not remove the only remaining block", () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    const el = blockText("b1");
    el.focus();
    fireEvent.keyDown(el, { key: "Backspace" });
    expect(api.deleteBlock).not.toHaveBeenCalled();
  });

  it("toggles a to-do checkbox and saves immediately", async () => {
    renderEditor();
    await userEvent.click(screen.getByRole("checkbox", { name: "A task" }));
    expect(api.updateBlock).toHaveBeenCalledWith("b2", {
      content: { text: "A task", checked: true },
    });
  });
});

describe("slash menu", () => {
  function openSlash(id = "b1") {
    const el = blockText(id);
    el.focus();
    fireEvent.keyDown(el, { key: "/" });
    const existing: unknown = el.textContent;
    el.textContent = `${typeof existing === "string" ? existing : ""}/`;
    fireEvent.input(el);
    return el;
  }

  it("opens on '/', lists all block types, and filters as you type", () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    const el = openSlash();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(11);

    el.textContent = "/head";
    fireEvent.input(el);
    expect(screen.getAllByRole("option")).toHaveLength(3);
    expect(
      screen.getByRole("option", { name: /Heading 1/ }),
    ).toBeInTheDocument();
  });

  it("picks a type with arrows and Enter, converting the block", async () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    const el = openSlash();
    fireEvent.keyDown(el, { key: "ArrowDown" });
    fireEvent.keyDown(el, { key: "ArrowDown" });
    expect(screen.getByRole("option", { name: /Heading 2/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    fireEvent.keyDown(el, { key: "Enter" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(api.updateBlock).toHaveBeenCalledWith("b1", {
        type: "heading2",
        content: { text: "" },
      }),
    );
  });

  it("picks a type with the mouse", async () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    openSlash();
    await userEvent.click(screen.getByRole("option", { name: /Quote/ }));
    expect(api.updateBlock).toHaveBeenCalledWith("b1", {
      type: "quote",
      content: { text: "" },
    });
  });

  it("inserting a divider keeps a paragraph for the caret", async () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    const el = openSlash();
    el.textContent = "/div";
    fireEvent.input(el);
    fireEvent.keyDown(el, { key: "Enter" });
    await waitFor(() =>
      expect(api.updateBlock).toHaveBeenCalledWith("b1", {
        type: "divider",
        content: {},
      }),
    );
    await waitFor(() =>
      expect(api.createBlock).toHaveBeenCalledWith(
        "p1",
        expect.objectContaining({ type: "paragraph", index: 1 }),
      ),
    );
  });

  it("closes with Escape leaving the text alone", () => {
    renderEditor([
      block({ id: "b1", type: "paragraph", content: { text: "" } }),
    ]);
    const el = openSlash();
    fireEvent.keyDown(el, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(api.updateBlock).not.toHaveBeenCalledWith(
      "b1",
      containing({ type: expect.anything() as unknown }),
    );
  });
});

describe("reordering", () => {
  it("applyReorder moves a block to the target position", () => {
    const blocks = makeBlocks();
    const moved = applyReorder(blocks, "b1", "b3");
    expect(moved.map((b) => b.id)).toEqual(["b2", "b3", "b1", "b4"]);
  });

  it("applyReorder ignores unknown ids and self-drops", () => {
    const blocks = makeBlocks();
    expect(applyReorder(blocks, "b1", "b1")).toBe(blocks);
    expect(applyReorder(blocks, "nope", "b2")).toBe(blocks);
  });

  it("renders a drag handle for every block", () => {
    renderEditor();
    expect(screen.getAllByRole("button", { name: "Drag block" })).toHaveLength(
      4,
    );
  });
});
