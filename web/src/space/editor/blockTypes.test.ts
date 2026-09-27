import { describe, expect, it } from "vitest";
import { setLang } from "../../shared/i18n";
import { blockLabel, filterBlockTypes } from "./blockTypes";

const found = (query: string) => filterBlockTypes(query).map((d) => d.type);

describe("filterBlockTypes", () => {
  it("matches the name in the page's language", () => {
    expect(found("head")).toEqual(["heading1", "heading2", "heading3"]);
    setLang("es");
    expect(found("enca")).toEqual(["heading1", "heading2", "heading3"]);
    expect(blockLabel("heading1")).toBe("Encabezado 1");
    expect(found("head")).toEqual(["heading1", "heading2", "heading3"]);
  });

  it("keeps the English shortcuts in either language", () => {
    setLang("es");
    expect(found("h1")).toEqual(["heading1"]);
    expect(found("todo")).toEqual(["todo"]);
  });
});
