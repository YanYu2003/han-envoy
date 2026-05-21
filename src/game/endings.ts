import type { Ending, GameStats } from "./types";

/**
 * 《汉使》Phase 2 结局数据。
 *
 * 新增：
 * - dynamicSupplements: 根据参数状态追加的补充段落
 * - getEndingTriggerReason: 结局触发原因描述
 */

export const ENDINGS: Record<string, Ending> = {
  /* ---- 结局 1：功成归朝 ---- */
  submit_to_han: {
    id: "submit_to_han",
    title: "楼兰暂服，汉使归朝",
    description:
      "在你的威慑与交涉之下，楼兰王最终选择了臣服。他当殿承诺重开通商之道，遣使入朝纳贡，并承诺不再纵容匈奴骑兵假道楼兰劫掠汉边。你持节而立，知道此行虽未竟全功，却已为汉朝在西域布下了一枚重要的棋子。",
    dynamicSupplements: [
      (s) =>
        s.tradeAccess >= 70
          ? "商道大开，往来的驼铃声响彻河西。楼兰城中，汉商的摊位一个接一个地支了起来。"
          : "",
      (s) =>
        s.proXiongnu >= 70
          ? "但隐患尚存——亲匈奴派的势力未除，你离楼兰后，难保朝局不会反复。"
          : "",
      (s) =>
        s.envoyHonor >= 70
          ? "你持节归来的身影，成为玉门关戍卒口中传颂的故事。"
          : "",
    ],
    historianComment:
      "使臣持节入胡庭，一言动国。楼兰王俯首称臣，汉威西渐，功在社稷。",
    tone: "glorious",
  },

  /* ---- 结局 2：被逐出城 ---- */
  expelled: {
    id: "expelled",
    title: "被逐出楼兰",
    description:
      "楼兰王拍案而起。卫兵涌入，以戈矛迫使你退出王庭。译者面色复杂地看着你，低声说了一句：「使者……走吧。」你在亲匈奴大臣的冷笑声中被护送出城。回头望去，楼兰城门缓缓关闭。商道断绝，使命失败。",
    dynamicSupplements: [
      (s) =>
        s.envoyHonor >= 50
          ? "但你的气节并未折损。至少，你没有在楼兰王面前屈膝。"
          : "",
      (s) =>
        s.hanPrestige >= 30
          ? "汉朝的余威犹在，楼兰不敢加害于你。但你清楚，下次再来，恐怕不会这般客气了。"
          : "",
    ],
    historianComment:
      "使臣出使而不达，失国威于外邦，为天下笑。虽全身而返，亦不足道也。",
    tone: "neutral",
  },

  /* ---- 结局 3：殉国成名 ---- */
  martyrdom: {
    id: "martyrdom",
    title: "殉国成名，汉军西征",
    description:
      "当刀锋划过胸膛的那一刻，你心中没有恐惧，只有持节使者的尊严。消息传回长安，天子震怒。以你之死与楼兰无信为由，大汉铁骑直驱西域。楼兰城破之日，改立亲汉新王。史官在竹简上写下了你的名字。",
    dynamicSupplements: [
      (s) =>
        s.tradeAccess >= 40
          ? "汉军西征之后，商路大开。后人说，你的血浇灌了丝路上第一朵花。"
          : "",
      (s) =>
        s.historianScore >= 70
          ? "后世读史至此，无不扼腕叹息。一个使节的死，换来了西域数十年的安宁。"
          : "",
    ],
    historianComment:
      "使节伏剑而死，以一身之死换一国荡平，壮哉！节义之名，永载青史。",
    tone: "tragic",
  },

  /* ---- 结局 4：狂妄被杀，无功无名 ---- */
  failed_death: {
    id: "failed_death",
    title: "狂妄被杀，无功无名",
    description:
      "你的冲动之举彻底激怒了楼兰王。卫兵一拥而上，你甚至来不及说出最后一句话。你的尸体被草草掩埋在城外荒漠中，使节旌节被折断弃于道旁。没有人记得你的名字。大汉甚至没有为你出兵的理由。",
    dynamicSupplements: [
      (s) =>
        s.envoyHonor < 30
          ? "史官甚至不愿多写一笔。只留下四个字：「某使，狂死。」"
          : "",
      (s) =>
        s.proHan >= 40
          ? "亲汉贵人在你的墓前站了片刻，摇了摇头，转身离去。"
          : "",
    ],
    historianComment:
      "某年，有汉使死于楼兰，狂妄无谋，徒丧性命。史官惜墨，不著其名。",
    tone: "disgrace",
  },

  /* ---- 结局 5：刺王成功，改立新王 ---- */
  coup_success: {
    id: "coup_success",
    title: "刺王成功，改立亲汉新王",
    description:
      "血溅王庭。楼兰王倒在阶下，亲汉大臣疾呼你早已安排好的说辞，宣布新王即位。亲匈派在愕然中无力反击。新王当众宣示臣服于汉，并承诺永结盟好。你手中的旌节染血，但使命达成了。",
    dynamicSupplements: [
      (s) =>
        s.historianScore >= 70
          ? "史官评价极高：「非常之时，行非常之事。」"
          : "",
      (s) =>
        s.historianScore < 50
          ? "但史官亦留下隐忧：「刺王易，服众难。楼兰此后数十年，政变不断。」"
          : "",
      (s) =>
        s.tradeAccess >= 60
          ? "新王登基当月，一支满载丝绸的汉商队便抵达了楼兰城下。"
          : "",
    ],
    historianComment:
      "使节当庭刺王，改立新君，雷霆手段，非常人之所能。功过是非，留与后人评说。",
    tone: "victory",
  },
};

