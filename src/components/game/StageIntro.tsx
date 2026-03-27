import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Volume2, Pause } from "lucide-react";
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
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleAudio = useCallback(() => {
    if (!audioSrc) return;
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.onended = () => setPlaying(false);
    }
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.currentTime = 0;
      void audioRef.current.play();
      setPlaying(true);
    }
  }, [audioSrc, playing]);

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
          <Button
            variant="outline"
            size="sm"
            onClick={toggleAudio}
            className="shrink-0 gap-2"
          >
            {playing ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            {playing ? t(language, gameCopy.stageIntro.playing) : t(language, gameCopy.stageIntro.playAudio)}
          </Button>
        )}
      </div>
    </motion.div>
  );
}
