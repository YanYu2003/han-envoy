import { useGameStore } from "../store/gameStore";
import { SCENES } from "../game/scenes";
import { CHARACTERS } from "../game/characters";
import { CharacterPanel } from "./CharacterPanel";
import { StatPanel } from "./StatPanel";
import { ChoicePanel } from "./ChoicePanel";
import { HistoryLog } from "./HistoryLog";

export function CourtScreen() {
  const currentSceneId = useGameStore((s) => s.currentSceneId);
  const stats = useGameStore((s) => s.stats);
  const turn = useGameStore((s) => s.turn);
  const history = useGameStore((s) => s.history);
  const makeChoice = useGameStore((s) => s.makeChoice);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-han-ink via-[#1e1e1e] to-han-ink text-han-gold">
      {/* Top bar：场景标题 + 回合数 */}
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

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left sidebar：角色面板 */}
          <aside className="lg:w-56 shrink-0 order-3 lg:order-1">
            <CharacterPanel characters={sceneCharacters} />
          </aside>

          {/* Center：叙事 + 选择 */}
          <section className="flex-1 order-1 lg:order-2 space-y-6">
            {/* Narrative */}
            <div
              className="p-4 md:p-6 rounded border border-han-gold/15 bg-black/20
                          text-han-gold/85 text-sm leading-relaxed whitespace-pre-line
                          min-h-[160px] font-han"
            >
              {scene.narrative}
            </div>

            {/* Choices */}
            <ChoicePanel
              choices={scene.choices}
              onChoose={makeChoice}
            />
          </section>

          {/* Right sidebar：参数面板 */}
          <aside className="lg:w-56 shrink-0 order-2 lg:order-3 space-y-6">
            <StatPanel stats={stats} />
            <HistoryLog history={history} />
          </aside>
        </div>
      </main>
    </div>
  );
}
