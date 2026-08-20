import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { api } from "./api";

const fetchMock = vi.fn();

beforeEach(() => {
  document.documentElement.lang = "en";
  vi.stubGlobal("fetch", fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function ok(body: unknown) {
  return { ok: true, json: () => Promise.resolve(body) } as Response;
}

describe("api client", () => {
  it("GETs without a body and parses JSON", async () => {
    fetchMock.mockResolvedValue(ok([{ id: "a" }]));
    const tree = await api.tree();
    expect(tree).toEqual([{ id: "a" }]);
    expect(fetchMock).toHaveBeenCalledWith("/api/space/tree", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Bench-Locale": "en",
      },
      body: undefined,
    });
  });

  it("POSTs JSON bodies with the right headers", async () => {
    fetchMock.mockResolvedValue(ok({ id: "p1" }));
    await api.createPage({ title: "X", parentId: null });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/space/pages");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({
      "Content-Type": "application/json",
      "X-Bench-Locale": "en",
    });
    expect(JSON.parse(init.body as string)).toEqual({
      title: "X",
      parentId: null,
    });
  });

  it("throws the server's error message on failure", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ error: "page not found" }),
    });
    await expect(api.getPage("nope")).rejects.toThrow("page not found");
  });

  it("falls back to a generic message when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.reject(new Error("bad json")),
    });
    await expect(api.deletePage("x")).rejects.toThrow(
      "DELETE /api/space/pages/x failed (500)",
    );
  });

  it("hits the expected endpoints for blocks, databases, and search", async () => {
    fetchMock.mockResolvedValue(ok({}));
    await api.updatePage("p", { title: "t" });
    await api.createBlock("p", { type: "paragraph", content: {} });
    await api.updateBlock("b", { content: { text: "x" } });
    await api.deleteBlock("b");
    await api.reorderBlocks("p", ["a", "b"]);
    await api.getDatabase("d");
    await api.addProperty("d", { name: "N", type: "text" });
    await api.renameProperty("pr", "M");
    await api.deleteProperty("pr");
    await api.addOption("pr", { name: "O", color: "blue" });
    await api.addRow("d", { title: "R" });
    await api.setRowValue("r", "pr", 5);
    await api.getRow("r");
    await api.updateView("d", "board", { groupBy: "pr" });
    await api.search("q x");
    const urls = fetchMock.mock.calls.map(([u]) => u as string);
    expect(urls).toEqual([
      "/api/space/pages/p",
      "/api/space/pages/p/blocks",
      "/api/space/blocks/b",
      "/api/space/blocks/b",
      "/api/space/pages/p/blocks/order",
      "/api/space/databases/d",
      "/api/space/databases/d/properties",
      "/api/space/properties/pr",
      "/api/space/properties/pr",
      "/api/space/properties/pr/options",
      "/api/space/databases/d/rows",
      "/api/space/rows/r/values",
      "/api/space/rows/r",
      "/api/space/databases/d/views/board",
      "/api/space/search?q=q%20x",
    ]);
  });
});
