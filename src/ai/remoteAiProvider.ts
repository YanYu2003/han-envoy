/* ============================================================
 * 《汉使》Han Envoy — Phase 4 远程 AI Provider
 *
 * 通过后端代理调用真实 AI 模型。
 *
 * 安全设计：
 * - 前端只保存代理 URL（VITE_AI_PROXY_URL）
 * - 真实 API Key 仅存于服务端
 * - 本文件不包含任何 API Key
 * - 代理请求失败时自动 fallback 到 MockAIProvider
 * ============================================================ */

import type {
  AIProvider,
  AIContext,
  PlayerActionAnalysis,
  CharacterReaction,
} from "./types";
import { mockAIProvider } from "./mockAiProvider";

/** 从环境变量读取代理 URL */
function getProxyUrl(): string | undefined {
  try {
    return import.meta.env.VITE_AI_PROXY_URL as string | undefined;
  } catch {
    return undefined;
  }
}

/**
 * RemoteAIProvider — 通过后端代理调用真实 AI。
 *
 * 所有请求通过 fetch 发送到代理服务器，由代理转发给真实 AI Provider。
 * 请求/响应格式详见 docs/ai-proxy-design.md。
 */
export class RemoteAIProvider implements AIProvider {
  async parsePlayerInput(
    input: string,
    context: AIContext
  ): Promise<PlayerActionAnalysis> {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) {
      console.warn(
        "[HanEnvoy] RemoteAIProvider: VITE_AI_PROXY_URL 未配置，降级到 MockAIProvider"
      );
      return mockAIProvider.parsePlayerInput(input, context);
    }

    try {
      const response = await fetch(`${proxyUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "parse",
          input,
          context,
        }),
        signal: AbortSignal.timeout(15000), // 15s 超时
      });

      if (!response.ok) {
        throw new Error(`代理返回 ${response.status}`);
      }

      const data: PlayerActionAnalysis = await response.json();
      return data;
    } catch (err) {
      console.warn("[HanEnvoy] RemoteAIProvider parse 请求失败，降级到 Mock:", err);
      return mockAIProvider.parsePlayerInput(input, context);
    }
  }

  async generateCharacterReactions(
    analysis: PlayerActionAnalysis,
    context: AIContext
  ): Promise<CharacterReaction[]> {
    const proxyUrl = getProxyUrl();
    if (!proxyUrl) {
      console.warn(
        "[HanEnvoy] RemoteAIProvider: VITE_AI_PROXY_URL 未配置，降级到 MockAIProvider"
      );
      return mockAIProvider.generateCharacterReactions(analysis, context);
    }

    try {
      const response = await fetch(`${proxyUrl}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          task: "react",
          analysis,
          context,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        throw new Error(`代理返回 ${response.status}`);
      }

      const data: CharacterReaction[] = await response.json();
      return data;
    } catch (err) {
      console.warn(
        "[HanEnvoy] RemoteAIProvider react 请求失败，降级到 Mock:",
        err
      );
      return mockAIProvider.generateCharacterReactions(analysis, context);
    }
  }
}

/** 单例 */
export const remoteAIProvider = new RemoteAIProvider();
