import { create } from "zustand";
import type {
  GameState,
  HistoryEntry,
  Choice,
  GameStats,
  EventLogEntry,
  AIInteractionLogEntry,
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
import { resolveCrisisEnding, resolveAssassinationEnding } from "../game/scenes";
import { getAIPlayMode } from "../ai/aiMode";
import { getAIProvider } from "../ai/aiProviderFactory";
import { analysisToEffects } from "../ai/analysisToEffects";

/* ================================================================
 * Store 类型
 * ================================================================ */

interface GameActions {
  startGame: () => void;
  makeChoice: (choiceId: string) => void;
  makeFreeInput: (input: string) => Promise<void>;
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
    aiLog: [],
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
 * 公共结算管线（纯数据，不调用 set）
 * ================================================================ */

interface TurnInput {
  effects: Partial<GameStats>;
  label: string;
  resultText: string;
  sceneTitle: string;
  endingIdOverride?: string;
  resolveEndingFn?: (stats: GameStats, turn: number) => string | null;
  nextSceneId?: string;
}

interface TurnOutput {
  newStats: GameStats;
  entry: HistoryEntry;
  newEventLog: EventLogEntry[];
  newTriggeredIds: string[];
  resolvedEndingId: string | undefined;
}

function resolveTurn(
  state: GameState,
  input: TurnInput
): TurnOutput {
  let newStats = applyEffects(state.stats, input.effects);

  const chainResult = resolveChainReactions(newStats);
  newStats = chainResult.stats;

  const newEvents = checkThresholdEvents(newStats, state.triggeredEvents);
  const eventResult = applyThresholdEvents(newStats, newEvents);
  newStats = eventResult.stats;
  const newTriggeredIds = [
    ...state.triggeredEvents,
    ...newEvents.map((e) => e.id),
  ];

  const delta = computeDelta(state.stats, newStats);
  const statSummary = formatStatChanges(delta);
  const entry: HistoryEntry = {
    turn: state.turn,
    sceneTitle: input.sceneTitle,
    choiceLabel: input.label,
    resultText: input.resultText,
    statChangesSummary: statSummary || "无显著变化",
  };

  const newEventLog: EventLogEntry[] = [
    ...state.eventLog,
    ...eventResult.logs.map((log) => ({
      turn: state.turn,
      eventTitle: "",
      description: log,
      statChangesSummary: "",
    })),
  ];
  for (const desc of chainResult.changes) {
    newEventLog.push({
      turn: state.turn,
      eventTitle: "连锁反应",
      description: desc,
      statChangesSummary: "",
    });
  }

  let resolvedEndingId: string | undefined;
  if (input.endingIdOverride) {
    resolvedEndingId = input.endingIdOverride;
  } else if (input.resolveEndingFn) {
    resolvedEndingId = input.resolveEndingFn(newStats, state.turn) ?? undefined;
  }

  return { newStats, entry, newEventLog, newTriggeredIds, resolvedEndingId };
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
      aiLog: [],
    });
  },

  makeChoice: (choiceId: string) => {
    const state = get();
    if (state.phase !== "court") return;

    const scene = SCENES[state.currentSceneId];
    if (!scene) return;

    const choice = findChoice(state.currentSceneId, choiceId);
    if (!choice) return;

    if (choice.condition && !choice.condition(state.stats)) return;

    const output = resolveTurn(state, {
      effects: choice.effects,
      label: choice.label,
      resultText: choice.resultText,
      sceneTitle: scene.title,
      endingIdOverride: choice.endingId,
      resolveEndingFn: choice.resolveEnding,
    });

    applyTurnOutcome(state, output, choice.nextSceneId);
  },

  makeFreeInput: async (input: string) => {
    const state = get();
    if (state.phase !== "court") return;

    const scene = SCENES[state.currentSceneId];
    if (!scene) return;

    // 1) 获取 AI Provider（支持 presetOnly / mock / realAI）
    const aiMode = getAIPlayMode();
    const provider = getAIProvider(aiMode);
    if (!provider) {
      console.warn("[HanEnvoy] 当前为 presetOnly 模式，自由输入已被忽略");
      return;
    }

    const context = {
      sceneId: state.currentSceneId,
      sceneTitle: scene.title,
      stats: state.stats,
      recentHistory: state.history.slice(-3),
    };
    const analysis = await provider.parsePlayerInput(input, context);

    // 2) 分析 → 规则效果
    const effects = analysisToEffects(analysis);

    // 3) 结果文本
    const isUnclear = analysis.intent === "unclear";
    const resultText = isUnclear
      ? "通译迟疑片刻，似乎未能理解你的意思。请换一种更明确的说法。"
      : `你开口说道：「${input.length > 40 ? input.slice(0, 40) + "…" : input}」`;

    // 4) 判定结局逻辑
    let resolveEndingFn: ((stats: GameStats, turn: number) => string | null) | undefined;
    let nextSceneId: string | undefined;

    if (analysis.intent === "assassinate") {
      resolveEndingFn = resolveAssassinationEnding;
    } else if (state.currentSceneId === "crisis_point") {
      resolveEndingFn = resolveCrisisEnding;
    } else {
      // 正常推进到下一场景
      const sceneIds = Object.keys(SCENES);
      const currentIdx = sceneIds.indexOf(state.currentSceneId);
      nextSceneId =
        currentIdx >= 0 && currentIdx < sceneIds.length - 1
          ? sceneIds[currentIdx + 1]
          : undefined;
    }

    // 5) 执行结算管线
    const output = resolveTurn(state, {
      effects,
      label: `自由输入：${analysis.shortSummary}`,
      resultText,
      sceneTitle: scene.title,
      resolveEndingFn,
    });

    // 6) 角色反应
    const reactions = await provider.generateCharacterReactions(
      analysis,
      context
    );

    // 7) 记录 AI 日志
    const aiEntry: AIInteractionLogEntry = {
      turn: state.turn,
      input,
      analysis,
      reactions,
    };

    // 8) 应用结果（含 AI 日志）
    applyTurnOutcome(state, output, nextSceneId, {
      aiLog: [...state.aiLog, aiEntry],
    });
  },

  restart: () => {
    set(createInitialState());
  },
}));

/* ================================================================
 * 应用结算结果到 store
 * ================================================================ */

function applyTurnOutcome(
  state: GameState,
  output: TurnOutput,
  nextSceneId?: string,
  additional: Partial<GameState> = {}
) {
  const { newStats, entry, newEventLog, newTriggeredIds, resolvedEndingId } =
    output;

  const base: Partial<GameState> = {
    stats: newStats,
    history: [...state.history, entry],
    eventLog: newEventLog,
    triggeredEvents: newTriggeredIds,
    ...additional,
  };

  if (resolvedEndingId) {
    useGameStore.setState({
      ...base,
      phase: "ending",
      endingId: resolvedEndingId,
      endingTriggerReason: getEndingTriggerReason(resolvedEndingId, newStats),
    } as Partial<GameStore>);
    return;
  }

  if (!nextSceneId) {
    useGameStore.setState({
      ...base,
      phase: "ending",
      endingId: "expelled",
      endingTriggerReason: getEndingTriggerReason("expelled", newStats),
    } as Partial<GameStore>);
    return;
  }

  useGameStore.setState({
    ...base,
    currentSceneId: nextSceneId,
    turn: state.turn + 1,
  } as Partial<GameStore>);
}