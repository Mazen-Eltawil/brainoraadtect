import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SIX_EIGHT_SEGMENTS } from "@/config/videoConfig";
import { REORDERING_OPTIONS, CORRECT_REORDERING } from "@/config/puzzleConfig";
import { CheckCircle, XCircle } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { getAudioSrc } from "@/config/videoConfig";
import StageIntro from "./StageIntro";
import { MotionClick, normalizeClickCoords, saveMotionTrial } from "@/lib/motionTracking";

interface Props {
  onComplete: () => void;
  onResult: (answer: string, correct: boolean) => void;
  language: Language;
}

export default function ReorderingStage({ onComplete, onResult, language }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const shuffledSegments = useMemo(() => {
    const shuffled = [...SIX_EIGHT_SEGMENTS];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const handleSelect = (label: string) => {
    if (selected) return;
    setSelected(label);
    onResult(label, label === CORRECT_REORDERING);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-5xl px-4 py-8">
      <StageIntro
        title={t(language, gameCopy.reordering.stageTitle)}
        description={t(language, gameCopy.reordering.stageDescription)}
        audioSrc={getAudioSrc("/audio/stage3.mp3", language)}
        language={language}
      />

      {/* Segment images display — 2x3 grid (bigger for elderly) */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        {shuffledSegments.map((seg) => (
          <div key={seg.id} className="group relative overflow-hidden rounded-xl border-2 border-border bg-card shadow-md transition-shadow hover:shadow-lg">
            <img
              src={seg.src}
              alt={`Segment ${seg.id}`}
              className="aspect-[16/10] w-full object-cover object-center"
              loading="eager"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-foreground/80 to-transparent py-2 text-center">
              <span className="text-xl font-extrabold tracking-wide text-background drop-shadow-sm" style={{ direction: "ltr", unicodeBidi: "embed" }}>{seg.id}</span>
            </div>
          </div>
        ))}
      </div>

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
              className={`relative rounded-lg border-2 bg-surface p-3 text-left transition-all ${
                showResult && isCorrect ? "border-success bg-success/5"
                  : showResult && isSelected && !isCorrect ? "border-destructive bg-destructive/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <span className="mb-1 block text-xs font-bold uppercase tracking-widest text-muted-foreground">{opt.label})</span>
              <span className="text-base font-semibold text-foreground" style={{ direction: "ltr", unicodeBidi: "embed" }}>{opt.sequence.join(" → ")}</span>
              {showResult && (isCorrect || isSelected) && (
                <span className="absolute right-2 top-2">
                  {isCorrect ? <CheckCircle className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex items-center justify-between gap-4">
          <p className="text-base text-muted-foreground">
            {selected === CORRECT_REORDERING
              ? t(language, gameCopy.reordering.correct)
              : `${t(language, gameCopy.reordering.incorrectPrefix)} (${REORDERING_OPTIONS.find((o) => o.label === CORRECT_REORDERING)?.sequence.join(" → ")}).`}
          </p>
          <Button onClick={onComplete} size="lg">{t(language, gameCopy.reordering.continue)}</Button>
        </motion.div>
      )}
    </motion.div>
  );
}
