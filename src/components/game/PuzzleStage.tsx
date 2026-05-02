import { useReducer, useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { PUZZLE_ASSETS, PUZZLE_STAGES, PuzzleConfig, TileType } from "@/config/puzzleConfig";
import { getAudioSrc } from "@/config/videoConfig";
import { PuzzleRunLog } from "@/types/game";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import StageIntro from "./StageIntro";
import { supabase } from "@/integrations/supabase/client";

interface ClickRecord {
  x: number; // normalized 0-1 within grid
  y: number; // normalized 0-1 within grid
  row: number;
  col: number;
  box_id: string; // e.g. "r2c0"
  tile_type: TileType;
  correct: boolean; // was this a valid/legal move
  t: number; // ms since trial start
}

interface Props {
  onComplete: () => void;
  onResult: (runs: PuzzleRunLog[]) => void;
  language: Language;
}

type PuzzleStatus = "idle" | "playing" | "success" | "fail_crab" | "fail_no_key";

interface PuzzleState {
  currentPos: [number, number] | null;
  path: [number, number][];
  hasKey: boolean;
  status: PuzzleStatus;
}

type PuzzleAction = { type: "START" } | { type: "MOVE"; pos: [number, number] } | { type: "RESET" };

function posEq(a: [number, number], b: [number, number]) { return a[0] === b[0] && a[1] === b[1]; }

function isAdjacent(a: [number, number], b: [number, number]) {
  const dr = Math.abs(b[0] - a[0]);
  const dc = Math.abs(b[1] - a[1]);
  return dr <= 1 && dc <= 1 && (dr + dc > 0);
}

function createReducer(config: PuzzleConfig) {
  return function reducer(state: PuzzleState, action: PuzzleAction): PuzzleState {
    switch (action.type) {
      case "START": return { currentPos: config.startPos, path: [config.startPos], hasKey: false, status: "playing" };
      case "RESET": return { currentPos: null, path: [], hasKey: false, status: "idle" };
      case "MOVE": {
        if (state.status !== "playing" || !state.currentPos) return state;
        const pos = action.pos;
        if (!isAdjacent(state.currentPos, pos)) return state;
        if (state.path.some((p) => posEq(p, pos))) return state;
        const tileType = config.grid[pos[0]][pos[1]];
        const newPath = [...state.path, pos];
        if (tileType === "crab") return { ...state, path: newPath, currentPos: pos, status: "fail_crab" };
        const newHasKey = state.hasKey || posEq(pos, config.keyPos);
        if (tileType === "chest") {
          if (!newHasKey) return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey, status: "fail_no_key" };
          return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey, status: "success" };
        }
        return { ...state, path: newPath, currentPos: pos, hasKey: newHasKey };
      }
      default: return state;
    }
  };
}

const TILE_IMAGES: Partial<Record<TileType, string>> = {
  start: PUZZLE_ASSETS.start, crab: PUZZLE_ASSETS.crab, chest: PUZZLE_ASSETS.chest, key: PUZZLE_ASSETS.key,
};

function calcScore(state: PuzzleState, config: PuzzleConfig): number {
  if (state.status === "success") return 1.0;
  // Partial credit based on path length vs total non-crab tiles
  const totalNonCrab = config.grid.flat().filter(t => t !== "crab").length;
  const visited = state.path.length - 1; // exclude start
  const ratio = Math.min(visited / totalNonCrab, 0.9);
  return Math.round(ratio * 10) / 10;
}

