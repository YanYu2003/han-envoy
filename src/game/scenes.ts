import type { GameStats, Scene } from "./types";

/**
 * 《汉使》Phase 1 场景数据。
 * 全部为数据驱动，修改此处即可增删改场景、选项和参数效果。
 */

/* ================================================================
 * 条件结局判定函数（供场景 choices 中的 resolveEnding 引用）
 * ================================================================ */

/** 危机升级场景中普通选择的结局判定 */
export function resolveCrisisEnding(
  stats: GameStats,
  _turn: number
): string | null {
  // 1) 汉威够高或王惧够大 → 楼兰臣服
  if (stats.hanPrestige >= 50 || stats.kingFear >= 60) {
    return "submit_to_han";
  }
  // 2) 王怒过高且王惧不足 → 被逐
  if (stats.kingAnger >= 60 && stats.kingFear < 40) {
    return "expelled";
  }
  // 3) 默认：王惧中等但王怒也未爆表 → 勉强臣服
  if (stats.kingFear >= 40) {
    return "submit_to_han";
  }
  return "expelled";
}

/** 刺王行动的条件结局判定 */
export function resolveAssassinationEnding(
  stats: GameStats,
  _turn: number
): string | null {
  // 亲汉势力 + 战争借口充足 → 刺王成功
  if (stats.proHan >= 50 && stats.casusBelli >= 45) {
    return "coup_success";
  }
  // 名节 + 战争借口足够 → 殉国成名
  if (stats.envoyHonor >= 40 && stats.casusBelli >= 30) {
    return "martyrdom";
  }
  // 否则 → 白白送死
  return "failed_death";
}

/* ================================================================
 * 场景数据
 * ================================================================ */

const firstSceneChoices = [
  {
    id: "invoke_han_authority",
    label: "陈汉威",
    description: "正色宣告汉朝之强盛，以皇权威慑楼兰君臣。",
    effects: { hanPrestige: 10, kingFear: 10, kingAnger: 5, historianScore: 3 },
    resultText:
      "你持节而立，声若洪钟：「大汉天子威加海内，楼兰若能归附，商路畅通，汉必厚遇之。」楼兰王面色微变，亲匈奴大臣却冷哼一声。",
    nextSceneId: "first_statement",
  },
  {
    id: "offer_benefits",
    label: "许厚利",
    description: "以通商、册封和赏赐为饵，争取楼兰王的信任。",
    effects: { tradeAccess: 10, proHan: 8, kingAnger: -5, historianScore: 1 },
    resultText:
      "你放低姿态，言道：「汉不吝封赏。楼兰若能通商和睦，天子必以丝绸、铁器厚赐。」亲汉大臣微微颔首，楼兰王露出思索之色。",
    nextSceneId: "first_statement",
  },
  {
    id: "cautious_tact",
    label: "谨慎周旋",
    description: "言语谦和，暂不表现出强硬立场，先观察局势。",
    effects: { kingAnger: -8, envoyHonor: -5, tradeAccess: 3, historianScore: -2 },
    resultText:
      "你以礼致辞，言辞谦逊但不失体统。楼兰王面色稍霁，但亲汉大臣眼中闪过一丝失望。译者尽职地翻译着你的话。",
    nextSceneId: "first_statement",
  },
  {
    id: "accuse_betrayal",
    label: "责背约",
    description: "当面斥责楼兰反复无常，暗通匈奴背弃汉朝。",
    effects: { envoyHonor: 8, kingAnger: 15, casusBelli: 8, hanPrestige: 3, historianScore: 5 },
    resultText:
      "你厉声道：「楼兰世受汉恩，却纵匈奴铁骑穿境劫掠！天子问：此为何意？」朝堂哗然，亲匈奴大臣拍案而起，楼兰王脸色铁青。",
    nextSceneId: "first_statement",
  },
];

