# 变更日志 · 2026-05 · Intent → Scene Routing & Stat Delta Floating Text

> 对应阶段：Phase 7 最小下一步（见 `docs/audit-report-2026-05.md` §13）
> 提交者：Coding Agent
> 范围限制：≤ 150 行；不引入新依赖；不大重构；不删除核心逻辑。

---

## 1. 本次改动目标

让 Demo **立刻**能体现：

1. **玩家的自由输入会改变下一个场景的走向**，而不是无论输入什么都按 `Object.keys(SCENES)` 顺序顺序推进。
2. **玩家每次行动后参数的增减会以浮字形式呈现在 UI 上**（例如 `汉威 +10`、`王怒 -5`），让"自然语言 → 状态变化"被肉眼可见地感知。

> 目的不是构建完整的剧情图谱、也不是重写 AI 系统，而是用最小代价让"输入 → 意图 → 参数 → 场景 → 反馈"的核心闭环跑通。

---

## 2. 改动范围

### 2.1 新增文件（1 个）

| 文件 | 行数 | 说明 |
| --- | --- | --- |
| `src/game/sceneRouter.ts` | 92 行（含注释） | 纯函数 `nextSceneByIntent(currentSceneId, intent, stats)`，根据意图和参数返回下一个场景或结局判定信号。 |

### 2.2 修改文件（4 个，净增 38 行）

| 文件 | 净变动 | 说明 |
| --- | --- | --- |
| `src/game/types.ts` | +2 | 给 `GameState` 加 `lastDelta?: Partial<GameStats>` 字段。 |
| `src/store/gameStore.ts` | +15 -13 | 引入 `nextSceneByIntent`；`TurnOutput` 加 `delta`；`resolveTurn` 返回 `delta`；`applyTurnOutcome` 把 `delta` 写入 `lastDelta`；`createInitialState` 初始化 `lastDelta`；`makeFreeInput` 用 `sceneRouter` 替换原硬编码 `Object.keys(SCENES)` 推进逻辑。 |
| `src/components/StatPanel.tsx` | +34 -1 | 增加 `lastDelta` prop；用 `useEffect + useState` 实现"浮字 1.8 秒后自动消失"；右侧多一列 +N / -N 标签，正值绿色、负值红色。 |
| `src/components/CourtScreen.tsx` | +2 -1 | 从 store 读取 `lastDelta` 并透传给 `<StatPanel />`。 |

> 已避免：未修改 `simpleRules.ts` / `chainReactions.ts` / `thresholdEvents.ts` / `endings.ts` / `analysisToEffects.ts` / `mockAiProvider.ts` / `aiProxyServer.ts` 等核心规则与 AI 模块。

### 2.3 验证

- `npm run build` 通过：`tsc --noEmit` + `vite build` 0 error，dist 产物 ~205 KB。
- `ReadLints` 全部 5 个改动文件 0 警告。

---

## 3. 玩家输入如何影响 intent

链路保持不变，仍走原有 AI Provider 抽象：

```
FreeInputBox.tsx
  └─▶ gameStore.makeFreeInput(input)
        └─▶ provider = getAIProvider(getAIPlayMode())
              ├─ presetOnly  → 直接返回，不响应（保持原行为）
              ├─ mock        → mockAIProvider.parsePlayerInput(input, ctx)  关键词打分 + 否定/威胁检测
              └─ realAI      → remoteAiProvider → server/aiProxyServer → LLM
        ▼
        analysis: { intent, tone, riskLevel, ... }   ← 这是 sceneRouter 的输入之一
```

> 本次没有改任何 intent 识别逻辑，复用现有的 `PlayerIntent`（assassinate / threaten / accuse / insult / demand_hostage / surrender / negotiate / appease / martyrdom / ask_question / unclear / ...）。

---

## 4. intent 如何影响参数

链路保持不变（**未改动 `analysisToEffects.ts`**）：

