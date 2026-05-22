# 《汉使》Han Envoy — AI 代理接口设计

> **阶段：** Phase 4（设计文档，尚未部署代理服务器）

---

## 1. 为什么不能在前端保存真实 API Key

本项目是纯前端网页游戏（React + Vite）。

在 Vite 中，所有以 `VITE_` 开头的环境变量都会在构建时被打包进浏览器端 JavaScript 代码中。浏览器端代码**无法保护 secret**——任何用户都可以通过浏览器开发者工具查看源码，找到硬编码的 API Key。

**结论：**

- `VITE_AI_API_KEY` **只能**用于本地快速开发实验
- **绝对不能**将生产环境的真实 API Key 放在前端 `.env` 文件中
- 真实 API Key **必须**存储在服务端环境变量中
- 前端通过自己的后端代理转发请求

---

## 2. 推荐架构

```
┌─────────────────┐     POST /api/ai     ┌─────────────────────┐
│  前端 React      │  ─────────────────→  │  后端代理           │
│  (浏览器端)      │                      │  (Cloud Function /  │
│                  │  ←─────────────────  │   Serverless /      │
│  不保存 API Key  │      JSON 响应        │   Express Proxy)    │
└─────────────────┘                      └─────────┬───────────┘
                                                   │
                                          ┌────────▼──────────┐
                                          │  真实 AI Provider  │
                                          │  (OpenAI / DeepSeek│
                                          │   / 腾讯混元等)    │
                                          └───────────────────┘
```

### 数据流

1. 前端发送玩家输入到 `/api/ai`（自己的后端代理）
2. 后端代理接收到请求，读取服务器端环境变量中的真实 API Key
3. 后端代理将请求转发给真实 AI Provider
4. AI Provider 返回响应
5. 后端代理校验 JSON 格式
6. 后端代理返回结构化 JSON 给前端
7. 前端接收到响应后进行规则结算

---

## 3. 代理接口设计

### 3.1 统一接口

**端点：** `POST {proxyUrl}`（默认为 `/api/ai`）

**请求 Content-Type：** `application/json`

**请求体通用结构：**

```json
{
  "task": "parse | react",
  "input": "...",
  "analysis": {},
  "context": {}
}
```

### 3.2 parse 任务

将玩家自然语言输入解析为游戏内部的结构化行动。

**请求：**

```json
{
  "task": "parse",
  "input": "不投降的都得死",
  "context": {
    "sceneId": "intro_court",
    "sceneTitle": "入楼兰王庭",
    "stats": {
      "hanPrestige": 30,
      "xiongnuPressure": 40,
      "kingAnger": 20,
      "kingFear": 30,
      "proHan": 25,
      "proXiongnu": 35,
      "tradeAccess": 30,
      "casusBelli": 15,
      "envoyHonor": 50,
      "historianScore": 50
    },
    "recentHistory": []
  }
}
```

**响应：**

```json
{
  "intent": "threaten",
  "tone": "furious",
  "target": "king",
  "riskLevel": 3,
  "confidence": 0.85,
  "ruleHints": [],
  "shortSummary": "意图:威慑 → 楼兰王",
  "interpretedAs": "意图:威慑 → 楼兰王"
}
```

**响应字段说明：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `intent` | string | 见 PlayerIntent 枚举 |
| `tone` | string | 见 PlayerTone 枚举 |
| `target` | string | 见 PlayerTarget 枚举 |
| `riskLevel` | number | 1–5 |
| `confidence` | number | 0–1 |
| `ruleHints` | string[] | 可选的规则提示 |
| `shortSummary` | string | 简短中文摘要 |
| `interpretedAs` | string | 解析后的中文描述 |

### 3.3 react 任务

根据玩家行动分析和当前情境，生成角色动态反应。

**请求：**

```json
{
  "task": "react",
  "analysis": {
    "intent": "threaten",
    "tone": "furious",
    "target": "king",
    "riskLevel": 3,
    "confidence": 0.85,
    "ruleHints": [],
    "shortSummary": "意图:威慑 → 楼兰王",
    "interpretedAs": "意图:威慑 → 楼兰王"
  },
  "context": {
    "sceneId": "intro_court",
    "sceneTitle": "入楼兰王庭",
    "stats": {},
    "recentHistory": []
  }
}
```

**响应：**

```json
[
  {
    "characterId": "king",
    "text": "汉使这是以势相压么？",
    "emotion": "hesitant"
  },
  {
    "characterId": "proXiongnu",
    "text": "大王！汉人向来言过其实，不可轻信！",
    "emotion": "angry"
  }
]
```

