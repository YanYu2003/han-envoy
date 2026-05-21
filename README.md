# 汉使 Han Envoy

> **持节入胡庭，一言动西域。**  
> 一款 AI 驱动的汉代外交叙事模拟网页游戏。玩家扮演持节出使西域的汉使，在楼兰原型国的朝堂上与国王、大臣、译者、亲汉派、亲匈奴派展开外交博弈。你的言辞、威慑、妥协、离间、刺王或殉国，都会改变楼兰与大汉的命运。

---

## 项目简介

《汉使》（英文名：**Han Envoy**）是一个为 **“AI CAN DO IT｜腾讯云黑客松 游戏开发挑战赛”** 开发的网页游戏原型，报名方向倾向于 **赛题三：叙事类游戏**。

本项目的目标不是做一份“历史科普作业”，而是做一个真正可玩的 AI 叙事游戏原型：

- 玩家不是旁观历史，而是以“汉使”身份进入异国朝堂；
- AI 不是简单聊天 NPC，而是参与核心玩法循环；
- 结果不完全交给大模型，而是由硬规则系统约束；
- 汉代外交文化不是美术贴皮，而是体现在持节、汉威、礼法、质子、册封、使节名节、战争借口和史官评价等机制中。

一句话概括：

> **AI 负责让朝堂活起来，规则负责让外交有代价。**

---

## 当前状态

| 项目 | 状态 |
|---|---|
| 当前阶段 | Phase 0：项目定版与工程骨架 |
| 游戏内容 | 第一章：楼兰原型国朝堂外交 |
| 可玩性 | 当前仅为工程骨架与静态页面，完整玩法尚未实现 |
| AI 接入 | 暂未接入真实 AI API |
| 规则系统 | 已在文档中设计，尚未代码实现 |
| 目标平台 | 可独立运行的网页游戏原型 |
| 仓库名 | `han-envoy` |

Phase 0 的重点是：明确项目方向、MVP 边界、AI 与硬规则的职责划分、工程目录结构和后续开发路线。

---

## 参赛定位

本项目面向 **叙事类游戏** 方向，核心展示点包括：

1. **AI 驱动的动态叙事**
   - AI 解析玩家自由输入；
   - AI 生成国王、大臣、译者和派系的动态反应；
   - AI 根据最终局势生成具有史书风格的结局文案。

2. **硬规则约束的外交模拟**
   - 游戏不让大模型直接决定胜负；
   - 参数变化、事件触发和结局判定由规则系统负责；
   - AI 的输出必须被游戏状态和角色设定约束。

3. **文化机制化**
   - “汉威”“持节”“使节名节”“质子”“册封”“战争借口”“史官评价”等元素不是背景装饰，而是参与玩法结算的系统参数。

---

## 核心体验

玩家进入楼兰朝堂后，可以通过预设选项或自由输入进行外交行动，例如：

- 以汉威震慑楼兰王；
- 许以贸易和册封利益；
- 指责楼兰反复无信；
- 离间亲匈奴大臣；
- 要求送质子入汉；
- 忍让周旋以保全任务；
- 羞辱敌方派系制造冲突；
- 冒险刺王并改立亲汉新王；
- 以死明志，为汉朝取得出兵借口。

本项目的一个核心设计点是：

> **死亡不一定是失败。**

如果玩家死得有价值，可能触发汉朝出兵、灭国、改立新王、封赏子孙或史官赞誉。  
但如果玩家只是无脑狂妄，也可能变成“无功无名地死在异邦”。

---

## MVP 范围

第一版 MVP 只做一个国家：**楼兰原型国**。

### MVP 包含

- 一个完整的楼兰朝堂外交场景；
- 汉使、楼兰王、亲汉派、亲匈奴派、译者等核心角色；
- 预设选项与自由输入两种玩家行动方式；
- AI 辅助解析玩家输入；
- 硬规则参数系统；
- 多个可触发结局；
- 史官评价与结局文案；
- 可部署、可演示的网页游戏原型。

### MVP 暂不包含

- 多国家系统；
- 大地图探索；
- 战斗系统；
- 复杂养成系统；
- 多人联机；
- 账号系统；
- 数据库存档；
- 完整开放世界；
- 大量美术与动画资源。

MVP 的原则是：

> **先把一个朝堂做深，不要把十个国家做空。**

---

## 核心玩法循环

