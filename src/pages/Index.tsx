import TopBar from "@/components/game/TopBar";
import Onboarding from "@/components/game/Onboarding";
import LearningStage from "@/components/game/LearningStage";
import ShortTermMemory from "@/components/game/ShortTermMemory";
import ReorderingStage from "@/components/game/ReorderingStage";
import PuzzleStage from "@/components/game/PuzzleStage";
import LongTermMemory from "@/components/game/LongTermMemory";
import ResultsScreen from "@/components/game/ResultsScreen";
import { useGameState } from "@/hooks/useGameState";

const Index = () => {
  const {
    stage, session, stageIndex, totalStages,
    startGame, nextStage, addResponse, setPuzzleRun,
    setReorderingResult, addLearningLog,
  } = useGameState();

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        stage={stage}
        playerId={session?.playerId ?? null}
        stageIndex={stageIndex}
        totalStages={totalStages}
      />
      <main className="mx-auto max-w-6xl">
        {stage === "onboarding" && <Onboarding onStart={startGame} />}
        {stage === "learning" && (
          <LearningStage onComplete={nextStage} onLog={addLearningLog} />
        )}
        {stage === "short_term" && (
          <ShortTermMemory onComplete={nextStage} onLogResponse={addResponse} />
        )}
        {stage === "reordering" && (
          <ReorderingStage onComplete={nextStage} onResult={setReorderingResult} />
        )}
        {stage === "puzzle" && (
          <PuzzleStage onComplete={nextStage} onResult={setPuzzleRun} />
        )}
        {stage === "long_term" && (
          <LongTermMemory onComplete={nextStage} onLogResponse={addResponse} />
        )}
        {stage === "results" && session && <ResultsScreen session={session} />}
      </main>
    </div>
  );
};

export default Index;
