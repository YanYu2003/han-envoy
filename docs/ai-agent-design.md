# 《汉使》AI Agent 设计文档

## 1. 设计哲学

**AI 是大脑，硬规则是骨架。**

- AI 负责"创造内容"和"理解意图"
- 硬规则负责"裁决"和"制衡"
- AI 的效果可以华丽，但硬规则保证下限

## 2. AI 负责什么

### 2.1 自由输入解析

玩家输入自然语言（中文优先）后，AI 将其解析为结构化的游戏行动：

```typescript
type PlayerActionAnalysis = {
  intent:
    | "threaten"
    | "negotiate"
    | "appease"
    | "insult"
    | "divide"
    | "demand_hostage"
    | "invoke_han_authority"
    | "assassinate"
    | "surrender"
    | "martyrdom"
    | "unclear";

  tone:
    | "formal"
    | "humble"
    | "arrogant"
    | "furious"
    | "calm"
    | "sarcastic"
    | "ritualistic";

  target:
    | "king"
    | "pro_xiongnu_minister"
    | "pro_han_minister"
    | "translator"
    | "court"
    | "self";

  riskLevel: 1 | 2 | 3 | 4 | 5;
  ruleHints: string[];
  shortSummary: string;
};
```

**解析流程：**

```
玩家输入 → [AI] → PlayerActionAnalysis → [硬规则引擎] → 参数变动
```

### 2.2 角色反应生成

每个 AI 驱动的角色在收到以下信息后生成对话：
- 玩家刚说的话/做的事（intent + tone + summary）
- 当前参数状态
- 角色自己的立场、个性、历史记忆
- 场景上下文

**角色反应 Prompt 模板思路：**

```
你是一个[角色身份]，性格[个性标签]，当前立场倾向于[亲汉/亲匈]。
场景：[场景描述]
事件：[发生了什么事]
面对汉使刚才的言论（[玩家行动概要]），你现在的心情是[基于参数的状态描述]。
你的反应会是什么？请用口语化的古风中文说出，控制在 2–3 句话以内。
```

### 2.3 结局文案生成

在结局触发后，根据最终参数状态，AI 生成：
- 史官评语（文言风格，50–100 字）
- 使节归宿描写
- 后续影响总结

### 2.4 场景描写润色（可选）

在固定场景描述框架上，AI 可以增加文学性的环境描写和氛围渲染。

## 3. AI 不负责什么

| ❌ 不负责 | 说明 |
|-----------|------|
| 参数增减 | 任何参数变动由其硬规则表决定，AI 不裁决 |
| 结局触发 | 结局由参数阈值规则触发，AI 只负责生成结局文案 |
| 游戏逻辑路由 | 场景切换、事件触发等由状态机控制 |
| 玩家输入安全 | 过滤不当内容由前端/后端处理，不和 AI 耦合 |
| 历史准确性 | AI 可能产生不符合史实的内容，游戏设计上应有容错 |

## 4. AI 与硬规则系统的边界

```
                    ┌──────────────────────┐
                    │      玩家输入          │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   检查是否为预设选项    │
                    └──────────┬───────────┘
                               │
               ┌───────────────┴───────────────┐
               ▼                                ▼
     ┌──────────────────┐           ┌──────────────────────┐
     │  预设选项 → 直接   │           │  自由输入 → 调用 AI    │
     │  映射参数变动       │           │  解析意图              │
     └──────────────────┘           └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │ AI 返回               │
                                    │ PlayerActionAnalysis  │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  硬规则引擎根据 intent  │
                                    │  计算参数变动           │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  根据新参数 → 调用 AI   │
                                    │  生成角色反应           │
                                    └──────────┬───────────┘
                                               │
                                    ┌──────────▼───────────┐
                                    │  显示结算结果给玩家      │
                                    └──────────────────────┘
```

## 5. 自由输入解析：详细设计

### 5.1 请求结构

```typescript
interface AIParseRequest {
  input: string; // 玩家原始输入
  context: {
    currentScene: string;
    gameState: Partial<GameState>;
    recentHistory: string[]; // 最近 3-5 条对话
  };
}
```

### 5.2 响应结构

```typescript
interface AIParseResponse {
  analysis: PlayerActionAnalysis;
  confidence: number; // 0–1，置信度
}

// 低置信度 (confidence < 0.6) 时：
// 1. 显示"未理解"提示
// 2. 默认使用 "unclear" 类型
// 3. 提示玩家换一种说法
```

### 5.3 intent → 参数变更映射表

此为硬规则，非 AI 决定：

