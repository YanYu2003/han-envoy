import type { Character } from "../game/types";

interface Props {
  characters: Character[];
}

export function CharacterPanel({ characters }: Props) {
  const STANCE_COLORS: Record<string, string> = {
    player: "border-han-gold/60 text-han-gold",
    pro_han: "border-green-700/50 text-green-300",
    pro_xiongnu: "border-red-800/50 text-red-300",
    neutral: "border-yellow-700/50 text-yellow-300",
  };

  const AVATAR_BG: Record<string, string> = {
    player: "bg-han-gold/10",
    pro_han: "bg-green-900/30",
    pro_xiongnu: "bg-red-900/30",
    neutral: "bg-yellow-900/30",
  };

  return (
    <div className="space-y-2">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-2">
        朝堂人物
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {characters.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-3 p-2 rounded border ${
              STANCE_COLORS[c.stance]
            } bg-black/20`}
          >
            {/* Avatar */}
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${AVATAR_BG[c.stance]}`}
            >
              {c.avatarText}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold truncate">{c.name}</div>
              <div className="text-[10px] opacity-60 truncate">{c.title}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
