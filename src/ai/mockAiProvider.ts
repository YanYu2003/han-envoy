/* ============================================================
 * 《汉使》Han Envoy — Phase 3.1 Mock AI Provider
 *
 * 本实现使用关键词匹配 + 优先级评分 + 否定检测 + 条件威胁检测，
 * 不调用任何外部 API。
 * ============================================================ */

import type {
  AIProvider,
  AIContext,
  PlayerActionAnalysis,
  CharacterReaction,
  CharacterEmotion,
  PlayerIntent,
  PlayerTone,
  PlayerTarget,
} from "./types";
import type { GameStats } from "../game/types";
import { CHARACTERS } from "../game/characters";

/* ================================================================
 * 关键词 → intent 映射（含优先级权重）
 * ================================================================ */

interface IntentRule {
  keywords: string[];
  intent: PlayerIntent;
  /** 基础优先级权重 */
  priority: number;
  /** 每个匹配关键词额外加的分数（基于长度） */
  keywordWeight?: number;
}

const INTENT_RULES: IntentRule[] = [
  // 刺杀 — 最高优先级
  { keywords: ["刺杀", "刺王", "杀王", "密诏", "短刃", "行刺", "暴起"], intent: "assassinate", priority: 90 },
  // 殉国
  { keywords: ["殉国", "伏剑", "死谏", "血溅朝堂", "捐躯"], intent: "martyrdom", priority: 85 },
  { keywords: ["以死明志", "以死谢罪"], intent: "martyrdom", priority: 80 },
  // 宣示汉威
  { keywords: ["汉威", "大汉天子", "持节", "天威", "上国", "皇威", "旌节"], intent: "invoke_han_authority", priority: 75 },
  // 问罪
  { keywords: ["背约", "杀使", "无信", "问罪", "血债", "凶手", "偿命", "罪不可赦"], intent: "accuse", priority: 72 },
  { keywords: ["交代", "给个说法", "必须负责", "讨回公道"], intent: "accuse", priority: 68 },
  // 威胁
  { keywords: ["大军", "天子震怒", "兵临城下", "铁骑", "踏平", "诛灭", "陈兵"], intent: "threaten", priority: 70 },
  { keywords: ["威胁", "警告", "后果自负", "后悔", "不客气"], intent: "threaten", priority: 45 },
  // 离间
  { keywords: ["私通", "背叛", "收受", "通敌", "离间", "暗通"], intent: "divide", priority: 60 },
  { keywords: ["匈奴", "左大将", "亲匈"], intent: "divide", priority: 55 },
  // 羞辱
  { keywords: ["鼠辈", "尔等", "区区", "蛮夷", "无耻", "卑鄙", "小人", "狂妄"], intent: "insult", priority: 65 },
  // 要求质子
  { keywords: ["质子", "王子入汉", "入朝为质", "送子为质"], intent: "demand_hostage", priority: 60 },
  // 谈判 / 通商
  { keywords: ["通商", "赏赐", "和好", "互市", "丝绸", "贸易", "商道", "封赏", "厚赏"], intent: "negotiate", priority: 55 },
  // 忍让
  { keywords: ["愿退", "不争", "请恕", "求和", "退让", "息事宁人", "各退一步"], intent: "appease", priority: 50 },
  // 投降（玩家投降类 — 主语必须是"我/汉使"相关）
  { keywords: ["我愿投降", "汉使愿降", "我愿臣服", "我认输", "我愿归附"], intent: "surrender", priority: 42 },
  // 通用投降关键词（单独出现时才匹配，后处理会修正）
  { keywords: ["投降", "臣服", "认输", "归附"], intent: "surrender", priority: 35 },
  // 提问
  { keywords: ["？", "如何", "为何", "谁", "何人", "何时", "什么", "为什么", "怎么回事"], intent: "ask_question", priority: 30 },
];

/* ================================================================
 * 否定词列表
 * ================================================================ */

const NEGATION_WORDS = ["不", "不可", "不能", "不愿", "休想", "莫", "毋", "非", "不是", "不再", "并未", "并非", "决不", "绝无"];

/** 检查输入中是否包含否定词 */
function hasNegation(input: string): boolean {
  const lower = input.toLowerCase();
  return NEGATION_WORDS.some((w) => lower.includes(w));
}

/** 检测是否为"不 X 就 Y"条件威胁句式 */
function isConditionalThreat(input: string): boolean {
  const lower = input.toLowerCase();
  const patterns = [
    /不.+就.+/, /不.+则/, /若不.+/, /再不.+便/, /不肯.+必/, /不降.+(死|杀|诛|踏平)/,
    /(不投降|不臣服|不归附).+(死|杀|诛|踏平|问罪)/,
    /(不答应|不从).+(后果|大军|兵)/,
  ];
  return patterns.some((p) => p.test(lower));
}

