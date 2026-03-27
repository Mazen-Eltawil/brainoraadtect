import { useState, useCallback } from "react";
import { GameStage, GameSession, ResponseLog, PuzzleRunLog, STAGE_ORDER } from "@/types/game";

const createSession = (): GameSession => ({
  playerId: "",
  startTime: new Date().toISOString(),
  responses: [],
  puzzleRun: null,
  reorderingAnswer: null,
  reorderingCorrect: false,
  learningLog: [],
});

export function useGameState() {
  const [stage, setStage] = useState<GameStage>("onboarding");
  const [session, setSession] = useState<GameSession | null>(null);

  const startGame = useCallback(() => {
    setSession(createSession());
    // Skip learning and short_term — now handled together by LearningWithTest
    // The flow after onboarding goes straight to "learning" which internally
    // handles both learning + short-term per clip
    setStage("learning");
  }, []);

  const nextStage = useCallback(() => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (stage === "learning") {
      // After LearningWithTest completes (learn+test for all clips),
      // skip short_term and go directly to reordering
      setStage("reordering");
      return;
    }
    if (idx < STAGE_ORDER.length - 1) {
      let next = STAGE_ORDER[idx + 1];
      // Skip short_term since it's merged into learning
      if (next === "short_term") {
        next = STAGE_ORDER[idx + 2];
      }
      setStage(next);
    }
  }, [stage]);

  const addResponse = useCallback((response: ResponseLog) => {
    setSession(prev => prev ? { ...prev, responses: [...prev.responses, response] } : prev);
  }, []);

  const setPuzzleRun = useCallback((run: PuzzleRunLog) => {
    setSession(prev => prev ? { ...prev, puzzleRun: run } : prev);
  }, []);

  const setReorderingResult = useCallback((answer: string, correct: boolean) => {
    setSession(prev => prev ? { ...prev, reorderingAnswer: answer, reorderingCorrect: correct } : prev);
  }, []);

  const addLearningLog = useCallback((clip: string, rep: number, completed: boolean) => {
    setSession(prev => prev ? {
      ...prev,
      learningLog: [...prev.learningLog, { clip, rep, completed, timestamp: new Date().toISOString() }],
    } : prev);
  }, []);

  const resetGame = useCallback(() => {
    setStage("onboarding");
    setSession(null);
  }, []);

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const totalStages = STAGE_ORDER.length - 1;

  return {
    stage, session, stageIndex, totalStages,
    startGame, nextStage, addResponse, setPuzzleRun,
    setReorderingResult, addLearningLog, resetGame,
  };
}