function PuzzleGrid({ config, stageNum, onFinish, language }: {
  config: PuzzleConfig; stageNum: number; onFinish: (run: PuzzleRunLog) => void; language: Language;
}) {
  const reducerFn = useCallback(createReducer(config), [config]);
  const [state, dispatch] = useReducer(reducerFn, { currentPos: null, path: [], hasKey: false, status: "idle" });

  // Auto-reset when config changes (new stage)
  const configRef = useRef(config);
  if (configRef.current !== config) {
    configRef.current = config;
    dispatch({ type: "RESET" });
  }
  const startTimeRef = useRef(Date.now());
  const clicksRef = useRef<ClickRecord[]>([]);

  const recordClick = useCallback((row: number, col: number, isLegal: boolean) => {
    const tileType = config.grid[row][col];
    // Normalized coords: center of tile within 3x3 grid (0-1)
    const x = (col + 0.5) / 3;
    const y = (row + 0.5) / 3;
    clicksRef.current.push({
      x: Math.round(x * 10000) / 10000,
      y: Math.round(y * 10000) / 10000,
      row,
      col,
      box_id: `r${row}c${col}`,
      tile_type: tileType,
      correct: isLegal,
      t: Date.now() - startTimeRef.current,
    });
  }, [config]);

  const handleTileClick = useCallback((row: number, col: number) => {
    if (state.status === "idle" && row === config.startPos[0] && col === config.startPos[1]) {
      startTimeRef.current = Date.now();
      clicksRef.current = [];
      recordClick(row, col, true);
      dispatch({ type: "START" });
      return;
    }
    if (state.status !== "playing" || !state.currentPos) {
      recordClick(row, col, false);
      return;
    }
    const isVisited = state.path.some((p) => posEq(p, [row, col]));
    const isLegal = isAdjacent(state.currentPos, [row, col]) && !isVisited;
    recordClick(row, col, isLegal);
    dispatch({ type: "MOVE", pos: [row, col] });
  }, [state.status, state.currentPos, state.path, config.startPos, recordClick]);

  const handleFinish = useCallback(async () => {
    const score = calcScore(state, config);
    const run: PuzzleRunLog = {
      path: state.path, success: state.status === "success",
      reason: state.status === "success" ? "completed" : state.status,
      durationMs: Date.now() - startTimeRef.current,
      score,
    };

    // Persist motion tracking for this trial
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (email) {
        const trialNumber = stageNum;
        // Count existing rows for this email+trial to make unique id across replays
        const { count } = await supabase
          .from("click_motion_tracking")
          .select("*", { count: "exact", head: true })
          .eq("email", email)
          .eq("trial_number", trialNumber);
        const attempt = (count ?? 0) + 1;
        const id = attempt === 1 ? `${email}${trialNumber}` : `${email}${trialNumber}_${attempt}`;
        const clicks = clicksRef.current;
        const click_coordinates = clicks.map((c) => ({ x: c.x, y: c.y, t: c.t, tile: c.tile_type }));
        const correctness_sequence = clicks.map((c) => (c.correct ? 1 : 0));
        const box_ids = clicks.map((c) => c.box_id);
        const { error } = await supabase.from("click_motion_tracking").insert({
          id,
          email,
          trial_number: trialNumber,
          click_coordinates,
          correctness_sequence,
          box_ids,
          total_clicks: clicks.length,
        } as any);
        if (error) console.error("click_motion_tracking insert error:", error);
        else console.log(`Saved motion tracking for trial ${trialNumber} (${clicks.length} clicks)`);
      }
    } catch (e) {
      console.error("Motion tracking save failed:", e);
    }

    onFinish(run);
  }, [state, config, onFinish, stageNum]);

  const handleRetry = useCallback(() => { dispatch({ type: "RESET" }); }, []);

  const isFinished = ["success", "fail_crab", "fail_no_key"].includes(state.status);

  const statusMessages: Record<PuzzleStatus, string> = {
    idle: t(language, gameCopy.puzzle.status.idle),
    playing: t(language, gameCopy.puzzle.status.playing),
    success: t(language, gameCopy.puzzle.status.success),
    fail_crab: t(language, gameCopy.puzzle.status.fail_crab),
    fail_no_key: t(language, gameCopy.puzzle.status.fail_no_key),
  };

  const lastTileAnim = isFinished && state.currentPos ? state.status : null;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <div className="relative flex flex-col items-center">
        <div className="grid grid-cols-3 grid-rows-3 gap-2 rounded-xl p-4" style={{ width: 460, height: 460, background: "linear-gradient(135deg, hsl(38, 35%, 82%), hsl(34, 28%, 75%))", direction: "ltr" }}>
          {config.grid.flatMap((row, r) =>
            row.map((tileType, c) => {
              const isVisited = state.path.some((p) => posEq(p, [r, c]));
              const isCurrent = state.currentPos && posEq(state.currentPos, [r, c]);
              const tileImg = TILE_IMAGES[tileType];
              const isClickable = state.status === "idle" ? r === config.startPos[0] && c === config.startPos[1] : state.status === "playing" && state.currentPos && isAdjacent(state.currentPos, [r, c]) && !isVisited;
              const isLastFail = lastTileAnim && (lastTileAnim === "fail_crab" || lastTileAnim === "fail_no_key") && isCurrent;
              const isSuccessChest = lastTileAnim === "success" && isCurrent;

              // Sandy tile background with grain texture
              const sandStyle: React.CSSProperties = {
                width: 140,
                height: 140,
                background: `
                  radial-gradient(ellipse at ${30 + (r * 20)}% ${40 + (c * 15)}%, hsl(39, 45%, 82%) 0%, transparent 70%),
                  radial-gradient(ellipse at ${70 - (c * 10)}% ${60 + (r * 10)}%, hsl(36, 38%, 76%) 0%, transparent 60%),
                  linear-gradient(145deg, hsl(40, 42%, 80%) 0%, hsl(37, 35%, 74%) 50%, hsl(35, 30%, 70%) 100%)
                `,
                boxShadow: 'inset 0 1px 3px rgba(255,245,220,0.5), inset 0 -2px 4px rgba(160,130,80,0.15), 0 2px 6px rgba(140,110,60,0.2)',
              };

              return (
                <motion.button
                  key={`${r}-${c}`}
                  onClick={() => handleTileClick(r, c)}
                  disabled={!isClickable}
                  whileHover={isClickable ? { scale: 1.05 } : {}}
                  whileTap={isClickable ? { scale: 0.94 } : {}}
                  animate={
                    isLastFail ? { x: [0, -6, 6, -4, 4, 0], borderColor: "hsl(0, 70%, 50%)" }
                      : isSuccessChest ? { scale: [1, 1.15, 1], boxShadow: ["0 0 0px hsl(150,60%,40%)", "0 0 20px hsl(150,60%,40%)", "0 0 0px hsl(150,60%,40%)"] }
                      : {}
                  }
                  transition={isLastFail ? { duration: 0.4 } : isSuccessChest ? { duration: 0.8, repeat: 1 } : {}}
                  className={`relative flex items-center justify-center rounded-xl border-2 transition-all overflow-hidden ${
                    isCurrent ? "border-primary ring-2 ring-primary/30"
                      : isVisited ? "border-amber-700/30 opacity-50"
                      : "border-amber-800/20"
                  } ${isClickable ? "cursor-pointer hover:shadow-lg hover:border-amber-600/40" : "cursor-default"}`}
                  style={sandStyle}
                >
                  {/* Sand grain overlay */}
                  <div className="pointer-events-none absolute inset-0 rounded-xl opacity-40" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E")`,
                    backgroundSize: '100px 100px',
                    mixBlendMode: 'multiply',
                  }} />
                  {tileImg ? <img src={tileImg} alt={tileType} className="relative z-10 h-24 w-24 object-contain drop-shadow-md" /> : null}
                  {isVisited && !isCurrent && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-foreground/10">
                      <span className="text-xs font-bold text-muted-foreground">{state.path.findIndex((p) => posEq(p, [r, c])) + 1}</span>
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </div>
        {state.path.length > 1 && (
          <svg className="pointer-events-none absolute" style={{ width: 460, height: 460 }} viewBox="0 0 460 460">
            <motion.polyline
              points={state.path.map(([r, c]) => `${c * 148 + 86},${r * 148 + 86}`).join(" ")}
              fill="none" stroke="hsl(210, 100%, 45%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.4 }}
            />
          </svg>
        )}
      </div>

      <div className="w-72 space-y-4">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-bold uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.puzzle.rules)}</h3>
          <ul className="space-y-1.5 text-sm leading-relaxed text-foreground">
            <li>{t(language, gameCopy.puzzle.ruleStart)}</li>
            <li>{t(language, gameCopy.puzzle.ruleAdjacent)}</li>
            <li>{t(language, gameCopy.puzzle.ruleNoRevisit)}</li>
            <li>{t(language, gameCopy.puzzle.ruleCrabs)}</li>
            <li>{t(language, gameCopy.puzzle.ruleKey)}</li>
          </ul>
        </div>
        <div className="space-y-2 rounded-xl border border-border bg-surface p-4 shadow-sm">
          <p className="text-sm text-muted-foreground">{t(language, gameCopy.puzzle.key)}: <strong className="text-foreground">{state.hasKey ? t(language, gameCopy.puzzle.collected) : t(language, gameCopy.puzzle.notCollected)}</strong></p>
          <p className="text-sm font-medium text-foreground">{statusMessages[state.status]}</p>
        </div>
        {isFinished && (
          <div className="flex gap-2">
            <Button onClick={handleRetry} variant="outline" className="flex-1">{t(language, gameCopy.puzzle.retry)}</Button>
            <Button onClick={handleFinish} className="flex-1">{t(language, gameCopy.puzzle.continue)}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PuzzleStage({ onComplete, onResult, language }: Props) {
  const [currentStage, setCurrentStage] = useState(0);
  const [runs, setRuns] = useState<PuzzleRunLog[]>([]);

  const handleStageFinish = useCallback((run: PuzzleRunLog) => {
    const newRuns = [...runs, run];
    setRuns(newRuns);
    if (currentStage < 2) {
      setCurrentStage(prev => prev + 1);
    } else {
      onResult(newRuns);
      onComplete();
    }
  }, [runs, currentStage, onResult, onComplete]);

  const config = PUZZLE_STAGES[currentStage];
  const stageLabel = language === "ar" ? `المرحلة ${currentStage + 1}/3` : `Stage ${currentStage + 1}/3`;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-8">
      <StageIntro
        title={`${t(language, gameCopy.puzzle.stageTitle)} — ${stageLabel}`}
        description={t(language, gameCopy.puzzle.stageDescription)}
        audioSrc={getAudioSrc("/audio/stage4.mp3", language)}
        language={language}
      />
      <div className="mb-4 flex items-center gap-3">
        {[0, 1, 2].map(i => (
          <div key={i} className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
            i < currentStage ? "bg-primary text-primary-foreground" :
            i === currentStage ? "border-2 border-primary bg-primary/10 text-primary" :
            "border border-border bg-muted text-muted-foreground"
          }`}>{i + 1}</div>
        ))}
        {runs.length > 0 && (
          <span className="ml-auto text-sm text-muted-foreground">
            {language === "ar" ? "النقاط:" : "Score:"} {runs.reduce((s, r) => s + r.score, 0).toFixed(1)}/{runs.length}.0
          </span>
        )}
      </div>
      <PuzzleGrid config={config} stageNum={currentStage + 1} onFinish={handleStageFinish} language={language} />
    </motion.div>
  );
}
