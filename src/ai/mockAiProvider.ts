/* ============================================================
 * 《汉使》Han Envoy — Phase 3 Mock AI Provider
 *
 * 本实现使用关键词匹配 + 模板规则，不调用任何外部 API。
 * 后续 Phase 4 接入真实大模型时，替换为真实 Provider 即可。
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
 * 关键词 → intent 映射
 * ================================================================ */

interface IntentRule {
  keywords: string[];
  intent: PlayerIntent;
  priority: number; // 高优先级优先匹配
}

const INTENT_RULES: IntentRule[] = [
  // 刺杀
  {
    keywords: ["刺杀", "刺王", "杀王", "密诏", "短刃", "行刺", "暴起"],
    intent: "assassinate",
    priority: 90,
  },
  // 殉国
  {
    keywords: ["殉国", "伏剑", "以死", "死谏", "血溅", "捐躯"],
    intent: "martyrdom",
    priority: 85,
  },
  // 威慑 / 汉威
  {
    keywords: ["大军", "天子震怒", "兵临", "铁骑", "踏平", "诛灭", "陈兵"],
    intent: "threaten",
    priority: 70,
  },
  {
    keywords: ["汉威", "大汉天子", "持节", "天威", "上国", "皇威"],
    intent: "invoke_han_authority",
    priority: 75,
  },
  // 问罪
  {
    keywords: ["背约", "杀使", "无信", "问罪", "血债", "交代", "凶手", "偿命"],
    intent: "accuse",
    priority: 70,
  },
  // 离间
  {
    keywords: ["匈奴", "左大将", "私通", "背叛", "收受", "通敌", "离间"],
    intent: "divide",
    priority: 60,
  },
  // 要求质子
  {
    keywords: ["质子", "王子入汉", "入朝为质", "送子"],
    intent: "demand_hostage",
    priority: 60,
  },
  // 谈判 / 通商
  {
    keywords: ["通商", "赏赐", "和好", "互市", "丝绸", "贸易", "商道", "封赏"],
    intent: "negotiate",
    priority: 55,
  },
  // 忍让
  {
    keywords: ["愿退", "不争", "请恕", "求和", "退让", "息事", "宁人"],
    intent: "appease",
    priority: 50,
  },
  // 投降
  {
    keywords: ["投降", "归附匈奴", "臣服", "认输"],
    intent: "surrender",
    priority: 40,
  },
  // 提问
  {
    keywords: ["？", "如何", "为何", "谁", "何人", "何时", "什么", "为什么"],
    intent: "ask_question",
    priority: 30,
  },
  // 威胁（通用）
  {
    keywords: ["威胁", "警告", "后果", "后悔", "不客气"],
    intent: "threaten",
    priority: 45,
  },
  // 羞辱
  {
    keywords: ["鼠辈", "尔等", "区区", "蛮夷", "无耻", "卑鄙", "小人"],
    intent: "insult",
    priority: 65,
  },
];

/* ================================================================
 * 关键词 → tone 映射
 * ================================================================ */

interface ToneRule {
  keywords: string[];
  tone: PlayerTone;
}

const TONE_RULES: ToneRule[] = [
  { keywords: ["请", "愿", "恳请", "乞", "伏惟"], tone: "humble" },
  { keywords: ["天子", "诏", "持节", "礼", "朝贡", "典"], tone: "ritualistic" },
  { keywords: ["尔等", "区区", "鼠辈", "蛮夷"], tone: "arrogant" },
  { keywords: ["怒", "血债", "必诛", "踏平", "不客气"], tone: "furious" },
  { keywords: ["何必", "呵呵", "可笑", "有趣"], tone: "sarcastic" },
];

/* ================================================================
 * 关键词 → target 映射
 * ================================================================ */

interface TargetRule {
  keywords: string[];
  target: PlayerTarget;
}

const TARGET_RULES: TargetRule[] = [
  { keywords: ["大王", "楼兰王", "王", "陛下"], target: "king" },
  { keywords: ["左大将", "亲匈", "匈奴派", "大将"], target: "proXiongnu" },
  { keywords: ["贵人", "亲汉"], target: "proHan" },
  { keywords: ["译者", "通译", "译长"], target: "translator" },
  { keywords: ["诸臣", "朝堂", "众人", "诸位"], target: "court" },
  { keywords: ["我", "使臣", "汉使", "本使", "吾"], target: "self" },
];

/* ================================================================
 * 工具函数
 * ================================================================ */

