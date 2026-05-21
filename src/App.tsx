import { useGameStore } from "./store/gameStore";
import { StartScreen } from "./components/StartScreen";
import { CourtScreen } from "./components/CourtScreen";
import { EndingScreen } from "./components/EndingScreen";

function App() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case "start":
      return <StartScreen />;
    case "court":
      return <CourtScreen />;
    case "ending":
      return <EndingScreen />;
    default:
      return <StartScreen />;
  }
}

export default App;
