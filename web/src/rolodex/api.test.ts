import { afterEach, describe, expect, it, vi, beforeEach } from "vitest";
import { api } from "./api";

function mockFetch(response: Partial<Response> = {}) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    statusText: "OK",
    json: () => Promise.resolve({ id: 1 }),
    ...response,
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

const callOf = (mock: ReturnType<typeof mockFetch>, i = 0) =>
  mock.mock.calls[i] as [string, RequestInit];

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  document.documentElement.lang = "en";
});

describe("the rolodex api client", () => {
  it("prefixes every path with the app's own namespace", async () => {
    const fetchMock = mockFetch();
    await api.listPeople();
    expect(callOf(fetchMock)[0]).toBe("/api/rolodex/people");
  });

  it("sends JSON bodies with the method the call names", async () => {
    const fetchMock = mockFetch();
    await api.addInteraction(7, "call", "2026-08-15", "Talked it over");
    const [url, init] = callOf(fetchMock);
    expect(url).toBe("/api/rolodex/people/7/interactions");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body as string)).toEqual({
      type: "call",
      date: "2026-08-15",
      notes: "Talked it over",
    });
  });

  it("builds the timeline query only from the filters that are set", async () => {
    const fetchMock = mockFetch({ json: () => Promise.resolve([]) });
    await api.timeline(null, null);
    await api.timeline(3, "news");
    expect(callOf(fetchMock, 0)[0]).toBe("/api/rolodex/timeline");
    expect(callOf(fetchMock, 1)[0]).toBe(
      "/api/rolodex/timeline?person=3&kind=news",
    );
  });

  it("raises the error the server explains, not the status code", async () => {
    mockFetch({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: "Name is required" }),
    });
    await expect(api.createPerson({})).rejects.toThrow("Name is required");
  });

  it("falls back to the status when the body carries no message", async () => {
    mockFetch({
      ok: false,
      status: 500,
      statusText: "Server Error",
      json: () => Promise.resolve({}),
    });
    await expect(api.listPeople()).rejects.toThrow("500 Server Error");
  });
});
