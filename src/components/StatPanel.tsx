import type { GameStats } from "../game/types";

interface Props {
  stats: GameStats;
}

const STAT_CONFIG: { key: keyof GameStats; label: string; color: string }[] = [
  { key: "hanPrestige", label: "汉威", color: "bg-han-gold" },
  { key: "xiongnuPressure", label: "胡压", color: "bg-red-600" },
  { key: "kingAnger", label: "王怒", color: "bg-orange-600" },
  { key: "kingFear", label: "王惧", color: "bg-yellow-600" },
  { key: "proHan", label: "亲汉", color: "bg-green-600" },
  { key: "proXiongnu", label: "亲胡", color: "bg-red-800" },
  { key: "tradeAccess", label: "商道", color: "bg-cyan-700" },
  { key: "casusBelli", label: "兵衅", color: "bg-rose-700" },
  { key: "envoyHonor", label: "名节", color: "bg-purple-600" },
  { key: "historianScore", label: "史评", color: "bg-blue-700" },
];

export function StatPanel({ stats }: Props) {
  return (
    <div className="space-y-1.5">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-2">
        外交参数
      </h3>
      {STAT_CONFIG.map(({ key, label, color }) => {
        const value = stats[key];
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <span className="w-8 text-han-gold/70 text-right shrink-0">
              {label}
            </span>
            <div className="flex-1 h-2 bg-black/40 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${value}%` }}
              />
            </div>
            <span className="w-7 text-han-gold/80 text-right font-mono">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
