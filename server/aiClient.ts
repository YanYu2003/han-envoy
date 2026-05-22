/* ============================================================
 * 《汉使》Han Envoy — Phase 4.5 AI Client
 *
 * 封装对 OpenAI-compatible API 的调用。
 * 支持 DeepSeek、OpenAI 等兼容 Chat Completions 接口的 Provider。
 *
 * 环境变量在运行时读取（非模块顶层），
 * 确保 dotenv.config 加载后能读到正确配置。
 *
 * 环境变量：
 *   AI_API_BASE_URL  — API 基础地址（默认 https://api.deepseek.com）
 *   AI_API_KEY       — API 密钥（必需，仅服务端）
 *   AI_MODEL         — 模型名（默认 deepseek-chat）
 * ============================================================ */

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

function getAIConfig() {
  return {
    baseUrl: process.env.AI_API_BASE_URL || "https://api.deepseek.com",
    model: process.env.AI_MODEL || "deepseek-chat",
    apiKey: process.env.AI_API_KEY,
  };
}

/**
 * 调用 AI Provider 的 Chat Completions 接口。
 * 返回原始文本内容（需自行 JSON.parse）。
 *
 * 注意：环境变量在函数内部读取，确保 dotenv 配置已加载。
 */
export async function callAI(messages: ChatMessage[]): Promise<string> {
  const { baseUrl, model, apiKey } = getAIConfig();

  if (!apiKey) {
    throw new Error("AI_API_KEY 未配置");
  }

  const startTime = Date.now();
  const url = `${baseUrl}/chat/completions`;

  console.log(`[AI Client] 请求 ${model}，消息数: ${messages.length}`);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.4,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    throw new Error(`AI API 返回 ${response.status}: ${errText.slice(0, 200)}`);
  }

  const data = await response.json();
  const content: string | undefined =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("AI API 返回了空内容");
  }

  const elapsed = Date.now() - startTime;
  console.log(`[AI Client] 响应耗时 ${elapsed}ms，内容长度: ${content.length}`);

  // 尝试提取 JSON（AI 可能返回 Markdown 代码块）
  return extractJsonFromText(content);
}

/**
 * 从 AI 回复文本中提取 JSON。
 * 如果包含 ```json ... ``` 或 ``` ... ``` 代码块则从中提取。
 * 否则假设整个文本就是 JSON。
 */
function extractJsonFromText(text: string): string {
  // 尝试匹配 ```json ... ```
  const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonBlockMatch?.[1]) return jsonBlockMatch[1].trim();

  // 尝试匹配 ``` ... ```
  const codeBlockMatch = text.match(/```\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch?.[1]) return codeBlockMatch[1].trim();

  // 没有代码块，假设全文本是 JSON
  return text.trim();
}