| intent | hanPrestige | xiongnuPressure | kingAnger | kingFear | proHan | proXiongnu | tradeAccess | casusBelli | envoyHonor |
|--------|-------------|-----------------|-----------|----------|--------|------------|-------------|------------|------------|
| threaten | +5 | +3 | +10 | +10 | +2 | +5 | -5 | +5 | +3 |
| negotiate | +2 | - | -5 | - | +3 | - | +5 | -3 | +5 |
| appease | -5 | +5 | -10 | -5 | -3 | +3 | +3 | -5 | -3 |
| insult | - | +3 | +20 | +5 | - | +10 | -5 | +5 | -5 |
| divide | +5 | - | +5 | - | +10 | -10 | - | - | +3 |
| demand_hostage | +8 | +5 | +15 | +20 | - | +10 | - | +5 | - |
| invoke_han_authority | +10 | +5 | +5 | +15 | +5 | - | - | +3 | +3 |
| assassinate | -10 | +10 | +30 | +10 | -15 | +15 | -10 | +10 | -15 |
| surrender | -15 | +15 | -10 | -15 | -10 | +10 | -5 | -5 | -20 |
| martyrdom | +5 | - | +15 | +10 | +5 | - | - | +10 | +15 |
| unclear | - | - | - | - | - | - | - | - | - |

> 注：上面是基础数值，实际应用时会根据 tone、target、riskLevel 做幅度修正。

## 6. 角色反应生成思路

### 6.1 每次生成时机

参数结算完成之后，调用 AI 为"发生变化/对事件有反应"的角色生成对话。

### 6.2 角色优先选择规则

1. 玩家 target 指向的角色 → 必须回应
2. 参数变动最大的受影响者 → 优先回应
3. 立场冲突者 → 可能插话

### 6.3 角色状态对 AI Prompt 的影响

```typescript
interface AICharacterState {
  id: string;
  name: string;
  title: string;
  personality: string[];
  stance: "proHan" | "proXiongnu" | "neutral";
  angerLevel: number;     // 基于 kingAnger 等参数
  fearLevel: number;      // 基于 kingFear 等参数
  memory: string[];       // 对玩家的记忆（前几轮的要点）
}
```

## 7. 失败 Fallback 思路

### 7.1 AI 调用失败层级

| 层级 | 失败表现 | 处理方式 |
|------|---------|---------|
| 网络层 | 请求超时/无响应 | 重试 1 次 → 使用缓存/固定回复 |
| 解析层 | AI 返回了无法 parse 的内容 | 强制 fallback 为 "unclear" intent |
| 内容层 | AI 返回了不当或超出范围内容 | 截断/过滤后使用，记录日志 |
| 置信度低 | confidence < 0.6 | 询问玩家确认意图 |

### 7.2 Fallback 回复

当 AI 不可用时，角色退化为预定义的静态回复库。例如：

```typescript
const fallbackReplies: Record<string, string[]> = {
  king: [
    "楼兰小国，不敢得罪上国，也不愿得罪邻国。",
    "使者远道而来，不如先歇息几日再议。",
    "此事关系重大，容孤与群臣商议。",
  ],
  translator: [
    "大王说……容我再想想如何转达。",
    "使者的话，我已转告大王。",
  ],
  // ...
};
```

## 8. 后续接入真实大模型的预留方案

### 8.1 抽象接口

```typescript
// src/ai/types.ts — Phase 0 定义，Phase 1 实现

interface AIProvider {
  name: string;
  parsePlayerInput(params: AIParseRequest): Promise<AIParseResponse>;
  generateCharacterResponse(params: AICharacterRequest): Promise<AICharacterResponse>;
  generateEnding(params: AIEndingRequest): Promise<AIEndingResponse>;
}
```

### 8.2 实现计划

| Provider | 接入方式 | 优先度 |
|----------|---------|--------|
| OpenAI | API 直连 | 高（开发方便） |
| DeepSeek | API 直连 | 高（性价比） |
| 腾讯混元 | API 直连 | 中（黑客松平台） |
| MockProvider | 本地模拟 | 开发期默认 |

### 8.3 MockProvider

在未接入真实 API 时，使用 MockProvider 返回模拟数据，方便前端开发和测试。

```typescript
class MockAIProvider implements AIProvider {
  async parsePlayerInput(params: AIParseRequest): Promise<AIParseResponse> {
    // 根据关键词简单匹配
    // 返回固定格式的模拟数据
  }
  // ...
}
```

### 8.4 环境变量驱动

```
VITE_AI_PROVIDER=mock       # 开发期用 mock
VITE_AI_PROVIDER=openai     # 接真实 API 时切换
```

AI Provider 实例化通过工厂函数，根据环境变量选择具体实现。

---

## 9. Phase 3：Mock AI 实现（当前）

### 9.1 当前实现概述

Phase 3 实现了 **MockAIProvider**，不调用任何外部 API。

所有"AI 能力"由关键词匹配 + 模板规则模拟，存储在 `src/ai/` 目录下：

| 文件 | 职责 |
|------|------|
| `src/ai/types.ts` | AIProvider 接口定义（PlayerActionAnalysis, CharacterReaction, AIContext） |
| `src/ai/mockAiProvider.ts` | MockAIProvider 实现：关键词匹配 13 种 intent、7 种 tone、7 种 target、20+ 角色反应模板 |
| `src/ai/analysisToEffects.ts` | 将 PlayerActionAnalysis 映射为 Partial<GameStats> 参数变化 |

