import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gameCopy, Language, t } from "@/lib/gameCopy";

interface OnboardingProps {
  onStart: (playerId: string) => void;
  language: Language;
}

export default function Onboarding({ onStart, language }: OnboardingProps) {
  const [playerId, setPlayerId] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] items-center justify-center"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          {t(language, gameCopy.onboarding.title)}
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">
          {t(language, gameCopy.onboarding.description)}
        </p>
        <div className="space-y-4">
          <Input
            placeholder={t(language, gameCopy.onboarding.placeholder)}
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="h-12 text-base"
            aria-label={t(language, gameCopy.onboarding.placeholder)}
          />
          <Button
            onClick={() => onStart(playerId.trim())}
            disabled={!playerId.trim()}
            className="h-12 w-full text-base"
            size="lg"
          >
            {t(language, gameCopy.onboarding.button)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
