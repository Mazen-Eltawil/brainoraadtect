import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, X } from "lucide-react";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  language: Language;
  userId: string;
  email: string;
  onBack: () => void;
}

interface SessionRow {
  id: string;
  created_at: string;
  total_score: number;
  max_score: number;
  short_term_score: number;
  short_term_total: number;
  long_term_score: number;
  long_term_total: number;
  reordering_correct: boolean;
  reordering_answer: string | null;
  puzzle_success: boolean;
  puzzle_steps: number | null;
  puzzle_duration_ms: number | null;
}

interface AQRow {
  total_score: number;
  interpretation: string;
  created_at: string;
}

interface ResponseRow {
  id: string;
  stage: string;
  target: string;
  selected: string;
  is_correct: boolean;
  response_time_ms: number;
}

export default function ProfilePage({ language, userId, email, onBack }: Props) {
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [aq, setAQ] = useState<AQRow | null>(null);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [responses, setResponses] = useState<ResponseRow[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  useEffect(() => {
    supabase.from("game_sessions").select("*").eq("user_id", userId).order("created_at", { ascending: false }).then(({ data }) => {
      if (data) setSessions(data as any);
    });
    supabase.from("aq_assessments").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).then(({ data }) => {
      if (data && data.length > 0) setAQ(data[0] as any);
    });
  }, [userId]);

  const viewSession = async (sessionId: string) => {
    setSelectedSession(sessionId);
    setLoadingResponses(true);
    const { data } = await supabase.from("game_responses").select("*").eq("session_id", sessionId).order("created_at", { ascending: true });
    setResponses((data as any) ?? []);
    setLoadingResponses(false);
  };

  const interpLabel = (key: string) => {
    const map: Record<string, Record<Language, string>> = {
      normal: gameCopy.questionnaire.interpretation.normal,
      mild_cognitive_impairment: gameCopy.questionnaire.interpretation.mild_cognitive_impairment,
      dementia: gameCopy.questionnaire.interpretation.dementia,
    };
    return map[key] ? t(language, map[key]) : key;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl px-4 py-8">
      <Button onClick={onBack} variant="ghost" className="mb-4 gap-2">
        <ArrowLeft className="h-4 w-4" /> {t(language, gameCopy.profile.back)}
      </Button>

      <h1 className="mb-6 text-3xl font-bold text-foreground">{t(language, gameCopy.profile.title)}</h1>

      <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
        <p className="text-sm text-muted-foreground">{t(language, gameCopy.auth.email)}</p>
        <p className="text-lg font-semibold text-foreground">{email}</p>
      </div>

      {aq && (
        <div className="mb-6 rounded-xl border border-border bg-surface p-5 shadow-sm">
          <h2 className="mb-2 text-lg font-bold text-foreground">{t(language, gameCopy.profile.aqScore)}</h2>
          <p className="text-3xl font-bold text-primary">{aq.total_score}/27</p>
          <p className="text-sm text-muted-foreground">{interpLabel(aq.interpretation)}</p>
        </div>
      )}

      <h2 className="mb-3 text-lg font-bold text-foreground">{t(language, gameCopy.profile.gameHistory)}</h2>
      {sessions.length === 0 ? (
        <p className="text-muted-foreground">{t(language, gameCopy.profile.noSessions)}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.date)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.score)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.results.shortTerm)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.results.longTerm)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.results.reordering)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground">{t(language, gameCopy.results.puzzle)}</th>
                <th className="p-3 text-left font-semibold text-muted-foreground"></th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="p-3 text-foreground">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-primary">{s.total_score}/{s.max_score}</td>
                  <td className="p-3 text-foreground">{s.short_term_score}/{s.short_term_total}</td>
                  <td className="p-3 text-foreground">{s.long_term_score}/{s.long_term_total}</td>
                  <td className="p-3 text-foreground">{s.reordering_correct ? "✅" : "❌"}</td>
                  <td className="p-3 text-foreground">{s.puzzle_success ? "✅" : "❌"}</td>
                  <td className="p-3">
                    <Button size="sm" variant="ghost" onClick={() => viewSession(s.id)} className="gap-1">
                      <Eye className="h-4 w-4" /> {t(language, gameCopy.profile.viewDetails)}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Session detail modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-xl font-bold text-foreground">{t(language, gameCopy.profile.sessionDetails)}</h3>
                <Button size="sm" variant="ghost" onClick={() => setSelectedSession(null)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {loadingResponses ? (
                <div className="flex justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : responses.length === 0 ? (
                <p className="text-muted-foreground">{t(language, gameCopy.profile.noSessions)}</p>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="p-2 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.stage)}</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.target)}</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.selected)}</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.correct)}</th>
                        <th className="p-2 text-left font-semibold text-muted-foreground">{t(language, gameCopy.profile.responseTime)}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {responses.map((r) => (
                        <tr key={r.id} className="border-t border-border">
                          <td className="p-2 text-foreground capitalize">{r.stage.replace("_", " ")}</td>
                          <td className="p-2 text-foreground">{r.target}</td>
                          <td className="p-2 text-foreground">{r.selected}</td>
                          <td className="p-2">{r.is_correct ? "✅" : "❌"}</td>
                          <td className="p-2 text-muted-foreground">{(r.response_time_ms / 1000).toFixed(1)}s</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