/** 检测主语是否为"我/汉使/本使"（表示自我行动） */
function isSelfSubject(input: string): boolean {
  const lower = input.toLowerCase();
  const selfPatterns = [
    /^我/, /^汉使/, /^本使/, /我愿/, /让我/, /容我/,
  ];
  return selfPatterns.some((p) => p.test(lower));
}

/** 检测主语是否为"楼兰/大王/你/对方" */
function isOtherSubject(input: string): boolean {
  const lower = input.toLowerCase();
  const otherPatterns = [
    /^楼兰/, /^大王/, /^王/, /^左大将/, /^贵人/, /尔等/, /你们/, /汝/,
  ];
  return otherPatterns.some((p) => p.test(lower));
}

/* ================================================================
 * 分数计算（综合 keyword + priority + 句式加分）
 * ================================================================ */

function scoreIntent(input: string): Map<PlayerIntent, number> {
  const lower = input.toLowerCase();
  const scores = new Map<PlayerIntent, number>();

  for (const rule of INTENT_RULES) {
    let baseScore = 0;
    for (const kw of rule.keywords) {
      if (lower.includes(kw)) {
        // 长关键词 + 较多分数
        baseScore += kw.length * 1.5;
      }
    }
    if (baseScore > 0) {
      // 加上优先级权重
      baseScore += rule.priority * 0.5;
      scores.set(rule.intent, (scores.get(rule.intent) ?? 0) + baseScore);
    }
  }

  // 条件威胁句式加分 — prefer threaten
  if (isConditionalThreat(input)) {
    scores.set("threaten", (scores.get("threaten") ?? 0) + 40);
  }

  // 否定 + surrender 关键词 → 强力惩罚
  if (hasNegation(input)) {
    const surrenderScore = scores.get("surrender");
    if (surrenderScore && surrenderScore > 0) {
      // 否定投降 → 删除投降分数并增加 threaten
      scores.delete("surrender");
      scores.set("threaten", (scores.get("threaten") ?? 0) + surrenderScore + 20);
    }
    // 否定忍让 → 删除忍让并增加 threaten/accuse
    const appeaseScore = scores.get("appease");
    if (appeaseScore && appeaseScore > 0) {
      scores.delete("appease");
      scores.set("threaten", (scores.get("threaten") ?? 0) + appeaseScore + 10);
    }
  }

  // surrender 关键词 + 主语不是我 → 改为 threaten
  const surrenderScore = scores.get("surrender");
  if (surrenderScore && surrenderScore > 0 && !isSelfSubject(input)) {
    scores.delete("surrender");
    scores.set("threaten", (scores.get("threaten") ?? 0) + surrenderScore + 15);
  }

  // 纯 surrender 关键词（无我愿前缀）+ 主楼兰 → threaten
  if (scores.has("surrender") && isOtherSubject(input)) {
    const val = scores.get("surrender")!;
    scores.delete("surrender");
    scores.set("threaten", (scores.get("threaten") ?? 0) + val + 15);
  }

  // "以死" 优先 martyrdom（除非明确刺杀上下文）
  if (lower.includes("以死")) {
    const hasAssassinate = scores.has("assassinate");
    if (!hasAssassinate) {
      scores.set("martyrdom", (scores.get("martyrdom") ?? 0) + 20);
    }
  }

  return scores;
}

/* ================================================================
 * Post-processing：修正明显的误判
 * ================================================================ */

