export interface AQQuestion {
  id: number;
  category: string;
  text: { en: string; ar: string };
  weight: number;
}

export const AQ_QUESTIONS: AQQuestion[] = [
  // MEMORY
  { id: 1, category: "Memory", text: { en: "Do you have memory loss?", ar: "هل تعاني من فقدان الذاكرة؟" }, weight: 1 },
  { id: 2, category: "Memory", text: { en: "If so, is your memory worse than a few years ago?", ar: "إذا كان الأمر كذلك، هل ذاكرتك أسوأ من قبل بضع سنوات؟" }, weight: 1 },
  { id: 3, category: "Memory", text: { en: "Do you repeat questions OR statements OR stories in the same day?", ar: "هل تكرر أسئلة أو عبارات أو قصص في نفس اليوم؟" }, weight: 2 },
  { id: 4, category: "Memory", text: { en: "Have you had to take over tracking events OR appointments? OR do you forget appointments?", ar: "هل اضطررت لتتبع المواعيد؟ أو هل تنسى المواعيد؟" }, weight: 1 },
  { id: 5, category: "Memory", text: { en: "Do you misplace items more than once a month? OR do you misplace objects so that you cannot find them?", ar: "هل تضع الأشياء في غير مكانها أكثر من مرة في الشهر؟ أو هل تضعها بحيث لا تجدها؟" }, weight: 1 },
  { id: 6, category: "Memory", text: { en: "Do you suspect others are moving, hiding, or stealing items when you cannot find them?", ar: "هل تشتبه بأن الآخرين يحركون أو يخفون أو يسرقون أغراضك عندما لا تجدها؟" }, weight: 1 },
  // ORIENTATION
  { id: 7, category: "Orientation", text: { en: "Do you frequently have trouble knowing the day, date, month, year, or time?", ar: "هل تواجه صعوبة متكررة في معرفة اليوم والتاريخ والشهر والسنة والوقت؟" }, weight: 2 },
  { id: 8, category: "Orientation", text: { en: "Do you become disoriented in unfamiliar places?", ar: "هل تصاب بالارتباك في الأماكن غير المألوفة؟" }, weight: 1 },
  { id: 9, category: "Orientation", text: { en: "Do you become more confused outside the home or when traveling?", ar: "هل تصبح أكثر ارتباكاً خارج المنزل أو عند السفر؟" }, weight: 1 },
  // FUNCTIONAL ABILITY
  { id: 10, category: "Functional Ability", text: { en: "Do you have trouble handling money, such as tips or calculating change?", ar: "هل تواجه صعوبة في التعامل مع المال مثل الإكراميات أو حساب الباقي؟" }, weight: 1 },
  { id: 11, category: "Functional Ability", text: { en: "Do you have trouble paying bills or doing finances, or are family members taking over finances?", ar: "هل تواجه صعوبة في دفع الفواتير أو إدارة الشؤون المالية، أو هل تولى أفراد العائلة ذلك؟" }, weight: 2 },
  { id: 12, category: "Functional Ability", text: { en: "Do you have trouble remembering to take medications or tracking medications taken?", ar: "هل تواجه صعوبة في تذكر تناول الأدوية أو تتبعها؟" }, weight: 1 },
  { id: 13, category: "Functional Ability", text: { en: "Are you having difficulty driving, or are you concerned about your driving?", ar: "هل تواجه صعوبة في القيادة، أو هل أنت قلق بشأن قيادتك؟" }, weight: 1 },
  { id: 14, category: "Functional Ability", text: { en: "Do you have trouble using appliances such as the microwave, oven, remote control, or telephone?", ar: "هل تواجه صعوبة في استخدام الأجهزة مثل الميكروويف أو الفرن أو جهاز التحكم أو الهاتف؟" }, weight: 1 },
  { id: 15, category: "Functional Ability", text: { en: "Do you have difficulty completing home repair or housekeeping tasks?", ar: "هل تواجه صعوبة في إتمام أعمال الصيانة المنزلية أو التنظيف؟" }, weight: 1 },
  { id: 16, category: "Functional Ability", text: { en: "Have you given up or significantly reduced activities such as golfing, dancing, exercising, or crafts?", ar: "هل تخليت أو قللت بشكل كبير من الأنشطة مثل الرياضة أو الرقص أو الحرف؟" }, weight: 1 },
  // VISUOSPATIAL
  { id: 17, category: "Visuospatial", text: { en: "Do you get lost in familiar surroundings, such as your own neighborhood?", ar: "هل تضل طريقك في محيط مألوف مثل حيك الخاص؟" }, weight: 2 },
  { id: 18, category: "Visuospatial", text: { en: "Do you have a decreased sense of direction?", ar: "هل لديك إحساس ضعيف بالاتجاهات؟" }, weight: 1 },
  // LANGUAGE
  { id: 19, category: "Language", text: { en: "Do you have trouble finding words other than names?", ar: "هل تواجه صعوبة في إيجاد الكلمات غير الأسماء؟" }, weight: 1 },
  { id: 20, category: "Language", text: { en: "Do you confuse names of family members or friends?", ar: "هل تخلط بين أسماء أفراد العائلة أو الأصدقاء؟" }, weight: 2 },
  { id: 21, category: "Language", text: { en: "Do you have difficulty recognizing people familiar to you?", ar: "هل تواجه صعوبة في التعرف على أشخاص مألوفين لديك؟" }, weight: 2 },
];

export function computeAQScore(answers: Record<number, boolean>): { total: number; interpretation: string } {
  let total = 0;
  for (const q of AQ_QUESTIONS) {
    if (answers[q.id]) {
      total += q.weight;
    }
  }
  let interpretation: string;
  if (total <= 4) {
    interpretation = "normal";
  } else if (total <= 14) {
    interpretation = "mild_cognitive_impairment";
  } else {
    interpretation = "dementia";
  }
  return { total, interpretation };
}
