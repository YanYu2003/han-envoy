import type { Character } from "./types";

/**
 * 《汉使》Phase 1 角色数据。
 * 全部为数据驱动，修改此处即可增删改角色。
 */
export const CHARACTERS: Record<string, Character> = {
  envoy: {
    id: "envoy",
    name: "汉使",
    title: "大汉持节使者",
    stance: "player",
    avatarText: "使",
    description:
      "你，汉朝天子所遣持节使者。肩负通西域、抚远邦、扬汉威之使命。今日入楼兰王庭，一言一行，皆系国运。",
  },
  king: {
    id: "king",
    name: "楼兰王",
    title: "楼兰国王",
    stance: "neutral",
    avatarText: "王",
    description:
      "楼兰之主，居汉匈两大势力之间，求存为第一要务。表面威严，内心权衡。畏汉之强，亦惧匈奴之近。",
  },
  proXiongnu: {
    id: "proXiongnu",
    name: "左大将",
    title: "亲匈奴大臣",
    stance: "pro_xiongnu",
    avatarText: "胡",
    description:
      "楼兰朝中亲匈奴派首领。自恃匈奴为近邻强援，对汉使充满敌意。言语强硬，屡次在朝堂上阻挠亲汉之议。",
  },
  proHan: {
    id: "proHan",
    name: "贵人",
    title: "亲汉大臣",
    stance: "pro_han",
    avatarText: "汉",
    description:
      "楼兰朝中亲汉派代表。深知汉朝国力远胜匈奴，主张与汉交好以保商道平安。态度温和，但在亲匈派面前往往受制。",
  },
  translator: {
    id: "translator",
    name: "通译",
    title: "楼兰王庭译长",
    stance: "neutral",
    avatarText: "译",
    description:
      "楼兰王庭译长，通晓汉语与楼兰语。立于王座阶下，负责转述汉使之言。表面中立谨慎，内心观察着每一位说话者。",
  },
};

/** 获取所有角色 ID 列表 */
export function getAllCharacterIds(): string[] {
  return Object.keys(CHARACTERS);
}
