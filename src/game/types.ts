/* ============================================================
 * 《汉使》Han Envoy — Phase 2 核心类型定义
 * ============================================================ */

/** 游戏阶段 */
export type GamePhase = "start" | "court" | "ending";

/** 外交参数（0–100） */
export interface GameStats {
  hanPrestige: number;
  xiongnuPressure: number;
  kingAnger: number;
  kingFear: number;
  proHan: number;
  proXiongnu: number;
  tradeAccess: number;
  casusBelli: number;
  envoyHonor: number;
  historianScore: number;
}

/** 角色立场 */
export type Stance = "player" | "pro_han" | "pro_xiongnu" | "neutral";

/** 角色 */
export interface Character {
  id: string;
  name: string;
  title: string;
  stance: Stance;
  avatarText: string;
  description: string;
}

/** 玩家可选择的一项行动 */
export interface Choice {
  id: string;
  label: string;
  description: string;
  effects: Partial<GameStats>;
  resultText: string;
  nextSceneId?: string;
  endingId?: string;
  resolveEnding?: (stats: GameStats, turn: number) => string | null;
  /** Phase 2: 显示条件 */
  condition?: (stats: GameStats) => boolean;
  /** Phase 2: 条件不满足时的提示 */
  disabledReason?: string;
  /** Phase 2: 风险等级（1–5） */
  riskLevel?: 1 | 2 | 3 | 4 | 5;
}

/** 动态叙事片段 */
export interface NarrativeVariant {
  condition: (stats: GameStats) => boolean;
  text: string;
}

/** 场景 */
export interface Scene {
  id: string;
  title: string;
  narrative: string;
  /** Phase 2: 根据参数状态追加/覆盖的动态叙事片段 */
  narrativeVariants?: NarrativeVariant[];
  characterIds: string[];
  choices: Choice[];
}

/** 阈值事件 */
export interface ThresholdEvent {
  id: string;
  title: string;
  description: string;
  condition: (stats: GameStats) => boolean;
  effects: Partial<GameStats>;
  /** 一局游戏内只触发一次 */
  once: boolean;
}

/** 事件日志条目 */
export interface EventLogEntry {
  turn: number;
  eventTitle: string;
  description: string;
  statChangesSummary: string;
}

/** 结局 */
export interface Ending {
  id: string;
  title: string;
  description: string;
  /** Phase 2: 根据参数动态追加的补充段落 */
  dynamicSupplements?: ((stats: GameStats) => string)[];
  historianComment: string;
  tone: "glorious" | "tragic" | "neutral" | "disgrace" | "victory";
}

/** 历史记录条目 */
export interface HistoryEntry {
  turn: number;
  sceneTitle: string;
  choiceLabel: string;
  resultText: string;
  statChangesSummary: string;
}

/** 完整游戏状态 */
export interface GameState {
  phase: GamePhase;
  currentSceneId: string;
  turn: number;
  stats: GameStats;
  history: HistoryEntry[];
  /** Phase 2: 事件日志 */
  eventLog: EventLogEntry[];
  /** Phase 2: 已触发的 once 事件 ID 集合 */
  triggeredEvents: string[];
  endingId?: string;
  /** Phase 2: 结局触发原因描述 */
  endingTriggerReason?: string;
}
