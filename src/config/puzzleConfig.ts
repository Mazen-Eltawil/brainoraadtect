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

export const GRID_MAP: TileType[][] = [
  ["empty", "crab", "chest"],
  ["empty", "empty", "empty"],
  ["start", "crab", "key"],
];

export const START_POS: [number, number] = [2, 0];
export const CHEST_POS: [number, number] = [0, 2];
export const KEY_POS: [number, number] = [2, 2];

export const SAFE_SAND_TILES: [number, number][] = [
  [1, 0],
  [1, 1],
  [1, 2],
];

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
