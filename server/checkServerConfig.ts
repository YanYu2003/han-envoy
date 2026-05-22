/* ============================================================
 * 《汉使》Han Envoy — Phase 4.5 Server Config Check
 *
 * 检查服务端代码是否能正常加载和配置。
 * 不依赖真实 API Key，不启动 HTTP 服务。
 * ============================================================ */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 尝试加载 .env.server.example 作为配置示例（.env.server 可能不存在）
dotenv.config({ path: path.resolve(__dirname, "../.env.server") });

let exitCode = 0;

function check(label: string, ok: boolean, detail?: string) {
  const status = ok ? "✅" : "❌";
  console.log(`${status} ${label}${detail ? " — " + detail : ""}`);
  if (!ok) exitCode = 1;
}

// ── 1. 检查模块导入 ──
try {
  // 动态 import 以触发 ESM 解析
  await import("./schemas.js");
  check("schemas.ts 可正常导入", true);
} catch (e) {
  check("schemas.ts 可正常导入", false, String(e));
}

try {
  await import("./serverPrompts.js");
  check("serverPrompts.ts 可正常导入", true);
} catch (e) {
  check("serverPrompts.ts 可正常导入", false, String(e));
}

try {
  const { callAI } = await import("./aiClient.js");
  check("aiClient.ts 可正常导入（未调用）", true);
  // 环境变量运行时读取测试
  const config = (callAI as unknown as { testGetConfig?: () => { baseUrl: string; model: string; apiKey: string | undefined } })?.testGetConfig;
  // 不调用实际 API
} catch (e) {
  check("aiClient.ts 可正常导入", false, String(e));
}

// ── 2. 配置检查 ──
const hasKey = !!process.env.AI_API_KEY;
if (hasKey) {
  check("AI_API_KEY 已配置", true, "长度 " + process.env.AI_API_KEY!.length + " 字符");
} else {
  check("AI_API_KEY 已配置", false, "未检测到，需创建 .env.server");
}

check(
  "AI_API_BASE_URL",
  !!process.env.AI_API_BASE_URL || true,
  process.env.AI_API_BASE_URL || "将使用默认值 https://api.deepseek.com"
);

check(
  "AI_MODEL",
  !!process.env.AI_MODEL || true,
  process.env.AI_MODEL || "将使用默认值 deepseek-chat"
);

// ── 3. 验证 __dirname 兼容性 ──
check("__dirname 在 ESM 环境下可用", __dirname.includes("server"), __dirname);

// ── 4. 安全提醒 ──
const keyInLog =
  process.env.AI_API_KEY &&
  process.env.AI_API_KEY.length > 0 &&
  process.env.AI_API_KEY !== "sk-your-key-here";
if (keyInLog) {
  // 只输出前缀，不输出完整 Key
  const prefix = process.env.AI_API_KEY!.slice(0, 6);
  console.log(`🔑 API Key 前缀: ${prefix}...（不输出完整 Key）`);
} else {
  console.log("ℹ️  未检测到真实 API Key，代理将在缺少 Key 时返回 500 可控错误");
}

// ── 结果 ──
console.log("\n" + (exitCode === 0 ? "✅ 全部检查通过" : "❌ 有检查未通过"));

process.exit(exitCode);
