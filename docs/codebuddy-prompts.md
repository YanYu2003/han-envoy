# CodeBuddy 开发对话记录

> 本文档记录每个阶段 CodeBuddy 的 Prompt 文件和使用记录。
> 便于后续回溯和集中管理 AI 辅助开发的过程。

---

## Phase 0（本阶段）

### Prompt 标题：创建 Phase 0 工程骨架与文档

**输入给 CodeBuddy 的 Prompt：**

> 你现在是本项目的工程搭建助手。请你为一个网页游戏项目创建 Phase 0 工程骨架与文档，不要急着实现完整游戏功能。
>
> 项目名称：《汉使》英文名：Han Envoy，GitHub 仓库名：han-envoy
>
> 项目背景：这是一个参加"AI CAN DO IT｜腾讯云黑客松 游戏开发挑战赛"的网页游戏原型。报名方向倾向于赛题三：叙事类游戏。作品需要是可独立运行的网页游戏原型，并深度融合 AI 能力。
>
> 游戏定位：《汉使》是一款 AI 驱动的汉代外交叙事模拟游戏。玩家扮演持节出使西域的汉使，第一章以楼兰/鄯善历史原型为基础。玩家进入外国朝堂，与 AI 驱动的国王、大臣、译者、亲汉派、亲匈奴派等角色进行外交博弈。
>
> 请创建 React + TypeScript + Vite 项目结构、7 份文档、以及一个最简单的启动页面。
>
> 具体要求详见完整任务描述。

**输出：**
- 完整的项目目录结构
- 7 份设计/规划文档
- 一个可运行的 Phase 0 页面
- 本记录文件

---

## Phase 1（已完成）

### 目标：静态可玩原型

**Prompt 标题：实现 Phase 1 静态可玩原型**

**输出：**
- Zustand 状态管理 (`src/store/gameStore.ts`)
- 完整类型定义 (`src/game/types.ts`)
- 角色数据系统 (`src/game/characters.ts`，5 个角色)
- 场景数据系统 (`src/game/scenes.ts`，4 个场景)
- 结局数据系统 (`src/game/endings.ts`，5 个结局)
- 简单规则引擎 (`src/game/simpleRules.ts`)
- 游戏 UI 组件（StartScreen, CourtScreen, EndingScreen, CharacterPanel, StatPanel, ChoicePanel, HistoryLog）
- 可玩的完整流程：开始 → 朝堂 4 场景 → 结局

---

## Phase 2（已完成）

### 目标：规则系统与分支深度

**Prompt 标题：实现 Phase 2 规则系统与分支深度**

**输出：**
- **新增文件：**
  - `src/game/thresholdEvents.ts` — 6 个阈值事件系统
  - `src/game/chainReactions.ts` — 6 组参数连锁反应
- **修改文件：**
  - `src/game/types.ts` — 新增 ThresholdEvent, EventLogEntry, NarrativeVariant, Choice.condition/disabledReason/riskLevel
  - `src/game/scenes.ts` — 条件选项（canDemandHostage/canAssassinate 等）、动态叙事变体（每场景 5 条）、风险等级（1–5）
  - `src/game/endings.ts` — 动态结局补充段落、getEndingTriggerReason、buildEndingDescription
  - `src/store/gameStore.ts` — 整合连锁反应、阈值事件检查、条件选项校验
  - `src/components/ChoicePanel.tsx` — 禁用状态显示、高风险标记、风险等级指示
  - `src/components/CourtScreen.tsx` — 动态叙事（getSceneNarrative）
  - `src/components/EndingScreen.tsx` — 触发原因展示、动态结局文本、关键事件汇总
  - `src/components/HistoryLog.tsx` — 合并事件日志（黄色边框标识）

---

## Phase 2.5（已完成）

### 目标：Act 0 入朝前准备与前任汉使死因调查系统设计

**Prompt 标题：Act 0 入朝前准备阶段设计（Phase 2.5）**

**输出：**
- **新增文件：**
  - `docs/act-0-design.md` — Act 0 完整设计文档（核心循环、行动类型、资源系统、与前序系统关系）
  - `src/game/preCourtTypes.ts` — 预留类型（PreparationAction, IntelItem, EvidenceItem, ContactState, PreCourtState 等）
  - `src/game/preCourtDesign.ts` — 示例数据（8 个准备行动、8 条情报、5 个证据、4 个调查结果）
- **修改文件：**
  - `docs/game-design.md` — 新增第 7 章 "Act 0：入朝前准备阶段设想"
  - `docs/codebuddy-prompts.md` — 记录本阶段
  - `docs/acceptance-checklist.md` — 追加 Phase 2.5 验收清单
- **不变：** 当前游戏主流程（start → court → ending）未受任何影响

---

## Phase 3（已完成）

### 目标：Mock AI + 自由输入 + 角色反应

**Prompt 标题：实现 Phase 3 Mock AI + 自由输入 + 角色反应**

**输出：**
- **新增文件：**
  - `src/ai/types.ts` — AIProvider 接口（PlayerActionAnalysis, CharacterReaction, AIContext）
  - `src/ai/mockAiProvider.ts` — MockAIProvider（关键词匹配 13 种 intent + 20+ 角色反应模板）
  - `src/ai/analysisToEffects.ts` — AI 分析 → 规则效果映射（含 tone/riskLevel 修正）
  - `src/components/FreeInputBox.tsx` — 自由输入文本框 UI
  - `src/components/ReactionPanel.tsx` — AI 解析结果 + 角色反应展示面板
- **修改文件：**
  - `src/game/types.ts` — 新增 AIInteractionLogEntry, GameState.aiLog
  - `src/store/gameStore.ts` — 重构：抽取 resolveTurn 公共结算管线；新增 makeFreeInput 异步 action
  - `src/components/CourtScreen.tsx` — 集成 FreeInputBox + ReactionPanel
  - `docs/ai-agent-design.md` — 新增 Phase 3 Mock AI 章节
  - `docs/codebuddy-prompts.md` — 记录本阶段
  - `docs/acceptance-checklist.md` — 追加 Phase 3 验收清单
- **不变：** Phase 2 规则系统、条件选项、动态叙事、结局系统全部保留

---

## Phase 4（预留）

### 目标：完整第一章

**待开发的 Prompt 占位**

> **即将编写——期待内容：**
> - 完整第一章朝堂流程
> - 多结局支持
> - UI 润色与动画
> - 音效与背景音乐
> - 史官评价终版
> - 响应式布局适配
> - 性能优化
> - 演示 Demo 流程打磨

---

## 使用提示

- 每个新 Phase 请在此文件末尾追加新的 Prompt 记录
- 保留历史 Prompt，不要删除/覆盖旧内容
- 对比各阶段输出效果，优化后续 Prompt 质量
