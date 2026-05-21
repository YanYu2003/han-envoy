import type { HistoryEntry, EventLogEntry } from "../game/types";

interface Props {
  history: HistoryEntry[];
  eventLog?: EventLogEntry[];
}

export function HistoryLog({ history, eventLog }: Props) {
  if (history.length === 0 && (!eventLog || eventLog.length === 0))
    return null;

  // 合并历史记录和事件日志，按 turn + 先后顺序排列
  const combined: { type: "history" | "event"; turn: number; node: React.ReactNode }[] =
    [];

  for (const h of history) {
    combined.push({
      type: "history",
      turn: h.turn,
      node: (
        <div
          key={`h-${combined.length}`}
          className="border-l-2 border-han-gold/20 pl-3 py-1 text-xs"
        >
          <div className="flex items-center gap-2 text-han-gold/50 mb-1">
            <span className="font-mono text-[10px]">#{h.turn}</span>
            <span className="text-[10px]">{h.sceneTitle}</span>
          </div>
          <div className="text-han-gold/80 font-medium mb-0.5">
            【{h.choiceLabel}】
          </div>
          <div className="text-han-gold/60 leading-relaxed mb-0.5">
            {h.resultText}
          </div>
          {h.statChangesSummary && (
            <div className="text-[10px] text-han-gold/40 font-mono mt-1">
              {h.statChangesSummary}
            </div>
          )}
        </div>
      ),
    });
  }

  if (eventLog) {
    for (const e of eventLog) {
      combined.push({
        type: "event",
        turn: e.turn,
        node: (
          <div
            key={`e-${combined.length}`}
            className="border-l-2 border-yellow-600/30 pl-3 py-1 text-xs"
          >
            <div className="flex items-center gap-2 text-yellow-500/60 mb-1">
              <span className="font-mono text-[10px]">#{e.turn}</span>
              {e.eventTitle && (
                <span className="text-[10px]">{e.eventTitle}</span>
              )}
            </div>
            <div className="text-yellow-300/60 leading-relaxed">
              {e.description}
            </div>
          </div>
        ),
      });
    }
  }

  return (
    <div className="space-y-1">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-2">
        回合日志
      </h3>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {combined.map((item) => item.node)}
      </div>
      {combined.length === 0 && (
        <div className="text-han-gold/30 text-xs text-center py-4">
          暂无记录
        </div>
      )}
    </div>
  );
}
