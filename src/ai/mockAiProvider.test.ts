import { afterEach, describe, expect, it, vi } from "vitest";
import { MOCK_AI_TEST_CASES, runMockAiTestCases } from "./mockAiTestCases";
import { mockAIProvider } from "./mockAiProvider";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("mockAIProvider regression cases", () => {
  it("matches the expected intent for every documented mock AI case", async () => {
    vi.spyOn(
      Object.getPrototypeOf(mockAIProvider),
      "delay"
    ).mockResolvedValue(undefined);

    const { results, summary } = await runMockAiTestCases();

    expect(summary.total).toBe(MOCK_AI_TEST_CASES.length);
    expect(summary.failed, formatFailures(results)).toBe(0);
  });
});

function formatFailures(
  results: Awaited<ReturnType<typeof runMockAiTestCases>>["results"]
): string {
  const failures = results.filter((r) => !r.intentPass);
  if (failures.length === 0) return "";
  return failures
    .map(
      (r) =>
        `#${r.index} ${r.input}: expected ${r.expectedIntent}, got ${r.actualIntent} (${r.note})`
    )
    .join("\n");
}
