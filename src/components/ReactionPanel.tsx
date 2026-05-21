import type { CharacterReaction, PlayerActionAnalysis } from "../ai/types";
import { CHARACTERS } from "../game/characters";

interface Props {
  /** 当前 AI 交互的解析结果 */
  analysis: PlayerActionAnalysis | null;
  /** 角色反应列表 */
  reactions: CharacterReaction[];
  /** 最近玩家输入的原文 */
  lastInput: string;
}

const EMOTION_COLORS: Record<string, string> = {
  angry: "border-red-700/40 bg-red-950/20",
  fearful: "border-yellow-700/40 bg-yellow-950/20",
  supportive: "border-green-700/40 bg-green-950/20",
  suspicious: "border-orange-700/40 bg-orange-950/20",
  mocking: "border-purple-700/40 bg-purple-950/20",
  hesitant: "border-blue-700/40 bg-blue-950/20",
  calm: "border-gray-600/30 bg-gray-800/20",
};

const EMOTION_LABEL: Record<string, string> = {
  angry: "怒",
  fearful: "惧",
  supportive: "赞",
  suspicious: "疑",
  mocking: "嘲",
  hesitant: "犹",
  calm: "平",
};

const CONFIDENCE_COLOR: Record<string, string> = {
  low: "text-red-400",
  medium: "text-yellow-400",
  high: "text-green-400",
};

function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.7) return "high";
  if (confidence >= 0.4) return "medium";
  return "low";
}

function getIntentZh(intent: string): string {
  const map: Record<string, string> = {
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
  return map[intent] ?? intent;
}

function getToneZh(tone: string): string {
  const map: Record<string, string> = {
    formal: "正式",
    humble: "谦卑",
    arrogant: "傲慢",
    furious: "愤怒",
    calm: "平静",
    sarcastic: "讽刺",
    ritualistic: "仪式",
  };
  return map[tone] ?? tone;
}

function getTargetZh(target: string): string {
  const map: Record<string, string> = {
    king: "楼兰王",
    proXiongnu: "亲匈大臣",
    proHan: "亲汉大臣",
    translator: "译者",
    court: "朝堂",
    self: "自己",
    unknown: "不明",
  };
  return map[target] ?? target;
}

export function ReactionPanel({ analysis, reactions, lastInput: _lastInput }: Props) {
  if (!analysis && reactions.length === 0) return null;

  return (
    <div className="space-y-2">
      {/* AI 解析结果 */}
      {analysis && (
        <div className="p-2 rounded border border-han-gold/10 bg-black/15">
          <div className="flex items-center gap-2 text-[10px] text-han-gold/50 mb-1.5">
            <span className="tracking-widest uppercase">Mock AI 解析</span>
            <span
              className={`${CONFIDENCE_COLOR[getConfidenceLevel(analysis.confidence)]}`}
            >
              {Math.round(analysis.confidence * 100)}%
            </span>
          </div>

          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px]">
            <span className="text-han-gold/70">
              意图：
              <span
                className={`font-bold ${
                  analysis.riskLevel >= 4 ? "text-red-400" : "text-han-gold"
                }`}
              >
                {getIntentZh(analysis.intent)}
              </span>
            </span>
            <span className="text-han-gold/50">
              语气：{getToneZh(analysis.tone)}
            </span>
            <span className="text-han-gold/50">
              对象：{getTargetZh(analysis.target)}
            </span>
            {analysis.riskLevel >= 4 && (
              <span className="text-red-400 font-bold">
                风险：{analysis.riskLevel}/5
              </span>
            )}
          </div>
        </div>
      )}

      {/* 角色反应 */}
      {reactions.length > 0 && (
        <div className="space-y-1.5">
          {reactions.map((r, i) => {
            const char = CHARACTERS[r.characterId];
            const color = EMOTION_COLORS[r.emotion] ?? EMOTION_COLORS.calm;
            return (
              <div
                key={i}
                className={`flex items-start gap-2 p-2 rounded border text-xs ${color}`}
              >
                {/* 角色头像 */}
                <div
                  className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center
                              text-[12px] font-bold shrink-0 mt-0.5"
                >
                  {char?.avatarText ?? "?"}
                </div>
                {/* 内容 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="font-bold text-[11px]">
                      {char?.name ?? r.characterId}
                    </span>
                    <span className="text-[9px] opacity-50">
                      {EMOTION_LABEL[r.emotion] ?? ""}
                    </span>
                  </div>
                  <div className="leading-relaxed opacity-80">{r.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