```
analysis (PlayerIntent + PlayerTone + riskLevel)
  └─▶ analysisToEffects(analysis): Partial<GameStats>
        例如  threaten + harsh + high  → { kingFear:+10, kingAnger:+10, proHan:-5, casusBelli:+8 }
              negotiate + neutral + low → { kingAnger:-2, proHan:+3, tradeAccess:+2 }
        ▼
        applyEffects(stats, effects)  → 钳制 0~100
        ▼
        resolveChainReactions  → 二阶联动（如 casusBelli≥60 自动 kingFear+1）
        ▼
        checkThresholdEvents + applyThresholdEvents  → 触发一次性事件
        ▼
        delta = computeDelta(oldStats, newStats)   ← 写入 state.lastDelta，驱动 UI 浮字
```

---

## 5. 参数如何影响场景

**新增一层路由器 `sceneRouter.ts`**，是本次改动的核心：

```ts
nextSceneByIntent(currentSceneId, intent, stats) →
  { nextSceneId?, forceEndingResolver?: "crisis" | "assassination", reason }
```

决策表（从上到下短路匹配）：

| 优先级 | 条件 | 结果 | 说明 |
| --- | --- | --- | --- |
| 1 | `intent === "assassinate"` | 走 `resolveAssassinationEnding` | 不论在哪个场景，刺王立即结算 |
| 2 | `intent === "martyrdom"` 且 `casusBelli ≥ 50` | 走 `resolveCrisisEnding` | 殉国 + 兵衅充足 → 触发结局 |
| 3 | `currentSceneId === "crisis_point"` | 走 `resolveCrisisEnding` | 已到危机点，任何输入都结算 |
| 4 | `intent === "surrender"` | 跳到 `crisis_point` | 屈服直接被押到危机点结算代价 |
| 5 | 强硬意图（threaten / accuse / insult / demand_hostage）且 `kingAnger ≥ 50` | 跳到 `crisis_point` | 国王已怒不可遏，骤然摊牌 |
| 6 | 兜底 | 按 `Object.keys(SCENES)` 顺序推进 | 保持原行为 |
| 7 | 已是最后一个场景 | 走 `resolveCrisisEnding` | 防御性兜底 |

> **临时方案声明**：当前路由仍依赖 `Object.keys(SCENES)` 的字面顺序（`opening_audience → present_credentials → confrontation → crisis_point`）。这是因为现有 `Scene` 类型没有显式的 `next` 图结构。未来 Phase 7 完整版应把 `Scene` 升级为带 `transitions: { intent?: PlayerIntent; condition?: (s:GameStats)=>boolean; to: string }[]` 的图节点，并把 `sceneRouter` 改成查图，**但本次最小下一步不做此重构**。

---

## 6. UI 如何展示变化

### 6.1 数据通路

```
gameStore.lastDelta (Partial<GameStats>)
  └─▶ CourtScreen 用 useGameStore((s) => s.lastDelta) 订阅
        └─▶ <StatPanel stats={stats} lastDelta={lastDelta} />
              └─▶ useEffect 监听 lastDelta 引用变化
                    └─▶ setVisibleDelta(lastDelta) 1.8s 后自动清空
                    └─▶ 每一行参数右侧渲染 "+N" / "-N"
                          - 正值：emerald-400 + pulse
                          - 负值：rose-400  + pulse
                          - 零值：opacity-0（不占视觉权重）
```

### 6.2 视觉规则

- 浮字只在 `lastDelta[key] !== 0` 时出现。
- 透明度过渡 500ms；动画 `animate-pulse`（Tailwind 已有，无新依赖）。
- 持续 1.8s 自动消失，**不影响下一次 `makeFreeInput` / `makeChoice`** —— 每次 store 写 `lastDelta` 都是新对象引用，`useEffect` 一定能重新触发。

### 6.3 退路

- 若某次 `delta` 为空对象 `{}`（例如 `unclear` 意图、`analysisToEffects` 返回空），`hasChange` 检查会跳过浮字显示。

