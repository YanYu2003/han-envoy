import { describe, expect, it } from "vitest";
import { INITIAL_STATS } from "./initialState";
import { nextSceneByIntent } from "./sceneRouter";
import type { GameStats } from "./types";

function stats(overrides: Partial<GameStats> = {}): GameStats {
  return { ...INITIAL_STATS, ...overrides };
}

describe("nextSceneByIntent", () => {
  it("routes assassination intent directly to the assassination resolver", () => {
    const route = nextSceneByIntent("intro_court", "assassinate", stats());

    expect(route).toMatchObject({ forceEndingResolver: "assassination" });
    expect(route).not.toHaveProperty("nextSceneId");
  });

  it("routes martyrdom to crisis only when casus belli is high enough", () => {
    expect(
      nextSceneByIntent("intro_court", "martyrdom", stats({ casusBelli: 50 }))
    ).toMatchObject({ forceEndingResolver: "crisis" });

    expect(
      nextSceneByIntent("intro_court", "martyrdom", stats({ casusBelli: 49 }))
    ).toMatchObject({ nextSceneId: "first_statement" });
  });

  it("routes any input from crisis_point to the crisis resolver", () => {
    const route = nextSceneByIntent("crisis_point", "negotiate", stats());

    expect(route).toMatchObject({ forceEndingResolver: "crisis" });
    expect(route).not.toHaveProperty("nextSceneId");
  });

  it("routes surrender directly to the crisis point", () => {
    const route = nextSceneByIntent("intro_court", "surrender", stats());

    expect(route).toMatchObject({ nextSceneId: "crisis_point" });
    expect(route).not.toHaveProperty("forceEndingResolver");
  });

  it.each(["threaten", "accuse", "insult", "demand_hostage"] as const)(
    "routes hardline intent %s to crisis_point when king anger is high",
    (intent) => {
      expect(
        nextSceneByIntent("first_statement", intent, stats({ kingAnger: 50 }))
      ).toMatchObject({ nextSceneId: "crisis_point" });
    }
  );

  it("keeps hardline intents on the normal fallback path when king anger is low", () => {
    expect(
      nextSceneByIntent("first_statement", "threaten", stats({ kingAnger: 49 }))
    ).toMatchObject({ nextSceneId: "faction_conflict" });
  });

  it("falls back to the existing scene order for mild or unclear intents", () => {
    expect(nextSceneByIntent("intro_court", "negotiate", stats())).toMatchObject(
      { nextSceneId: "first_statement" }
    );
    expect(
      nextSceneByIntent("first_statement", "unclear", stats())
    ).toMatchObject({ nextSceneId: "faction_conflict" });
  });
});
