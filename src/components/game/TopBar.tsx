import { motion } from "framer-motion";
import { Languages, Volume2, VolumeX } from "lucide-react";
import { GameStage } from "@/types/game";
import { gameCopy, Language, stageLabels, t } from "@/lib/gameCopy";

interface TopBarProps {
  stage: GameStage;
  playerId: string | null;
  stageIndex: number;
  totalStages: number;
  language: Language;
  onLanguageChange: (language: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function TopBar({
  stage,
  playerId,
  stageIndex,
  totalStages,
  language,
  onLanguageChange,
  isMuted,
  onToggleMute,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            {t(language, gameCopy.appTitle)}
          </span>
          <span className="text-lg font-semibold text-foreground">
            {stageLabels[language][stage]}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground">
          <div className="relative flex items-center rounded-full border border-border bg-background/80 p-1 shadow-sm">
            <Languages className="ml-2 h-4 w-4" />
            {(["en", "ar"] as const).map((option) => {
              const active = language === option;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => onLanguageChange(option)}
                  className="relative rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors"
                  aria-pressed={active}
                >
                  {active && (
                    <motion.span
                      layoutId="language-toggle"
                      className="absolute inset-0 rounded-full bg-primary shadow-sm"
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                    />
                  )}
                  <span className={`relative z-10 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={onToggleMute}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 font-medium text-foreground transition-transform duration-200 hover:scale-105"
            aria-pressed={!isMuted}
            aria-label={isMuted ? t(language, gameCopy.topBar.unmute) : t(language, gameCopy.topBar.mute)}
          >
            <motion.span
              key={isMuted ? "muted" : "unmuted"}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </motion.span>
            <span>{isMuted ? t(language, gameCopy.topBar.unmute) : t(language, gameCopy.topBar.mute)}</span>
          </button>

          {playerId && <span>{t(language, gameCopy.topBar.id)}: {playerId}</span>}
          {stage !== "onboarding" && (
            <span>
              {t(language, gameCopy.topBar.stage)} {stageIndex}/{totalStages - 1}
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
