/* ============================================================
 * 《汉使》Han Envoy — Phase 4 AI 模式开关
 *
 * 控制自由输入是否可用，以及使用哪种 AI Provider。
 * 支持从环境变量 VITE_AI_PLAY_MODE 读取配置。
 * ============================================================ */

/**
 * AI 游玩模式：
 * - presetOnly: 隐藏/禁用自由输入，只保留预设选项
 * - mock: 显示自由输入，使用 MockAIProvider（开发默认）
 * - realAI: 通过后端代理接入真实大模型
 */
export type AIPlayMode = "presetOnly" | "mock" | "realAI";

/** 代码默认模式 */
export const DEFAULT_AI_PLAY_MODE: AIPlayMode = "mock";

/**
 * 从环境变量读取 AI 模式，非法值 fallback 到 mock。
 *
 * 环境变量：VITE_AI_PLAY_MODE
 * 可选值：presetOnly | mock | realAI
 *
 * 注意：VITE_ 前缀变量会进入浏览器端，
 * 只能用于模式选择、代理 URL 等非敏感配置。
 */
export function getAIPlayMode(): AIPlayMode {
  try {
    const env = import.meta.env.VITE_AI_PLAY_MODE as string | undefined;
    if (env && ["presetOnly", "mock", "realAI"].includes(env)) {
      return env as AIPlayMode;
    }
  } catch {
    // import.meta.env 不可用时（如 Node 环境），使用默认值
  }
  return DEFAULT_AI_PLAY_MODE;
}
