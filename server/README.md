# 《汉使》Han Envoy — 本地 AI Proxy

> 本目录包含一个最小可用的本地 Express AI Proxy，用于调用真实大模型。

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

### 2. 启动代理

```bash
npm run server:dev
```

看到以下输出表示启动成功：

```
[AI Proxy] 启动成功 → http://localhost:8787/api/ai
```

### 3. 前端连接代理

在项目的 `.env` 文件中设置：

```
VITE_AI_PLAY_MODE=realAI
VITE_AI_PROXY_URL=http://localhost:8787/api/ai
```

### 4. 同时运行前后端

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
- 不要把 AI_API_KEY 放进任何 `VITE_` 前缀的环境变量

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
