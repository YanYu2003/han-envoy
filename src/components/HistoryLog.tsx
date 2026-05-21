import type { HistoryEntry } from "../game/types";

interface Props {
  history: HistoryEntry[];
}

export function HistoryLog({ history }: Props) {
  if (history.length === 0) return null;

  return (
    <div className="space-y-1">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-2">
        回合日志
      </h3>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
        {history.map((entry, i) => (
          <div
            key={i}
            className="border-l-2 border-han-gold/20 pl-3 py-1 text-xs"
          >
            <div className="flex items-center gap-2 text-han-gold/50 mb-1">
              <span className="font-mono text-[10px]">#{entry.turn}</span>
              <span className="text-[10px]">{entry.sceneTitle}</span>
            </div>
            <div className="text-han-gold/80 font-medium mb-0.5">
              【{entry.choiceLabel}】
            </div>
            <div className="text-han-gold/60 leading-relaxed mb-0.5">
              {entry.resultText}
            </div>
            {entry.statChangesSummary && (
              <div className="text-[10px] text-han-gold/40 font-mono mt-1">
                {entry.statChangesSummary}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
