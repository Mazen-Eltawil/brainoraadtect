import { useReducer, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PUZZLE_ASSETS, GRID_MAP, START_POS, CHEST_POS, KEY_POS, SAFE_SAND_TILES, TileType } from "@/config/puzzleConfig";
import { PuzzleRunLog } from "@/types/game";

interface Props {
  onComplete: () => void;
  onResult: (run: PuzzleRunLog) => void;
}

type PuzzleStatus = "idle" | "playing" | "success" | "fail_crab" | "fail_no_key" | "fail_incomplete";

interface PuzzleState {
  currentPos: [number, number] | null;
  path: [number, number][];
  hasKey: boolean;
  status: PuzzleStatus;
}

type PuzzleAction =
  | { type: "START" }
  | { type: "MOVE"; pos: [number, number] }
  | { type: "RESET" };

function posEq(a: [number, number], b: [number, number]) {
  return a[0] === b[0] && a[1] === b[1];
}

function isAdjacent(a: [number, number], b: [number, number]) {
  const dr = Math.abs(b[0] - a[0]);
  const dc = Math.abs(b[1] - a[1]);

  return (dr !== 0 || dc !== 0) && dr <= 1 && dc <= 1;
}

function reducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
  switch (action.type) {
    case "START":
      return { currentPos: START_POS, path: [START_POS], hasKey: false, status: "playing" };
    case "RESET":
      return { currentPos: null, path: [], hasKey: false, status: "idle" };
    case "MOVE": {
      if (state.status !== "playing" || !state.currentPos) return state;
      const pos = action.pos;
      
      if (!isAdjacent(state.currentPos, pos)) return state;
      if (state.path.some(p => posEq(p, pos))) return state;

      const tileType = GRID_MAP[pos[0]][pos[1]];
      const newPath = [...state.path, pos];
      
      if (tileType === "crab") {
        return { ...state, path: newPath, currentPos: pos, status: "fail_crab" };
      }

      const newHasKey = state.hasKey || posEq(pos, KEY_POS);

      if (tileType === "chest") {
        if (!newHasKey) {
          return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey, status: "fail_no_key" };
        }
        const visitedSand = SAFE_SAND_TILES.every(st => newPath.some(p => posEq(p, st)));
        if (!visitedSand) {
          return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey, status: "fail_incomplete" };
        }
        return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey, status: "success" };
      }

      return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey };
    }
    default:
      return state;
  }
}

const TILE_IMAGES: Partial<Record<TileType, string>> = {
  start: PUZZLE_ASSETS.start,
  crab: PUZZLE_ASSETS.crab,
  chest: PUZZLE_ASSETS.chest,
  key: PUZZLE_ASSETS.key,
};

