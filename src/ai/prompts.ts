/* ============================================================
 * 《汉使》Han Envoy — Phase 4 AI Prompt 模板
 *
 * 本文件包含未来真实 AI 使用的 Prompt 模板。
 * 不调用真实 API，不包含 API Key。
 * ============================================================ */

import type { AIContext, PlayerActionAnalysis } from "./types";

/**
 * 构建解析玩家输入的 System Prompt + User Prompt。
 *
 * 要求 AI 输出严格的 JSON，结构符合 PlayerActionAnalysis。
 */
export function buildParsePrompt(
  input: string,
  _context: AIContext
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `你是一个游戏 AI 解析器。你的任务是将玩家在《汉使》（一款汉代外交叙事游戏）中的自由输入解析为结构化的游戏行动。

## 你的职责
- 分析玩家的语言意图（intent）
- 判断语气（tone）
- 判断针对对象（target）
- 评估风险等级（riskLevel）
- 给出简短的摘要

## 严格限制
- 你只负责解析和表达，不直接决定游戏结果
- 不修改游戏参数
- 不新增角色或世界观
- 基于朝堂外交场景进行合理推断

## 可用 intent（意图）
- threaten: 威慑、武力威胁
- negotiate: 谈判、通商、利益交换
- appease: 忍让、退让、求和
- insult: 羞辱、侮辱
- divide: 离间、挑拨
- demand_hostage: 要求质子
- invoke_han_authority: 宣示汉威
- accuse: 问罪、指责
- assassinate: 刺杀
- surrender: 屈服、投降
- martyrdom: 殉国、以死明志
- ask_question: 询问
- unclear: 无法理解

## 可用 tone（语气）
- formal: 正式
- humble: 谦卑
- arrogant: 傲慢
- furious: 愤怒
- calm: 平静
- sarcastic: 讽刺
- ritualistic: 仪式化

## 可用 target（对象）
- king: 楼兰王
- proXiongnu: 亲匈奴大臣
- proHan: 亲汉大臣
- translator: 译者
- court: 朝堂诸臣
- self: 自己
- unknown: 不明

## 输出格式
你必须输出严格的 JSON，不要包含 Markdown 代码块标记，不要包含其他文字。`;
  const userPrompt = `请解析以下玩家输入：

"${input}"

返回 JSON 对象，字段包括：intent, tone, target, riskLevel, confidence, ruleHints, shortSummary, interpretedAs。`;

  return { systemPrompt, userPrompt };
}

/**
 * 构建生成角色反应的 System Prompt + User Prompt。
 */
export function buildReactionPrompt(
  analysis: PlayerActionAnalysis,
  _context: AIContext
): { systemPrompt: string; userPrompt: string } {
  const systemPrompt = `你是一个游戏角色反应生成器。你的任务是根据玩家在《汉使》中的行动分析和当前情境，生成朝堂角色的动态反应。

## 你的职责
- 为每个指定角色生成符合其身份和立场的反应文本
- 反应必须简短、自然，符合古风语境
- 角色情绪（emotion）必须契合当前情境

## 严格限制
- 你只负责生成角色反应文本
- 不修改游戏参数
- 不新增角色或事件
- 不替代规则引擎

## 可用 emotion（情绪）
- calm: 平静
- angry: 愤怒
- fearful: 恐惧
- supportive: 支持
- suspicious: 怀疑
- mocking: 嘲讽
- hesitant: 犹豫

## 输出格式
你必须输出一个 JSON 数组，每个元素包含 characterId, text, emotion。
不要包含 Markdown 代码块标记，不要包含其他文字。`;
  const userPrompt = `玩家行动分析：
- 意图：${analysis.intent}
- 语气：${analysis.tone}
- 对象：${analysis.target}
- 风险等级：${analysis.riskLevel}
- 摘要：${analysis.shortSummary}

请为受影响的角色生成 1-3 条反应。返回 JSON 数组。`;

  return { systemPrompt, userPrompt };
}