---

## 7. 后续 Agent 接手注意事项

### 7.1 复用现有契约，不要重写

- **`PlayerIntent` 枚举**：在 `src/ai/types.ts`。新加意图必须同时在 `sceneRouter.ts` 决策表里覆盖，否则会走兜底顺序推进，玩家会感觉"输入没用"。
- **`GameStats` 字段**：在 `src/game/types.ts`。10 维参数是经过 audit 报告论证过的，**新增字段前先读 `docs/audit-report-2026-05.md` §7**。
- **`SCENES`**：当前只有 4 个场景。如果加新场景，注意 `Object.keys` 顺序会影响兜底分支。建议在加场景的同时把 `Scene` 升级为图节点（见 §5 临时方案声明）。

### 7.2 不要破坏 `lastDelta` 的"每次都是新对象"特性

- `gameStore.applyTurnOutcome` 里把 `delta`（来自 `computeDelta`，每次都是新对象）写入 `lastDelta`。**不要做 `if (delta) state.lastDelta = delta` 这种判断**，否则同样 delta 第二次出现时 `useEffect` 不会重新触发，浮字不会再次显示。
- 如果未来需要在同一回合里多次刷新 UI（例如分阶段动画），考虑改成 `lastDelta: { changes: Partial<GameStats>; nonce: number }`，用 `nonce` 强制触发。

### 7.3 `sceneRouter` 必须保持纯函数

- 不要在 `nextSceneByIntent` 里调用 store、不要 await、不要副作用。
- 这样将来可以在 `vitest` 里写表驱动测试（参见 audit 报告 §10 Phase 4 / Phase 7 计划）。

### 7.4 与现有兜底逻辑的兼容性

- `makeChoice`（预设选项）路径未改动，仍走 `choice.nextSceneId`。预设选项点击不会经过 `sceneRouter`，**这是有意为之**：选项已经显式声明了去向，无需再路由。
- `applyTurnOutcome` 会把 `lastDelta` 写入 state——**预设选项也会触发浮字**，这是预期行为，不是 bug。

### 7.5 当 intent 是 `unclear` 时

- `analysisToEffects` 返回空对象 → `delta` 为空 → 浮字不显示。
- `sceneRouter` 走兜底分支：按顺序推进。
- 体验上：玩家说"啊啊啊"会得到"通译迟疑片刻"的提示，并且场景仍然推进，但没有参数变化。**这是可接受的退路**。

### 7.6 与 `presetOnly` 模式的关系

- `presetOnly` 模式下根本不会调用 `parsePlayerInput`，所以 `sceneRouter` 不会被触发。预设选项点击仍走原逻辑。**本次改动对 `presetOnly` 模式零影响**。

### 7.7 推荐的下一个 Phase

- **Phase 7.1**：把 `Scene` 升级为图节点，`sceneRouter` 改为查图，让 `nextSceneByIntent` 不再依赖 `Object.keys` 字面顺序。
- **Phase 7.2**：给 `sceneRouter` 加 `vitest` 表驱动测试（每个决策分支至少 1 个用例）。
- **Phase 7.3**：把 `lastDelta` 浮字从"右侧固定列"升级为"从条形图上方飘起 + 淡出"的更精致动画，配合 `framer-motion`（但只有在体验确实需要时再引入）。

---

## 附：完整改动文件列表

```
A  src/game/sceneRouter.ts              (新增, 92 行含注释, 核心 ~55 行)
M  src/game/types.ts                    (+2 行)
M  src/store/gameStore.ts               (+15 -13 行)
M  src/components/StatPanel.tsx         (+34 -1 行)
M  src/components/CourtScreen.tsx       (+2 -1 行)
A  docs/change-log-2026-05-intent-routing.md   (本文件)
```

**总有效代码改动 ≈ 130 行（含 sceneRouter.ts 注释），实际逻辑代码 ≈ 90 行**，在 100-150 行限制内。
