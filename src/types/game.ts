export type GameStage = 
  | "onboarding"
  | "learning"
  | "short_term"
  | "reordering"
  | "puzzle"
  | "long_term"
  | "results";

export const STAGE_LABELS: Record<GameStage, string> = {
  onboarding: "Welcome",
  learning: "Learning Phase",
  short_term: "Short-Term Memory",
  reordering: "Reordering Task",
  puzzle: "Puzzle Stage",
  long_term: "Long-Term Memory",
  results: "Results",
};

export const STAGE_ORDER: GameStage[] = [
  "onboarding",
  "learning",
  "short_term",
  "reordering",
  "puzzle",
  "long_term",
  "results",
];

export interface ResponseLog {
  stage: GameStage;
  target: string;
  selected: string;
  isCorrect: boolean;
  responseTimeMs: number;
  timestamp: string;
}

export interface PuzzleRunLog {
  path: [number, number][];
  success: boolean;
  reason: string;
  durationMs: number;
}

export interface GameSession {
  playerId: string;
  startTime: string;
  responses: ResponseLog[];
  puzzleRun: PuzzleRunLog | null;
  reorderingAnswer: string | null;
  reorderingCorrect: boolean;
  learningLog: { clip: string; rep: number; completed: boolean; timestamp: string }[];
}
