import { create } from "zustand";
import type {
  GameState,
  HistoryEntry,
  Choice,
  GameStats,
  EventLogEntry,
} from "../game/types";
import { INITIAL_STATS } from "../game/initialState";
import { SCENES, STARTING_SCENE_ID } from "../game/scenes";
import { applyEffects, formatStatChanges } from "../game/simpleRules";
import { resolveChainReactions } from "../game/chainReactions";
import {
  checkThresholdEvents,
  applyThresholdEvents,
} from "../game/thresholdEvents";
import { getEndingTriggerReason } from "../game/endings";

/* ================================================================
 * Store 类型
 * ================================================================ */

interface GameActions {
  startGame: () => void;
  makeChoice: (choiceId: string) => void;
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
    eventLog: [],
    triggeredEvents: [],
    endingId: undefined,
    endingTriggerReason: undefined,
  };
}

/* ================================================================
 * 工具函数
 * ================================================================ */

function findChoice(sceneId: string, choiceId: string): Choice | null {
  const scene = SCENES[sceneId];
  if (!scene) return null;
  return scene.choices.find((c) => c.id === choiceId) ?? null;
}

function computeDelta(
  before: GameStats,
  after: GameStats
): Partial<GameStats> {
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
      eventLog: [],
      triggeredEvents: [],
      endingId: undefined,
      endingTriggerReason: undefined,
    });
  },

  makeChoice: (choiceId: string) => {
    const state = get();
    if (state.phase !== "court") return;

    const scene = SCENES[state.currentSceneId];
    if (!scene) return;

    const choice = findChoice(state.currentSceneId, choiceId);
    if (!choice) return;

    // ---- Phase 2: 条件检查 ----
    if (choice.condition && !choice.condition(state.stats)) {
      return; // 不应到达此处（UI 已禁用按钮）
    }

    // ---- 1) 应用选择效果 ----
    let newStats = applyEffects(state.stats, choice.effects);

    // ---- 2) Phase 2: 连锁反应 ----
    const chainResult = resolveChainReactions(newStats);
    newStats = chainResult.stats;

    // ---- 3) Phase 2: 阈值事件检查 ----
    const newEvents = checkThresholdEvents(newStats, state.triggeredEvents);
    const eventResult = applyThresholdEvents(newStats, newEvents);
    newStats = eventResult.stats;
    const newTriggeredIds = [
      ...state.triggeredEvents,
      ...newEvents.map((e) => e.id),
    ];

    // ---- 4) 记录历史 ----
    const choiceDelta = computeDelta(state.stats, newStats);
    const statSummary = formatStatChanges(choiceDelta);

    const entry: HistoryEntry = {
      turn: state.turn,
      sceneTitle: scene.title,
      choiceLabel: choice.label,
      resultText: choice.resultText,
      statChangesSummary: statSummary || "无显著变化",
    };

    // ---- 5) 记录事件日志 ----
    const newEventLog: EventLogEntry[] = [
      ...state.eventLog,
      ...eventResult.logs.map((log) => ({
        turn: state.turn,
        eventTitle: "",
        description: log,
        statChangesSummary: "",
      })),
    ];

    // 如果有连锁反应变化，追加到日志
    if (chainResult.changes.length > 0) {
      for (const desc of chainResult.changes) {
        newEventLog.push({
          turn: state.turn,
          eventTitle: "连锁反应",
          description: desc,
          statChangesSummary: "",
        });
      }
    }

    // ---- 6) 判定结局 ----
    let endingId: string | undefined;

    if (choice.endingId) {
      endingId = choice.endingId;
    } else if (choice.resolveEnding) {
      const resolved = choice.resolveEnding(newStats, state.turn);
      if (resolved) endingId = resolved;
    }

    // ---- 7) 触发结局 ----
    if (endingId) {
      const triggerReason = getEndingTriggerReason(endingId, newStats);
      set({
        stats: newStats,
        history: [...state.history, entry],
        eventLog: newEventLog,
        triggeredEvents: newTriggeredIds,
        phase: "ending",
        endingId,
        endingTriggerReason: triggerReason,
      });
      return;
    }

    // ---- 8) 正常推进 ----
    const nextSceneId = choice.nextSceneId;
    if (!nextSceneId) {
      set({
        stats: newStats,
        history: [...state.history, entry],
        eventLog: newEventLog,
        triggeredEvents: newTriggeredIds,
        phase: "ending",
        endingId: "expelled",
        endingTriggerReason: getEndingTriggerReason("expelled", newStats),
      });
      return;
    }

    set({
      stats: newStats,
      history: [...state.history, entry],
      eventLog: newEventLog,
      triggeredEvents: newTriggeredIds,
      currentSceneId: nextSceneId,
      turn: state.turn + 1,
    });
  },

  restart: () => {
    set(createInitialState());
  },
}));
