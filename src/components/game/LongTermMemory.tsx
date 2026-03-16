import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, CLIP_ORDER } from "@/config/videoConfig";
import { CheckCircle, XCircle } from "lucide-react";
import { ResponseLog } from "@/types/game";

interface Props {
  onComplete: () => void;
  onLogResponse: (r: ResponseLog) => void;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LongTermMemory({ onComplete, onLogResponse }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());

  const questions = useMemo(() => {
    return CLIP_ORDER.map((key) => {
      const correct = GAME_CLIPS[key];
      const allLabels = CLIP_ORDER.map(k => GAME_CLIPS[k].label);
      const options = shuffleArray(allLabels);
      return { clipKey: key, clipSrc: correct.src, correctLabel: correct.label, options };
    });
  }, []);

  const q = questions[qIndex];

  const handleSelect = useCallback((label: string) => {
    if (selected) return;
    setSelected(label);
    const responseTime = Date.now() - startTimeRef.current;
    onLogResponse({
      stage: "long_term",
      target: q.correctLabel,
      selected: label,
      isCorrect: label === q.correctLabel,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
    });
  }, [selected, q, onLogResponse]);

  const handleNext = useCallback(() => {
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      setSelected(null);
      startTimeRef.current = Date.now();
    } else {
      onComplete();
    }
  }, [qIndex, questions.length, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-3xl px-4 py-8"
    >
      <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="mb-2 text-sm tracking-widest uppercase text-muted-foreground">
          Watch the clip and select the correct label
        </p>
        <video
          key={q.clipKey}
          src={q.clipSrc}
          className="aspect-video w-full rounded-lg border border-border"
          playsInline
          autoPlay
          controls={false}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {q.options.map((label) => {
          const isCorrect = label === q.correctLabel;
          const isSelected = selected === label;
          const showResult = selected !== null;
          return (
            <motion.button
              key={label}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(label)}
              disabled={!!selected}
              className={`flex items-center justify-between rounded-lg border-2 p-4 text-lg font-semibold transition-all ${
                showResult && isCorrect
                  ? "border-success bg-success/5 text-foreground"
                  : showResult && isSelected && !isCorrect
                  ? "border-destructive bg-destructive/5 text-foreground"
                  : "border-border bg-surface text-foreground hover:border-primary/50"
              }`}
              aria-label={`Select ${label}`}
            >
              {label}
              {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
              {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
          <Button onClick={handleNext} size="lg">
            {qIndex + 1 < questions.length ? "Next Question" : "View Results"}
          </Button>
        </motion.div>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Question {qIndex + 1} of {questions.length}
      </p>
    </motion.div>
  );
}