```text
当前朝堂局势
    ↓
玩家选择预设行动或输入自由发言
    ↓
AI 解析玩家意图、语气、目标和风险
    ↓
硬规则系统更新外交参数
    ↓
AI 生成各角色反应和朝堂辩论
    ↓
系统判断是否触发事件或结局
    ↓
进入下一轮外交回合
```

AI 负责“理解与表达”，规则系统负责“裁判与结算”。

---

## 核心参数系统

游戏计划使用一组 0–100 范围内的外交参数表示当前局势。

| 参数名 | 中文名 | 含义 |
|---|---|---|
| `hanPrestige` | 汉威 | 汉朝在楼兰朝堂中的威慑力与权威感 |
| `xiongnuPressure` | 胡压 | 匈奴对楼兰的外部压力 |
| `kingAnger` | 王怒 | 楼兰王对汉使的愤怒程度 |
| `kingFear` | 王惧 | 楼兰王对汉朝报复的恐惧程度 |
| `proHan` | 亲汉派 | 楼兰朝中亲汉势力的影响力 |
| `proXiongnu` | 亲胡派 | 楼兰朝中亲匈奴势力的影响力 |
| `tradeAccess` | 商道通行 | 丝路商道的开放与安全程度 |
| `casusBelli` | 战争借口 | 汉朝出兵问罪的政治与道义理由 |
| `envoyHonor` | 使节名节 | 玩家作为汉使的个人气节与名誉 |
| `historianScore` | 史官评价 | 后世史官对玩家行为的总体评价 |

这些参数将共同影响：

- 朝堂角色态度；
- 外交事件触发；
- 刺王或政变成功率；
- 玩家是否能活着归汉；
- 玩家死亡后是否仍能取得战略胜利；
- 最终结局与史官评价。

---

## AI 设计边界

本项目会使用 AI Agent，但不会让 AI 失控地决定游戏结果。

### AI 负责

- 解析玩家自由输入；
- 判断玩家意图、语气、目标和风险等级；
- 生成角色动态反应；
- 生成朝堂辩论文本；
- 生成结局文案和史官评价；
- 在固定世界观和角色设定内丰富叙事表现。

### AI 不负责

- 不直接修改游戏参数；
- 不直接决定胜负；
- 不绕过硬规则触发结局；
- 不擅自新增国家、角色或系统；
- 不替代规则引擎；
- 不保存或暴露 API Key。

推荐架构：

```text
玩家输入
    ↓
AI 解析层
    ↓
结构化 JSON
    ↓
硬规则引擎
    ↓
游戏状态更新
    ↓
AI 叙事生成层
    ↓
角色反应 / 朝堂辩论 / 结局文案
```

详细设计见：

- [`docs/ai-agent-design.md`](./docs/ai-agent-design.md)
- [`docs/game-design.md`](./docs/game-design.md)

---

## 技术栈

| 技术 | 用途 |
|---|---|
| React | 前端 UI |
| TypeScript | 类型安全 |
| Vite | 开发与构建工具 |
| Tailwind CSS | 样式系统 |
| Zustand | 后续状态管理 |
| AI Provider Abstraction | 后续 AI 接入抽象层 |

当前 Phase 0 只提供工程骨架和文档。完整游戏逻辑、状态管理、规则系统和 AI Provider 将在后续阶段逐步实现。

---

## 项目结构

```text
han-envoy/
├── README.md
├── package.json
├── vite.config.ts
├── tsconfig.json
├── index.html
├── .gitignore
├── .env.example
├── docs/
│   ├── phase-0-plan.md
│   ├── game-design.md
│   ├── ai-agent-design.md
│   ├── historical-notes.md
│   ├── codebuddy-prompts.md
│   └── acceptance-checklist.md
├── public/
│   └── assets/
│       ├── images/
│       ├── audio/
│       └── icons/
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── index.css
    ├── ai/
    ├── components/
    ├── game/
    ├── store/
    ├── styles/
    └── utils/
```

---

## 本地运行

### 环境要求

建议使用：

- Node.js 20+
- npm 10+

### 克隆仓库

```bash
git clone https://github.com/YanYu2003/han-envoy.git
cd han-envoy
```

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 构建生产版本

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

---

## 环境变量

复制示例环境变量文件：

```bash
cp .env.example .env
```

示例内容：

```env
VITE_AI_PROVIDER=
VITE_AI_API_BASE_URL=
VITE_AI_API_KEY=
VITE_GAME_VERSION=0.1.0
```

---

## API Key 安全说明

本项目是前端网页游戏，因此必须特别注意 API Key 安全。

