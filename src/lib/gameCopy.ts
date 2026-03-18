import { GameStage } from "@/types/game";

export type Language = "en" | "ar";

export const isArabic = (language: Language) => language === "ar";

export const t = (language: Language, value: Record<Language, string>) => value[language];

export const stageLabels: Record<Language, Record<GameStage, string>> = {
  en: {
    onboarding: "Welcome",
    learning: "Learning Phase",
    short_term: "Short-Term Memory",
    reordering: "Reordering Task",
    puzzle: "Puzzle Stage",
    long_term: "Long-Term Memory",
    results: "Results",
  },
  ar: {
    onboarding: "الترحيب",
    learning: "مرحلة التعلّم",
    short_term: "الذاكرة قصيرة المدى",
    reordering: "مهمة الترتيب",
    puzzle: "مرحلة اللغز",
    long_term: "الذاكرة طويلة المدى",
    results: "النتائج",
  },
};

export const gameCopy = {
  appTitle: {
    en: "Fasla Cognitive Game",
    ar: "لعبة فراسلا الإدراكية",
  },
  topBar: {
    id: { en: "ID", ar: "المعرف" },
    stage: { en: "Stage", ar: "المرحلة" },
    mute: { en: "Mute", ar: "كتم" },
    unmute: { en: "Unmute", ar: "تشغيل الصوت" },
  },
  onboarding: {
    title: { en: "Welcome", ar: "مرحباً" },
    description: {
      en: "This cognitive assessment tests memory, sequencing, and problem-solving through interactive game stages. Enter your Player ID to begin.",
      ar: "يقيس هذا التقييم الإدراكي الذاكرة والتسلسل وحل المشكلات عبر مراحل تفاعلية. أدخل معرف اللاعب للبدء.",
    },
    placeholder: { en: "Enter Player ID", ar: "أدخل معرف اللاعب" },
    button: { en: "Start Assessment", ar: "ابدأ التقييم" },
  },
  learning: {
    instructionsLabel: { en: "Instructions", ar: "التعليمات" },
    instructions: {
      en: "You will see 4 dancing clips: Fasla, 6 8, Money, Marshmallow. Watch each dancing video 3 times carefully — you will be tested later.",
      ar: "ستشاهد 4 مقاطع رقص: Fasla و 6 8 و Money و Marshmallow. شاهد كل فيديو رقص 3 مرات بعناية لأنك ستُختبر لاحقاً.",
    },
    nowLearning: { en: "Now learning:", ar: "تتعلم الآن:" },
    remember: {
      en: "Watch the movement and remember the label.",
      ar: "شاهد الحركة وتذكّر الاسم.",
    },
    clipCounter: { en: "Clip", ar: "المقطع" },
    repetition: { en: "Repetition", ar: "التكرار" },
    playClip: { en: "Play Clip", ar: "تشغيل المقطع" },
    playAgain: { en: "Play Again", ar: "أعد التشغيل" },
    learnedTitle: { en: "All Clips Learned!", ar: "تمت مشاهدة جميع المقاطع!" },
    learnedDescription: {
      en: "You've watched all 4 movement clips. Click Next to continue to the memory tests.",
      ar: "لقد شاهدت جميع مقاطع الحركات الأربعة. اضغط التالي للمتابعة إلى اختبارات الذاكرة.",
    },
    next: { en: "Next", ar: "التالي" },
  },
  shortTerm: {
    prompt: {
      en: "Which movement matches this name?",
      ar: "أي حركة تطابق هذا الاسم؟",
    },
    helper: {
      en: "Click the correct movement clip below.",
      ar: "اضغط على مقطع الحركة الصحيح بالأسفل.",
    },
    nextQuestion: { en: "Next Question", ar: "السؤال التالي" },
    continue: { en: "Continue", ar: "متابعة" },
    question: { en: "Question", ar: "السؤال" },
    of: { en: "of", ar: "من" },
  },
  reordering: {
    title: { en: "Reordering Task", ar: "مهمة الترتيب" },
    description: {
      en: 'The "6 8" clip has been divided into 6 segments shown below. Select the option that shows the correct chronological order of these segments.',
      ar: 'تم تقسيم مقطع "6 8" إلى 6 أجزاء موضحة بالأسفل. اختر الخيار الذي يعرض الترتيب الزمني الصحيح لهذه الأجزاء.',
    },
    correct: { en: "✅ Correct! The right sequence is option G.", ar: "✅ صحيح! الترتيب الصحيح هو الخيار G." },
    incorrectPrefix: { en: "❌ Incorrect. The correct answer was G", ar: "❌ غير صحيح. الإجابة الصحيحة كانت G" },
    continue: { en: "Continue", ar: "متابعة" },
  },
  puzzle: {
    rules: { en: "Rules", ar: "القواعد" },
    ruleStart: { en: "• Start on the START tile", ar: "• ابدأ من خانة START" },
    ruleAdjacent: {
      en: "• Move to any adjacent tile (including diagonals)",
      ar: "• تحرك إلى أي خانة مجاورة بما في ذلك القطرية",
    },
    ruleNoRevisit: { en: "• No revisiting tiles", ar: "• ممنوع زيارة نفس الخانة مرة أخرى" },
    ruleSand: { en: "• Visit all sand tiles", ar: "• زر جميع خانات الرمل" },
    ruleCrabs: { en: "• Avoid crabs 🦀", ar: "• تجنب السرطانات 🦀" },
    ruleKey: { en: "• Collect the key before the chest", ar: "• اجمع المفتاح قبل الصندوق" },
    sandTiles: { en: "Sand tiles", ar: "خانات الرمل" },
    key: { en: "Key", ar: "المفتاح" },
    collected: { en: "✅ Collected", ar: "✅ تم جمعه" },
    notCollected: { en: "❌ Not collected", ar: "❌ لم يتم جمعه" },
    retry: { en: "Retry", ar: "إعادة المحاولة" },
    continue: { en: "Continue", ar: "متابعة" },
    status: {
      idle: { en: "Click the START tile to begin.", ar: "اضغط على خانة START للبدء." },
      playing: { en: "Navigate to the treasure chest!", ar: "اتجه إلى صندوق الكنز!" },
      success: { en: "🎉 Congratulations! Puzzle completed successfully!", ar: "🎉 رائع! تم حل اللغز بنجاح!" },
      fail_crab: { en: "🦀 You stepped on a crab. Puzzle failed.", ar: "🦀 لقد وقفت على سرطان. فشل اللغز." },
      fail_no_key: { en: "🔒 Chest is locked — you did not collect the key.", ar: "🔒 الصندوق مقفل — لم تجمع المفتاح." },
      fail_incomplete: { en: "⚠️ You haven't visited all sand tiles yet.", ar: "⚠️ لم تزر جميع خانات الرمل بعد." },
    },
  },
  longTerm: {
    prompt: {
      en: "Watch the clip and select the correct label",
      ar: "شاهد المقطع واختر الاسم الصحيح",
    },
    nextQuestion: { en: "Next Question", ar: "السؤال التالي" },
    viewResults: { en: "View Results", ar: "عرض النتائج" },
    question: { en: "Question", ar: "السؤال" },
    of: { en: "of", ar: "من" },
  },
  results: {
    title: { en: "Assessment Complete", ar: "اكتمل التقييم" },
    player: { en: "Player", ar: "اللاعب" },
    compositeScore: { en: "Composite Score", ar: "الدرجة الإجمالية" },
    shortTerm: { en: "Short-Term Memory", ar: "الذاكرة قصيرة المدى" },
    longTerm: { en: "Long-Term Memory", ar: "الذاكرة طويلة المدى" },
    reordering: { en: "Reordering", ar: "الترتيب" },
    puzzle: { en: "Puzzle", ar: "اللغز" },
    correct: { en: "✅ Correct", ar: "✅ صحيح" },
    incorrect: { en: "❌ Incorrect", ar: "❌ غير صحيح" },
    solved: { en: "✅ Solved", ar: "✅ تم الحل" },
    failed: { en: "❌ Failed", ar: "❌ فشل" },
    answer: { en: "Answer", ar: "الإجابة" },
    avg: { en: "Avg", ar: "المتوسط" },
    secondsShort: { en: "s", ar: "ث" },
  },
} as const;
