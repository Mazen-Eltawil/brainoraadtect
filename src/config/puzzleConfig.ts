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

// Swapped: old stage 2 is now stage 1, old stage 1 is now stage 2
export const PUZZLE_STAGES: PuzzleConfig[] = [
  // Stage 1 (was stage 2): crabs at (0,0) and (1,1)
  {
    grid: [
      ["crab", "empty", "chest"],
      ["empty", "crab", "empty"],
      ["start", "empty", "key"],
    ],
    startPos: [2, 0],
    chestPos: [0, 2],
    keyPos: [2, 2],
  },
  // Stage 2 (was stage 1): crabs at (0,1) and (2,1)
  {
    grid: [
      ["empty", "crab", "chest"],
      ["empty", "empty", "empty"],
      ["start", "crab", "key"],
    ],
    startPos: [2, 0],
    chestPos: [0, 2],
    keyPos: [2, 2],
  },
  // Stage 3: crabs at (1,0), (0,1), and (2,1) — hardest, 3 crabs
  {
    grid: [
      ["empty", "crab", "chest"],
      ["crab", "empty", "empty"],
      ["start", "crab", "key"],
    ],
    startPos: [2, 0],
    chestPos: [0, 2],
    keyPos: [2, 2],
  },
];

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
  { label: "g", sequence: [1, 5, 3, 2, 6, 4] },
  { label: "h", sequence: [3, 6, 2, 4, 5, 1] },
  { label: "i", sequence: [3, 2, 5, 1, 6, 4] },
  { label: "j", sequence: [6, 1, 4, 5, 3, 2] },
  { label: "k", sequence: [6, 2, 5, 3, 1, 4] },
  { label: "l", sequence: [6, 3, 1, 4, 2, 5] },
];

export const CORRECT_REORDERING = "g";