### 重要提醒

在 Vite 项目中，所有以 `VITE_` 开头的环境变量，都可能被打包进浏览器端代码。

这意味着：

> **不要把真正需要保密的生产 API Key 直接放在前端 `.env` 文件中。**

即使变量名叫 `VITE_AI_API_KEY`，它也不能被视为安全的后端密钥。

### 当前阶段原则

Phase 0 / Phase 1 阶段建议：

- 优先使用 Mock AI；
- 不接入真实大模型 API；
- 不在仓库中提交任何真实 Key；
- 不在截图、Demo、日志或文档中展示真实 Key。

### 后续真实 AI 接入建议

如果后续接入腾讯混元、OpenAI、DeepSeek 或其他大模型 API，推荐采用：

```text
前端页面
    ↓
后端代理 / Serverless Function / Cloud Function
    ↓
真实 AI Provider
```

真实 API Key 应保存在服务端环境变量中，而不是前端代码中。

### 提交前安全检查

提交前建议执行：

```bash
git status
git diff --cached
```

可选地搜索敏感字段：

```bash
grep -R "sk-" . --exclude-dir=node_modules --exclude-dir=dist
grep -R "api_key\|apikey\|secret\|token" . --exclude-dir=node_modules --exclude-dir=dist
```

提交前确认：

- [ ] 没有提交 `.env`
- [ ] 没有提交真实 API Key
- [ ] 没有在 README 或 docs 中写入真实凭据
- [ ] 没有在截图、日志或 Demo 文件中暴露 Key
- [ ] `.codebuddy/` 等本地 AI 工具缓存没有被提交
- [ ] 真实 AI 调用不直接暴露生产密钥到浏览器端

### 如果 Key 已经泄露

如果不小心提交了真实 API Key：

1. 立即前往服务商控制台禁用或删除该 Key；
2. 创建新的 Key；
3. 从代码和文档中移除泄露内容；
4. 检查服务商账单与调用日志；
5. 即使删除仓库或改为私有，也要默认旧 Key 已经失效且不可信。

---

## 开发路线

### Phase 0：项目定版与工程骨架

- 创建基础工程；
- 明确 MVP 范围；
- 编写设计文档；
- 确定 AI 与规则系统边界；
- 准备后续开发目录。

### Phase 1：静态可玩原型

- 开始界面；
- 朝堂主界面；
- 角色面板；
- 参数面板；
- 预设选项；
- 基础场景推进；
- 不接入真实 AI。

### Phase 2：规则系统与结局系统

- 实现核心参数；
- 实现行动结算；
- 实现回合日志；
- 实现结局判定；
- 实现史官评价。

### Phase 3：Mock AI Agent

- 实现自由输入框；
- 用 Mock AI 解析玩家输入；
- 生成模拟角色反应；
- 跑通“输入 → 解析 → 规则 → 反应”的完整链路。

### Phase 4：真实 AI 接入

- 设计 AI Client；
- 接入真实 Provider；
- 处理 JSON 解析失败；
- 增加 fallback；
- 设计服务端代理方案，避免前端暴露生产 Key。

### Phase 5：演示包装与比赛提交

- 优化 UI；
- 完善结局文案；
- 部署网页；
- 准备 Demo 视频；
- 准备作品介绍 PPT；
- 整理 CodeBuddy 历史对话记录。

---

## 文档索引

| 文档 | 说明 |
|---|---|
| [`docs/phase-0-plan.md`](./docs/phase-0-plan.md) | Phase 0 项目定版与阶段计划 |
| [`docs/game-design.md`](./docs/game-design.md) | 游戏玩法、参数、行动、角色与结局设计 |
| [`docs/ai-agent-design.md`](./docs/ai-agent-design.md) | AI Agent 职责边界、解析结构与 fallback 方案 |
| [`docs/historical-notes.md`](./docs/historical-notes.md) | 楼兰/鄯善与西汉西域经营的史料灵感笔记 |
| [`docs/codebuddy-prompts.md`](./docs/codebuddy-prompts.md) | CodeBuddy Prompt 记录与后续阶段占位 |
| [`docs/acceptance-checklist.md`](./docs/acceptance-checklist.md) | 阶段验收清单 |

---

## 许可证

当前项目仍处于黑客松原型阶段，许可证暂定为：

```text
TBD
```

如果后续决定正式开源，应添加独立的 `LICENSE` 文件，并在此处更新许可证说明。
