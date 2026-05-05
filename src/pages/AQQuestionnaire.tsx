import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AQ_QUESTIONS, computeAQScore } from "@/config/aqQuestions";
import { gameCopy, Language, t } from "@/lib/gameCopy";
import { supabase } from "@/integrations/supabase/client";
import { getAudioSrc } from "@/config/videoConfig";
import StageIntro from "@/components/game/StageIntro";
import { Volume2, Pause, RotateCcw } from "lucide-react";
import { MotionClick, normalizeClickCoords, saveMotionTrial } from "@/lib/motionTracking";

interface Props {
  language: Language;
  userId: string;
  onComplete: () => void;
}

export default function AQQuestionnaire({ language, userId, onComplete }: Props) {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ total: number; interpretation: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [qPlaying, setQPlaying] = useState(false);
  const [qPaused, setQPaused] = useState(false);
  const qAudioRef = useRef<HTMLAudioElement | null>(null);
  const startTimeRef = useRef(Date.now());
  const clicksRef = useRef<MotionClick[]>([]);
  const formRef = useRef<HTMLDivElement>(null);

  const allAnswered = AQ_QUESTIONS.every((q) => answers[q.id] !== undefined);

  const questionsAudioSrc = language === "ar" ? "/audio/questionnaire-questions-ar.mp3" : "/audio/questionnaire-questions.mp3";

  const getQAudio = useCallback(() => {
    if (!qAudioRef.current || qAudioRef.current.src !== new URL(questionsAudioSrc, window.location.origin).href) {
      if (qAudioRef.current) { qAudioRef.current.pause(); qAudioRef.current = null; }
      qAudioRef.current = new Audio(questionsAudioSrc);
      qAudioRef.current.onended = () => { setQPlaying(false); setQPaused(false); };
    }
    return qAudioRef.current;
  }, [questionsAudioSrc]);

  const toggleQAudio = useCallback(() => {
    const audio = getQAudio();
    if (qPlaying && !qPaused) { audio.pause(); setQPaused(true); }
    else if (qPaused) { void audio.play(); setQPaused(false); }
    else { audio.currentTime = 0; void audio.play(); setQPlaying(true); setQPaused(false); }
  }, [qPlaying, qPaused, getQAudio]);

  const restartQAudio = useCallback(() => {
    const audio = getQAudio();
    audio.currentTime = 0; void audio.play(); setQPlaying(true); setQPaused(false);
  }, [getQAudio]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (qAudioRef.current) {
        qAudioRef.current.pause();
        qAudioRef.current = null;
      }
    };
  }, []);

  const handleAnswer = useCallback((id: number, val: boolean, e?: React.MouseEvent<HTMLButtonElement>) => {
    setAnswers((prev) => ({ ...prev, [id]: val }));
    if (e) {
      const coords = normalizeClickCoords(e, formRef.current);
      clicksRef.current.push({
        x: coords.x,
        y: coords.y,
        t: Date.now() - startTimeRef.current,
        box_id: `q${id}_${val ? "yes" : "no"}`,
        target: `q${id}`,
        selected: val ? "yes" : "no",
        correct: true,
      });
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setSaving(true);
    const score = computeAQScore(answers);
    setResult(score);

    try {
      await supabase.from("aq_assessments").insert({
        user_id: userId,
        total_score: score.total,
        interpretation: score.interpretation,
        answers_json: answers,
      } as any);
      await supabase.from("profiles").update({ aq_completed: true } as any).eq("id", userId);
    } catch (e) {
      console.error("Error saving AQ:", e);
    }
    void saveMotionTrial({ trialNumber: 41, clicks: clicksRef.current });
    setSaving(false);
    setSubmitted(true);
  }, [allAnswered, answers, userId]);

  if (submitted && result) {
    const interpKey = result.interpretation as keyof typeof gameCopy.questionnaire.interpretation;
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-8 text-center shadow-lg">
          <h2 className="mb-3 text-2xl font-bold text-foreground">{t(language, gameCopy.questionnaire.resultTitle)}</h2>
          <div className="mb-4 rounded-lg bg-primary/10 p-6">
            <p className="text-5xl font-bold text-primary">{result.total}/27</p>
          </div>
          <p className="mb-6 text-base text-muted-foreground">
            {t(language, gameCopy.questionnaire.interpretation[interpKey])}
          </p>
          <Button onClick={onComplete} size="lg" className="h-12 w-full">
            {t(language, gameCopy.questionnaire.continue)}
          </Button>
        </div>
      </motion.div>
    );
  }

  const categories = [...new Set(AQ_QUESTIONS.map((q) => q.category))];

  // Shuffle questions within each category once per mount for variation
  const shuffledByCategoryRef = useRef<Record<string, typeof AQ_QUESTIONS> | null>(null);
  if (!shuffledByCategoryRef.current) {
    const map: Record<string, typeof AQ_QUESTIONS> = {};
    for (const cat of categories) {
      const items = AQ_QUESTIONS.filter((q) => q.category === cat);
      // Fisher-Yates
      for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
      }
      map[cat] = items;
    }
    shuffledByCategoryRef.current = map;
  }
  const shuffledByCategory = shuffledByCategoryRef.current;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-3xl px-4 py-8">
      <StageIntro
        title={t(language, gameCopy.questionnaire.stageTitle)}
        description={t(language, gameCopy.questionnaire.stageDescription)}
        audioSrc={getAudioSrc("/audio/questionnaire.mp3", language)}
        language={language}
      />

      {/* Listen to questions audio button */}
      <div className="mb-6 flex items-center gap-1">
        <Button variant="outline" size="sm" onClick={toggleQAudio} className="gap-2">
          {qPlaying && !qPaused ? <Pause className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          {t(language, gameCopy.questionnaire.listenQuestions)}
        </Button>
        {qPlaying && (
          <Button variant="ghost" size="sm" onClick={restartQAudio} className="px-2" title="Restart">
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div ref={formRef} className="space-y-6">
        {categories.map((cat) => (
          <div key={cat} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary">{cat}</h3>
            <div className="space-y-4">
              <AnimatePresence>
                {shuffledByCategory[cat].map((q, idx) => (
                  <motion.div
                    key={q.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-4 rounded-lg border border-border/50 p-4"
                  >
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {q.id}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed text-foreground">{q.text[language]}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        ({q.weight} {q.weight === 1 ? "point" : "points"})
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={(e) => handleAnswer(q.id, true, e)}
                        className={`rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition-all ${
                          answers[q.id] === true ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {t(language, gameCopy.questionnaire.yes)}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleAnswer(q.id, false, e)}
                        className={`rounded-lg border-2 px-4 py-1.5 text-sm font-semibold transition-all ${
                          answers[q.id] === false ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-primary/50"
                        }`}
                      >
                        {t(language, gameCopy.questionnaire.no)}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <Button onClick={handleSubmit} disabled={!allAnswered || saving} size="lg" className="h-14 px-12 text-lg">
          {saving ? "..." : t(language, gameCopy.questionnaire.submit)}
        </Button>
      </div>
    </motion.div>
  );
}
