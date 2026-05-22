import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import { SCENES, getSceneNarrative } from "../game/scenes";
import { CHARACTERS } from "../game/characters";
import { DEFAULT_AI_PLAY_MODE } from "../ai/aiMode";
import { CharacterPanel } from "./CharacterPanel";
import { StatPanel } from "./StatPanel";
import { ChoicePanel } from "./ChoicePanel";
import { HistoryLog } from "./HistoryLog";
import { FreeInputBox } from "./FreeInputBox";
import { ReactionPanel } from "./ReactionPanel";
import type { PlayerActionAnalysis, CharacterReaction } from "../ai/types";

export function CourtScreen() {
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const stats = useGameStore((s) => s.stats);
  const turn = useGameStore((s) => s.turn);
  const history = useGameStore((s) => s.history);
  const eventLog = useGameStore((s) => s.eventLog);
  const makeChoice = useGameStore((s) => s.makeChoice);
  const makeFreeInput = useGameStore((s) => s.makeFreeInput);

  const [freeInputLoading, setFreeInputLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<PlayerActionAnalysis | null>(null);
  const [lastReactions, setLastReactions] = useState<CharacterReaction[]>([]);
  const [lastFreeInput, setLastFreeInput] = useState("");

  // AI 模式（当前使用默认值，后续可改为动态切换）
  const aiMode = DEFAULT_AI_PLAY_MODE;

  const scene = SCENES[currentSceneId];
  if (!scene) {
    return (
      <div className="min-h-screen bg-han-ink flex items-center justify-center text-han-gold/60">
        场景数据丢失 (sceneId: {currentSceneId})
      </div>
    );
  }

  const sceneCharacters = scene.characterIds
    .map((id) => CHARACTERS[id])
    .filter((c): c is NonNullable<typeof c> => c != null);

  const narrative = getSceneNarrative(currentSceneId, stats);

  const handleFreeInput = async (input: string) => {
    setFreeInputLoading(true);
    try {
      await makeFreeInput(input);
      const newLog = useGameStore.getState().aiLog;
      const latest = newLog[newLog.length - 1];
      if (latest) {
        setLastAnalysis(latest.analysis);
        setLastReactions(latest.reactions);
        setLastFreeInput(latest.input);
      }
    } finally {
      setFreeInputLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-han-ink via-[#1e1e1e] to-han-ink text-han-gold">
      <header className="border-b border-han-gold/10 px-4 md:px-8 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-han-gold/80 font-bold tracking-wider text-sm md:text-base">
            {scene.title}
          </span>
          <span className="text-han-gold/30 text-xs font-mono">
            第 {turn} 回合
          </span>
        </div>
        <div className="text-han-gold/30 text-xs">
          持节出塞 · 汉使
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="lg:w-56 shrink-0 order-3 lg:order-1">
            <CharacterPanel characters={sceneCharacters} />
          </aside>

          <section className="flex-1 order-1 lg:order-2 space-y-6">
            <div
              className="p-4 md:p-6 rounded border border-han-gold/15 bg-black/20
                          text-han-gold/85 text-sm leading-relaxed whitespace-pre-line
                          min-h-[160px] font-han"
            >
              {narrative}
            </div>

            <ChoicePanel
              choices={scene.choices}
              stats={stats}
              onChoose={makeChoice}
            />

            {/* Phase 3.1: Free input with AI mode */}
            <FreeInputBox
              loading={freeInputLoading}
              aiMode={aiMode}
              onSubmit={handleFreeInput}
            />

            {(lastAnalysis || lastReactions.length > 0) && (
              <ReactionPanel
                analysis={lastAnalysis}
                reactions={lastReactions}
                lastInput={lastFreeInput}
              />
            )}
          </section>

          <aside className="lg:w-56 shrink-0 order-2 lg:order-3 space-y-6">
            <StatPanel stats={stats} />
            <HistoryLog history={history} eventLog={eventLog} />
          </aside>
        </div>
      </main>
    </div>
  );
}
