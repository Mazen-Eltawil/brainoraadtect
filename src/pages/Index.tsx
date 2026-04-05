import { lazy, Suspense, useState, useCallback } from "react";
import TopBar from "@/components/game/TopBar";
import Onboarding from "@/components/game/Onboarding";
import { useGameState } from "@/hooks/useGameState";
import { useAuth } from "@/hooks/useAuth";
import { useTheme, Theme } from "@/hooks/useTheme";
import { isArabic, Language } from "@/lib/gameCopy";
import AuthPage from "./AuthPage";
import Dashboard from "./Dashboard";
import ProfilePage from "./ProfilePage";
import AQQuestionnaire from "./AQQuestionnaire";

const LearningWithTest = lazy(() => import("@/components/game/LearningWithTest"));
const ReorderingStage = lazy(() => import("@/components/game/ReorderingStage"));
const PuzzleStage = lazy(() => import("@/components/game/PuzzleStage"));
const LongTermMemory = lazy(() => import("@/components/game/LongTermMemory"));
const ResultsScreen = lazy(() => import("@/components/game/ResultsScreen"));

type AppView = "auth" | "questionnaire" | "dashboard" | "profile" | "game";

const Index = () => {
  const { user, profile, loading, signIn, signUp, signOut, updateProfile, refetchProfile } = useAuth();
  const { theme, setTheme } = useTheme((profile?.theme_preference as Theme) || "system");
  const {
    stage, session, stageIndex, totalStages,
    startGame, nextStage, addResponse, setPuzzleRun, setPuzzleRuns,
    setReorderingResult, addLearningLog, resetGame,
  } = useGameState();

  const [language, setLanguage] = useState<Language>("en");
  const [isMuted, setIsMuted] = useState(true);
  const [view, setView] = useState<AppView>("auth");

  // Determine view based on auth state
  const currentView = !user ? "auth" : view === "auth" ? (profile && !profile.aq_completed ? "questionnaire" : "dashboard") : view;

  const handleThemeChange = useCallback((t: Theme) => {
    setTheme(t);
    if (user) updateProfile({ theme_preference: t });
  }, [user, setTheme, updateProfile]);

  const handleStartGame = useCallback(() => {
    setView("game");
    startGame();
  }, [startGame]);

  const handleGoToDashboard = useCallback(() => {
    resetGame();
    setView("dashboard");
  }, [resetGame]);

  const handleAQComplete = useCallback(() => {
    refetchProfile();
    setView("dashboard");
  }, [refetchProfile]);

  const handleLogout = useCallback(async () => {
    await signOut();
    resetGame();
    setView("auth");
  }, [signOut, resetGame]);

  const topBarStage = currentView === "game" ? stage : currentView as any;

  const renderContent = () => {
    if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /></div>;

    if (currentView === "auth") {
      return <AuthPage language={language} onSignIn={signIn} onSignUp={signUp} />;
    }

    if (currentView === "questionnaire") {
      return <AQQuestionnaire language={language} userId={user!.id} onComplete={handleAQComplete} />;
    }

    if (currentView === "profile") {
      return <ProfilePage language={language} userId={user!.id} email={user!.email || ""} displayName={profile?.display_name} onBack={() => setView("dashboard")} />;
    }

    if (currentView === "dashboard") {
      return <Dashboard language={language} onStartGame={handleStartGame} onViewProfile={() => setView("profile")} />;
    }

    // Game view
    if (stage === "onboarding") {
      return <Onboarding onStart={handleStartGame} language={language} />;
    }

    return (
      <Suspense fallback={null}>
        {stage === "learning" && (
          <LearningWithTest onComplete={nextStage} onLogLearning={addLearningLog} onLogResponse={addResponse} language={language} isMuted={isMuted} />
        )}
        {stage === "reordering" && (
          <ReorderingStage onComplete={nextStage} onResult={setReorderingResult} language={language} />
        )}
        {stage === "puzzle" && (
          <PuzzleStage onComplete={nextStage} onResult={setPuzzleRuns} language={language} />
        )}
        {stage === "long_term" && (
          <LongTermMemory onComplete={nextStage} onLogResponse={addResponse} language={language} isMuted={isMuted} />
        )}
        {stage === "results" && session && (
          <ResultsScreen session={session} language={language} onGoToDashboard={handleGoToDashboard} />
        )}
      </Suspense>
    );
  };

  return (
    <div className="min-h-screen bg-background" dir={isArabic(language) ? "rtl" : "ltr"} lang={language}>
      <TopBar
        stage={topBarStage}
        stageIndex={stageIndex}
        totalStages={totalStages}
        language={language}
        onLanguageChange={setLanguage}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted((v) => !v)}
        theme={theme}
        onThemeChange={handleThemeChange}
        isLoggedIn={!!user}
        onLogout={handleLogout}
      />
      <main className="mx-auto max-w-6xl">{renderContent()}</main>
    </div>
  );
};

export default Index;