const secondSceneChoices = [
  {
    id: "declare_might",
    label: "宣示汉威",
    description: "再次强调汉朝军事力量，警告楼兰不要误判形势。",
    effects: { hanPrestige: 8, kingFear: 10, kingAnger: 5, xiongnuPressure: 3 },
    resultText:
      "你朗声道：「去年，贰师将军破大宛，天下震动。楼兰以为汉不能越葱岭而战耶？」亲匈奴大臣面色阴沉，楼兰王握紧了王座扶手。",
    nextSceneId: "faction_conflict",
  },
  {
    id: "propose_trade",
    label: "提出通商",
    description: "详述通商之利，以经济利益争取楼兰向汉。",
    effects: { tradeAccess: 12, proHan: 10, kingAnger: -3, historianScore: 2 },
    resultText:
      "你取出丝路图卷：「大汉愿与楼兰开通市集，丝绸、漆器、铁器不日而至。」亲汉大臣眼睛发亮，楼兰王微微前倾身体。",
    nextSceneId: "faction_conflict",
  },
  {
    id: "divide_xiongnu",
    label: "离间亲胡",
    description: "暗示亲匈奴大臣收受了汉朝的好处，制造猜忌。",
    effects: { proHan: 10, proXiongnu: -8, kingAnger: 5, envoyHonor: -3, historianScore: -2 },
    resultText:
      "你意味深长地看了亲匈奴大臣一眼：「听闻左大将也曾遣人私通汉边——不知楼兰王可知此事？」朝堂上响起窃窃私语，亲匈奴大臣面色大变。",
    nextSceneId: "faction_conflict",
  },
  {
    id: "yield_and_wait",
    label: "忍让退避",
    description: "暂时退让，不与其争锋，保住使节安全再图后计。",
    effects: { kingAnger: -10, kingFear: -5, envoyHonor: -8, hanPrestige: -5, historianScore: -5 },
    resultText:
      "你拱手道：「大王言之有理，容我再思。」亲匈奴大臣露出不屑的笑容。译者低下头，似乎不愿看你退让的姿态。",
    nextSceneId: "faction_conflict",
  },
];

const thirdSceneChoices = [
  {
    id: "support_pro_han",
    label: "支持亲汉派",
    description: "公开支持亲汉大臣的提议，打压亲匈奴派气焰。",
    effects: { proHan: 12, kingAnger: 8, xiongnuPressure: 5, historianScore: 3 },
    resultText:
      "你向亲汉大臣点头示意，那人立刻上前陈词：「大王，汉使在此，实乃楼兰之福！请大王三思。」楼兰王犹豫地看了看你，又看了看亲匈奴大臣。",
    nextSceneId: "crisis_point",
  },
  {
    id: "suppress_xiongnu",
    label: "压制亲胡派",
    description: "当面驳斥亲匈奴大臣的言论，打压其气势。",
    effects: { proXiongnu: -10, kingAnger: 10, kingFear: 10, casusBelli: 3, historianScore: 5 },
    resultText:
      "你截断亲匈奴大臣的话，厉声道：「匈奴能给楼兰什么？铁骑过境，征粮征丁！大汉能给楼兰什么？商道安全，世代安宁！」亲匈奴大臣怒目而视。",
    nextSceneId: "crisis_point",
  },
  {
    id: "mediate",
    label: "居中调和",
    description: "以温和姿态调停两派之争，不直接得罪任何一方。",
    effects: { kingAnger: -5, envoyHonor: -3, tradeAccess: 5, historianScore: -1 },
    resultText:
      "你抬手示意双方稍安：「两国交好，贵在诚意。大王不妨各自听听双方说辞再做定夺。」楼兰王神色稍缓，但问题并未解决。",
    nextSceneId: "crisis_point",
  },
  {
    id: "threaten_xiongnu",
    label: "威胁亲胡派",
    description: "暗示亲匈奴大臣，大汉已知其私通匈奴的证据。",
    effects: { kingFear: 12, proXiongnu: 5, kingAnger: 8, envoyHonor: -3, casusBelli: 5 },
    resultText:
      "你冷冷地看着亲匈奴大臣：「大汉对楼兰朝中的一举一动，了如指掌。」那人面色一僵，但很快恢复了强硬姿态。楼兰王眉头紧锁。",
    nextSceneId: "crisis_point",
  },
];

