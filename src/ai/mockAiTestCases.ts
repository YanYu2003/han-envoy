/* ============================================================
 * 《汉使》Han Envoy — Phase 3.1 Mock AI 测试样例
 *
 * 用于验证 MockAIProvider 的意图识别正确性。
 * 不依赖测试框架，可手动调用 runMockAiTestCases() 检查结果。
 * ============================================================ */

import type { PlayerIntent, PlayerTone, PlayerTarget } from "./types";

export interface MockAiTestCase {
  input: string;
  expectedIntent: PlayerIntent;
  expectedTone?: PlayerTone;
  expectedTarget?: PlayerTarget;
  note: string;
}

/**
 * 25 条测试样例，覆盖 13 种 intent + 各类边界情况。
 */
export const MOCK_AI_TEST_CASES: MockAiTestCase[] = [
  // ---- 威胁 / 汉威 ----
  {
    input: "不投降的都得死",
    expectedIntent: "threaten",
    expectedTone: "furious",
    note: "否定投降 + 条件威胁 → threaten，不可是 surrender",
  },
  {
    input: "楼兰若不臣服，大汉必诛之",
    expectedIntent: "threaten",
    expectedTone: "furious",
    expectedTarget: "king",
    note: "若不…则…条件威胁 → threaten",
  },
  {
    input: "再不交出凶手，汉军便至",
    expectedIntent: "threaten",
    note: "再不…便…条件威胁 → threaten",
  },
  {
    input: "大汉天子持节在此，谁敢无礼",
    expectedIntent: "invoke_han_authority",
    expectedTone: "ritualistic",
    note: "汉威语境 → invoke_han_authority",
  },

  // ---- 投降 ----
  {
    input: "我愿投降，请大王饶命",
    expectedIntent: "surrender",
    expectedTone: "humble",
    expectedTarget: "king",
    note: "我愿投降 → surrender，主语为我",
  },
  {
    input: "我愿臣服于楼兰王",
    expectedIntent: "surrender",
    note: "我愿臣服 → surrender",
  },
  {
    input: "楼兰必须投降",
    expectedIntent: "threaten",
    expectedTarget: "king",
    note: "要求对方投降 → threaten，不是 surrender",
  },
  {
    input: "不投降就死",
    expectedIntent: "threaten",
    note: "否定 + 条件威胁 → threaten",
  },

  // ---- 忍让 vs 否定忍让 ----
  {
    input: "请大王息怒，我愿退一步谈",
    expectedIntent: "appease",
    expectedTone: "humble",
    note: "我愿退 → appease",
  },
  {
    input: "我不愿退让",
    expectedIntent: "threaten",
    note: "不愿退让 → 否定忍让 → threaten，不可是 appease",
  },
  {
    input: "我不是来求和的",
    expectedIntent: "threaten",
    note: "否定求和 → threaten，不可是 appease",
  },
  {
    input: "我愿暂退一步，但楼兰必须给出承诺",
    expectedIntent: "negotiate",
    note: "退一步但要求承诺 → negotiate 或 threaten",
  },

  // ---- 谈判 / 通商 ----
  {
    input: "愿与楼兰互市通商",
    expectedIntent: "negotiate",
    note: "通商 → negotiate",
  },
  {
    input: "大王若肯通商，汉必厚赏",
    expectedIntent: "negotiate",
    expectedTarget: "king",
    note: "通商 + 厚赏 → negotiate",
  },
  {
    input: "楼兰归附大汉，商道可保",
    expectedIntent: "negotiate",
    note: "归附 + 商道 → negotiate",
  },

  // ---- 问罪 ----
  {
    input: "前任汉使之死，楼兰必须给大汉一个交代",
    expectedIntent: "accuse",
    note: "前任 + 交代 → accuse",
  },

  // ---- 刺杀 ----
  {
    input: "我要刺杀楼兰王",
    expectedIntent: "assassinate",
    expectedTarget: "king",
    note: "刺杀 → assassinate",
  },

  // ---- 离间 ----
  {
    input: "左大将私通匈奴，罪不可赦",
    expectedIntent: "divide",
    expectedTarget: "proXiongnu",
    note: "左大将 + 私通 + 匈奴 → divide",
  },
  {
    input: "亲匈奴者，不过卖国求荣",
    expectedIntent: "insult",
    note: "卖国求荣 → insult",
  },

  // ---- 质子 ----
  {
    input: "送王子入汉为质，方显诚意",
    expectedIntent: "demand_hostage",
    note: "送王子为质 → demand_hostage",
  },
  {
    input: "王若疑我，可遣质子入汉",
    expectedIntent: "demand_hostage",
    expectedTarget: "king",
    note: "遣质子 → demand_hostage",
  },

  // ---- 殉国 ----
  {
    input: "我愿以死明志",
    expectedIntent: "martyrdom",
    note: "以死明志 → martyrdom",
  },

  // ---- 提问 ----
  {
    input: "楼兰为何要杀前任汉使？",
    expectedIntent: "ask_question",
    note: "为何 + ？ → ask_question",
  },
  {
    input: "译者，你可敢照实翻译？",
    expectedIntent: "ask_question",
    expectedTarget: "translator",
    note: "你可敢 → ask_question",
  },

  // ---- unclear ----
  {
    input: "你好",
    expectedIntent: "unclear",
    note: "无意义问候 → unclear",
  },
  {
    input: "今日天气不错",
    expectedIntent: "unclear",
    note: "无关内容 → unclear",
  },

  // ---- 复杂句 ----
  {
    input: "我不会投降，也不会退让",
    expectedIntent: "threaten",
    note: "否定投降 + 否定退让 → threaten",
  },
  {
    input: "区区楼兰，尔等也敢抗汉",
    expectedIntent: "insult",
    expectedTone: "arrogant",
    note: "区区 + 尔等 → insult",
  },
];
