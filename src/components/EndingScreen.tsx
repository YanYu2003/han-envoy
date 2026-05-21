import { useGameStore } from "../store/gameStore";
import { ENDINGS, buildEndingDescription } from "../game/endings";
import { StatPanel } from "./StatPanel";

const TONE_STYLES: Record<string, { label: string; color: string }> = {
  glorious: { label: "荣耀", color: "text-han-gold border-han-gold/50" },
  tragic: { label: "悲壮", color: "text-red-300 border-red-700/50" },
  neutral: { label: "平常", color: "text-gray-400 border-gray-600/50" },
  disgrace: { label: "耻辱", color: "text-gray-500 border-gray-700/50" },
  victory: { label: "胜利", color: "text-yellow-300 border-yellow-600/50" },
};

const FALLBACK_TONE = TONE_STYLES.neutral as { label: string; color: string };

export function EndingScreen() {
  const stats = useGameStore((s) => s.stats);
  const endingId = useGameStore((s) => s.endingId);
  const endingTriggerReason = useGameStore((s) => s.endingTriggerReason);
  const restart = useGameStore((s) => s.restart);
  const history = useGameStore((s) => s.history);
  const eventLog = useGameStore((s) => s.eventLog);

  const ending = endingId ? ENDINGS[endingId] : undefined;

  if (!ending) {
    return (
      <div className="min-h-screen bg-han-ink flex items-center justify-center text-han-gold/60">
        结局数据丢失
      </div>
    );
  }

  const toneStyle = TONE_STYLES[ending.tone] ?? FALLBACK_TONE;
  const fullDescription = buildEndingDescription(ending, stats);
  const highScoreEvents = eventLog.filter(
    (e) =>
      e.description.includes("王怒滔天") ||
      e.description.includes("亲胡当道") ||
      e.description.includes("兵衅已成")
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-han-ink via-[#1a1a1a] to-han-ink flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full space-y-8">
        {/* Tone badge */}
        <div className="text-center">
          <span
            className={`inline-block px-3 py-1 text-xs tracking-widest border ${toneStyle.color}`}
          >
            {toneStyle.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center tracking-wider text-han-gold">
          {ending.title}
        </h1>

        {/* Divider */}
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-han-gold/50 to-transparent mx-auto" />

        {/* Trigger reason */}
        {endingTriggerReason && (
          <div className="text-center text-xs text-han-gold/50 italic">
            {endingTriggerReason}
          </div>
        )}

        {/* Description */}
        <div
          className="p-6 rounded border border-han-gold/15 bg-black/20
                      text-han-gold/80 text-sm leading-relaxed font-han whitespace-pre-line"
        >
          {fullDescription}
        </div>

        {/* Historian comment */}
        <div
          className="p-4 rounded border border-green-800/30 bg-green-950/20
                      text-green-300/70 text-xs italic leading-relaxed text-center"
        >
          <span className="block mb-1 text-green-400/50 text-[10px] tracking-widest">
            — 史官录 —
          </span>
          {ending.historianComment}
        </div>

        {/* Key events summary */}
        {highScoreEvents.length > 0 && (
          <div className="p-3 rounded border border-yellow-700/20 bg-yellow-950/10">
            <h3 className="text-yellow-500/50 text-[10px] tracking-widest uppercase mb-2 text-center">
              关键事件
            </h3>
            {highScoreEvents.slice(-3).map((e, i) => (
              <div
                key={i}
                className="text-yellow-300/50 text-[10px] text-center leading-relaxed"
              >
                {e.description}
              </div>
            ))}
          </div>
        )}

        {/* Final stats */}
        <div className="p-4 rounded border border-han-gold/10 bg-black/20">
          <h3 className="text-han-gold/50 text-xs tracking-widest uppercase mb-3 text-center">
            最终参数
          </h3>
          <div className="max-w-xs mx-auto">
            <StatPanel stats={stats} />
          </div>
        </div>

        {/* History summary */}
        {history.length > 0 && (
          <div className="text-center text-han-gold/40 text-xs space-y-1">
            <p>全程共 {history.length} 回合</p>
            {history.slice(-3).map((h, i) => (
              <p key={i}>
                #{h.turn} · {h.choiceLabel}
              </p>
            ))}
          </div>
        )}

        {/* Restart button */}
        <div className="text-center">
          <button
            onClick={restart}
            className="px-10 py-3 border border-han-gold/50 text-han-gold
                       tracking-widest text-lg hover:bg-han-gold/10 hover:border-han-gold
                       transition-all duration-300 font-han"
          >
            重新开始
          </button>
        </div>
      </div>
    </div>
  );
}
