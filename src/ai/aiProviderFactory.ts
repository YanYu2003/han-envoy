/* ============================================================
 * 《汉使》Han Envoy — Phase 4 AI Provider 选择器
 *
 * 根据当前 AI 模式返回合适的 AIProvider。
 * ============================================================ */

import type { AIProvider } from "./types";
import type { AIPlayMode } from "./aiMode";
import { mockAIProvider } from "./mockAiProvider";
import { remoteAIProvider } from "./remoteAiProvider";

/**
 * 根据 AI 模式返回对应的 Provider。
 *
 * - presetOnly：不需要 provider，返回 null
 * - mock：返回 MockAIProvider
 * - realAI：返回 RemoteAIProvider（通过后端代理）；若不可用 fallback 到 mock
 *
 * @param mode 当前 AI 模式
 * @param allowFallback 当 realAI 不可用时是否 fallback 到 mock（默认 true）
 */
export function getAIProvider(
  mode: AIPlayMode,
  allowFallback = true
): AIProvider | null {
  switch (mode) {
    case "presetOnly":
      return null;

    case "mock":
      return mockAIProvider;

    case "realAI": {
      // realAI 模式：检查远程代理是否已配置
      const proxyUrl = getProxyUrl();
      if (proxyUrl) {
        return remoteAIProvider;
      }
      // 代理未配置时
      console.warn(
        "[HanEnvoy] realAI 模式已选择，但 VITE_AI_PROXY_URL 未配置。" +
          (allowFallback ? " 降级到 MockAIProvider。" : "")
      );
      if (allowFallback) {
        return mockAIProvider;
      }
      return null;
    }

    default:
      return mockAIProvider;
  }
}

/** 从环境变量读取代理 URL */
function getProxyUrl(): string | undefined {
  try {
    return import.meta.env.VITE_AI_PROXY_URL as string | undefined;
  } catch {
    return undefined;
  }
}
