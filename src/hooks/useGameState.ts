import { useState, useCallback } from "react";
import { GameStage, GameSession, ResponseLog, PuzzleRunLog, STAGE_ORDER } from "@/types/game";

const createSession = (): GameSession => ({
  playerId: "",
  startTime: new Date().toISOString(),
  responses: [],
  puzzleRuns: [],
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
    setStage("learning");
  }, []);

  const nextStage = useCallback(() => {
    const idx = STAGE_ORDER.indexOf(stage);
    if (stage === "learning") {
      setStage("reordering");
      return;
    }
    if (idx < STAGE_ORDER.length - 1) {
      let next = STAGE_ORDER[idx + 1];
      if (next === "short_term") {
        next = STAGE_ORDER[idx + 2];
      }
      setStage(next);
    }
  }, [stage]);

  const addResponse = useCallback((response: ResponseLog) => {
    setSession(prev => prev ? { ...prev, responses: [...prev.responses, response] } : prev);
  }, []);

  const setPuzzleRuns = useCallback((runs: PuzzleRunLog[]) => {
    setSession(prev => prev ? { ...prev, puzzleRuns: runs, puzzleRun: runs[runs.length - 1] || null } : prev);
  }, []);

  // Legacy compat
  const setPuzzleRun = useCallback((run: PuzzleRunLog) => {
    setSession(prev => prev ? { ...prev, puzzleRun: run, puzzleRuns: [run] } : prev);
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
    startGame, nextStage, addResponse, setPuzzleRun, setPuzzleRuns,
    setReorderingResult, addLearningLog, resetGame,
  };
}
