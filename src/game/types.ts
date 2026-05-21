/* ============================================================
 * 《汉使》Han Envoy — Phase 1 核心类型定义
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
  /** 选择后对参数的增量变化（部分可缺省） */
  effects: Partial<GameStats>;
  /** 选择后显示的剧情反馈文本 */
  resultText: string;
  /** 下一场景 ID（若不触发结局） */
  nextSceneId?: string;
  /** 直接指定的结局 ID（若有） */
  endingId?: string;
  /**
   * 条件结局判定函数。
   * 若返回非空字符串，则以此结局 ID 为准。
   * 仅在 choice 未指定 endingId 时调用。
   */
  resolveEnding?: (stats: GameStats, turn: number) => string | null;
}

/** 场景 */
export interface Scene {
  id: string;
  title: string;
  /** 叙事文本 */
  narrative: string;
  /** 此场景中出现的角色 ID 列表 */
  characterIds: string[];
  /** 玩家可选行动列表 */
  choices: Choice[];
}

/** 结局 */
export interface Ending {
  id: string;
  title: string;
  description: string;
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
  endingId?: string;
}
