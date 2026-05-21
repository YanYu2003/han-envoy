import type { GameStats } from "./types";
import { clamp } from "../utils/clamp";

/**
 * 《汉使》简单规则引擎。
 *
 * 职责：
 * 1. 应用 choice.effects 并 clamp
 * 2. 格式化参数变化摘要（供 HistoryEntry 使用）
 */

/**
 * 将一组增量变化应用到当前 stats 上，
 * 返回新的 stats（不可变）。
 */
export function applyEffects(
  stats: GameStats,
  effects: Partial<GameStats>
): GameStats {
  const keys = Object.keys(effects) as (keyof GameStats)[];
  const next = { ...stats };
  for (const key of keys) {
    const delta = effects[key];
    if (delta !== undefined && delta !== 0) {
      next[key] = clamp(next[key] + delta);
    }
  }
  return next;
}

/**
 * 生成参数变化的可读摘要，例如：
 * "汉威 +10  王惧 +10  王怒 +5"
 */
export function formatStatChanges(
  effects: Partial<GameStats>
): string {
  const LABEL_MAP: Record<keyof GameStats, string> = {
    hanPrestige: "汉威",
    xiongnuPressure: "胡压",
    kingAnger: "王怒",
    kingFear: "王惧",
    proHan: "亲汉",
    proXiongnu: "亲胡",
    tradeAccess: "商道",
    casusBelli: "兵衅",
    envoyHonor: "名节",
    historianScore: "史评",
  };

  const parts: string[] = [];
  const entries = Object.entries(effects) as [keyof GameStats, number | undefined][];

  for (const [key, value] of entries) {
    if (value === undefined || value === 0) continue;
    const sign = value > 0 ? "+" : "";
    parts.push(`${LABEL_MAP[key]} ${sign}${value}`);
  }

  return parts.join("  ");
}
