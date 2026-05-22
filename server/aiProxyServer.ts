/* ============================================================
 * 《汉使》Han Envoy — Phase 4.5 AI Proxy Server
 *
 * 本地 Express 代理，用于调用真实 AI Provider。
 * 读取服务端环境变量中的 API Key，不暴露到前端。
 *
 * 注意：项目使用 ESM ("type": "module")，
 * 因此使用 fileURLToPath 替代 __dirname。
 * ============================================================ */

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载 .env.server（优先）或 .env
dotenv.config({ path: path.resolve(__dirname, "../.env.server") });

import { callAI } from "./aiClient";
import { buildParsePrompt, buildReactionPrompt } from "./serverPrompts";
import {
  isValidTask,
  sanitizeParseResponse,
  sanitizeReactionResponse,
} from "./schemas";

const PORT = parseInt(process.env.AI_PROXY_PORT || "8787", 10);
const ALLOWED_ORIGIN =
  process.env.AI_PROXY_ALLOWED_ORIGIN || "http://localhost:3000";

const app = express();

// CORS
app.use(
  cors({
    origin: ALLOWED_ORIGIN.split(",").map((s) => s.trim()),
    methods: ["POST"],
    maxAge: 86400,
  })
);

// Body parser with size limit
app.use(express.json({ limit: "100kb" }));

// Health check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    provider: process.env.AI_PROVIDER || "openai-compatible",
    model: process.env.AI_MODEL || "deepseek-chat",
  });
});

// Main AI proxy endpoint
app.post("/api/ai", async (req, res) => {
  try {
    const { task, input, analysis, context } = req.body;

    // 校验 task
    if (!isValidTask(task)) {
      res.status(400).json({
        error: true,
        code: "INVALID_TASK",
        message: `无效的 task：${task}。可选值：parse, react`,
      });
      return;
    }

    // 校验 API Key
    const apiKey = process.env.AI_API_KEY;
    if (!apiKey) {
      res.status(500).json({
        error: true,
        code: "MISSING_API_KEY",
        message: "服务端未配置 AI_API_KEY，请在 .env.server 中设置",
      });
      return;
    }

    let result: unknown;

    if (task === "parse") {
      if (!input || typeof input !== "string") {
        res.status(400).json({
          error: true,
          code: "INVALID_INPUT",
          message: "parse task 需要 string input",
        });
        return;
      }
      const prompt = buildParsePrompt(input, context || {});
      const raw = await callAI([
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ]);
      const parsed = JSON.parse(raw);
      result = sanitizeParseResponse(parsed);
    } else if (task === "react") {
      if (!analysis || typeof analysis !== "object") {
        res.status(400).json({
          error: true,
          code: "INVALID_ANALYSIS",
          message: "react task 需要 analysis 对象",
        });
        return;
      }
      const prompt = buildReactionPrompt(analysis, context || {});
      const raw = await callAI([
        { role: "system", content: prompt.systemPrompt },
        { role: "user", content: prompt.userPrompt },
      ]);
      const parsed = JSON.parse(raw);
      result = sanitizeReactionResponse(parsed);
    }

    res.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "未知错误";
    console.error("[AI Proxy] 处理请求失败:", msg);
    res.status(500).json({
      error: true,
      code: "AI_PROXY_ERROR",
      message: "AI 代理调用失败",
    });
  }
});

app.listen(PORT, () => {
  console.log(`[AI Proxy] 启动成功 → http://localhost:${PORT}/api/ai`);
  console.log(`[AI Proxy] Provider: ${process.env.AI_PROVIDER || "openai-compatible"}`);
  console.log(`[AI Proxy] Model: ${process.env.AI_MODEL || "deepseek-chat"}`);
  console.log(`[AI Proxy] CORS allowed: ${ALLOWED_ORIGIN}`);
});
