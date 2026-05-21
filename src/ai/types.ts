/* ============================================================
 * 《汉使》Han Envoy — Phase 3 AI 抽象接口
 * ============================================================ */

import type { GameStats, HistoryEntry } from "../game/types";

/* ================================================================
 * 玩家意图
 * ================================================================ */

export type PlayerIntent =
  | "threaten"
  | "negotiate"
  | "appease"
  | "insult"
  | "divide"
  | "demand_hostage"
  | "invoke_han_authority"
  | "accuse"
  | "assassinate"
  | "surrender"
  | "martyrdom"
  | "ask_question"
  | "unclear";

export type PlayerTone =
  | "formal"
  | "humble"
  | "arrogant"
  | "furious"
  | "calm"
  | "sarcastic"
  | "ritualistic";

export type PlayerTarget =
  | "king"
  | "proXiongnu"
  | "proHan"
  | "translator"
  | "court"
  | "self"
  | "unknown";

/* ================================================================
 * AI 解析结果
 * ================================================================ */

export interface PlayerActionAnalysis {
  intent: PlayerIntent;
  tone: PlayerTone;
  target: PlayerTarget;
  riskLevel: 1 | 2 | 3 | 4 | 5;
  confidence: number;
  ruleHints: string[];
  shortSummary: string;
  /** 用中文一句话概括玩家说了什么（用于日志） */
  interpretedAs: string;
}

/* ================================================================
 * 角色反应
 * ================================================================ */

export type CharacterEmotion =
  | "calm"
  | "angry"
  | "fearful"
  | "supportive"
  | "suspicious"
  | "mocking"
  | "hesitant";

export interface CharacterReaction {
  characterId: string;
  text: string;
  emotion: CharacterEmotion;
}

/* ================================================================
 * AI 上下文
 * ================================================================ */

export interface AIContext {
  sceneId: string;
  sceneTitle: string;
  stats: GameStats;
  recentHistory: HistoryEntry[];
}

/* ================================================================
 * AI Provider 接口
 * ================================================================ */

export interface AIProvider {
  /** 解析玩家自由输入，返回结构化分析结果 */
  parsePlayerInput(
    input: string,
    context: AIContext
  ): Promise<PlayerActionAnalysis>;

  /** 根据分析和当前情境，生成角色动态反应 */
  generateCharacterReactions(
    analysis: PlayerActionAnalysis,
    context: AIContext
  ): Promise<CharacterReaction[]>;
}
