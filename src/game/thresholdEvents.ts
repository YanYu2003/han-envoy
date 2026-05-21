import type { GameStats, ThresholdEvent } from "./types";
import { clamp } from "../utils/clamp";
import { formatStatChanges } from "./simpleRules";

/**
 * 《汉使》Phase 2 阈值事件系统。
 *
 * 每个事件定义：
 * - condition：在回合结算时检查是否满足
 * - effects：触发后自动应用的参数变化
 * - once：游戏内是否只触发一次
 */

export const THRESHOLD_EVENTS: ThresholdEvent[] = [
  {
    id: "king_anger_high",
    title: "王怒滔天",
    description:
      "楼兰王怒不可遏，殿外卫士已按剑候命。你的处境越发危险。",
    condition: (s) => s.kingAnger >= 80,
    effects: { casusBelli: 5, tradeAccess: -5 },
    once: true,
  },
  {
    id: "king_fear_high",
    title: "王惧畏汉",
    description:
      "楼兰王被汉威震慑，言语间已露退意。亲汉派借机进言。",
    condition: (s) => s.kingFear >= 75,
    effects: { proHan: 5, proXiongnu: -3 },
    once: true,
  },
  {
    id: "pro_xiongnu_dominant",
    title: "亲胡当道",
    description:
      "亲匈奴派已控制朝堂大势，楼兰王在其压力下愈发不耐。",
    condition: (s) => s.proXiongnu >= 75,
    effects: { kingAnger: 5, casusBelli: 5 },
    once: true,
  },
  {
    id: "pro_han_rising",
    title: "亲汉暗涌",
    description:
      "亲汉派在朝中暗中活动，商道派系开始向汉使靠拢。",
    condition: (s) => s.proHan >= 70,
    effects: { tradeAccess: 5, kingFear: 3 },
    once: true,
  },
  {
    id: "envoy_honor_low",
    title: "名节受损",
    description:
      "使节接连退让，使团随员面有羞惭之色。史官已在暗中记下一笔。",
    condition: (s) => s.envoyHonor <= 30,
    effects: { historianScore: -5 },
    once: true,
  },
  {
    id: "casus_belli_strong",
    title: "兵衅已成",
    description:
      "汉朝已有充分问罪理由。若使节遇害，大军即刻西征。",
    condition: (s) => s.casusBelli >= 70,
    effects: { hanPrestige: 3, envoyHonor: 3 },
    once: true,
  },
];

/**
 * 检查所有尚未触发的阈值事件，返回应触发的事件列表。
 */
export function checkThresholdEvents(
  stats: GameStats,
  triggeredIds: string[]
): ThresholdEvent[] {
  const result: ThresholdEvent[] = [];
  for (const event of THRESHOLD_EVENTS) {
    if (event.once && triggeredIds.includes(event.id)) continue;
    if (event.condition(stats)) {
      result.push(event);
    }
  }
  return result;
}

/**
 * 应用阈值事件效果，返回新的 stats 和事件日志摘要。
 */
export function applyThresholdEvents(
  stats: GameStats,
  events: ThresholdEvent[]
): { stats: GameStats; logs: string[] } {
  let current = { ...stats };
  const logs: string[] = [];
  for (const event of events) {
    current = applyEventEffects(current, event.effects);
    logs.push(
      `⚡ ${event.title}: ${event.description}（${formatStatChanges(event.effects)}）`
    );
  }
  return { stats: current, logs };
}

function applyEventEffects(
  stats: GameStats,
  effects: Partial<GameStats>
): GameStats {
  const next = { ...stats };
  const keys = Object.keys(effects) as (keyof GameStats)[];
  for (const key of keys) {
    const delta = effects[key];
    if (delta !== undefined && delta !== 0) {
      next[key] = clamp(next[key] + delta);
    }
  }
  return next;
}
