import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, CLIP_ORDER, getAudioSrc, getClipLabel } from "@/config/videoConfig";
import { CheckCircle, XCircle, RotateCcw } from "lucide-react";
import { ResponseLog } from "@/types/game";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import StageIntro from "./StageIntro";

interface Props {
  onComplete: () => void;
  onLogResponse: (r: ResponseLog) => void;
  language: Language;
  isMuted: boolean;
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LongTermMemory({ onComplete, onLogResponse, language, isMuted }: Props) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());
  const videoRef = useRef<HTMLVideoElement>(null);

  const questions = useMemo(() => {
    return CLIP_ORDER.map((key) => {
      const correct = GAME_CLIPS[key];
      const allOptions = CLIP_ORDER.map((k) => ({
        key: k,
        label: GAME_CLIPS[k].label,
        label_ar: GAME_CLIPS[k].label_ar,
      }));
      return { clipKey: key, clipSrc: correct.src, correctKey: key, options: shuffleArray(allOptions) };
    });
  }, []);

  const q = questions[qIndex];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const handleRewatch = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play().catch(() => {});
    }
  }, []);

  const correctLabel = GAME_CLIPS[q.correctKey].label;

  const handleSelect = useCallback((optKey: string) => {
    if (selected) return;
    setSelected(optKey);
    const selectedLabel = GAME_CLIPS[optKey]?.label ?? optKey;
    onLogResponse({
      stage: "long_term", target: correctLabel, selected: selectedLabel,
      isCorrect: optKey === q.correctKey, responseTimeMs: Date.now() - startTimeRef.current,
      timestamp: new Date().toISOString(),
    });
  }, [selected, q, correctLabel, onLogResponse]);

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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl px-4 py-8">
      <StageIntro
        title={t(language, gameCopy.longTerm.stageTitle)}
        description={t(language, gameCopy.longTerm.stageDescription)}
        audioSrc={getAudioSrc("/audio/stage5.mp3", language)}
        language={language}
      />
      <div className="mb-6 rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.longTerm.prompt)}</p>
        <video
          ref={videoRef}
          key={q.clipKey}
          src={q.clipSrc}
          className="aspect-video w-full rounded-lg border border-border"
          playsInline
          autoPlay
          muted={isMuted}
          controls
        />
        <div className="mt-3 flex justify-center">
          <Button variant="outline" size="sm" onClick={handleRewatch} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            {language === "ar" ? "إعادة المشاهدة" : "Rewatch"}
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt) => {
          const isCorrect = opt.key === q.correctKey;
          const isSelected = selected === opt.key;
          const showResult = selected !== null;
          const displayLabel = language === "ar" ? opt.label_ar : opt.label;
          return (
            <motion.button key={opt.key} whileTap={{ scale: 0.96 }} onClick={() => handleSelect(opt.key)} disabled={!!selected}
              className={`flex items-center justify-between rounded-lg border-2 p-4 text-lg font-semibold transition-all ${
                showResult && isCorrect ? "border-success bg-success/5 text-foreground"
                  : showResult && isSelected && !isCorrect ? "border-destructive bg-destructive/5 text-foreground"
                  : "border-border bg-surface text-foreground hover:border-primary/50"
              }`}
            >
              <span style={{ direction: "ltr", unicodeBidi: "embed" }}>{displayLabel}</span>
              {showResult && isCorrect && <CheckCircle className="h-5 w-5 text-success" />}
              {showResult && isSelected && !isCorrect && <XCircle className="h-5 w-5 text-destructive" />}
            </motion.button>
          );
        })}
      </div>
      {selected && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
          <Button onClick={handleNext} size="lg">
            {qIndex + 1 < questions.length ? t(language, gameCopy.longTerm.nextQuestion) : t(language, gameCopy.longTerm.viewResults)}
          </Button>
        </motion.div>
      )}
      <p className="mt-4 text-center text-sm text-muted-foreground">
        {t(language, gameCopy.longTerm.question)} {qIndex + 1} {t(language, gameCopy.longTerm.of)} {questions.length}
      </p>
    </motion.div>
  );
}
