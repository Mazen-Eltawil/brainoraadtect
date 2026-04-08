import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GameSession } from "@/types/game";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { supabase } from "@/integrations/supabase/client";
import { RatingInteraction } from "@/components/ui/emoji-rating";

interface Props {
  session: GameSession;
  language: Language;
  onGoToDashboard?: () => void;
}

export default function ResultsScreen({ session, language, onGoToDashboard }: Props) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingGiven, setRatingGiven] = useState(false);

  const shortTermResponses = session.responses.filter((r) => r.stage === "short_term");
  const longTermResponses = session.responses.filter((r) => r.stage === "long_term");
  const stCorrect = shortTermResponses.filter((r) => r.isCorrect).length;
  const ltCorrect = longTermResponses.filter((r) => r.isCorrect).length;
  const p1 = session.puzzleRuns[0]?.score ?? 0;
  const p2 = session.puzzleRuns[1]?.score ?? 0;
  const p3 = session.puzzleRuns[2]?.score ?? 0;
  const puzzleTotal = Math.round((p1 + p2 + p3) * 10) / 10;
  const reorderCorrect = session.reorderingCorrect;
  const totalScore = stCorrect + ltCorrect + (reorderCorrect ? 1 : 0) + puzzleTotal;
  const maxScore = shortTermResponses.length + longTermResponses.length + 1 + 3;

  useEffect(() => {
    const saveResults = async () => {
      setSaving(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Get AQ score
        const { data: aqData } = await supabase.from("aq_assessments").select("total_score").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1);
        const aqScore = aqData && aqData.length > 0 ? (aqData[0] as any).total_score : 0;

        const { error: scoresError } = await supabase.from("scores").insert({
          email: user.email || "",
          short_term_score: stCorrect,
          long_term_score: ltCorrect,
          reordering_correct: reorderCorrect,
          puzzle_stage1_score: p1,
          puzzle_stage2_score: p2,
          puzzle_stage3_score: p3,
          total_score: totalScore,
          aq_assessment: aqScore,
        } as any);
        if (scoresError) console.error("Scores insert error:", scoresError);

        setSaved(true);
        setTimeout(() => setShowRating(true), 800);
      } catch (e) {
        console.error("Error saving results:", e);
      } finally {
        setSaving(false);
      }
    };
    saveResults();
  }, []); // eslint-disable-line

  const handleRating = (value: number) => {
    setRatingGiven(true);
    setTimeout(() => setShowRating(false), 1200);
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-xl border border-border bg-surface p-8 text-center shadow-md">
          <h2 className="mb-2 text-3xl font-bold text-foreground">{t(language, gameCopy.results.title)}</h2>
          <div className="mb-8 rounded-lg bg-primary/10 p-6">
            <p className="text-sm uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.results.compositeScore)}</p>
            <p className="text-5xl font-bold text-primary">{totalScore}/{maxScore}</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-left">
            <ScoreCard title={t(language, gameCopy.results.shortTerm)} score={stCorrect} total={shortTermResponses.length} avgTime={avg(shortTermResponses.map((r) => r.responseTimeMs))} language={language} />
            <ScoreCard title={t(language, gameCopy.results.longTerm)} score={ltCorrect} total={longTermResponses.length} avgTime={avg(longTermResponses.map((r) => r.responseTimeMs))} language={language} />
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.results.reordering)}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{reorderCorrect ? t(language, gameCopy.results.correct) : t(language, gameCopy.results.incorrect)}</p>
              <p className="text-sm text-muted-foreground">{t(language, gameCopy.results.answer)}: {session.reorderingAnswer ?? "—"}</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{t(language, gameCopy.results.puzzle)}</p>
              <p className="mt-1 text-2xl font-bold text-foreground">{puzzleTotal}/3</p>
              <p className="text-sm text-muted-foreground">
                S1: {p1.toFixed(1)} · S2: {p2.toFixed(1)} · S3: {p3.toFixed(1)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            {saving && t(language, gameCopy.results.savingResults)}
            {saved && t(language, gameCopy.results.savedSuccess)}
          </div>
          {onGoToDashboard && (
            <Button onClick={onGoToDashboard} size="lg" className="mt-6">
              {t(language, gameCopy.results.goToDashboard)}
            </Button>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showRating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowRating(false)}>
            <motion.div initial={{ scale: 0.85, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.85, opacity: 0, y: 20 }} transition={{ type: "spring", duration: 0.5 }} className="w-full max-w-sm rounded-2xl border border-border bg-background p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <h3 className="mb-1 text-center text-xl font-bold text-foreground">
                {language === "ar" ? "كيف كانت تجربتك؟" : "How was your experience?"}
              </h3>
              <p className="mb-6 text-center text-sm text-muted-foreground">
                {language === "ar" ? "قيّم تجربتك مع التقييم" : "Rate your experience with the assessment"}
              </p>
              <RatingInteraction onChange={handleRating} />
              {ratingGiven && (
                <motion.p initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-sm font-medium text-primary">
                  {language === "ar" ? "شكراً لتقييمك! 🎉" : "Thanks for your feedback! 🎉"}
                </motion.p>
              )}
              <button onClick={() => setShowRating(false)} className="mt-4 block w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors">
                {language === "ar" ? "تخطي" : "Skip"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ScoreCard({ title, score, total, avgTime, language }: { title: string; score: number; total: number; avgTime: number; language: Language }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{score}/{total}</p>
      <p className="text-sm text-muted-foreground">{t(language, gameCopy.results.avg)}: {avgTime > 0 ? `${(avgTime / 1000).toFixed(1)}${t(language, gameCopy.results.secondsShort)}` : "—"}</p>
    </div>
  );
}

function avg(nums: number[]) { return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; }
