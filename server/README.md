# 《汉使》Han Envoy — 本地 AI Proxy

> 本目录包含一个最小可用的本地 Express AI Proxy，用于调用真实大模型。

---

## 环境说明

- 项目使用 **ESM**（`"type": "module"`）
- 服务端使用 **tsx** 运行 TypeScript 文件
- 环境变量**在运行时读取**（非模块加载时），确保 `.env.server` 配置生效

---

## 快速开始

### 1. 配置环境变量

```bash
cp .env.server.example .env.server
```

然后编辑 `.env.server`，填入真实 API Key：

```
AI_API_KEY=sk-your-real-key-here
```

### 2. 验证配置（无需 API Key）

```bash
npm run server:check
```

输出示例：

```
✅ schemas.ts 可正常导入
✅ serverPrompts.ts 可正常导入
✅ aiClient.ts 可正常导入（未调用）
❌ AI_API_KEY 已配置 — 未检测到，需创建 .env.server
✅ AI_API_BASE_URL — 将使用默认值 https://api.deepseek.com
✅ AI_MODEL — 将使用默认值 deepseek-chat
✅ __dirname 在 ESM 环境下可用
ℹ️  未检测到真实 API Key，代理将在缺少 Key 时返回 500 可控错误
✅ 全部检查通过
```

### 3. 启动代理

```bash
npm run server:dev
```

看到以下输出表示启动成功：

```
[AI Proxy] 启动成功 → http://localhost:8787/api/ai
```

### 4. 测试健康检查

```bash
curl http://localhost:8787/api/health
```

响应示例：

```json
{"status":"ok","provider":"openai-compatible","model":"deepseek-chat"}
```

### 5. 前端连接代理

在项目的 `.env` 文件中设置：

```
VITE_AI_PLAY_MODE=realAI
VITE_AI_PROXY_URL=http://localhost:8787/api/ai
```

### 6. 同时运行前后端

需要两个终端：

| 终端 | 命令 | 说明 |
|------|------|------|
| 终端 1 | `npm run server:dev` | 后端 AI Proxy（端口 8787）|
| 终端 2 | `npm run dev` | 前端 Vite 开发服务器（端口 3000）|

---

## 安全说明

> **不要把真实 API Key 提交到代码仓库。**

- 真实 Key 只填入本地的 `.env.server`，不要提交
- `.env.server` 已在 `.gitignore` 中排除
- 前端只知道 `VITE_AI_PROXY_URL`，不知道真实 Key
- 不要把 `AI_API_KEY` 放进任何 `VITE_` 前缀的环境变量
- 日志不会输出完整 API Key

---

## 常见问题

### server:dev 报错 `__dirname is not defined`

项目使用 ESM，旧版 Node 不支持 `__dirname`。修复方法：
- 使用 Node 20+（已内置 `import.meta.url`）
- 检查 `server/aiProxyServer.ts` 顶部是否有 `fileURLToPath` 导入

### AI_API_BASE_URL / AI_MODEL 不生效

确认环境变量写在 `.env.server`（不是 `.env`），且文件位于项目根目录（`server/` 的上级目录）。

### 缺少 API Key 会怎样

代理会正常启动。调用 `POST /api/ai` 时会返回 500 可控错误，前端会 fallback 到 MockAIProvider，游戏不会崩溃。

---

## API 接口

### POST /api/ai

统一接口，通过 `task` 字段区分功能。

**parse 任务：**

```json
{
  "task": "parse",
  "input": "不投降的都得死",
  "context": { "sceneId": "intro_court", "sceneTitle": "...", "stats": {}, "recentHistory": [] }
}
```

**react 任务：**

```json
{
  "task": "react",
  "analysis": { "intent": "threaten", "tone": "furious", ... },
  "context": {}
}
```

**健康检查：**

```bash
curl http://localhost:8787/api/health
```

---

## 环境变量

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `AI_PROVIDER` | `openai-compatible` | Provider 名称（仅日志显示）|
| `AI_API_BASE_URL` | `https://api.deepseek.com` | API 基础地址 |
| `AI_API_KEY` | — | **必需**：API 密钥 |
| `AI_MODEL` | `deepseek-chat` | 模型名称 |
| `AI_PROXY_PORT` | `8787` | 代理端口 |
| `AI_PROXY_ALLOWED_ORIGIN` | `http://localhost:3000` | CORS 允许的源 |
