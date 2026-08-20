import { describe, expect, it } from "vitest";
import {
  FILTER_SPEC,
  MASTER_GROUPS,
  MASTER_PARAMS,
  UNIT_META,
  UNIT_PARAMS,
} from "./params";
import { PATCHES } from "./patches";
import { UNIT_IDS, type ParamSpec } from "./types";

const allSpecs = (): ParamSpec[] => [
  ...UNIT_IDS.flatMap((id) => UNIT_PARAMS[id]),
  ...MASTER_PARAMS,
  FILTER_SPEC,
];

describe("param specs", () => {
  it("describes every unit and names it for the panel", () => {
    for (const id of UNIT_IDS) {
      expect(UNIT_PARAMS[id].length).toBeGreaterThan(0);
      expect(UNIT_META[id].nameKey).not.toBe("");
      expect(UNIT_META[id].model).not.toBe("");
    }
  });

  it("gives every spec a usable range and a label", () => {
    for (const spec of allSpecs()) {
      expect(spec.key).not.toBe("");
      expect(spec.label).not.toBe("");
      expect(spec.max).toBeGreaterThan(spec.min);
      expect(["knob", "slider"]).toContain(spec.kind);
    }
  });

  it("keeps keys unique within a unit", () => {
    for (const id of UNIT_IDS) {
      const keys = UNIT_PARAMS[id].map((s) => s.key);
      expect(new Set(keys).size).toBe(keys.length);
    }
  });

  it("ranges a discrete spec over its own options", () => {
    for (const spec of allSpecs()) {
      if (!spec.options) continue;
      expect(spec.min).toBe(0);
      expect(spec.max).toBe(spec.options.length - 1);
    }
  });

  it("formats a value without throwing wherever a formatter is given", () => {
    for (const spec of allSpecs()) {
      if (!spec.format) continue;
      for (const v of [spec.min, (spec.min + spec.max) / 2, spec.max]) {
        expect(typeof spec.format(v)).toBe("string");
      }
    }
  });

  it("groups the master controls under non-empty titles", () => {
    expect(MASTER_GROUPS.length).toBeGreaterThan(0);
    for (const group of MASTER_GROUPS) {
      expect(group.titleKey).not.toBe("");
      expect(group.specs.length).toBeGreaterThan(0);
    }
  });

  it("every patch sets a value for every param its unit declares", () => {
    for (const patch of PATCHES) {
      for (const id of UNIT_IDS) {
        for (const spec of UNIT_PARAMS[id]) {
          const value = patch[id].params[spec.key];
          expect(typeof value, `${patch.name}/${id}/${spec.key}`).toBe(
            "number",
          );
          expect(value).toBeGreaterThanOrEqual(spec.min);
          expect(value).toBeLessThanOrEqual(spec.max);
        }
      }
    }
  });
});
