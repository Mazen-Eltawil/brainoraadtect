import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, SkipForward } from "lucide-react";
import { GAME_CLIPS, CLIP_ORDER, REPS_PER_CLIP, DISTRACTOR_CLIPS, CLIP_AUDIO, ClipConfig, getAudioSrc, getClipLabel } from "@/config/videoConfig";
import { ResponseLog } from "@/types/game";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import StageIntro from "./StageIntro";

interface Props {
  onComplete: () => void;
  onLogLearning: (clip: string, rep: number, completed: boolean) => void;
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

type Phase = "learning" | "testing" | "done";

export default function LearningWithTest({ onComplete, onLogLearning, onLogResponse, language, isMuted }: Props) {
  const [clipIndex, setClipIndex] = useState(0);
  const [rep, setRep] = useState(0);
  const [phase, setPhase] = useState<Phase>("learning");
  const [playing, setPlaying] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [hasCompletedFirstRep, setHasCompletedFirstRep] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const startTimeRef = useRef(Date.now());

  const currentKey = CLIP_ORDER[clipIndex];
  const currentClip = GAME_CLIPS[currentKey];

  // Reset first-rep flag when clip changes
  useEffect(() => {
    setHasCompletedFirstRep(false);
  }, [clipIndex]);

  const testOptions = useMemo(() => {
    const correct = GAME_CLIPS[currentKey];
    const otherMain = Object.entries(GAME_CLIPS)
      .filter(([k]) => k !== currentKey)
      .map(([, v]) => v);
    const pool = [...otherMain, ...DISTRACTOR_CLIPS];
    const shuffled = shuffleArray(pool);
    const distractors = shuffled.slice(0, 3);
    return shuffleArray([correct, ...distractors]);
  }, [currentKey]);

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

  const handleSkipToTest = useCallback(() => {
    // Log remaining reps as skipped
    for (let r = rep; r < REPS_PER_CLIP; r++) {
      onLogLearning(currentClip.label, r + 1, false);
    }
    if (videoRef.current) videoRef.current.pause();
    setPlaying(false);
    setPhase("testing");
    startTimeRef.current = Date.now();
  }, [rep, currentClip.label, onLogLearning]);

  const handleEnded = useCallback(() => {
    onLogLearning(currentClip.label, rep + 1, true);
    setPlaying(false);
    const nextRep = rep + 1;
    if (nextRep >= 1) setHasCompletedFirstRep(true);
    if (nextRep < REPS_PER_CLIP) {
      setRep(nextRep);
    } else {
      setPhase("testing");
      startTimeRef.current = Date.now();
    }
  }, [rep, currentClip.label, onLogLearning]);

  const handleSelect = useCallback((clip: ClipConfig) => {
    if (selected) return;
    const responseTime = Date.now() - startTimeRef.current;
    const isCorrect = clip.id === currentClip.id;
    setSelected(clip.id);
    onLogResponse({
      stage: "short_term",
      target: currentClip.label,
      selected: clip.label,
      isCorrect,
      responseTimeMs: responseTime,
      timestamp: new Date().toISOString(),
    });
  }, [selected, currentClip, onLogResponse]);

  const handleNext = useCallback(() => {
    const nextClip = clipIndex + 1;
    if (nextClip < CLIP_ORDER.length) {
      setClipIndex(nextClip);
      setRep(0);
      setPhase("learning");
      setPlaying(false);
      setSelected(null);
    } else {
      setPhase("done");
    }
  }, [clipIndex]);

  if (phase === "done") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-lg rounded-xl border border-border bg-surface p-8 text-center shadow-md">
          <h2 className="mb-3 text-2xl font-bold text-foreground">{t(language, gameCopy.learning.learnedTitle)}</h2>
          <p className="mb-6 leading-relaxed text-muted-foreground">{t(language, gameCopy.learning.learnedDescription)}</p>
          <Button onClick={onComplete} size="lg" className="h-12 px-8">{t(language, gameCopy.learning.next)}</Button>
        </div>
      </motion.div>
    );
  }

  if (phase === "testing") {
    const audioSrc = CLIP_AUDIO[currentKey][language];
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-4xl px-4 py-8">
        <StageIntro
          title={t(language, gameCopy.shortTerm.stageTitle)}
          description={t(language, gameCopy.shortTerm.stageDescription)}
          audioSrc={audioSrc}
          language={language}
        />
        <div className="mb-6 rounded-xl border border-border bg-surface p-6 text-center shadow-sm">
          <p className="mb-2 text-sm uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.shortTerm.prompt)}</p>
          <p className="text-4xl font-bold tracking-tight text-primary" style={{ direction: "ltr", unicodeBidi: "embed" }}>{getClipLabel(currentClip, language)}</p>
          <p className="mt-2 text-muted-foreground">{t(language, gameCopy.shortTerm.helper)}</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {testOptions.map((clip) => {
            const isCorrect = clip.id === currentClip.id;
            const isSelected = selected === clip.id;
            const showResult = selected !== null;
            return (
              <motion.button
                key={clip.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => handleSelect(clip)}
                disabled={!!selected}
                className={`relative overflow-hidden rounded-lg border-2 transition-all ${
                  showResult && isCorrect ? "border-success ring-4 ring-success/20"
                    : showResult && isSelected && !isCorrect ? "border-destructive ring-4 ring-destructive/20"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <video src={clip.src} className="aspect-video w-full object-cover" playsInline muted autoPlay loop />
                {showResult && (isCorrect || isSelected) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/10">
                    {isCorrect ? <CheckCircle className="h-12 w-12 text-success" /> : <XCircle className="h-12 w-12 text-destructive" />}
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 flex justify-end">
            <Button onClick={handleNext} size="lg">
              {clipIndex + 1 < CLIP_ORDER.length ? t(language, gameCopy.shortTerm.nextQuestion) : t(language, gameCopy.shortTerm.continue)}
            </Button>
          </motion.div>
        )}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {t(language, gameCopy.shortTerm.question)} {clipIndex + 1} {t(language, gameCopy.shortTerm.of)} {CLIP_ORDER.length}
        </p>
      </motion.div>
    );
  }

  // Learning phase
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto grid max-w-5xl gap-8 px-4 py-8 lg:grid-cols-[1fr_1.5fr]">
      <div>
        <StageIntro
          title={t(language, gameCopy.learning.stageTitle)}
          description={t(language, gameCopy.learning.stageDescription)}
          audioSrc={getAudioSrc("/audio/stage1.mp3", language)}
          language={language}
        />
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
          <p className="mb-4 text-sm uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.learning.instructionsLabel)}</p>
          <p className="mb-4 leading-relaxed text-foreground">{t(language, gameCopy.learning.instructions)}</p>
          <div className="mb-3 rounded-lg bg-primary/10 p-4">
            <p className="text-sm text-muted-foreground">{t(language, gameCopy.learning.nowLearning)}</p>
            <p className="text-2xl font-bold text-primary" style={{ direction: "ltr", unicodeBidi: "embed" }}>{getClipLabel(currentClip, language)}</p>
          </div>
          <p className="text-sm text-muted-foreground">{t(language, gameCopy.learning.remember)}</p>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <AnimatePresence mode="wait">
          <motion.div key={`${currentKey}-${rep}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full overflow-hidden rounded-xl border border-border bg-foreground/5 shadow-sm">
            <video ref={videoRef} src={currentClip.src} className="aspect-video w-full object-cover" playsInline muted={isMuted} onEnded={handleEnded} />
          </motion.div>
        </AnimatePresence>
        <div className="mt-4 flex w-full items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground" style={{ direction: "ltr", unicodeBidi: "embed" }}>
            {t(language, gameCopy.learning.clipCounter)} {clipIndex + 1}/{CLIP_ORDER.length} · {t(language, gameCopy.learning.repetition)} {rep + 1}/{REPS_PER_CLIP}
          </span>
          <div className="flex gap-2">
            {hasCompletedFirstRep && !playing && (
              <Button onClick={handleSkipToTest} variant="outline" className="gap-1">
                <SkipForward className="h-4 w-4" />
                {language === "ar" ? "تخطي للاختبار" : "Skip to Test"}
              </Button>
            )}
            {!playing && (
              <Button onClick={handlePlay} variant="default">
                {rep === 0 && clipIndex === 0 ? t(language, gameCopy.learning.playClip) : t(language, gameCopy.learning.playAgain)}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
