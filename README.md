# 汉使 Han Envoy

> **持节入胡庭，一言动西域。**
>
> 一个 AI 辅助的汉代外交叙事模拟游戏原型。玩家扮演出使西域的汉使，在楼兰原型国的王庭上，用威慑、通商、问罪、离间、忍让、刺王或殉国改变朝堂局势。

---

## 当前状态

《汉使》最初为 **AI CAN DO IT｜腾讯云黑客松 游戏开发挑战赛** 的叙事游戏原型而启动；现在项目已经超过最早 README 中的 Phase 0 设想，进入“可玩 Demo + AI 工程化扩展”的阶段。

当前版本已经具备：

- React + TypeScript + Vite + Tailwind + Zustand 的前端工程；
- 一个楼兰王庭朝堂篇章，包含 4 个主要场景和多条预设路线；
- 10 维外交参数系统，数值范围统一钳制在 0-100；
- 阈值事件、连锁反应、动态叙事片段和 5 类结局；
- 预设选项与自由输入两种玩家行动方式；
- `presetOnly` / `mock` / `realAI` 三档 AI 模式；
- Mock AI 意图解析、角色反应生成，以及真实 AI 代理的本地 Express 方案；
- 服务端 schema sanitize，避免模型输出直接污染游戏状态；
- 自由输入意图路由和参数变化浮字反馈；
- Vitest 自动化测试底座，覆盖路由、规则映射、Mock AI 样例和基础规则引擎。

项目仍然是原型，不是完整商业游戏。当前主要短板是：篇章较短、NPC 没有长期记忆、场景流转仍未升级为显式剧情图、自动化测试不足、部署和演示包装还未完成。

一句话概括当前设计：

> **AI 负责理解与表达，规则负责裁判与结算。**

---

## 最新改动

最近一次功能改动是 **Intent Routing & Stat Delta Feedback**，建议在后续主线记录中视为 **Phase 5：交互后果可见化**。

它解决了两个早期问题：

1. 自由输入不再只是“解析后顺序推进”。`src/game/sceneRouter.ts` 会根据玩家意图决定是否继续、跳到危机点，或直接进入刺王/危机结局判定。
2. 每次行动后的参数变化会显示在右侧状态栏，例如 `+10`、`-5`，让玩家看到自然语言如何影响局势。

注意：`docs/change-log-2026-05-intent-routing.md` 中把这次改动称为“Phase 7 最小下一步”。那是某次 AI 体检报告中的局部编号。README 从现在起使用下面的“主线阶段表”作为对外和 review 的参考，旧 docs 保持为历史记录。

---

## 本地运行

建议环境：

- Node.js 20+
- npm 10+

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

Vite 默认会输出本地访问地址，通常是：

```text
http://localhost:5173/
```

构建：

```bash
npm run build
```

运行自动化测试：

```bash
npm test
```

检查服务端 AI 代理配置：

```bash
npm run server:check
```

启动本地 AI 代理：

```bash
npm run server:dev
```

---

## AI 模式

复制环境变量示例：

```bash
cp .env.example .env
cp .env.server.example .env.server
```

前端 AI 模式由 `.env` 中的 `VITE_AI_PLAY_MODE` 控制：

| 模式 | 说明 |
|---|---|
| `presetOnly` | 只使用预设选项，隐藏自由输入 |
| `mock` | 默认开发模式，本地关键词/规则模拟 AI |
| `realAI` | 通过后端代理调用真实模型，失败时可 fallback 到 mock |

真实 API Key 不应放入任何 `VITE_` 变量。Vite 会把 `VITE_` 变量打进浏览器端 bundle。真实密钥请放在 `.env.server`，由 `server/aiProxyServer.ts` 读取。

---

## 手动测试

默认 `mock` 模式下，不需要真实模型即可测试核心流程。

1. 打开本地页面并开始游戏。
2. 走一条预设路线，例如“陈汉威 → 宣示汉威 → 支持亲汉派 → 以兵威慑”。预期：流程正常进入结局，右侧参数出现短暂 `+N` / `-N` 反馈。
3. 重开后测试自由输入：“我愿与楼兰互市通商”。预期：Mock AI 识别为谈判/通商，场景正常推进，并显示参数变化。
4. 重开后测试高风险输入：“我要刺杀楼兰王”或“我握短刃刺王”。预期：不再普通推进，而是直接进入刺王结局判定。
5. 测试不明确输入：“啊啊啊”。预期：通译提示不理解，参数通常不变；系统仍保留兜底推进。

---

## 核心玩法循环

```text
当前朝堂局势
    ↓
玩家选择预设行动或输入自由发言
    ↓
AI Provider 解析玩家意图、语气、目标和风险
    ↓
analysisToEffects 将结构化分析映射为参数增量
    ↓
规则系统结算参数、连锁反应和阈值事件
    ↓
角色反应生成
    ↓
sceneRouter 决定下一场景或结局判定
    ↓
UI 展示朝堂文本、角色反应、参数变化和历史记录
```

---

## 核心参数

| 参数 | 中文名 | 含义 |
|---|---|---|
| `hanPrestige` | 汉威 | 汉朝在楼兰朝堂中的权威与威慑 |
| `xiongnuPressure` | 胡压 | 匈奴对楼兰的外部压力 |
| `kingAnger` | 王怒 | 楼兰王对汉使的愤怒 |
| `kingFear` | 王惧 | 楼兰王对汉朝报复的恐惧 |
| `proHan` | 亲汉派 | 楼兰朝中亲汉势力影响力 |
| `proXiongnu` | 亲胡派 | 楼兰朝中亲匈奴势力影响力 |
| `tradeAccess` | 商道通行 | 丝路商道开放与安全程度 |
| `casusBelli` | 兵衅 | 汉朝出兵问罪的政治理由 |
| `envoyHonor` | 使节名节 | 玩家作为汉使的个人气节 |
| `historianScore` | 史官评价 | 后世对玩家行为的评价 |