/**
 * 根据结局 ID 和参数状态生成触发原因描述。
 */
export function getEndingTriggerReason(
  endingId: string,
  stats: GameStats
): string {
  switch (endingId) {
    case "submit_to_han":
      if (stats.kingFear >= 65)
        return "触发原因：王惧过高（" + stats.kingFear + "），楼兰选择臣服";
      if (stats.hanPrestige >= 65)
        return "触发原因：汉威鼎盛（" + stats.hanPrestige + "），楼兰不敢违抗";
      return "触发原因：楼兰王权衡利弊后选择暂服";
    case "expelled":
      return (
        "触发原因：王怒高涨（" +
        stats.kingAnger +
        "）而王惧不足（" +
        stats.kingFear +
        "），楼兰将汉使逐出"
      );
    case "martyrdom":
      if (stats.envoyHonor >= 60 && stats.casusBelli >= 55)
        return "触发原因：名节高洁（" + stats.envoyHonor + "）且战争借口充足（" + stats.casusBelli + "），殉国转化为战略胜利";
      return "触发原因：使节殉国，但因准备不足未能引汉军西征";
    case "failed_death":
      return "触发原因：贸然行动，名节不足（" + stats.envoyHonor + "），无法引汉军出兵";
    case "coup_success":
      return (
        "触发原因：亲汉势力雄厚（" +
        stats.proHan +
        "）且战争借口充足（" +
        stats.casusBelli +
        "），刺王行动成功"
      );
    default:
      return "";
  }
}

/**
 * 将动态补充段落拼接为完整文本。
 */
export function buildEndingDescription(
  ending: Ending,
  stats: GameStats
): string {
  let text = ending.description;
  if (ending.dynamicSupplements) {
    const extras: string[] = [];
    for (const fn of ending.dynamicSupplements) {
      const line = fn(stats);
      if (line) extras.push(line);
    }
    if (extras.length > 0) {
      text += "\n\n" + extras.join("\n");
    }
  }
  return text;
}

/** 获取所有结局 ID 列表 */
export function getAllEndingIds(): string[] {
  return Object.keys(ENDINGS);
}
