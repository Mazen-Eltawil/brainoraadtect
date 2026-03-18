import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, CLIP_ORDER, REPS_PER_CLIP } from "@/config/videoConfig";
import { gameCopy, Language, t } from "@/lib/gameCopy";

interface LearningStageProps {
  onComplete: () => void;
  onLog: (clip: string, rep: number, completed: boolean) => void;
  language: Language;
  isMuted: boolean;
}

export default function LearningStage({ onComplete, onLog, language, isMuted }: LearningStageProps) {
  const [clipIndex, setClipIndex] = useState(0);
  const [rep, setRep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentKey = CLIP_ORDER[clipIndex];
  const currentClip = GAME_CLIPS[currentKey];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted, currentKey, rep]);

  const handlePlay = useCallback(() => {
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
      void videoRef.current.play();
    }
  }, [isMuted]);

  const handleEnded = useCallback(() => {
    onLog(currentClip.label, rep + 1, true);
    setPlaying(false);

    const nextRep = rep + 1;
    if (nextRep < REPS_PER_CLIP) {
      setRep(nextRep);
    } else {
      const nextClip = clipIndex + 1;
      if (nextClip < CLIP_ORDER.length) {
        setClipIndex(nextClip);
        setRep(0);
      } else {
        setDone(true);
      }
    }
  }, [rep, clipIndex, currentClip.label, onLog]);

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex min-h-[60vh] items-center justify-center"
      >
        <div className="max-w-lg rounded-xl border border-border bg-surface p-8 text-center shadow-md">
          <h2 className="mb-3 text-2xl font-bold text-foreground">{t(language, gameCopy.learning.learnedTitle)}</h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">
            {t(language, gameCopy.learning.learnedDescription)}
          </p>
          <Button onClick={onComplete} size="lg" className="h-12 px-8">
            {t(language, gameCopy.learning.next)}
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_1.5fr]"
    >
      <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">
          {t(language, gameCopy.learning.instructionsLabel)}
        </p>
        <p className="mb-4 leading-relaxed text-foreground">
          {t(language, gameCopy.learning.instructions)}
        </p>
        <div className="mb-3 rounded-lg bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">{t(language, gameCopy.learning.nowLearning)}</p>
          <p className="text-2xl font-bold text-primary">{currentClip.label}</p>
        </div>
        <p className="text-sm text-muted-foreground">{t(language, gameCopy.learning.remember)}</p>
      </div>

      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${currentKey}-${rep}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full overflow-hidden rounded-xl border border-border bg-foreground/5 shadow-sm"
          >
            <video
              ref={videoRef}
              src={currentClip.src}
              className="aspect-video w-full object-cover"
              playsInline
              muted={isMuted}
              onEnded={handleEnded}
              aria-label={`${currentClip.label} movement clip`}
            />
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex w-full items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {t(language, gameCopy.learning.clipCounter)} {clipIndex + 1}/{CLIP_ORDER.length} · {t(language, gameCopy.learning.repetition)} {rep + 1}/{REPS_PER_CLIP}
          </span>
          {!playing && (
            <Button onClick={handlePlay} variant="default">
              {rep === 0 && clipIndex === 0
                ? t(language, gameCopy.learning.playClip)
                : t(language, gameCopy.learning.playAgain)}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
