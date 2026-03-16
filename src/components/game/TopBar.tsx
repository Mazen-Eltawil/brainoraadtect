import { STAGE_LABELS, GameStage, STAGE_ORDER } from "@/types/game";

interface TopBarProps {
  stage: GameStage;
  playerId: string | null;
  stageIndex: number;
  totalStages: number;
}

export default function TopBar({ stage, playerId, stageIndex, totalStages }: TopBarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <span className="text-sm font-bold tracking-widest uppercase text-primary">
          Fasla Cognitive Game
        </span>
        <span className="text-lg font-semibold text-foreground">
          {STAGE_LABELS[stage]}
        </span>
        <div className="flex items-center gap-4 text-sm text-muted-foreground tracking-wide">
          {playerId && <span>ID: {playerId}</span>}
          {stage !== "onboarding" && (
            <span>Stage {stageIndex}/{totalStages - 1}</span>
          )}
        </div>
      </div>
    </header>
  );
}
