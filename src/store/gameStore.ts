import { create } from "zustand";
import type { GameState, HistoryEntry, Choice, GameStats } from "../game/types";
import { INITIAL_STATS } from "../game/initialState";
import { SCENES, STARTING_SCENE_ID } from "../game/scenes";
import { applyEffects, formatStatChanges } from "../game/simpleRules";

/* ================================================================
 * Store 类型
 * ================================================================ */

interface GameActions {
  /** 从开始界面进入游戏 */
  startGame: () => void;
  /** 玩家选择了一个行动 */
  makeChoice: (choiceId: string) => void;
  /** 回到开始界面 */
  restart: () => void;
}

type GameStore = GameState & GameActions;

/* ================================================================
 * 初始状态
 * ================================================================ */

function createInitialState(): GameState {
  return {
    phase: "start",
    currentSceneId: STARTING_SCENE_ID,
    turn: 0,
    stats: { ...INITIAL_STATS },
    history: [],
    endingId: undefined,
  };
}

/* ================================================================
 * 获取当前场景中的某个 Choice 对象
 * ================================================================ */

function findChoice(sceneId: string, choiceId: string): Choice | null {
  const scene = SCENES[sceneId];
  if (!scene) return null;
  return scene.choices.find((c) => c.id === choiceId) ?? null;
}

/* ================================================================
 * 递归生成参数增量摘要：只显示有变化的字段
 * ================================================================ */

function computeDelta(before: GameStats, after: GameStats): Partial<GameStats> {
  const delta: Partial<GameStats> = {};
  const keys = Object.keys(before) as (keyof GameStats)[];
  for (const key of keys) {
    const diff = after[key] - before[key];
    if (diff !== 0) {
      delta[key] = diff;
    }
  }
  return delta;
}

/* ================================================================
 * Store
 * ================================================================ */

export const useGameStore = create<GameStore>((set, get) => ({
  /* ---- State ---- */
  ...createInitialState(),

  /* ---- Actions ---- */

  startGame: () => {
    set({
      phase: "court",
      currentSceneId: STARTING_SCENE_ID,
      turn: 1,
      stats: { ...INITIAL_STATS },
      history: [],
      endingId: undefined,
    });
  },

  makeChoice: (choiceId: string) => {
    const state = get();
    if (state.phase !== "court") return;

    const scene = SCENES[state.currentSceneId];
    if (!scene) return;

    const choice = findChoice(state.currentSceneId, choiceId);
    if (!choice) return;

    // 1) 应用参数变化
    const newStats = applyEffects(state.stats, choice.effects);

    // 2) 记录历史
    const delta = computeDelta(state.stats, newStats);
    const statSummary = formatStatChanges(delta);

    const entry: HistoryEntry = {
      turn: state.turn,
      sceneTitle: scene.title,
      choiceLabel: choice.label,
      resultText: choice.resultText,
      statChangesSummary: statSummary || "无显著变化",
    };

    // 3) 判定结局
    let endingId: string | undefined;

    if (choice.endingId) {
      // 选择直接指定结局
      endingId = choice.endingId;
    } else if (choice.resolveEnding) {
      // 条件结局判定
      const resolved = choice.resolveEnding(newStats, state.turn);
      if (resolved) endingId = resolved;
    }

    // 4) 如果触发了结局
    if (endingId) {
      set({
        stats: newStats,
        history: [...state.history, entry],
        phase: "ending",
        endingId,
      });
      return;
    }

    // 5) 正常推进到下一场景
    const nextSceneId = choice.nextSceneId;
    if (!nextSceneId) {
      // 没有 nextSceneId 且没有结局 → fallback 到危机结局
      set({
        stats: newStats,
        history: [...state.history, entry],
        phase: "ending",
        endingId: "expelled",
      });
      return;
    }

    set({
      stats: newStats,
      history: [...state.history, entry],
      currentSceneId: nextSceneId,
      turn: state.turn + 1,
    });
  },

  restart: () => {
    set(createInitialState());
  },
}));
