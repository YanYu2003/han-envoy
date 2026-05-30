import { describe, expect, it } from "vitest";
import { INITIAL_STATS } from "./initialState";
import { applyEffects, formatStatChanges } from "./simpleRules";

describe("simpleRules", () => {
  it("applies effects immutably and clamps stat values to 0-100", () => {
    const next = applyEffects(INITIAL_STATS, {
      hanPrestige: 100,
      kingAnger: -100,
    });

    expect(next).not.toBe(INITIAL_STATS);
    expect(next.hanPrestige).toBe(100);
    expect(next.kingAnger).toBe(0);
    expect(INITIAL_STATS.hanPrestige).toBe(30);
    expect(INITIAL_STATS.kingAnger).toBe(20);
  });

  it("formats non-zero stat deltas for history entries", () => {
    expect(
      formatStatChanges({
        hanPrestige: 10,
        kingAnger: -5,
        tradeAccess: 0,
      })
    ).toBe("汉威 +10  王怒 -5");
  });
});