function postProcessIntent(
  rawIntent: PlayerIntent,
  input: string,
  allScores: Map<PlayerIntent, number>
): PlayerIntent {
  const lower = input.toLowerCase();

  // 1) assassinate 保持最高优先级
  if (allScores.get("assassinate") && allScores.get("assassinate")! >= 20) {
    return "assassinate";
  }

  // 2) 问罪语境优先
  const accuseKeywords = ["杀使", "前任", "背约", "血债", "问罪", "凶手", "交代", "偿命", "罪不可赦"];
  if (accuseKeywords.some((k) => lower.includes(k)) && allScores.get("accuse") && allScores.get("accuse")! > 10) {
    return "accuse";
  }

  // 3) 威胁 + 条件句式 → threaten
  if (isConditionalThreat(lower) && allScores.get("threaten")) {
    return "threaten";
  }

  // 4) 否定 appease → threaten
  if (rawIntent === "appease" && hasNegation(lower)) {
    return "threaten";
  }

  // 5) 如果只有 unclear 但有内容 → 尝试找次高分
  if (rawIntent === "unclear" && allScores.size > 0) {
    const sorted = [...allScores.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted[0];
    if (top && top[1] > 5) return top[0];
  }

  return rawIntent;
}

/* ================================================================
 * Tone / Target 匹配（保持简单）
 * ================================================================ */

const TONE_RULES: { keywords: string[]; tone: PlayerTone }[] = [
  { keywords: ["请", "愿", "恳请", "乞", "伏惟"], tone: "humble" },
  { keywords: ["天子", "诏", "持节", "礼", "朝贡", "典"], tone: "ritualistic" },
  { keywords: ["尔等", "区区", "鼠辈", "蛮夷"], tone: "arrogant" },
  { keywords: ["怒", "血债", "必诛", "踏平", "不客气"], tone: "furious" },
  { keywords: ["何必", "呵呵", "可笑", "有趣"], tone: "sarcastic" },
];

const TARGET_RULES: { keywords: string[]; target: PlayerTarget }[] = [
  { keywords: ["大王", "楼兰王", "王", "陛下"], target: "king" },
  { keywords: ["左大将", "亲匈", "匈奴派", "大将"], target: "proXiongnu" },
  { keywords: ["贵人", "亲汉"], target: "proHan" },
  { keywords: ["译者", "通译", "译长"], target: "translator" },
  { keywords: ["诸臣", "朝堂", "众人", "诸位"], target: "court" },
  { keywords: ["我", "使臣", "汉使", "本使", "吾"], target: "self" },
];

function simpleMatch(input: string, rules: { keywords: string[] }[]): number[] {
  const lower = input.toLowerCase();
  return rules.map((r) => {
    let score = 0;
    for (const kw of r.keywords) {
      if (lower.includes(kw)) score += kw.length;
    }
    return score;
  });
}

/* ================================================================
 * MockAIProvider
 * ================================================================ */

export class MockAIProvider implements AIProvider {
  private async delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async parsePlayerInput(
    input: string,
    _context: AIContext
  ): Promise<PlayerActionAnalysis> {
    await this.delay(400);

    const trimmed = input.trim();
    if (!trimmed) {
      return {
        intent: "unclear",
        tone: "calm",
        target: "unknown",
        riskLevel: 1,
        confidence: 0,
        ruleHints: [],
        shortSummary: "空输入",
        interpretedAs: "通译未能听清使者之言。",
      };
    }

    // ---- 1) 全局评分 ----
    const scores = scoreIntent(trimmed);

    // ---- 2) 取最高分 intent ----
    const sorted = [...scores.entries()].sort((a, b) => b[1] - a[1]);
    const rawIntent: PlayerIntent = sorted.length > 0 && sorted[0]![1] > 3
      ? sorted[0]![0]
      : "unclear";

    // ---- 3) Post-processing ----
    const intent = postProcessIntent(rawIntent, trimmed, scores);

    // ---- 4) tone ----
    const toneScores = simpleMatch(trimmed, TONE_RULES);
    let bestToneIdx = -1;
    let bestToneScore = 0;
    toneScores.forEach((s, i) => { if (s > bestToneScore) { bestToneScore = s; bestToneIdx = i; } });
    const tone: PlayerTone = bestToneIdx >= 0 ? TONE_RULES[bestToneIdx]!.tone : "formal";

    // ---- 5) target ----
    const targetScores = simpleMatch(trimmed, TARGET_RULES);
    let bestTargetIdx = -1;
    let bestTargetScore = 0;
    targetScores.forEach((s, i) => { if (s > bestTargetScore) { bestTargetScore = s; bestTargetIdx = i; } });
    const target: PlayerTarget = bestTargetIdx >= 0 ? TARGET_RULES[bestTargetIdx]!.target : "unknown";

    // ---- 6) riskLevel ----
    const riskLevel = this.inferRiskLevel(intent, tone);

    // ---- 7) confidence ----
    const topScore = sorted[0]?.[1] ?? 0;
    const confidence = topScore > 0 ? Math.min(1, 0.3 + topScore / 60) : 0.2;

    // ---- 8) summary ----
    const shortSummary = this.summarize(intent, target, trimmed);

    return {
      intent,
      tone,
      target,
      riskLevel,
      confidence,
      ruleHints: [],
      shortSummary,
      interpretedAs: shortSummary,
    };
  }

  /* ---- generateCharacterReactions（与 Phase 3 相同） ---- */
  async generateCharacterReactions(
    analysis: PlayerActionAnalysis,
    context: AIContext
  ): Promise<CharacterReaction[]> {
    await this.delay(200);
    const reactions: CharacterReaction[] = [];
    const { stats, sceneId } = context;
    const targetIds = this.getTargetIds(analysis.target);
    for (const charId of targetIds) {
      const text = this.generateReactionText(charId, analysis, stats, sceneId);
      const emotion = this.inferEmotion(charId, analysis, stats);
      reactions.push({ characterId: charId, text, emotion });
    }
    if (analysis.target !== "court") {
      const opposing = this.getOpposingCharacter(analysis.target, stats);
      if (opposing && !targetIds.includes(opposing)) {
        const text = this.generateReactionText(opposing, analysis, stats, sceneId);
        const emotion = this.inferEmotion(opposing, analysis, stats);
        reactions.push({ characterId: opposing, text, emotion });
      }
    }
    return reactions.slice(0, 3);
  }

  /* ---- 私有辅助 ---- */

  private inferRiskLevel(intent: PlayerIntent, _tone: PlayerTone): 1 | 2 | 3 | 4 | 5 {
    const riskMap: Partial<Record<PlayerIntent, 1 | 2 | 3 | 4 | 5>> = {
      assassinate: 5, martyrdom: 5, insult: 4, demand_hostage: 4,
      threaten: 3, accuse: 3, surrender: 3, divide: 3,
      invoke_han_authority: 2, negotiate: 1, appease: 1, ask_question: 1, unclear: 1,
    };
    return riskMap[intent] ?? 2;
  }

  private summarize(intent: PlayerIntent, target: PlayerTarget, input: string): string {
    const intentZh: Record<PlayerIntent, string> = {
      threaten: "威慑", negotiate: "谈判", appease: "忍让", insult: "羞辱",
      divide: "离间", demand_hostage: "要求质子", invoke_han_authority: "宣示汉威",
      accuse: "问罪", assassinate: "刺杀", surrender: "屈服", martyrdom: "殉国",
      ask_question: "询问", unclear: "难以理解",
    };
    const targetZh: Record<PlayerTarget, string> = {
      king: "楼兰王", proXiongnu: "亲匈大臣", proHan: "亲汉大臣",
      translator: "译者", court: "朝堂诸臣", self: "自己", unknown: "众人",
    };
    const truncated = input.length > 20 ? input.slice(0, 20) + "…" : input;
    return `意图:${intentZh[intent]} → ${targetZh[target]}（"${truncated}"）`;
  }

  private getTargetIds(target: PlayerTarget): string[] {
    const map: Record<PlayerTarget, string[]> = {
      king: ["king"], proXiongnu: ["proXiongnu"], proHan: ["proHan"],
      translator: ["translator"], court: ["king", "proXiongnu", "proHan"],
      self: ["envoy"], unknown: ["king"],
    };
    return map[target] ?? ["king"];
  }

  private getOpposingCharacter(target: PlayerTarget, stats: GameStats): string | null {
    if (target === "king") return stats.proXiongnu >= stats.proHan ? "proXiongnu" : "proHan";
    if (target === "proXiongnu") return "proHan";
    if (target === "proHan") return "proXiongnu";
    return null;
  }

  private inferEmotion(charId: string, analysis: PlayerActionAnalysis, stats: GameStats): CharacterEmotion {
    if (charId === "king") {
      if (stats.kingAnger >= 70) return "angry";
      if (stats.kingFear >= 70) return "fearful";
      return "hesitant";
    }
    if (charId === "proXiongnu") {
      if (analysis.intent === "divide" || analysis.intent === "insult") return "angry";
      if (stats.kingFear >= 60) return "suspicious";
      return "mocking";
    }
    if (charId === "proHan") {
      if (analysis.intent === "negotiate" || analysis.intent === "invoke_han_authority") return "supportive";
      if (analysis.intent === "appease" || analysis.intent === "surrender") return "hesitant";
      return "calm";
    }
    if (charId === "translator") {
      if (stats.kingAnger >= 70) return "fearful";
      return "calm";
    }
    return "calm";
  }

  private generateReactionText(charId: string, analysis: PlayerActionAnalysis, stats: GameStats, _sceneId: string): string {
    const name = CHARACTERS[charId]?.name ?? "某人";
    const emotionPfx: Record<string, string> = {
      angry: "（怒）", fearful: "（惧）", supportive: "（赞）",
      suspicious: "（疑）", mocking: "（嘲）", hesitant: "（犹豫）", calm: "（平）",
    };
    const emotion = this.inferEmotion(charId, analysis, stats);
    const pfx = emotionPfx[emotion] ?? "";
    const templates = this.getReactionTemplates(charId, analysis, stats);
    if (templates.length === 0) return `${pfx}${name}默默注视着朝堂上的变化。`;
    const idx = Math.floor(Math.random() * templates.length);
    return `${pfx}${name}：${templates[idx]}`;
  }

  private getReactionTemplates(charId: string, analysis: PlayerActionAnalysis, stats: GameStats): string[] {
    if (charId === "king") {
      if (stats.kingAnger >= 80) return ["汉使之言，是要逼寡人翻脸吗？！", "够了！楼兰虽小，亦非可欺之国！", "使者若再出言无状，休怪寡人不念汉楼之谊！"];
      if (stats.kingFear >= 70) return ["使者所言……寡人、寡人自会斟酌。", "大汉天威，寡人岂敢轻视。只是楼兰亦有楼兰的难处。", "请使者容寡人再想想。"];
      switch (analysis.intent) {
        case "threaten": case "invoke_han_authority": return ["汉使这是以势相压么？", "寡人知道了。大汉的威名，寡人不敢忘。", "使者所言，寡人记下了。只是楼兰小国，亦有不得已之处。"];
        case "negotiate": return ["通商之事……倒也不是不能商议。", "汉使愿意谈，寡人自然愿意听。", "若真能通商互市，对楼兰也是好事。"];
        case "accuse": return ["前任汉使之死，寡人亦深感遗憾。但那已是过去之事。", "使者这是在质问寡人么？", "那件事……其中另有缘由，并非使者所想那般简单。"];
        case "appease": return ["使者能体谅楼兰的处境，寡人甚慰。", "如此最好，大家各退一步。"];
        case "assassinate": return ["！……你、你说什么？！", "卫兵！卫兵何在？！"];
        case "martyrdom": return ["使者何必如此决绝？万事好商量。", "莫要冲动！有什么话可以好好说。"];
        case "insult": return ["大胆！寡人敬你是汉使，你竟敢如此无礼！", "来人！将此狂徒拿下！"];
        default: return ["使者有何高见，寡人愿闻其详。", "此事关系重大，容寡人三思。"];
      }
    }
    if (charId === "proXiongnu") {
      switch (analysis.intent) {
        case "threaten": case "invoke_han_authority": return ["大王！汉人向来言过其实，不可轻信！", "哼，汉使不过是在虚张声势罢了。", "大王若信汉人，楼兰迟早被汉吞并！"];
        case "negotiate": return ["大王！汉人的丝绸换的是楼兰的命脉！", "通商？通商之后，楼兰便是汉朝的附庸！"];
        case "divide": return ["使者这是在挑拨离间！大王明鉴！", "哼，这等拙劣手段，也敢在朝堂上卖弄。"];
        case "insult": return ["你说什么？！", "大王！此人不除，楼兰永无宁日！"];
        case "assassinate": return ["保护大王！", "果然不出我所料！汉使心怀不轨！"];
        default: return ["大王，汉使来意不善，不可不防。", "匈奴单于才是楼兰真正的盟友，大王三思。"];
      }
    }
    if (charId === "proHan") {
      switch (analysis.intent) {
        case "threaten": case "invoke_han_authority": return ["大王，汉使所言不虚。大汉国力远非匈奴可比。", "大王！这是楼兰与汉交好的良机啊！"];
        case "negotiate": return ["大王，通商对楼兰百利而无一害。", "使者诚意可鉴，大王切莫错失良机。"];
        case "accuse": return ["大王，前任汉使之事确实需要给大汉一个交代。", "使者所言，句句在理。大王不可不察。"];
        case "appease": return ["大王，使者已退让至此，楼兰也该拿出诚意。", "大王，见好就收吧。"];
        case "divide": return ["大王，左大将与匈奴私通之事，臣也有所耳闻。", "大王明鉴，左大将此举实是置楼兰于险地。"];
        default: return ["大王，汉使远道而来，应以礼相待。", "臣以为，与汉交好方为上策。"];
      }
    }
    if (charId === "translator") {
      if (stats.kingAnger >= 70) return ["（译者声音微颤，小心翼翼地翻译着你的话……）", "（译者面色苍白，翻译时几度停顿。）"];
      if (analysis.riskLevel >= 4) return ["（译者迟疑了一下，压低声音）使者……慎言。", "（译者面色犹豫，似乎不太愿意照实翻译。）"];
      return ["（译者仔细聆听着你的话，逐句翻译给楼兰王。）", "（译者垂手而立，等待你的下一句话。）", "（译者将你的话翻译完毕后，退后半步。）"];
    }
    return [];
  }
}

/** 单例 */
export const mockAIProvider = new MockAIProvider();
