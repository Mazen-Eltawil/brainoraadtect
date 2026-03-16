import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS } from "@/config/videoConfig";
import { REORDERING_OPTIONS, CORRECT_REORDERING } from "@/config/puzzleConfig";
import { CheckCircle, XCircle } from "lucide-react";

interface Props {
  onComplete: () => void;
  onResult: (answer: string, correct: boolean) => void;
}

export default function ReorderingStage({ onComplete, onResult }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const clip = GAME_CLIPS.sixEight;

  const handleSelect = (label: string) => {
    if (selected) return;
    setSelected(label);
    onResult(label, label === CORRECT_REORDERING);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-5xl px-4 py-8"
    >
      <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-foreground">Reordering Task</h2>
        <p className="leading-relaxed text-muted-foreground">
          The "6 8" clip has been divided into 6 segments shown below. Select the option that shows the correct chronological order of these segments.
        </p>
      </div>

      {/* Segment thumbnails - placeholders numbered 1-6 */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <div
            key={n}
            className="flex aspect-square items-center justify-center rounded-lg border border-border bg-surface text-2xl font-bold text-primary shadow-sm"
          >
            {n}
          </div>
        ))}
      </div>

      {/* Options grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {REORDERING_OPTIONS.map((opt) => {
          const isCorrect = opt.label === CORRECT_REORDERING;
          const isSelected = selected === opt.label;
          const showResult = selected !== null;
          return (
            <motion.button
              key={opt.label}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(opt.label)}
              disabled={!!selected}
              className={`relative rounded-lg border-2 p-3 text-left transition-all ${
                showResult && isCorrect
                  ? "border-success bg-success/5"
                  : showResult && isSelected && !isCorrect
                  ? "border-destructive bg-destructive/5"
                  : "border-border hover:border-primary/50 bg-surface"
              }`}
              aria-label={`Option ${opt.label}: ${opt.sequence.join(", ")}`}
            >
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
                {opt.label})
              </span>
              <span className="text-base font-semibold text-foreground">
                {opt.sequence.join(" → ")}
              </span>
              {showResult && (isCorrect || isSelected) && (
                <span className="absolute right-2 top-2">
                  {isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-success" />
                  ) : (
                    <XCircle className="h-5 w-5 text-destructive" />
                  )}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center justify-between">
          <p className="text-base text-muted-foreground">
            {selected === CORRECT_REORDERING
              ? "✅ Correct! The right sequence is option G."
              : `❌ Incorrect. The correct answer was G (${REORDERING_OPTIONS.find(o => o.label === CORRECT_REORDERING)?.sequence.join(" → ")}).`}
          </p>
          <Button onClick={onComplete} size="lg">Continue</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
