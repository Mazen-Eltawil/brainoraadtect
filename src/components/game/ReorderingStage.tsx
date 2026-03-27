import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SIX_EIGHT_SEGMENTS } from "@/config/videoConfig";
import { REORDERING_OPTIONS, CORRECT_REORDERING } from "@/config/puzzleConfig";
import { CheckCircle, XCircle } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import StageIntro from "./StageIntro";

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
        audioSrc="/audio/stage3.mp3"
        language={language}
      />

      <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="mb-2 text-2xl font-bold text-foreground">{t(language, gameCopy.reordering.title)}</h2>
        <p className="leading-relaxed text-muted-foreground">{t(language, gameCopy.reordering.description)}</p>
      </div>

      {/* Segment images display */}
      <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {shuffledSegments.map((seg) => (
          <div key={seg.id} className="relative overflow-hidden rounded-lg border border-border bg-surface shadow-sm">
            <img
              src={seg.src}
              alt={`Segment ${seg.id}`}
              className="aspect-[4/3] w-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-foreground/60 py-1 text-center text-lg font-bold text-background">
              {seg.id}
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
              <span className="text-base font-semibold text-foreground">{opt.sequence.join(" → ")}</span>
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