---

## 4. 安全要求

| 要求 | 说明 |
|------|------|
| API Key 位置 | 仅存储在服务端环境变量中 |
| 前端 Secret | 前端不保存任何真实 secret |
| 请求体大小限制 | 建议限制 ≤ 100KB |
| Rate Limit | 建议对同一 IP 做 30 次/分钟的限流 |
| Task 校验 | 服务端应校验 `task` 是否为 `parse` 或 `react` |
| JSON 校验 | 服务端应校验 AI 返回的 JSON 是否符合期望结构 |
| 错误处理 | AI 失败时返回可控错误对象，不要暴露原始错误 |
| 超时 | 建议代理超时设为 20s |
| 前端 Fallback | 前端请求失败时降级到 MockAIProvider |

---

## 5. 可选部署方案

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| 腾讯云云函数 (SCF) | Serverless，按量计费，天然防攻击 | 黑客松/比赛部署 |
| Vercel Serverless Function | 与前端同仓库部署，无需额外服务器 | 快速原型 |
| Netlify Function | 类似 Vercel，但限流较严格 | 轻量试用 |
| 自建 Express Proxy | 完全控制，适合生产 | 正式运营 |
| CloudBase 云函数 | 腾讯云生态，与微信生态集成 | 腾讯云黑客松 |

### 推荐：腾讯云云函数 (SCF)

对于本项目的黑客松参赛场景，推荐使用腾讯云云函数：

1. 创建一个 Node.js 云函数
2. 在云函数环境变量中配置 `AI_API_KEY`
3. 前端设置 `VITE_AI_PROXY_URL=/api/ai`
4. 通过 API 网关暴露云函数
5. 云函数内部转发请求到真实 AI Provider

---

## 6. 前端配置

### 开发环境

```bash
# .env 文件（本地开发）
VITE_AI_PLAY_MODE=mock           # 本地使用 Mock
VITE_AI_PROXY_URL=/api/ai        # 代理 URL（有后端时启用）
```

### 生产环境

```bash
# 部署平台环境变量
VITE_AI_PLAY_MODE=realAI
VITE_AI_PROXY_URL=https://your-domain.com/api/ai
```

---

## 7. 错误处理

### 代理返回的错误格式

```json
{
  "error": true,
  "code": "AI_PARSE_ERROR",
  "message": "AI 解析失败，请重试"
}
```

### 前端行为

当代理请求失败时，`RemoteAIProvider` 会自动降级到 `MockAIProvider`，并输出 `console.warn` 警告。游戏不会崩溃，玩家可以继续游玩。

---

## 8. 参考实现

后端代理的实现不在本项目范围内。但可以参考以下伪代码：

```typescript
// Node.js Express / Cloud Function 伪代码
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_API_KEY, // 仅存在于服务端
});

export async function handler(req, res) {
  const { task, input, analysis, context } = req.body;

  if (task === "parse") {
    const prompt = buildParsePrompt(input, context);
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ],
      response_format: { type: "json_object" },
    });
    const result = JSON.parse(completion.choices[0].message.content);
    res.json(result);
  }

  if (task === "react") {
    const prompt = buildReactionPrompt(analysis, context);
    // ... 类似逻辑
  }
}
```

> **注意：** 上述参考实现仅用作架构说明，本项目中未实现真实后端代理。实际部署时请参考此设计自行实现。

---

## 9. Phase 4.5：本地 Express 代理 Demo

Phase 4.5 已实现一个最小可用的本地 Express AI Proxy，位于 `server/` 目录。

| 组件 | 文件 | 说明 |
|------|------|------|
| Express 服务器 | `server/aiProxyServer.ts` | POST /api/ai，支持 parse/react 两个 task |
| AI Client | `server/aiClient.ts` | 调用 OpenAI-compatible Chat Completions 接口 |
| 服务端 Prompt | `server/serverPrompts.ts` | 含 context 的 System/User Prompt |
| Schema 校验 | `server/schemas.ts` | sanitizeParseResponse / sanitizeReactionResponse |
| 环境变量示例 | `.env.server.example` | 服务端环境变量（API Key 仅在此处配置） |

### 快速启动

```bash
cp .env.server.example .env.server
# 编辑 .env.server 填入 AI_API_KEY
npm run server:dev
```

### 前端配置

```bash
VITE_AI_PLAY_MODE=realAI
VITE_AI_PROXY_URL=http://localhost:8787/api/ai
```

详见 [`server/README.md`](../server/README.md)。
