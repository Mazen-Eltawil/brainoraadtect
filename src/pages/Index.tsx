import { lazy, Suspense, useState } from "react";
import TopBar from "@/components/game/TopBar";
import Onboarding from "@/components/game/Onboarding";
import { useGameState } from "@/hooks/useGameState";
import { isArabic, Language } from "@/lib/gameCopy";

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

  const [language, setLanguage] = useState<Language>("en");
  const [isMuted, setIsMuted] = useState(true);

  const renderStage = () => {
    if (stage === "onboarding") {
      return <Onboarding onStart={startGame} language={language} />;
    }

    return (
      <Suspense fallback={null}>
        {stage === "learning" && (
          <LearningStage onComplete={nextStage} onLog={addLearningLog} language={language} isMuted={isMuted} />
        )}
        {stage === "short_term" && (
          <ShortTermMemory onComplete={nextStage} onLogResponse={addResponse} language={language} />
        )}
        {stage === "reordering" && (
          <ReorderingStage onComplete={nextStage} onResult={setReorderingResult} language={language} />
        )}
        {stage === "puzzle" && (
          <PuzzleStage onComplete={nextStage} onResult={setPuzzleRun} language={language} />
        )}
        {stage === "long_term" && (
          <LongTermMemory onComplete={nextStage} onLogResponse={addResponse} language={language} isMuted={isMuted} />
        )}
        {stage === "results" && session && <ResultsScreen session={session} language={language} />}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic(language) ? "rtl" : "ltr"} lang={language}>
      <TopBar
        stage={stage}
        playerId={session?.playerId ?? null}
        stageIndex={stageIndex}
        totalStages={totalStages}
        language={language}
        onLanguageChange={setLanguage}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((value) => !value)}
      />
      <main className="mx-auto max-w-6xl">{renderStage()}</main>
    </div>
  );
};

export default Index;
