/* ============================================================
 * 《汉使》Han Envoy — Phase 3 AI 分析 → 规则效果映射
 *
 * 将 PlayerActionAnalysis 中的 intent/tone/riskLevel
 * 映射为 Partial<GameStats> 参数变化，交由现有规则引擎 clamp。
 * ============================================================ */

import type { GameStats } from "../game/types";
import type { PlayerActionAnalysis, PlayerIntent, PlayerTone } from "./types";

/* ================================================================
 * 基础效果映射（intent → 参数变化）
 * ================================================================ */

const BASE_EFFECTS: Record<PlayerIntent, Partial<GameStats>> = {
  threaten: { hanPrestige: 5, kingFear: 8, kingAnger: 8, casusBelli: 3 },
  negotiate: { tradeAccess: 8, proHan: 5, kingAnger: -4, historianScore: 2 },
  appease: { kingAnger: -8, envoyHonor: -5, hanPrestige: -3, tradeAccess: 3 },
  insult: { kingAnger: 15, proXiongnu: 8, envoyHonor: -5, casusBelli: 5 },
  divide: { proHan: 8, proXiongnu: -8, kingAnger: 4, envoyHonor: -2 },
  demand_hostage: {
    hanPrestige: 8,
    kingFear: 10,
    kingAnger: 12,
    casusBelli: 5,
  },
  invoke_han_authority: {
    hanPrestige: 10,
    kingFear: 10,
    kingAnger: 4,
    historianScore: 3,
  },
  accuse: { envoyHonor: 8, kingAnger: 10, casusBelli: 10, historianScore: 4 },
  assassinate: {
    hanPrestige: -5,
    xiongnuPressure: 10,
    envoyHonor: 10,
    casusBelli: 10,
  },
  surrender: {
    hanPrestige: -15,
    envoyHonor: -15,
    kingAnger: -10,
    historianScore: -10,
  },
  martyrdom: {
    envoyHonor: 15,
    casusBelli: 10,
    kingAnger: 10,
    historianScore: 8,
  },
  ask_question: { kingAnger: -2, tradeAccess: 2 },
  unclear: { historianScore: -1 },
};

/* ================================================================
 * 修正因子
 * ================================================================ */

const RISK_MODIFIER: Partial<GameStats> = {
  kingAnger: 3,
  casusBelli: 3,
};

const TONE_MODIFIERS: Record<PlayerTone, Partial<GameStats>> = {
  arrogant: { kingAnger: 5 },
  furious: { kingAnger: 5 },
  ritualistic: { hanPrestige: 2, envoyHonor: 2 },
  formal: { hanPrestige: 1, envoyHonor: 1 },
  humble: { kingAnger: -2, envoyHonor: -2 },
  calm: {},
  sarcastic: { kingAnger: 3, envoyHonor: -1 },
};

/* ================================================================
 * 合并所有效果
 * ================================================================ */

/**
 * 将 AI 解析结果合并为一组参数增量。
 * 返回值直接传给 applyEffects（由规则引擎负责 clamp）。
 */
export function analysisToEffects(
  analysis: PlayerActionAnalysis
): Partial<GameStats> {
  // 1) 基础效果
  const base = { ...(BASE_EFFECTS[analysis.intent] ?? {}) };

  // 2) 风险修正
  if (analysis.riskLevel >= 4) {
    for (const [k, v] of Object.entries(RISK_MODIFIER)) {
      const key = k as keyof GameStats;
      base[key] = (base[key] ?? 0) + (v ?? 0);
    }
  }

  // 3) 语气修正
  const toneMod = TONE_MODIFIERS[analysis.tone] ?? {};
  for (const [k, v] of Object.entries(toneMod)) {
    const key = k as keyof GameStats;
    base[key] = (base[key] ?? 0) + (v ?? 0);
  }

  return base;
}
