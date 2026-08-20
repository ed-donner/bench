import { describe, expect, it, vi, afterEach, beforeEach } from "vitest";
import { api, query } from "./api";

const JSON_LOCALE_HEADERS = {
  "Content-Type": "application/json",
  "X-Bench-Locale": "en",
};

function mockFetch(response: Partial<Response>) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ id: 1 }),
    ...response,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  document.documentElement.lang = "en";
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("request", () => {
  it("sends JSON and parses the reply", async () => {
    const fetchMock = mockFetch({});
    const result = await api.post("/api/crm/deals", { name: "New deal" });

    expect(result).toEqual({ id: 1 });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/crm/deals");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual(JSON_LOCALE_HEADERS);
    expect(JSON.parse(init.body as string)).toEqual({ name: "New deal" });
  });

  it("names the method and path in the error when the server refuses", async () => {
    mockFetch({ ok: false, status: 404 });
    await expect(api.get("/api/crm/deals/9")).rejects.toThrow(
      "GET /api/crm/deals/9 failed: 404",
    );
  });

  it("does not try to parse a 204", async () => {
    const json = vi.fn();
    mockFetch({ status: 204, json });
    await expect(api.delete("/api/crm/deals/1")).resolves.toBeUndefined();
    expect(json).not.toHaveBeenCalled();
  });

  it("carries the verb through for put and patch", async () => {
    const fetchMock = mockFetch({});
    await api.put("/api/crm/deals/1", { name: "x" });
    await api.patch("/api/crm/deals/1/stage", { stage: "Won" });
    const methods = fetchMock.mock.calls.map(
      ([, init]) => (init as RequestInit).method,
    );
    expect(methods).toEqual(["PUT", "PATCH"]);
  });
});

describe("query", () => {
  it("builds a query string and drops what was not set", () => {
    expect(query({ q: "acme", stage: undefined, limit: 5 })).toBe(
      "?q=acme&limit=5",
    );
  });

  it("is empty when nothing is set", () => {
    expect(query({ q: undefined })).toBe("");
  });

  it("escapes values", () => {
    expect(query({ q: "a&b c" })).toBe("?q=a%26b+c");
  });
});
