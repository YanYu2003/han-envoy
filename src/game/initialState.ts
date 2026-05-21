import type { GameStats } from "./types";

/**
 * Phase 1 初始参数值。
 * 反映楼兰朝堂在汉使抵达前的平衡态势。
 */
export const INITIAL_STATS: GameStats = {
  hanPrestige: 30,       // 汉朝有一定声望，但尚不足以震慑
  xiongnuPressure: 40,   // 匈奴压力不小
  kingAnger: 20,         // 楼兰王暂无怒意
  kingFear: 30,          // 对汉朝有一定畏惧
  proHan: 25,            // 亲汉势力有限
  proXiongnu: 35,        // 亲匈势力略占上风
  tradeAccess: 30,       // 商道尚可通行
  casusBelli: 15,        // 暂无出兵的正当理由
  envoyHonor: 50,        // 使节名节初始中等
  historianScore: 50,    // 史官评价初始中等
};
