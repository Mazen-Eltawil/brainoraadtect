import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Volume2, Pause, RotateCcw } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { getAudioSrc } from "@/config/videoConfig";

interface OnboardingProps {
  onStart: () => void;
  language: Language;
}

export default function Onboarding({ onStart, language }: OnboardingProps) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const audioSrc = getAudioSrc("/audio/intro.mp3", language);

  const getOrCreateAudio = useCallback(() => {
    if (!audioRef.current || audioRef.current.src !== new URL(audioSrc, window.location.origin).href) {
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      audioRef.current = new Audio(audioSrc);
      audioRef.current.onended = () => { setPlaying(false); setPaused(false); };
    }
    return audioRef.current;
  }, [audioSrc]);

  const toggleAudio = useCallback(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;
    if (playing && !paused) { audio.pause(); setPaused(true); }
    else if (paused) { void audio.play(); setPaused(false); }
    else { audio.currentTime = 0; void audio.play(); setPlaying(true); setPaused(false); }
  }, [playing, paused, getOrCreateAudio]);

  const restartAudio = useCallback(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;
    audio.currentTime = 0; void audio.play(); setPlaying(true); setPaused(false);
  }, [getOrCreateAudio]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="flex min-h-[70vh] items-center justify-center px-4"
    >
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-10 text-center shadow-lg">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-3 text-4xl font-extrabold tracking-tight text-foreground"
        >
          {t(language, gameCopy.onboarding.title)}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-8 text-base leading-relaxed text-muted-foreground"
        >
          {t(language, gameCopy.onboarding.description)}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mb-6 flex items-center justify-center gap-1"
        >
          <Button variant="outline" onClick={toggleAudio} className="gap-2">
            {playing && !paused ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {t(language, gameCopy.onboarding.playIntro)}
          </Button>
          {playing && (
            <Button variant="ghost" size="sm" onClick={restartAudio} className="px-2" title="Restart">
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
        >
          <Button
            onClick={onStart}
            size="lg"
            className="h-14 w-full bg-gradient-to-r from-primary to-primary/80 text-lg font-bold shadow-md transition-transform hover:scale-[1.02] hover:shadow-lg"
          >
            {t(language, gameCopy.onboarding.button)}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
