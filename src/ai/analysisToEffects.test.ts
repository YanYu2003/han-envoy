import { describe, expect, it } from "vitest";
import { analysisToEffects } from "./analysisToEffects";
import type { PlayerActionAnalysis } from "./types";

function analysis(
  overrides: Partial<PlayerActionAnalysis>
): PlayerActionAnalysis {
  return {
    intent: "unclear",
    tone: "calm",
    target: "unknown",
    riskLevel: 1,
    confidence: 1,
    ruleHints: [],
    shortSummary: "test",
    interpretedAs: "test",
    ...overrides,
  };
}

describe("analysisToEffects", () => {
  it("maps negotiate intent to trade and pro-Han gains", () => {
    expect(
      analysisToEffects(analysis({ intent: "negotiate" }))
    ).toMatchObject({
      tradeAccess: 8,
      proHan: 5,
      kingAnger: -4,
      historianScore: 2,
    });
  });

  it("adds risk modifiers for high-risk actions", () => {
    expect(
      analysisToEffects(
        analysis({ intent: "threaten", tone: "calm", riskLevel: 4 })
      )
    ).toMatchObject({
      hanPrestige: 5,
      kingFear: 8,
      kingAnger: 11,
      casusBelli: 6,
    });
  });

  it("adds tone modifiers after base and risk effects", () => {
    expect(
      analysisToEffects(
        analysis({ intent: "invoke_han_authority", tone: "ritualistic" })
      )
    ).toMatchObject({
      hanPrestige: 12,
      kingFear: 10,
      kingAnger: 4,
      envoyHonor: 2,
      historianScore: 3,
    });
  });

  it("keeps unclear actions low impact but still records historian friction", () => {
    expect(analysisToEffects(analysis({ intent: "unclear" }))).toEqual({
      historianScore: -1,
    });
  });
});
