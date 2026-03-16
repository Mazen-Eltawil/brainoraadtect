import { useState, useCallback } from "react";
import { GameStage, GameSession, ResponseLog, PuzzleRunLog, STAGE_ORDER } from "@/types/game";

const createSession = (playerId: string): GameSession => ({
  playerId,
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

  const startGame = useCallback((playerId: string) => {
    setSession(createSession(playerId));
    setStage("learning");
  }, []);

  const nextStage = useCallback(() => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (idx < STAGE_ORDER.length - 1) {
      setStage(STAGE_ORDER[idx + 1]);
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

  const stageIndex = STAGE_ORDER.indexOf(stage);
  const totalStages = STAGE_ORDER.length - 1; // exclude onboarding

  return {
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
  };
}
