import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, DISTRACTOR_CLIPS, ClipConfig } from "@/config/videoConfig";
import { CheckCircle, XCircle } from "lucide-react";
import { ResponseLog } from "@/types/game";

interface Props {
  onComplete: () => void;
  onLogResponse: (r: ResponseLog) => void;
}

const TEST_CLIPS = ["fasla", "money", "marshmallow"] as const;

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ShortTermMemory({ onComplete, onLogResponse }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  
  const questions = useMemo(() => {
    return TEST_CLIPS.map((key) => {
      const correct = GAME_CLIPS[key];
      const others = Object.values(GAME_CLIPS).filter(c => c.id !== correct.id);
      const distractors = [...others, ...DISTRACTOR_CLIPS.slice(0, 2)];
      const options = shuffleArray([correct, ...distractors.slice(0, 3)]);
      return { targetLabel: correct.label, correctId: correct.id, options };
    });
  }, []);

  const q = questions[qIndex];

  const handleSelect = useCallback((clip: ClipConfig) => {
    if (selected) return;
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = clip.id === q.correctId;
    setSelected(clip.id);
    onLogResponse({
      stage: "short_term",
      target: q.targetLabel,
      selected: clip.label,
      isCorrect,
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
      className="mx-auto max-w-4xl px-4 py-8"
    >
      <div className="mb-6 rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
        <p className="text-sm tracking-widest uppercase text-muted-foreground mb-2">
          Which movement matches this name?
        </p>
        <p className="text-4xl font-bold text-primary tracking-tight">{q.targetLabel}</p>
        <p className="mt-2 text-muted-foreground">Click the correct movement clip below.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {q.options.map((clip) => {
          const isCorrect = clip.id === q.correctId;
          const isSelected = selected === clip.id;
          const showResult = selected !== null;
          return (
            <motion.button
              key={clip.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(clip)}
              disabled={!!selected}
              className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                showResult && isCorrect
                  ? "border-success ring-4 ring-success/20"
                  : showResult && isSelected && !isCorrect
                  ? "border-destructive ring-4 ring-destructive/20"
                  : "border-border hover:border-primary/50"
              }`}
              aria-label={`Select ${clip.label}`}
            >
              <video
                src={clip.src}
                className="aspect-video w-full object-cover"
                playsInline
                muted
                autoPlay
                loop
              />
              <div className="p-2 text-center text-sm font-medium text-foreground">{clip.label}</div>
              {showResult && (isCorrect || isSelected) && (
                <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                  {isCorrect ? (
                    <CheckCircle className="h-12 w-12 text-success" />
                  ) : (
                    <XCircle className="h-12 w-12 text-destructive" />
                  )}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 flex justify-end"
        >
          <Button onClick={handleNext} size="lg">
            {qIndex + 1 < questions.length ? "Next Question" : "Continue"}
          </Button>
        </motion.div>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Question {qIndex + 1} of {questions.length}
      </p>
    </motion.div>
  );
}
