import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OnboardingProps {
  onStart: (playerId: string) => void;
}

export default function Onboarding({ onStart }: OnboardingProps) {
  const [playerId, setPlayerId] = useState("");

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[70vh] items-center justify-center"
    >
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
        <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
          Welcome
        </h1>
        <p className="mb-6 text-base leading-relaxed text-muted-foreground">
          This cognitive assessment will test your memory, sequencing, and problem-solving through a series of fun interactive stages. Enter your Player ID to begin.
        </p>
        <div className="space-y-4">
          <Input
            placeholder="Enter Player ID"
            value={playerId}
            onChange={(e) => setPlayerId(e.target.value)}
            className="h-12 text-base"
            aria-label="Player ID"
          />
          <Button
            onClick={() => onStart(playerId.trim())}
            disabled={!playerId.trim()}
            className="w-full h-12 text-base"
            size="lg"
          >
            Start Assessment
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