export default function PuzzleStage({ onComplete, onResult }: Props) {
  const [state, dispatch] = useReducer(reducer, {
    currentPos: null,
    path: [],
    hasKey: false,
    status: "idle",
  });
  const startTimeRef = useRef(Date.now());

  const handleTileClick = useCallback((row: number, col: number) => {
    if (state.status === "idle" && row === START_POS[0] && col === START_POS[1]) {
      startTimeRef.current = Date.now();
      dispatch({ type: "START" });
      return;
    }
    dispatch({ type: "MOVE", pos: [row, col] });
  }, [state.status]);

  const handleFinish = useCallback(() => {
    const run: PuzzleRunLog = {
      path: state.path,
      success: state.status === "success",
      reason: state.status === "success" ? "completed" : state.status,
      durationMs: Date.now() - startTimeRef.current,
    };
    onResult(run);
    onComplete();
  }, [state, onComplete, onResult]);

  const handleRetry = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  const isFinished = ["success", "fail_crab", "fail_no_key", "fail_incomplete"].includes(state.status);
  const visitedSandCount = SAFE_SAND_TILES.filter(st => state.path.some(p => posEq(p, st))).length;

  const statusMessages: Record<string, string> = {
    idle: "Click the START tile to begin.",
    playing: "Navigate to the treasure chest!",
    success: "🎉 Congratulations! Puzzle completed successfully!",
    fail_crab: "🦀 You stepped on a crab. Puzzle failed.",
    fail_no_key: "🔒 Chest is locked — you did not collect the key.",
    fail_incomplete: "⚠️ You haven't visited all sand tiles yet.",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
        {/* Grid */}
        <div className="flex flex-col items-center">
          <div
            className="grid grid-cols-3 grid-rows-3 gap-1 rounded-xl p-4"
            style={{
              width: 450,
              height: 450,
              background: "linear-gradient(135deg, hsl(40, 30%, 90%), hsl(40, 20%, 85%))",
            }}
          >
            {GRID_MAP.flatMap((row, r) =>
              row.map((tileType, c) => {
                const isVisited = state.path.some(p => posEq(p, [r, c]));
                const isCurrent = state.currentPos && posEq(state.currentPos, [r, c]);
                const tileImg = TILE_IMAGES[tileType];
                const isClickable =
                  state.status === "idle"
                    ? r === START_POS[0] && c === START_POS[1]
                    : state.status === "playing" && state.currentPos && isAdjacent(state.currentPos, [r, c]) && !isVisited;

                return (
                  <motion.button
                    key={`${r}-${c}`}
                    onClick={() => handleTileClick(r, c)}
                    disabled={!isClickable}
                    whileHover={isClickable ? { scale: 1.02 } : {}}
                    whileTap={isClickable ? { scale: 0.96 } : {}}
                    className={`relative flex items-center justify-center rounded-lg border transition-all ${
                      isCurrent
                        ? "border-primary ring-2 ring-primary/30 bg-primary/10"
                        : isVisited
                        ? "border-border/50 bg-foreground/5 opacity-50"
                        : "border-border/30 bg-surface/80"
                    } ${isClickable ? "cursor-pointer hover:shadow-md" : "cursor-default"}`}
                    style={{ width: 140, height: 140 }}
                    aria-label={`${tileType} tile at Row ${r + 1} Column ${c + 1}`}
                  >
                    {tileImg ? (
                      <img
                        src={tileImg}
                        alt={tileType}
                        className="h-20 w-20 object-contain"
                      />
                    ) : (
                      <div className="h-full w-full rounded-lg" style={{ background: "hsl(40, 25%, 88%)" }} />
                    )}
                    {isVisited && !isCurrent && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/10">
                        <span className="text-xs font-bold text-muted-foreground">
                          {state.path.findIndex(p => posEq(p, [r, c])) + 1}
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
          {/* Path line SVG overlay */}
          {state.path.length > 1 && (
            <svg
              className="pointer-events-none absolute"
              style={{ width: 450, height: 450 }}
              viewBox="0 0 450 450"
            >
              <polyline
                points={state.path.map(([r, c]) => `${c * 148 + 86},${r * 148 + 86}`).join(" ")}
                fill="none"
                stroke="hsl(210, 100%, 45%)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.5"
              />
            </svg>
          )}
        </div>

        {/* Rules & Status */}
        <div className="w-72 space-y-4">
          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">Rules</h3>
            <ul className="space-y-1.5 text-sm leading-relaxed text-foreground">
              <li>• Start on the START tile</li>
              <li>• Move up, left, or right only</li>
              <li>• No revisiting tiles</li>
              <li>• Visit all sand tiles</li>
              <li>• Avoid crabs 🦀</li>
              <li>• Collect the key before the chest</li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4 shadow-sm space-y-2">
            <p className="text-sm text-muted-foreground">
              Sand tiles: <strong className="text-foreground">{visitedSandCount}/{SAFE_SAND_TILES.length}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Key: <strong className="text-foreground">{state.hasKey ? "✅ Collected" : "❌ Not collected"}</strong>
            </p>
            <p className="text-sm font-medium text-foreground">{statusMessages[state.status]}</p>
          </div>

          {isFinished && (
            <div className="flex gap-2">
              <Button onClick={handleRetry} variant="outline" className="flex-1">
                Retry
              </Button>
              <Button onClick={handleFinish} className="flex-1">
                Continue
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
