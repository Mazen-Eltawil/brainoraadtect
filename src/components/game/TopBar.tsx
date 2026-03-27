import { motion } from "framer-motion";
import { Languages, Volume2, VolumeX, Sun, Moon, Monitor, LogOut } from "lucide-react";
import { GameStage } from "@/types/game";
import { gameCopy, Language, stageLabels, t } from "@/lib/gameCopy";
import { Theme } from "@/hooks/useTheme";

interface TopBarProps {
  stage: GameStage | "dashboard" | "profile" | "questionnaire" | "auth";
  stageIndex: number;
  totalStages: number;
  language: Language;
  onLanguageChange: (language: Language) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onLogout?: () => void;
  isLoggedIn?: boolean;
}

const themeIcons = { system: Monitor, light: Sun, dark: Moon };
const themeKeys: Theme[] = ["system", "light", "dark"];

export default function TopBar({
  stage, stageIndex, totalStages, language, onLanguageChange,
  isMuted, onToggleMute, theme, onThemeChange, onLogout, isLoggedIn,
}: TopBarProps) {
  const isGameStage = !["dashboard", "profile", "questionnaire", "auth"].includes(stage);
  const stageLabel = isGameStage ? stageLabels[language][stage as GameStage] : "";

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-bold uppercase tracking-widest text-primary">
            {t(language, gameCopy.appTitle)}
          </span>
          {isGameStage && <span className="text-lg font-semibold text-foreground">{stageLabel}</span>}
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 text-sm text-muted-foreground">
          {/* Language toggle */}
          <div className="relative flex items-center rounded-full border border-border bg-background/80 p-1 shadow-sm">
            <Languages className="ml-2 h-4 w-4" />
            {(["en", "ar"] as const).map((option) => {
              const active = language === option;
              return (
                <button key={option} type="button" onClick={() => onLanguageChange(option)}
                  className="relative rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition-colors">
                  {active && <motion.span layoutId="language-toggle" className="absolute inset-0 rounded-full bg-primary shadow-sm" transition={{ type: "spring", stiffness: 360, damping: 28 }} />}
                  <span className={`relative z-10 ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>{option}</span>
                </button>
              );
            })}
          </div>

          {/* Theme toggle */}
          <div className="relative flex items-center rounded-full border border-border bg-background/80 p-1 shadow-sm">
            {themeKeys.map((key) => {
              const active = theme === key;
              const Icon = themeIcons[key];
              return (
                <button key={key} type="button" onClick={() => onThemeChange(key)}
                  className="relative rounded-full p-2 transition-colors">
                  {active && <motion.span layoutId="theme-toggle" className="absolute inset-0 rounded-full bg-primary shadow-sm" transition={{ type: "spring", stiffness: 360, damping: 28 }} />}
                  <Icon className={`relative z-10 h-3.5 w-3.5 ${active ? "text-primary-foreground" : "text-muted-foreground"}`} />
                </button>
              );
            })}
          </div>

          {/* Mute toggle */}
          <button type="button" onClick={onToggleMute}
            className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 font-medium text-foreground transition-transform duration-200 hover:scale-105">
            <motion.span key={isMuted ? "m" : "u"} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.2 }}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </motion.span>
            <span>{isMuted ? t(language, gameCopy.topBar.unmute) : t(language, gameCopy.topBar.mute)}</span>
          </button>

          {/* Logout */}
          {isLoggedIn && onLogout && (
            <button type="button" onClick={onLogout}
              className="flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 font-medium text-foreground transition-transform duration-200 hover:scale-105">
              <LogOut className="h-4 w-4" />
              <span>{t(language, gameCopy.auth.logout)}</span>
            </button>
          )}

          {isGameStage && stage !== "onboarding" && (
            <span>{t(language, gameCopy.topBar.stage)} {stageIndex}/{totalStages - 1}</span>
          )}
        </div>
      </div>
    </header>
  );
}