const fourthSceneChoices = [
  {
    id: "military_pressure",
    label: "以兵威慑",
    description: "直接暗示汉朝大军已在玉门关外整装待发。",
    effects: { hanPrestige: 12, kingFear: 15, kingAnger: 8, casusBelli: 5, historianScore: 3 },
    resultText:
      "你缓缓道：「天子已命贰师将军率兵五万，陈兵玉门。若楼兰执意不遵，恐怕……」你的话未说完，朝堂已一片死寂。",
    resolveEnding: resolveCrisisEnding,
  },
  {
    id: "buy_peace",
    label: "许厚利求和",
    description: "开出更优厚的通商条件，以经济让步换取和平。",
    effects: { tradeAccess: 10, proHan: 8, kingAnger: -10, envoyHonor: -5, historianScore: -2 },
    resultText:
      "你深吸一口气：「若楼兰愿与汉交好，天子可特许楼兰商队于河西四郡自由贸易，减免关税。」楼兰王的眼神动摇了。",
    resolveEnding: resolveCrisisEnding,
  },
  {
    id: "assassinate_king",
    label: "冒险刺王",
    description:
      "效法傅介子故事，趁楼兰王不备暴起刺杀。成败在此一举。",
    effects: { hanPrestige: -5, xiongnuPressure: 10, envoyHonor: 10, casusBelli: 10 },
    resultText:
      "你眼中寒光一闪，握紧了袖中的短刃。机会只有一次。你向前一步，低声对楼兰王说：「大王，天子有密诏，请借一步说话……」",
    resolveEnding: resolveAssassinationEnding,
  },
  {
    id: "divide_and_conquer",
    label: "离间促变",
    description: "暗中策反亲匈奴派中的动摇者，促使朝堂倒向。",
    effects: { proHan: 10, proXiongnu: -10, kingAnger: 5, casusBelli: 3, historianScore: 2 },
    resultText:
      "你注意到一个亲匈奴派官员神色犹豫，便在言辞间刻意对他单独示好。亲匈奴大臣察觉到了异样，但裂痕已然出现。",
    resolveEnding: resolveCrisisEnding,
  },
];

/**
 * 所有场景的 Map。
 * key 是 sceneId，value 是 Scene 对象。
 */
export const SCENES: Record<string, Scene> = {
  intro_court: {
    id: "intro_court",
    title: "入楼兰王庭",
    narrative: `你率使团穿越戈壁，终于抵达楼兰城。

城中建筑以土坯筑成，王庭虽远不及长安宫室之壮丽，却也颇有西域气度。你手持天子旌节，踏着黄土台阶步入大殿。

楼兰王端坐于上，左右分列文武。左侧一人身着胡服，目光锐利如鹰隼，正是朝中亲匈奴派首领——左大将。右侧一人汉服冠带，神色温和，乃是主张与汉交好的贵人。阶下立着一人，低头垂手，那是王庭译长——通译。

楼兰王开口，声如洪钟：「汉使远来，寡人有失远迎。不知天子遣使至我楼兰，所为何事？」

朝堂上的目光都聚焦在你身上。`,
    characterIds: ["king", "proXiongnu", "proHan", "translator"],
    choices: firstSceneChoices,
  },

  first_statement: {
    id: "first_statement",
    title: "首次陈词",
    narrative: `气氛凝重。楼兰王的目光在你和两派大臣之间游移。

亲匈奴大臣冷冷开口：「大王，汉使来意不善。匈奴单于方与大汉和亲，彼却来我楼兰挑拨离间，不可不防。」

亲汉大臣立刻反驳：「左大将此言差矣！汉使远道而来，愿与我楼兰通好，此乃天赐良机。」

译者小心翼翼地看着你，等待你的正式陈词。`,
    characterIds: ["king", "proXiongnu", "proHan", "translator"],
    choices: secondSceneChoices,
  },

  faction_conflict: {
    id: "faction_conflict",
    title: "派系冲突",
    narrative: `你的话音刚落，朝堂上便爆发了激烈的争论。

亲匈奴大臣拍案而起：「大王！汉人言而无信！昔日张骞来西域，说的也是通好，结果呢？汉军随后便至！匈奴与楼兰水土相连，才是真正的盟友！」

亲汉大臣上前一步：「左大将！匈奴铁骑年年借道，将我楼兰百姓的口粮征去大半！你所谓盟友，可曾给楼兰带来一丝好处？」

楼兰王揉着太阳穴，显然无法决断。译者站在阶下，眼神在每一个人脸上快速扫过。

朝堂上的争吵愈演愈烈，所有人都看向你——是时候做出选择了。`,
    characterIds: ["king", "proXiongnu", "proHan", "translator"],
    choices: thirdSceneChoices,
  },

  crisis_point: {
    id: "crisis_point",
    title: "危机升级",
    narrative: `争论的声浪渐渐平息，但空气中弥漫着更加危险的气息。

楼兰王终于开口，声音疲惫但带着一丝决断：「汉使之言，寡人听明白了。但左大将所言也不无道理。楼兰小国，得罪不起任何一方。使者想让寡人如何抉择？」

亲匈奴大臣眯起眼睛，手按在了腰间的刀柄上。亲汉大臣紧张地看着你。译者嘴唇微动，似乎想说什么但最终没有出声。

王庭外传来战马的嘶鸣声。你明白，真正的抉择时刻到了。`,
    characterIds: ["king", "proXiongnu", "proHan", "translator"],
    choices: fourthSceneChoices,
  },
};

/** 第一个场景的 ID */
export const STARTING_SCENE_ID = "intro_court";
