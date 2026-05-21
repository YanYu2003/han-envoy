/* ============================================================
 * 《汉使》Han Envoy — Phase 2.5 Act 0 前置类型预留
 *
 * 本文件仅为后续 Phase 5 实现 Act 0 提供类型定义。
 * 尚未接入当前游戏主流程，不影响 Phase 2 已有功能。
 * ============================================================ */

import type { GameStats } from "./types";

/* ================================================================
 * 行动类型
 * ================================================================ */

export type PreparationActionType =
  | "contact" // 接触
  | "bribe" // 贿赂
  | "threaten" // 威胁
  | "investigate" // 调查
  | "scout" // 侦察
  | "spread_rumor" // 散布谣言
  | "prepare_assassination" // 准备刺王
  | "prepare_argument" // 准备辩词
  | "ritual_preparation"; // 礼仪准备

/** Act 0 中玩家可选择的一项准备行动 */
export interface PreparationAction {
  id: string;
  label: string;
  description: string;
  /** 目标角色 ID（可选） */
  targetCharacterId?: string;
  actionType: PreparationActionType;
  /** 消耗的行动次数 */
  cost: number;
  /** 对核心参数的影响 */
  effects: Partial<GameStats>;
  /** 可能获得的情报 ID 列表（可能概率触发） */
  intelGained?: string[];
  /** 可能获得的证据 ID 列表（可能概率触发） */
  evidenceGained?: string[];
  /** 暴露度变化 */
  exposureChange: number;
  /** 解锁的选项 ID 列表 */
  unlocks?: string[];
  /** 风险等级 */
  riskLevel: 1 | 2 | 3 | 4 | 5;
  /** 成功率（0–1），用于概率判定 */
  baseSuccessRate: number;
}

/* ================================================================
 * 情报
 * ================================================================ */

/** 情报可靠性等级 */
export type IntelReliability = "reliable" | "uncertain" | "rumor";

/** 一条情报 */
export interface IntelItem {
  id: string;
  title: string;
  description: string;
  reliability: IntelReliability;
  /** 情报来源描述 */
  source: string;
  /** 相关角色 ID */
  relatedCharacterIds: string[];
  /** 标签，用于条件判定 */
  tags: string[];
}

/* ================================================================
 * 证据
 * ================================================================ */

/** 一件可在朝堂上使用的证据 */
export interface EvidenceItem {
  id: string;
  title: string;
  description: string;
  /** 证据力度（0–1） */
  strength: number;
  /** 是否可在朝堂上公开出示 */
  canUseInCourt: boolean;
  /** 此证据解锁的朝堂选项 ID 列表 */
  unlockChoiceIds: string[];
  /** 出示证据时触发的参数变化 */
  effectsWhenRevealed: Partial<GameStats>;
  /** 标签 */
  tags: string[];
}

/* ================================================================
 * 角色关系状态
 * ================================================================ */

/** Act 0 中玩家与某角色的接触状态 */
export interface ContactState {
  characterId: string;
  /** 信任度 0–100 */
  trust: number;
  /** 把柄/筹码（0–100） */
  leverage: number;
  /** 疑心度（被察觉调查意图的程度） */
  suspicion: number;
  /** 接触备注 */
  notes: string[];
}

/* ================================================================
 * 调查结果
 * ================================================================ */

/** 一次调查行动的可能结果 */
export interface InvestigationOutcome {
  id: string;
  title: string;
  description: string;
  /** 相对概率权重，用于随机判定 */
  probabilityWeight: number;
  /** 参数变化 */
  effects: Partial<GameStats>;
  /** 获得的情报 ID */
  intelGained: string[];
  /** 获得的证据 ID */
  evidenceGained: string[];
  /** 暴露度变化 */
  exposureChange: number;
}

/* ================================================================
 * Act 0 完整状态
 * ================================================================ */

/** Act 0 准备阶段的完整状态 */
export interface PreCourtState {
  /** 剩余准备行动次数 */
  actionsRemaining: number;
  /** 暴露度 0–100 */
  exposure: number;
  /** 已获得的情报 ID 列表 */
  intelIds: string[];
  /** 已获得的证据 ID 列表 */
  evidenceIds: string[];
  /** 各角色的接触状态 */
  contactStates: Record<string, ContactState>;
  /** 已解锁的朝堂选项 ID 列表 */
  unlockedChoiceIds: string[];
  /** 自定义标志位（用于记录特殊剧情状态） */
  preCourtFlags: Record<string, boolean>;
}

/* ================================================================
 * 配置默认值
 * ================================================================ */

export const DEFAULT_PRE_COURT_STATE: PreCourtState = {
  actionsRemaining: 3,
  exposure: 0,
  intelIds: [],
  evidenceIds: [],
  contactStates: {},
  unlockedChoiceIds: [],
  preCourtFlags: {},
};
