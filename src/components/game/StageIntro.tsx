import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Volume2, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { gameCopy, Language, t } from "@/lib/gameCopy";

interface StageIntroProps {
  title: string;
  description: string;
  audioSrc?: string;
  language: Language;
}

export default function StageIntro({ title, description, audioSrc, language }: StageIntroProps) {
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const getOrCreateAudio = useCallback(() => {
    if (!audioSrc) return null;
    if (!audioRef.current || audioRef.current.src !== new URL(audioSrc, window.location.origin).href) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      audioRef.current = new Audio(audioSrc);
      audioRef.current.onended = () => {
        setPlaying(false);
        setPaused(false);
      };
    }
    return audioRef.current;
  }, [audioSrc]);

  const toggleAudio = useCallback(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;
    if (playing && !paused) {
      // Currently playing → pause
      audio.pause();
      setPaused(true);
    } else if (paused) {
      // Paused → resume
      void audio.play();
      setPaused(false);
    } else {
      // Not playing → start
      audio.currentTime = 0;
      void audio.play();
      setPlaying(true);
      setPaused(false);
    }
  }, [playing, paused, getOrCreateAudio]);

  const restartAudio = useCallback(() => {
    const audio = getOrCreateAudio();
    if (!audio) return;
    audio.currentTime = 0;
    void audio.play();
    setPlaying(true);
    setPaused(false);
  }, [getOrCreateAudio]);

  // Stop audio on unmount (stage transition)
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const buttonLabel = playing
    ? paused
      ? t(language, gameCopy.stageIntro.paused)
      : t(language, gameCopy.stageIntro.playing)
    : t(language, gameCopy.stageIntro.playAudio);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {audioSrc && (
          <div className="flex shrink-0 items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleAudio}
              className="gap-2"
            >
              {playing && !paused ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              {buttonLabel}
            </Button>
            {playing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={restartAudio}
                className="px-2"
                title="Restart"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
