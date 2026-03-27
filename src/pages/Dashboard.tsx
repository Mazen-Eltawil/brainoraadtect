import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, User } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";

interface Props {
  language: Language;
  onStartGame: () => void;
  onViewProfile: () => void;
}

export default function Dashboard({ language, onStartGame, onViewProfile }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] items-center justify-center px-4"
    >
      <div className="w-full max-w-lg text-center">
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-3 text-4xl font-extrabold tracking-tight text-foreground"
        >
          {t(language, gameCopy.dashboard.welcome)}
        </motion.h1>
        <p className="mb-10 text-lg text-muted-foreground">{t(language, gameCopy.appTitle)}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Button
            onClick={onStartGame}
            size="lg"
            className="h-14 gap-3 bg-gradient-to-r from-primary to-primary/80 px-8 text-lg font-bold shadow-md transition-transform hover:scale-[1.02]"
          >
            <Play className="h-5 w-5" />
            {t(language, gameCopy.dashboard.startGame)}
          </Button>
          <Button
            onClick={onViewProfile}
            size="lg"
            variant="outline"
            className="h-14 gap-3 px-8 text-lg font-bold"
          >
            <User className="h-5 w-5" />
            {t(language, gameCopy.dashboard.viewProfile)}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
