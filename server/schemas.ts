/* ============================================================
 * 《汉使》Han Envoy — Phase 4.5 服务端 Schema 校验
 *
 * 校验从 AI 返回的 JSON 是否符合预期结构。
 * 无法修复时返回错误，可修复时尽量 sanitize。
 * ============================================================ */

// ---- 允许枚举 ----

const VALID_INTENTS = [
  "threaten", "negotiate", "appease", "insult", "divide",
  "demand_hostage", "invoke_han_authority", "accuse",
  "assassinate", "surrender", "martyrdom", "ask_question", "unclear",
] as const;

const VALID_TONES = [
  "formal", "humble", "arrogant", "furious", "calm", "sarcastic", "ritualistic",
] as const;

const VALID_TARGETS = [
  "king", "proXiongnu", "proHan", "translator", "court", "self", "unknown",
] as const;

const VALID_EMOTIONS = [
  "calm", "angry", "fearful", "supportive", "suspicious", "mocking", "hesitant",
] as const;

const VALID_CHARACTER_IDS = ["king", "proXiongnu", "proHan", "translator", "envoy"] as const;

// ---- Task 校验 ----

export function isValidTask(task: unknown): task is "parse" | "react" {
  return task === "parse" || task === "react";
}

// ---- Parse 响应校验 ----

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function sanitizeParseResponse(data: Record<string, unknown>): Record<string, unknown> {
  // intent
  const intent = VALID_INTENTS.includes(data.intent as typeof VALID_INTENTS[number])
    ? data.intent
    : "unclear";

  // tone
  const tone = VALID_TONES.includes(data.tone as typeof VALID_TONES[number])
    ? data.tone
    : "formal";

  // target
  const target = VALID_TARGETS.includes(data.target as typeof VALID_TARGETS[number])
    ? data.target
    : "unknown";

  // riskLevel: 1-5
  const riskLevel = clamp(
    typeof data.riskLevel === "number" ? data.riskLevel : 1,
    1,
    5
  );

  // confidence: 0-1
  const confidence = clamp(
    typeof data.confidence === "number" ? data.confidence : 0.5,
    0,
    1
  );

  // ruleHints: string[]
  const ruleHints = Array.isArray(data.ruleHints)
    ? data.ruleHints.filter((h: unknown) => typeof h === "string")
    : [];

  // shortSummary: string
  const shortSummary =
    typeof data.shortSummary === "string" ? data.shortSummary : "";

  // interpretedAs: string
  const interpretedAs =
    typeof data.interpretedAs === "string" ? data.interpretedAs : shortSummary;

  return {
    intent,
    tone,
    target,
    riskLevel,
    confidence,
    ruleHints,
    shortSummary,
    interpretedAs,
  };
}

// ---- React 响应校验 ----

export function sanitizeReactionResponse(
  data: unknown
): Record<string, unknown>[] {
  if (!Array.isArray(data)) {
    return [];
  }

  const sanitized = data
    .filter((item): item is Record<string, unknown> =>
      typeof item === "object" && item !== null
    )
    .map((item) => {
      const characterId = VALID_CHARACTER_IDS.includes(
        item.characterId as typeof VALID_CHARACTER_IDS[number]
      )
        ? item.characterId
        : "king";

      const text =
        typeof item.text === "string"
          ? item.text.slice(0, 500) // 限制长度
          : "";

      const emotion = VALID_EMOTIONS.includes(
        item.emotion as typeof VALID_EMOTIONS[number]
      )
        ? item.emotion
        : "calm";

      return { characterId, text, emotion };
    })
    .filter((item) => item.text.length > 0); // 排除空文本

  // 最多返回 3 条
  return sanitized.slice(0, 3);
}
