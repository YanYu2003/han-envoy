import type { Choice, GameStats } from "../game/types";

interface Props {
  choices: Choice[];
  stats: GameStats;
  onChoose: (choiceId: string) => void;
}

export function ChoicePanel({ choices, stats, onChoose }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-1">
        你的抉择
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {choices.map((choice) => {
          const enabled = !choice.condition || choice.condition(stats);
          const isHighRisk = choice.riskLevel && choice.riskLevel >= 4;

          return (
            <button
              key={choice.id}
              disabled={!enabled}
              onClick={() => enabled && onChoose(choice.id)}
              className={`
                text-left p-4 rounded border transition-all duration-200 group
                ${
                  enabled
                    ? "border-han-gold/30 bg-black/30 hover:bg-han-gold/10 hover:border-han-gold/60 cursor-pointer"
                    : "border-gray-700/30 bg-black/10 cursor-not-allowed opacity-50"
                }
              `}
            >
              {/* Label row */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`font-bold text-sm ${
                    enabled
                      ? "text-han-gold group-hover:text-han-gold/90"
                      : "text-gray-500"
                  }`}
                >
                  【{choice.label}】
                </span>

                {/* High-risk badge */}
                {isHighRisk && enabled && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/40 text-red-300 border border-red-800/50">
                    高风险
                  </span>
                )}
              </div>

              {/* Description */}
              <div
                className={`text-xs leading-relaxed ${
                  enabled ? "text-han-gold/60" : "text-gray-600"
                }`}
              >
                {choice.description}
              </div>

              {/* Disabled reason */}
              {!enabled && choice.disabledReason && (
                <div className="mt-2 text-[10px] text-gray-500 italic">
                  ⛔ {choice.disabledReason}
                </div>
              )}

              {/* Risk level indicator for non-high-risk */}
              {choice.riskLevel && choice.riskLevel >= 2 && enabled && (
                <div className="mt-1.5 text-[10px] text-han-gold/30">
                  {"✦".repeat(choice.riskLevel)}
                  {"✧".repeat(5 - choice.riskLevel)}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
