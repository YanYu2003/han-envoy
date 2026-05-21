import type { GameStats } from "./types";
import { applyEffects } from "./simpleRules";

/**
 * 《汉使》Phase 2 参数连锁反应。
 *
 * 在每次选择结算后自动运行，模拟参数间的自然影响。
 */

export interface ChainReaction {
  condition: (stats: GameStats) => boolean;
  effects: Partial<GameStats>;
  description: string;
}

export const CHAIN_REACTIONS: ChainReaction[] = [
  // 王怒高涨 → 亲胡派得势，商道受阻，兵衅升温
  {
    condition: (s) => s.kingAnger >= 70,
    effects: { proXiongnu: 5, tradeAccess: -5, casusBelli: 5 },
    description: "王怒高企，亲胡派借机煽动，商道受阻。",
  },
  // 王惧高 → 亲汉派增长，亲胡派退缩
  {
    condition: (s) => s.kingFear >= 70,
    effects: { proHan: 5, proXiongnu: -3 },
    description: "王惧汉威，亲汉派势力暗中增长。",
  },
  // 亲胡派占优 → 王怒+兵衅
  {
    condition: (s) => s.proXiongnu >= 75,
    effects: { kingAnger: 5, casusBelli: 5 },
    description: "亲胡派掌控朝堂，局势趋于危险。",
  },
  // 亲汉派占优 → 商道打通，王惧微增
  {
    condition: (s) => s.proHan >= 70,
    effects: { tradeAccess: 5, kingFear: 3 },
    description: "亲汉派势力抬头，商道安全改善。",
  },
  // 名节低 → 史官评价下滑
  {
    condition: (s) => s.envoyHonor <= 30,
    effects: { historianScore: -5 },
    description: "使节名节受损，史官笔下不留情。",
  },
  // 名节高 → 史官评价上升
  {
    condition: (s) => s.envoyHonor >= 70,
    effects: { historianScore: 5 },
    description: "使节气节高尚，史官赞誉有加。",
  },
];

/**
 * 对给定 stats 运行所有连锁反应，返回新的 stats 和变更摘要。
 */
export function resolveChainReactions(
  stats: GameStats
): { stats: GameStats; changes: string[] } {
  let current = { ...stats };
  const changes: string[] = [];

  for (const reaction of CHAIN_REACTIONS) {
    // 检查连锁条件
    if (reaction.condition(current)) {
      const before = { ...current };
      current = applyEffects(current, reaction.effects);
      // 检查是否产生了实际变化
      const changed = Object.keys(reaction.effects).some(
        (k) => current[k as keyof GameStats] !== before[k as keyof GameStats]
      );
      if (changed) {
        changes.push(reaction.description);
      }
    }
  }

  return { stats: current, changes };
}
