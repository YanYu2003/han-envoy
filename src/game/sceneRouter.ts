/* ============================================================
 * 《汉使》Han Envoy — Phase 7 最小下一步：场景路由器
 *
 * 目标：让自由输入的 PlayerIntent 真正影响下一个场景的走向，
 *      而不是简单按 Object.keys(SCENES) 顺序推进。
 *
 * 设计原则：
 * - 纯函数，不依赖 store / React。
 * - 不破坏现有 4 个朝堂场景的顺序兜底。
 * - 不新增任何场景；只是在已有场景之间做"路由决策"。
 * - 高风险 intent（assassinate / martyrdom）直接进入结局判定。
 * - 强硬 intent + 王怒已高 → 跳到 crisis_point 加速博弈。
 * - 屈服 intent → 也跳到 crisis_point（让屈服的代价立刻被结算）。
 * - 温和 intent（negotiate / appease / ask_question / unclear）→ 顺序推进。
 *
 * 后续 Phase 7 完整版会引入 vitest 测试与更多分支。
 * ============================================================ */

import type { GameStats } from "./types";
import type { PlayerIntent } from "../ai/types";
import { SCENES } from "./scenes";

export interface SceneRouteResult {
  /** 下一个场景 ID。若为 undefined 且 forceEndingResolver 也未设置，调用者按 expelled 兜底。 */
  nextSceneId?: string;
  /** 强制使用某种结局判定函数（由调用者把 resolveEndingFn 设置成对应函数）。 */
  forceEndingResolver?: "crisis" | "assassination";
  /** 路由决策原因，便于日志和调试。 */
  reason: string;
}

/**
 * 根据当前场景、玩家意图和参数状态，决定下一个场景。
 */
export function nextSceneByIntent(
  currentSceneId: string,
  intent: PlayerIntent,
  stats: GameStats
): SceneRouteResult {
  // 1) 刺杀意图：直接进入刺杀结局判定（resolveAssassinationEnding）
  if (intent === "assassinate") {
    return {
      forceEndingResolver: "assassination",
      reason: "intent=assassinate，直接走刺王结局判定",
    };
  }

  // 2) 殉国意图 + 兵衅充足 → 走 crisis 结局判定（可能触发 martyrdom 结局）
  if (intent === "martyrdom" && stats.casusBelli >= 50) {
    return {
      forceEndingResolver: "crisis",
      reason: `intent=martyrdom 且 casusBelli=${stats.casusBelli}≥50，殉国触发结局`,
    };
  }

  // 3) 已在 crisis_point：任意输入都走 crisis 判定（保持原 store 行为）
  if (currentSceneId === "crisis_point") {
    return {
      forceEndingResolver: "crisis",
      reason: "currentScene=crisis_point，任意输入触发结局判定",
    };
  }

  // 4) 屈服意图：直接跳到 crisis_point，让屈服的代价被立即结算
  if (intent === "surrender") {
    return {
      nextSceneId: "crisis_point",
      reason: "intent=surrender，跳过中间场景直入危机点",
    };
  }

  // 5) 强硬意图 + 王怒 ≥ 50 → 跳到 crisis_point 加速博弈
  const isHardline =
    intent === "threaten" ||
    intent === "accuse" ||
    intent === "insult" ||
    intent === "demand_hostage";
  if (isHardline && stats.kingAnger >= 50) {
    return {
      nextSceneId: "crisis_point",
      reason: `强硬意图(${intent}) + kingAnger=${stats.kingAnger}≥50，加速到危机点`,
    };
  }

  // 6) 兜底：按 SCENES key 顺序推进（保持原有行为）
  const sceneIds = Object.keys(SCENES);
  const idx = sceneIds.indexOf(currentSceneId);
  if (idx >= 0 && idx < sceneIds.length - 1) {
    const next = sceneIds[idx + 1]!;
    return {
      nextSceneId: next,
      reason: `兜底顺序推进: ${currentSceneId} → ${next}`,
    };
  }

  // 7) 已是最后一个场景但不在 crisis_point（理论上不会发生）→ 走 crisis 判定
  return {
    forceEndingResolver: "crisis",
    reason: "已无下一个场景，触发 crisis 结局判定",
  };
}
