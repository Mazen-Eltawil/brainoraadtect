import { lazy, Suspense } from "react";
import TopBar from "@/components/game/TopBar";
import Onboarding from "@/components/game/Onboarding";
import { useGameState } from "@/hooks/useGameState";

const LearningStage = lazy(() => import("@/components/game/LearningStage"));
const ShortTermMemory = lazy(() => import("@/components/game/ShortTermMemory"));
const ReorderingStage = lazy(() => import("@/components/game/ReorderingStage"));
const PuzzleStage = lazy(() => import("@/components/game/PuzzleStage"));
const LongTermMemory = lazy(() => import("@/components/game/LongTermMemory"));
const ResultsScreen = lazy(() => import("@/components/game/ResultsScreen"));

const Index = () => {
  const {
    stage,
    session,
    stageIndex,
    totalStages,
    startGame,
    nextStage,
    addResponse,
    setPuzzleRun,
    setReorderingResult,
    addLearningLog,
  } = useGameState();

  const renderStage = () => {
    if (stage === "onboarding") {
      return <Onboarding onStart={startGame} />;
    }

    return (
      <Suspense fallback={null}>
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
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar
        stage={stage}
        playerId={session?.playerId ?? null}
        stageIndex={stageIndex}
        totalStages={totalStages}
      />
      <main className="mx-auto max-w-6xl">{renderStage()}</main>
    </div>
  );
};

export default Index;
