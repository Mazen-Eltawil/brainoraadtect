import { useState, useRef, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, DISTRACTOR_CLIPS, ClipConfig } from "@/config/videoConfig";
import { CheckCircle, XCircle } from "lucide-react";
import { ResponseLog } from "@/types/game";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { MotionClick, normalizeClickCoords, saveMotionTrial } from "@/lib/motionTracking";

interface Props {
  onComplete: () => void;
  onLogResponse: (r: ResponseLog) => void;
  language: Language;
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

export default function ShortTermMemory({ onComplete, onLogResponse, language }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const clicksRef = useRef<MotionClick[]>([]);
  const gridRef = useRef<HTMLDivElement>(null);

  const questions = useMemo(() => {
    const shuffledOrder = shuffleArray([...TEST_CLIPS]);
    return shuffledOrder.map((key) => {
      const correct = GAME_CLIPS[key];
      const others = shuffleArray(Object.values(GAME_CLIPS).filter((c) => c.id !== correct.id));
      const distractorsPool = shuffleArray([...others, ...DISTRACTOR_CLIPS]);
      const options = shuffleArray([correct, ...distractorsPool.slice(0, 3)]);
      return { targetLabel: correct.label, correctId: correct.id, options };
    });
  }, []);

  const q = questions[qIndex];

  const handleSelect = useCallback((clip: ClipConfig, e: React.MouseEvent<HTMLButtonElement>) => {
    if (selected) return;
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = clip.id === q.correctId;
    const coords = normalizeClickCoords(e, gridRef.current);
    clicksRef.current.push({
      x: coords.x,
      y: coords.y,
      t: responseTime,
      box_id: clip.id,
      target: q.targetLabel,
      selected: clip.label,
      correct: isCorrect,
    });
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
    // Save motion tracking for the just-answered question
    void saveMotionTrial({ trialNumber: 11 + qIndex, clicks: clicksRef.current });
    clicksRef.current = [];
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
        <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">
          {t(language, gameCopy.shortTerm.prompt)}
        </p>
        <p className="text-4xl font-bold tracking-tight text-primary">{q.targetLabel}</p>
        <p className="mt-2 text-muted-foreground">{t(language, gameCopy.shortTerm.helper)}</p>
      </div>

      <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {q.options.map((clip) => {
          const isCorrect = clip.id === q.correctId;
          const isSelected = selected === clip.id;
          const showResult = selected !== null;
          return (
            <motion.button
              key={clip.id}
              whileTap={{ scale: 0.96 }}
              onClick={(e) => handleSelect(clip, e)}
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
            {qIndex + 1 < questions.length
              ? t(language, gameCopy.shortTerm.nextQuestion)
              : t(language, gameCopy.shortTerm.continue)}
          </Button>
        </motion.div>
      )}

      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t(language, gameCopy.shortTerm.question)} {qIndex + 1} {t(language, gameCopy.shortTerm.of)} {questions.length}
      </p>
    </motion.div>
  );
}
