import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GAME_CLIPS, CLIP_ORDER, REPS_PER_CLIP } from "@/config/videoConfig";

interface LearningStageProps {
  onComplete: () => void;
  onLog: (clip: string, rep: number, completed: boolean) => void;
}

export default function LearningStage({ onComplete, onLog }: LearningStageProps) {
  const [clipIndex, setClipIndex] = useState(0);
  const [rep, setRep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [done, setDone] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const currentKey = CLIP_ORDER[clipIndex];
  const currentClip = GAME_CLIPS[currentKey];

  const handlePlay = useCallback(() => {
    setPlaying(true);
    videoRef.current?.play();
  }, []);

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
          <h2 className="mb-3 text-2xl font-bold text-foreground">All Clips Learned!</h2>
          <p className="mb-6 text-muted-foreground leading-relaxed">
            You've watched all 4 movement clips. Click Next to continue to the memory tests.
          </p>
          <Button onClick={onComplete} size="lg" className="h-12 px-8">
            Next
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
        <p className="mb-4 text-sm tracking-widest uppercase text-muted-foreground">Instructions</p>
        <p className="mb-4 leading-relaxed text-foreground">
          You will see 4 movement clips: <strong>Fasla</strong>, <strong>6 8</strong>, <strong>Money</strong>, <strong>Marshmallow</strong>. Watch them carefully — you will be tested later.
        </p>
        <div className="mb-3 rounded-lg bg-primary/10 p-4">
          <p className="text-sm text-muted-foreground">Now learning:</p>
          <p className="text-2xl font-bold text-primary">{currentClip.label}</p>
        </div>
        <p className="text-sm text-muted-foreground">Watch the movement and remember the label.</p>
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
              onEnded={handleEnded}
              aria-label={`${currentClip.label} movement clip`}
            />
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex w-full items-center justify-between">
          <span className="text-sm text-muted-foreground">
            Clip {clipIndex + 1}/{CLIP_ORDER.length} · Repetition {rep + 1}/{REPS_PER_CLIP}
          </span>
          {!playing && (
            <Button onClick={handlePlay} variant="default">
              {rep === 0 && clipIndex === 0 ? "Play Clip" : "Play Again"}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
