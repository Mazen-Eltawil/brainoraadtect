import { motion } from "framer-motion";
import { GameSession } from "@/types/game";

interface Props {
  session: GameSession;
}

export default function ResultsScreen({ session }: Props) {
  const shortTermResponses = session.responses.filter(r => r.stage === "short_term");
  const longTermResponses = session.responses.filter(r => r.stage === "long_term");
  const stCorrect = shortTermResponses.filter(r => r.isCorrect).length;
  const ltCorrect = longTermResponses.filter(r => r.isCorrect).length;
  const puzzleSuccess = session.puzzleRun?.success ?? false;
  const reorderCorrect = session.reorderingCorrect;

  const totalScore = stCorrect + ltCorrect + (reorderCorrect ? 1 : 0) + (puzzleSuccess ? 1 : 0);
  const maxScore = shortTermResponses.length + longTermResponses.length + 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl px-4 py-8"
    >
      <div className="rounded-xl border border-border bg-surface p-8 shadow-md text-center">
        <h2 className="mb-2 text-3xl font-bold text-foreground">Assessment Complete</h2>
        <p className="mb-6 text-muted-foreground">Player: {session.playerId}</p>

        <div className="mb-8 rounded-lg bg-primary/10 p-6">
          <p className="text-sm uppercase tracking-widest text-muted-foreground">Composite Score</p>
          <p className="text-5xl font-bold text-primary">{totalScore}/{maxScore}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <ScoreCard
            title="Short-Term Memory"
            score={stCorrect}
            total={shortTermResponses.length}
            avgTime={avg(shortTermResponses.map(r => r.responseTimeMs))}
          />
          <ScoreCard
            title="Long-Term Memory"
            score={ltCorrect}
            total={longTermResponses.length}
            avgTime={avg(longTermResponses.map(r => r.responseTimeMs))}
          />
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Reordering</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{reorderCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
            <p className="text-sm text-muted-foreground">Answer: {session.reorderingAnswer ?? "—"}</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Puzzle</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{puzzleSuccess ? "✅ Solved" : "❌ Failed"}</p>
            <p className="text-sm text-muted-foreground">
              {session.puzzleRun
                ? `${session.puzzleRun.path.length} steps · ${(session.puzzleRun.durationMs / 1000).toFixed(1)}s`
                : "—"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ScoreCard({ title, score, total, avgTime }: { title: string; score: number; total: number; avgTime: number }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{score}/{total}</p>
      <p className="text-sm text-muted-foreground">Avg: {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}s` : "—"}</p>
    </div>
  );
}

function avg(nums: number[]) {
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
}
