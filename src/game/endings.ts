import type { Ending } from "./types";

/**
 * 《汉使》Phase 1 结局数据。
 * 全部为数据驱动，修改此处即可增删改结局。
 */
export const ENDINGS: Record<string, Ending> = {
  /* ---- 结局 1：功成归朝 ---- */
  submit_to_han: {
    id: "submit_to_han",
    title: "楼兰暂服，汉使归朝",
    description:
      "在你的威慑与交涉之下，楼兰王最终选择了臣服。他当殿承诺重开通商之道，遣使入朝纳贡，并承诺不再纵容匈奴骑兵假道楼兰劫掠汉边。你持节而立，知道此行虽未竟全功，却已为汉朝在西域布下了一枚重要的棋子。",
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
    historianComment:
      "使节当庭刺王，改立新君，雷霆手段，非常人之所能。功过是非，留与后人评说。",
    tone: "victory",
  },
};

/** 获取所有结局 ID 列表 */
export function getAllEndingIds(): string[] {
  return Object.keys(ENDINGS);
}
