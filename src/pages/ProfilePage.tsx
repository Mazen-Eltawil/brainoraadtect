import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  language: Language;
  userId: string;
  email: string;
  displayName?: string | null;
  onBack: () => void;
}

interface ScoreRow {
  id: string;
  email: string;
  short_term_score: number;
  long_term_score: number;
  reordering_correct: boolean;
  puzzle_stage1_score: number;
  puzzle_stage2_score: number;
  puzzle_stage3_score: number;
  total_score: number;
  aq_assessment: number;
  created_at: string;
}

export default function ProfilePage({ language, userId, email, displayName, onBack }: Props) {
  const [scores, setScores] = useState<ScoreRow[]>([]);

  useEffect(() => {
    supabase.from("scores").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setScores(data as any);
    });
  }, [userId]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-6xl px-4 py-8">
      <Button onClick={onBack} variant="ghost" className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> {t(language, gameCopy.profile.back)}
      </Button>

      <h1 className="mb-6 text-3xl font-bold text-foreground">{t(language, gameCopy.profile.title)}</h1>

      {scores.length === 0 ? (
        <p className="text-muted-foreground">{t(language, gameCopy.profile.noSessions)}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.name)}</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.shortTerm)}</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.longTerm)}</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.reordering)}</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">Puzzle 1</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">Puzzle 2</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">Puzzle 3</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">AQ©</th>
                <th className="whitespace-nowrap p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.finalScore)}</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s) => (
                <tr key={s.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 text-foreground">{s.email}</td>
                  <td className="p-3 text-foreground">{s.short_term_score}</td>
                  <td className="p-3 text-foreground">{s.long_term_score}</td>
                  <td className="p-3 text-foreground">{s.reordering_correct ? 1 : 0}</td>
                  <td className="p-3 text-foreground">{Number(s.puzzle_stage1_score ?? 0).toFixed(1)}</td>
                  <td className="p-3 text-foreground">{Number(s.puzzle_stage2_score ?? 0).toFixed(1)}</td>
                  <td className="p-3 text-foreground">{Number(s.puzzle_stage3_score ?? 0).toFixed(1)}</td>
                  <td className="p-3 text-foreground">{s.aq_assessment}</td>
                  <td className="p-3 font-bold text-primary">{s.total_score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
