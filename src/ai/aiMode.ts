/* ============================================================
 * 《汉使》Han Envoy — Phase 3.1 AI 模式开关
 *
 * 控制自由输入是否可用，以及使用哪种 AI Provider。
 * ============================================================ */

/**
 * AI 游玩模式：
 * - presetOnly: 隐藏/禁用自由输入，只保留预设选项
 * - mock: 显示自由输入，使用 MockAIProvider（当前默认）
 * - realAI: 未来真实 AI 模式
 */
export type AIPlayMode = "presetOnly" | "mock" | "realAI";

/** 当前默认模式 */
export const DEFAULT_AI_PLAY_MODE: AIPlayMode = "mock";

/**
 * 模式说明：
 * - presetOnly：适合无 AI 场景或演示，只显示预设选项
 * - mock：开发验证模式，显示 Mock AI 实验提示
 * - realAI：Phase 4 后接入真实大模型
 */