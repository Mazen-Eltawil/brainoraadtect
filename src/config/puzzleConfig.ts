export const PUZZLE_ASSETS = {
  start: "/images/start.png",
  crab: "/images/crab.png",
  chest: "/images/chest.png",
  key: "/images/key.png",
};

export type TileType = "empty" | "crab" | "chest" | "key" | "start";

export interface Tile {
  type: TileType;
  row: number;
  col: number;
}

// 3 puzzle configurations with increasing difficulty
export interface PuzzleConfig {
  grid: TileType[][];
  startPos: [number, number];
  chestPos: [number, number];
  keyPos: [number, number];
}

// Pool of puzzle variants — randomly sampled per session for variety.
// Each grid is solvable: a path exists from start -> key -> chest avoiding crabs.
// Difficulty buckets: easy (1 crab), medium (2 crabs), hard (3 crabs).
export const PUZZLE_VARIANTS_EASY: PuzzleConfig[] = [
  {
    grid: [
      ["empty", "empty", "chest"],
      ["empty", "crab", "empty"],
      ["start", "empty", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [2, 2],
  },
  {
    grid: [
      ["key", "empty", "chest"],
      ["empty", "crab", "empty"],
      ["start", "empty", "empty"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [0, 0],
  },
  {
    grid: [
      ["chest", "empty", "key"],
      ["empty", "crab", "empty"],
      ["start", "empty", "empty"],
    ],
    startPos: [2, 0], chestPos: [0, 0], keyPos: [0, 2],
  },
];

export const PUZZLE_VARIANTS_MEDIUM: PuzzleConfig[] = [
  {
    grid: [
      ["crab", "empty", "chest"],
      ["empty", "crab", "empty"],
      ["start", "empty", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [2, 2],
  },
  {
    grid: [
      ["empty", "crab", "chest"],
      ["empty", "empty", "empty"],
      ["start", "crab", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [2, 2],
  },
  {
    grid: [
      ["chest", "empty", "empty"],
      ["crab", "empty", "crab"],
      ["start", "empty", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 0], keyPos: [2, 2],
  },
  {
    grid: [
      ["key", "empty", "crab"],
      ["empty", "empty", "empty"],
      ["start", "crab", "chest"],
    ],
    startPos: [2, 0], chestPos: [2, 2], keyPos: [0, 0],
  },
];

export const PUZZLE_VARIANTS_HARD: PuzzleConfig[] = [
  {
    grid: [
      ["empty", "crab", "chest"],
      ["crab", "empty", "empty"],
      ["start", "crab", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [2, 2],
  },
  {
    grid: [
      ["chest", "crab", "empty"],
      ["empty", "empty", "crab"],
      ["start", "crab", "key"],
    ],
    startPos: [2, 0], chestPos: [0, 0], keyPos: [2, 2],
  },
  {
    grid: [
      ["key", "crab", "chest"],
      ["empty", "empty", "crab"],
      ["start", "crab", "empty"],
    ],
    startPos: [2, 0], chestPos: [0, 2], keyPos: [0, 0],
  },
  {
    grid: [
      ["empty", "crab", "key"],
      ["crab", "empty", "empty"],
      ["start", "crab", "chest"],
    ],
    startPos: [2, 0], chestPos: [2, 2], keyPos: [0, 2],
  },
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Builds a fresh shuffled set of 3 stages (easy -> medium -> hard) per call.
export function generatePuzzleStages(): PuzzleConfig[] {
  return [
    pickRandom(PUZZLE_VARIANTS_EASY),
    pickRandom(PUZZLE_VARIANTS_MEDIUM),
    pickRandom(PUZZLE_VARIANTS_HARD),
  ];
}

// Default static set kept for backward-compat imports (legacy).
export const PUZZLE_STAGES: PuzzleConfig[] = generatePuzzleStages();

// Legacy exports for backward compat
export const GRID_MAP = PUZZLE_STAGES[0].grid;
export const START_POS = PUZZLE_STAGES[0].startPos;
export const CHEST_POS = PUZZLE_STAGES[0].chestPos;
export const KEY_POS = PUZZLE_STAGES[0].keyPos;

export const REORDERING_OPTIONS = [
  { label: "a", sequence: [1, 6, 3, 5, 4, 2] },
  { label: "b", sequence: [1, 2, 6, 4, 5, 3] },
  { label: "c", sequence: [2, 6, 1, 5, 3, 4] },
  { label: "d", sequence: [2, 3, 6, 4, 1, 5] },
  { label: "e", sequence: [2, 1, 5, 6, 4, 3] },
  { label: "f", sequence: [3, 1, 6, 5, 4, 2] },
  { label: "g", sequence: [1, 3, 6, 4, 5, 2] },
  { label: "h", sequence: [3, 6, 2, 4, 5, 1] },
  { label: "i", sequence: [3, 2, 5, 1, 6, 4] },
  { label: "j", sequence: [6, 1, 4, 5, 3, 2] },
  { label: "k", sequence: [6, 2, 5, 3, 1, 4] },
  { label: "l", sequence: [6, 3, 1, 4, 2, 5] },
];

export const CORRECT_REORDERING = "g";