---

## 项目结构

```text
han-envoy/
├── README.md
├── package.json
├── server/
│   ├── aiProxyServer.ts
│   ├── aiClient.ts
│   ├── checkServerConfig.ts
│   └── schemas.ts
├── src/
│   ├── ai/
│   │   ├── aiMode.ts
│   │   ├── aiProviderFactory.ts
│   │   ├── analysisToEffects.ts
│   │   ├── mockAiProvider.ts
│   │   └── remoteAiProvider.ts
│   ├── components/
│   ├── game/
│   │   ├── scenes.ts
│   │   ├── endings.ts
│   │   ├── simpleRules.ts
│   │   ├── thresholdEvents.ts
│   │   ├── chainReactions.ts
│   │   └── sceneRouter.ts
│   ├── store/
│   │   └── gameStore.ts
│   └── utils/
└── docs/
```

---

## 文档说明

`docs/` 目录保留了不同 AI 工具和不同开发阶段留下的设计、验收、审查和变更记录。它们非常有价值，但不是每一份都代表“当前唯一计划”。

阅读优先级建议：

| 文档 | 当前用途 |
|---|---|
| `README.md` | 当前对外说明、运行方式、主线规划，以此为 review 入口 |
| `docs/change-log-2026-05-intent-routing.md` | 最近一次 intent routing / stat delta 改动记录 |
| `docs/audit-report-2026-05.md` | 2026-05 的大型项目体检与后续建议 |
| `docs/ai-agent-design.md` | AI 边界、Provider、Mock/Real AI 架构背景 |
| `docs/ai-proxy-design.md` | 后端代理与 API Key 安全方案 |
| `docs/game-design.md` | 玩法、参数、角色和结局的早期设计 |
| `docs/act-0-design.md` | 入朝前准备阶段的设计草案，尚未接入主流程 |
| `docs/acceptance-checklist.md` | 各历史阶段验收记录 |
| `docs/codebuddy-prompts.md` | AI 协作 prompt 记录 |
| `docs/phase-0-plan.md` | 项目启动阶段记录，已过时但保留 |

如果文档之间出现 Phase 编号冲突，以 README 的“主线阶段表”为准；历史文档不建议重写，除非追加明确的补充说明。

---

## 主线阶段表

下面是从当前状态重新整理后的阶段规划。早期 docs 中的 Phase 名称可能与此表不完全一致。

| 阶段 | 状态 | 内容 |
|---|---|---|
| Phase 0 | 已完成 | 项目定版、工程骨架、MVP 边界、设计文档 |
| Phase 1 | 已完成 | 静态可玩原型、开始界面、朝堂 UI、预设选项 |
| Phase 2 | 已完成 | 参数系统、规则结算、回合历史、结局判定 |
| Phase 2.5 | 已完成设计 | Act 0 入朝前准备阶段设计与类型预留，尚未接入 |
| Phase 3 | 已完成 | Mock AI Provider、自由输入、角色反应 |
| Phase 3.1 | 已完成 | Mock Parser 修正、AI 模式开关 |
| Phase 4 | 已完成设计 | 真实 AI 接入架构、安全边界、代理方案 |
| Phase 4.5 | 已完成 | 本地 Express AI 代理、schema sanitize、realAI fallback |
| Phase 5 | 已完成 | 自由输入意图路由、参数变化浮字、交互后果可见化 |
| Phase 6 | 当前 | Vitest 测试底座、sceneRouter 表驱动测试、Mock AI 回归样例、规则映射测试 |
| Phase 7 | 建议下一步 | 显式场景图，将 `Object.keys(SCENES)` 兜底替换为 transitions |
| Phase 8 | 规划中 | NPC 运行时状态、短期记忆、态度和派系关系 |
| Phase 9 | 规划中 | Act 0 入朝前准备阶段接入主流程 |
| Phase 10 | 规划中 | Demo 包装、部署、录屏、作品集说明 |
| Phase 11+ | 开放 | 多国家、多章节、存档、叙事调试工具、可观测性 |

Phase 编号是协作索引，不是硬性边界。后续 review 应优先关注当前代码事实和本表，而不是早期 README 中“只到 Phase 5”的旧计划。

---

## 近期建议

优先级较高的下一步：

1. 将场景推进从 `Object.keys(SCENES)` 升级为显式 `transitions`，降低剧情扩展风险。
2. 为结局判定、阈值事件和连锁反应继续补测试，扩大 Phase 6 的回归覆盖面。
3. 做一个最小 Debug Panel，展示最近一次 AI analysis、effects、route reason 和 delta。
4. 再考虑 NPC 记忆与 Act 0，不要在场景图尚未稳定时大改角色系统。

---

## 安全说明

提交前建议检查：

```bash
git status
git diff --cached
```

不要提交：

- `.env`
- `.env.server`
- 真实 API Key
- 本地日志中的敏感凭据
- `node_modules/`
- `dist/`，除非明确需要发布静态产物

如果真实 Key 已经泄露，应立即去服务商控制台禁用旧 Key，并检查账单和调用日志。

---

## 许可证

当前许可证暂定：

```text
TBD
```

正式开源前应补充独立 `LICENSE` 文件。
