import type { Choice } from "../game/types";

interface Props {
  choices: Choice[];
  onChoose: (choiceId: string) => void;
}

export function ChoicePanel({ choices, onChoose }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-han-gold/60 text-xs tracking-widest uppercase mb-1">
        你的抉择
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {choices.map((choice) => (
          <button
            key={choice.id}
            onClick={() => onChoose(choice.id)}
            className="text-left p-4 rounded border border-han-gold/30 bg-black/30
                       hover:bg-han-gold/10 hover:border-han-gold/60
                       transition-all duration-200 group"
          >
            <div className="text-han-gold font-bold text-sm mb-1 group-hover:text-han-gold/90">
              【{choice.label}】
            </div>
            <div className="text-han-gold/60 text-xs leading-relaxed">
              {choice.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