### 9.2 AI 负责（当前 Mock）

- 解析玩家自由输入 → 结构化 intent/tone/target/riskLevel
- 生成角色动态反应文本（基于模板 + 参数状态）

### 9.3 AI 不负责（始终不变）

- 不直接修改游戏参数（由 analysisToEffects + 规则引擎 clamp）
- 不直接决定胜负或结局
- 不绕过硬规则
- 不暴露 API Key

### 9.4 当前限制

- 关键词匹配有限，复杂表达可能被误判为 "unclear"
- 角色反应是预定义模板，不是真实生成的文本
- 没有译者误译机制
- 没有后端代理

### 9.5 后续升级路径

Phase 4 将接入真实大模型（OpenAI / 腾讯混元等），只需：

1. 实现新的 `AIProvider` 类（如 `OpenAIProvider`）
2. 在 `src/ai/types.ts` 基础上保持一致接口
3. 通过环境变量 `VITE_AI_PROVIDER` 切换 Provider
4. 真实 API Key 不放在前端（需后端代理 / Cloud Function）

---

## 10. Phase 3.1：Mock Parser 修正与 AI 模式开关

### 10.1 改进内容

Phase 3.1 修复了 Phase 3 MockAIProvider 的明显误判问题，主要改进：

| 问题 | 解决方案 |
|------|----------|
| "投降"关键词导致反向匹配 | 增加 `scoreIntent` 综合评分 + 否定检测 + 主语判断 |
| 否定结构无视 | 识别"不""不可""不愿"等否定词，删除被否定 intent 的分数 |
| 条件威胁句式忽略 | 检测"不…就…""若不…则…"等模式，加分到 threaten |
| 投降 vs 要求对方投降 | 检查主语（我/汉使 vs 楼兰/你），后者改为 threaten |
| priority 字段未有效使用 | 评分公式中包含 `priority * 0.5` |
| post-processing | 新增 `postProcessIntent` 修正函数处理边界情况 |

### 10.2 Parser 边界说明

Mock Parser 仍然**不是**可靠的自然语言理解系统：

- 复杂隐喻/双关语大概率被误判
- 超长句子评分可能分散
- 缺乏真正语义理解

建议在演示中使用预设选项为主，自由输入作为概念验证。

### 10.3 AI 模式开关

新增 `src/ai/aiMode.ts` 定义三种模式：

| 模式 | 说明 |
|------|------|
| `presetOnly` | 隐藏自由输入，只保留预设选项（安全模式） |
| `mock` | 显示自由输入 + Mock AI 实验提示（当前默认） |
| `realAI` | 未来 Phase 4 真实 AI 模式 |

默认模式为 `mock`。切换只需修改 `DEFAULT_AI_PLAY_MODE` 常量。Phase 4 已升级为可通过 `VITE_AI_PLAY_MODE` 环境变量配置。

---

## 11. Phase 4：真实 AI 接入架构与安全代理设计

### 11.1 核心变更

| 变更 | 说明 |
|------|------|
| AI 模式配置化 | 从 `DEFAULT_AI_PLAY_MODE` 硬编码改为 `getAIPlayMode()` 环境变量读取 |
| Provider Factory | `getAIProvider(mode)` 根据模式返回对应 Provider |
| RemoteAIProvider | 新实现，通过后端代理调用真实 AI，失败时 fallback 到 Mock |
| Proxy 设计文档 | `docs/ai-proxy-design.md` 规范了代理接口和安全要求 |
| Prompt 模板 | `src/ai/prompts.ts` 为真实 AI 准备了 System Prompt |

### 11.2 三种模式的边界

| 模式 | Provider | 自由输入 | 适用场景 |
|------|----------|----------|----------|
| `presetOnly` | null（不可自由输入） | 隐藏 | 演示、无 AI 稳定游玩 |
| `mock` | MockAIProvider | 显示 + 实验警告 | 开发验证、流程测试 |
| `realAI` | RemoteAIProvider（→ 后端代理） | 显示 | 生产部署 |

### 11.3 安全架构

```
前端 (VITE_AI_PROXY_URL)  →  后端代理  →  真实 AI Provider
不保存 API Key               保存 API Key    (OpenAI/DeepSeek/腾讯混元)
```

### 11.4 Fallback 策略

- `realAI` 模式但 `VITE_AI_PROXY_URL` 未配置 → fallback 到 mock（带 console.warn）
- RemoteAIProvider 请求失败 → fallback 到 mockAIProvider
- `presetOnly` 模式下 store 层也有安全防护，不会调用 Provider

### 11.5 新增文件

| 文件 | 说明 |
|------|------|
| `src/ai/aiProviderFactory.ts` | AI Provider 选择器 |
| `src/ai/remoteAiProvider.ts` | 远程 AI Provider（安全代理客户端） |
| `src/ai/prompts.ts` | 真实 AI Prompt 模板 |
| `docs/ai-proxy-design.md` | AI 代理接口设计文档 |