function matchKeywords(
  input: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rules: any[]
): number[] {
  const lower = input.toLowerCase();
  const scores: number[] = [];
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    if (!rule) { scores.push(0); continue; }
    const kws = rule.keywords as string[];
    let score = 0;
    for (const kw of kws) {
      if (lower.includes(kw)) {
        score += kw.length;
      }
    }
    scores.push(score);
  }
  return scores;
}

/* ================================================================
 * MockAIProvider
 * ================================================================ */

export class MockAIProvider implements AIProvider {
  /** 模拟网络延迟 */
  private async delay(ms = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /* ---- parsePlayerInput ---- */

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

    // 1) 匹配 intent
    const intentScores = matchKeywords(trimmed, INTENT_RULES);
    let bestIntentIdx = -1;
    let bestIntentScore = 0;
    intentScores.forEach((score, i) => {
      if (score > bestIntentScore) {
        bestIntentScore = score;
        bestIntentIdx = i;
      }
    });

    const intent: PlayerIntent =
      bestIntentIdx >= 0 && bestIntentScore > 0
        ? INTENT_RULES[bestIntentIdx]!.intent
        : "unclear";

    // 2) 匹配 tone
    const toneScores = matchKeywords(trimmed, TONE_RULES);
    let bestToneIdx = -1;
    let bestToneScore = 0;
    toneScores.forEach((score, i) => {
      if (score > bestToneScore) {
        bestToneScore = score;
        bestToneIdx = i;
      }
    });
    const tone: PlayerTone =
      bestToneIdx >= 0 && bestToneScore > 0
        ? TONE_RULES[bestToneIdx]!.tone
        : "formal";

    // 3) 匹配 target
    const targetScores = matchKeywords(trimmed, TARGET_RULES);
    let bestTargetIdx = -1;
    let bestTargetScore = 0;
    targetScores.forEach((score, i) => {
      if (score > bestTargetScore) {
        bestTargetScore = score;
        bestTargetIdx = i;
      }
    });
    const target: PlayerTarget =
      bestTargetIdx >= 0 && bestTargetScore > 0
        ? TARGET_RULES[bestTargetIdx]!.target
        : "unknown";

    // 4) 风险等级
    const riskLevel = this.inferRiskLevel(intent, tone);

    // 5) 简短的摘要描述
    const shortSummary = this.summarize(intent, target, trimmed);

    // 6) 置信度
    const confidence = bestIntentScore > 0
      ? Math.min(1, 0.5 + bestIntentScore / 40)
      : 0.2;

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

  /* ---- generateCharacterReactions ---- */

  async generateCharacterReactions(
    analysis: PlayerActionAnalysis,
    context: AIContext
  ): Promise<CharacterReaction[]> {
    await this.delay(200);

    const reactions: CharacterReaction[] = [];
    const { stats, sceneId } = context;

    // 确定哪些角色需要反应
    const targetIds = this.getTargetIds(analysis.target);

    // 为每个目标角色生成反应
    for (const charId of targetIds) {
      const text = this.generateReactionText(charId, analysis, stats, sceneId);
      const emotion = this.inferEmotion(charId, analysis, stats);
      reactions.push({ characterId: charId, text, emotion });
    }

    // 如果 target 不是 court，让另一派系也插话
    if (analysis.target !== "court") {
      const opposing = this.getOpposingCharacter(analysis.target, stats);
      if (opposing && !targetIds.includes(opposing)) {
        const text = this.generateReactionText(
          opposing,
          analysis,
          stats,
          sceneId
        );
        const emotion = this.inferEmotion(opposing, analysis, stats);
        reactions.push({ characterId: opposing, text, emotion });
      }
    }

    // 最多返回 3 条反应
    return reactions.slice(0, 3);
  }

  /* ---- 私有辅助 ---- */

  private inferRiskLevel(intent: PlayerIntent, _tone: PlayerTone): 1 | 2 | 3 | 4 | 5 {
    const riskMap: Partial<Record<PlayerIntent, 1 | 2 | 3 | 4 | 5>> = {
      assassinate: 5,
      martyrdom: 5,
      insult: 4,
      threaten: 3,
      accuse: 3,
      demand_hostage: 4,
      surrender: 3,
      divide: 3,
      invoke_han_authority: 2,
      negotiate: 1,
      appease: 1,
      ask_question: 1,
      unclear: 1,
    };
    return riskMap[intent] ?? 2;
  }

  private summarize(
    intent: PlayerIntent,
    target: PlayerTarget,
    input: string
  ): string {
    const intentZh: Record<PlayerIntent, string> = {
      threaten: "威慑",
      negotiate: "谈判",
      appease: "忍让",
      insult: "羞辱",
      divide: "离间",
      demand_hostage: "要求质子",
      invoke_han_authority: "宣示汉威",
      accuse: "问罪",
      assassinate: "刺杀",
      surrender: "屈服",
      martyrdom: "殉国",
      ask_question: "询问",
      unclear: "难以理解",
    };
    const targetZh: Record<PlayerTarget, string> = {
      king: "楼兰王",
      proXiongnu: "亲匈大臣",
      proHan: "亲汉大臣",
      translator: "译者",
      court: "朝堂诸臣",
      self: "自己",
      unknown: "众人",
    };
    const summary = intentZh[intent];
    const tgt = targetZh[target];
    const truncated = input.length > 20 ? input.slice(0, 20) + "…" : input;
    return `意图:${summary} → ${tgt}（"${truncated}"）`;
  }

  private getTargetIds(target: PlayerTarget): string[] {
    const map: Record<PlayerTarget, string[]> = {
      king: ["king"],
      proXiongnu: ["proXiongnu"],
      proHan: ["proHan"],
      translator: ["translator"],
      court: ["king", "proXiongnu", "proHan"],
      self: ["envoy"],
      unknown: ["king"],
    };
    return map[target] ?? ["king"];
  }

  private getOpposingCharacter(
    target: PlayerTarget,
    stats: GameStats
  ): string | null {
    // 如果对王发言，让强势方插话
    if (target === "king") {
      return stats.proXiongnu >= stats.proHan ? "proXiongnu" : "proHan";
    }
    if (target === "proXiongnu") return "proHan";
    if (target === "proHan") return "proXiongnu";
    return null;
  }

  private inferEmotion(
    charId: string,
    analysis: PlayerActionAnalysis,
    stats: GameStats
  ): CharacterEmotion {
    if (charId === "king") {
      if (stats.kingAnger >= 70) return "angry";
      if (stats.kingFear >= 70) return "fearful";
      return "hesitant";
    }
    if (charId === "proXiongnu") {
      if (analysis.intent === "divide" || analysis.intent === "insult")
        return "angry";
      if (stats.kingFear >= 60) return "suspicious";
      return "mocking";
    }
    if (charId === "proHan") {
      if (
        analysis.intent === "negotiate" ||
        analysis.intent === "invoke_han_authority"
      )
        return "supportive";
      if (analysis.intent === "appease" || analysis.intent === "surrender")
        return "hesitant";
      return "calm";
    }
    if (charId === "translator") {
      if (stats.kingAnger >= 70) return "fearful";
      return "calm";
    }
    return "calm";
  }

  private generateReactionText(
    charId: string,
    analysis: PlayerActionAnalysis,
    stats: GameStats,
    _sceneId: string
  ): string {
    const name = CHARACTERS[charId]?.name ?? "某人";

    // 情绪修饰
    const emotionPfx: Record<string, string> = {
      angry: "（怒）",
      fearful: "（惧）",
      supportive: "（赞）",
      suspicious: "（疑）",
      mocking: "（嘲）",
      hesitant: "（犹豫）",
      calm: "（平）",
    };
    const emotion = this.inferEmotion(charId, analysis, stats);
    const pfx = emotionPfx[emotion] ?? "";

    // 模板
    const templates = this.getReactionTemplates(charId, analysis, stats);

    if (templates.length === 0) {
      return `${pfx}${name}默默注视着朝堂上的变化。`;
    }

    const idx = Math.floor(Math.random() * templates.length);
    return `${pfx}${name}：${templates[idx]}`;
  }

  private getReactionTemplates(
    charId: string,
    analysis: PlayerActionAnalysis,
    stats: GameStats
  ): string[] {
    // 通用高情绪模板
    if (charId === "king") {
      if (stats.kingAnger >= 80) {
        return [
          "汉使之言，是要逼寡人翻脸吗？！",
          "够了！楼兰虽小，亦非可欺之国！",
          "使者若再出言无状，休怪寡人不念汉楼之谊！",
        ];
      }
      if (stats.kingFear >= 70) {
        return [
          "使者所言……寡人、寡人自会斟酌。",
          "大汉天威，寡人岂敢轻视。只是楼兰亦有楼兰的难处。",
          "请使者容寡人再想想。",
        ];
      }

      switch (analysis.intent) {
        case "threaten":
        case "invoke_han_authority":
          return [
            "汉使这是以势相压么？",
            "寡人知道了。大汉的威名，寡人不敢忘。",
            "使者所言，寡人记下了。只是楼兰小国，亦有不得已之处。",
          ];
        case "negotiate":
          return [
            "通商之事……倒也不是不能商议。",
            "汉使愿意谈，寡人自然愿意听。",
            "若真能通商互市，对楼兰也是好事。",
          ];
        case "accuse":
          return [
            "前任汉使之死，寡人亦深感遗憾。但那已是过去之事。",
            "使者这是在质问寡人么？",
            "那件事……其中另有缘由，并非使者所想那般简单。",
          ];
        case "appease":
          return [
            "使者能体谅楼兰的处境，寡人甚慰。",
            "如此最好，大家各退一步。",
          ];
        case "assassinate":
          return [
            "！……你、你说什么？！",
            "卫兵！卫兵何在？！",
          ];
        case "martyrdom":
          return [
            "使者何必如此决绝？万事好商量。",
            "莫要冲动！有什么话可以好好说。",
          ];
        case "insult":
          return [
            "大胆！寡人敬你是汉使，你竟敢如此无礼！",
            "来人！将此狂徒拿下！",
          ];
        default:
          return [
            "使者有何高见，寡人愿闻其详。",
            "此事关系重大，容寡人三思。",
          ];
      }
    }

    if (charId === "proXiongnu") {
      switch (analysis.intent) {
        case "threaten":
        case "invoke_han_authority":
          return [
            "大王！汉人向来言过其实，不可轻信！",
            "哼，汉使不过是在虚张声势罢了。",
            "大王若信汉人，楼兰迟早被汉吞并！",
          ];
        case "negotiate":
          return [
            "大王！汉人的丝绸换的是楼兰的命脉！",
            "通商？通商之后，楼兰便是汉朝的附庸！",
          ];
        case "divide":
          return [
            "使者这是在挑拨离间！大王明鉴！",
            "哼，这等拙劣手段，也敢在朝堂上卖弄。",
          ];
        case "insult":
          return [
            "你说什么？！",
            "大王！此人不除，楼兰永无宁日！",
          ];
        case "assassinate":
          return [
            "保护大王！",
            "果然不出我所料！汉使心怀不轨！",
          ];
        default:
          return [
            "大王，汉使来意不善，不可不防。",
            "匈奴单于才是楼兰真正的盟友，大王三思。",
          ];
      }
    }

    if (charId === "proHan") {
      switch (analysis.intent) {
        case "threaten":
        case "invoke_han_authority":
          return [
            "大王，汉使所言不虚。大汉国力远非匈奴可比。",
            "大王！这是楼兰与汉交好的良机啊！",
          ];
        case "negotiate":
          return [
            "大王，通商对楼兰百利而无一害。",
            "使者诚意可鉴，大王切莫错失良机。",
          ];
        case "accuse":
          return [
            "大王，前任汉使之事确实需要给大汉一个交代。",
            "使者所言，句句在理。大王不可不察。",
          ];
        case "appease":
          return [
            "大王，使者已退让至此，楼兰也该拿出诚意。",
            "大王，见好就收吧。",
          ];
        case "divide":
          return [
            "大王，左大将与匈奴私通之事，臣也有所耳闻。",
            "大王明鉴，左大将此举实是置楼兰于险地。",
          ];
        default:
          return [
            "大王，汉使远道而来，应以礼相待。",
            "臣以为，与汉交好方为上策。",
          ];
      }
    }

    if (charId === "translator") {
      // 译者：谨慎翻译，偶尔提醒
      if (stats.kingAnger >= 70) {
        return [
          "（译者声音微颤，小心翼翼地翻译着你的话……）",
          "（译者面色苍白，翻译时几度停顿。）",
        ];
      }
      if (analysis.riskLevel >= 4) {
        return [
          "（译者迟疑了一下，压低声音）使者……慎言。",
          "（译者面色犹豫，似乎不太愿意照实翻译。）",
        ];
      }
      return [
        "（译者仔细聆听着你的话，逐句翻译给楼兰王。）",
        "（译者垂手而立，等待你的下一句话。）",
        "（译者将你的话翻译完毕后，退后半步。）",
      ];
    }

    return [];
  }
}

/** 单例 */
export const mockAIProvider = new MockAIProvider();
