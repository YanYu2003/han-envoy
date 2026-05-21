import { useGameStore } from "../store/gameStore";

export function StartScreen() {
  const startGame = useGameStore((s) => s.startGame);

  return (
    <div className="min-h-screen bg-gradient-to-b from-han-ink via-[#1a1a1a] to-han-ink flex flex-col items-center justify-center px-4">
      {/* Title */}
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-[0.3em] text-han-gold">
          汉使
        </h1>
        <p className="text-2xl md:text-3xl italic tracking-[0.2em] text-han-gold/80">
          Han Envoy
        </p>
      </div>

      {/* Divider */}
      <div className="w-32 h-px bg-gradient-to-r from-transparent via-han-gold/60 to-transparent my-8" />

      {/* Tagline */}
      <p className="text-lg md:text-xl text-han-gold/70 text-center max-w-lg leading-relaxed font-han italic">
        「持节入胡庭，一言动西域。」
      </p>

      {/* Description */}
      <div className="mt-8 max-w-xl text-center text-han-gold/60 text-sm leading-relaxed space-y-3">
        <p>
          大汉天子遣使西域，持节入楼兰王庭。
          面对摇摆的国王、敌视的亲匈奴大臣、暗助的亲汉势力、
          表面中立的通译——你的一言一行，皆系国运。
        </p>
        <p>
          威慑、谈判、羞辱、离间、刺杀、殉国……
          棋局已开，阁下如何落子？
        </p>
      </div>

      {/* Start Button */}
      <button
        onClick={startGame}
        className="mt-12 px-10 py-3 border border-han-gold/50 text-han-gold 
                   tracking-widest text-lg hover:bg-han-gold/10 hover:border-han-gold
                   transition-all duration-300 font-han"
      >
        开始出使
      </button>

      {/* Phase Badge */}
      <span className="mt-16 px-3 py-1 border border-han-gold/20 text-han-gold/40 text-xs tracking-widest">
        — Phase 1 Static Prototype —
      </span>
    </div>
  );
}
