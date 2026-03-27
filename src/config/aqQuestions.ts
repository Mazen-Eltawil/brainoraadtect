export interface AQQuestion {
  id: number;
  category: string;
  text: { en: string; ar: string };
  weight: number;
}

export const AQ_QUESTIONS: AQQuestion[] = [
  // MEMORY
  { id: 1, category: "Memory", text: { en: "Does your loved one have memory loss?", ar: "هل يعاني قريبك من فقدان الذاكرة؟" }, weight: 1 },
  { id: 2, category: "Memory", text: { en: "If so, is their memory worse than a few years ago?", ar: "إذا كان الأمر كذلك، هل ذاكرتهم أسوأ من قبل بضع سنوات؟" }, weight: 1 },
  { id: 3, category: "Memory", text: { en: "Does the patient repeat questions OR statements OR stories in the same day?", ar: "هل يكرر المريض أسئلة أو عبارات أو قصص في نفس اليوم؟" }, weight: 2 },
  { id: 4, category: "Memory", text: { en: "Have you had to take over tracking events OR appointments? OR Does the patient forget appointments?", ar: "هل اضطررت لتتبع المواعيد بدلاً عنه؟ أو هل ينسى المريض المواعيد؟" }, weight: 1 },
  { id: 5, category: "Memory", text: { en: "Does the patient misplace items more than once a month? OR Does the patient misplace objects so that he or she cannot find them?", ar: "هل يضع المريض الأشياء في غير مكانها أكثر من مرة في الشهر؟" }, weight: 1 },
  { id: 6, category: "Memory", text: { en: "Does the patient suspect others are moving, hiding or stealing items when they cannot find them?", ar: "هل يشتبه المريض بأن الآخرين يحركون أو يخفون أو يسرقون أغراضه عندما لا يجدها؟" }, weight: 1 },
  // ORIENTATION
  { id: 7, category: "Orientation", text: { en: "Does the patient frequently have trouble knowing the day, date, month, year, time?", ar: "هل يواجه المريض صعوبة متكررة في معرفة اليوم والتاريخ والشهر والسنة والوقت؟" }, weight: 2 },
  { id: 8, category: "Orientation", text: { en: "Does the patient become disoriented in unfamiliar places?", ar: "هل يصاب المريض بالارتباك في الأماكن غير المألوفة؟" }, weight: 1 },
  { id: 9, category: "Orientation", text: { en: "Does the patient become more confused outside the home or when traveling?", ar: "هل يصبح المريض أكثر ارتباكاً خارج المنزل أو عند السفر؟" }, weight: 1 },
  // FUNCTIONAL ABILITY
  { id: 10, category: "Functional Ability", text: { en: "Does the patient have trouble handling money (tips, calculating change)?", ar: "هل يواجه المريض صعوبة في التعامل مع المال (الإكراميات، حساب الباقي)؟" }, weight: 1 },
  { id: 11, category: "Functional Ability", text: { en: "Does the patient have trouble paying bills or doing finances OR are family members taking over finances?", ar: "هل يواجه المريض صعوبة في دفع الفواتير أو إدارة الشؤون المالية؟" }, weight: 2 },
  { id: 12, category: "Functional Ability", text: { en: "Does the patient have trouble remembering to take medications or tracking medications taken?", ar: "هل يواجه المريض صعوبة في تذكر تناول الأدوية أو تتبعها؟" }, weight: 1 },
  { id: 13, category: "Functional Ability", text: { en: "Is the patient having difficulty driving? OR Are you concerned about the patient's driving?", ar: "هل يواجه المريض صعوبة في القيادة؟ أو هل أنت قلق بشأن قيادته؟" }, weight: 1 },
  { id: 14, category: "Functional Ability", text: { en: "Is the patient having trouble using appliances (microwave, oven, remote control, telephone)?", ar: "هل يواجه المريض صعوبة في استخدام الأجهزة (الميكروويف، الفرن، جهاز التحكم، الهاتف)؟" }, weight: 1 },
  { id: 15, category: "Functional Ability", text: { en: "Is the patient having difficulty completing home repair or housekeeping tasks?", ar: "هل يواجه المريض صعوبة في إتمام أعمال الصيانة المنزلية أو التنظيف؟" }, weight: 1 },
  { id: 16, category: "Functional Ability", text: { en: "Has the patient given up or significantly reduced activities such as golfing, dancing, exercising, or crafts?", ar: "هل تخلى المريض أو قلل بشكل كبير من الأنشطة مثل الرياضة أو الرقص أو الحرف؟" }, weight: 1 },
  // VISUOSPATIAL
  { id: 17, category: "Visuospatial", text: { en: "Is the patient getting lost in familiar surroundings (own neighborhood)?", ar: "هل يضل المريض طريقه في محيط مألوف (حيه الخاص)؟" }, weight: 2 },
  { id: 18, category: "Visuospatial", text: { en: "Does the patient have a decreased sense of direction?", ar: "هل لدى المريض إحساس ضعيف بالاتجاهات؟" }, weight: 1 },
  // LANGUAGE
  { id: 19, category: "Language", text: { en: "Does the patient have trouble finding words other than names?", ar: "هل يواجه المريض صعوبة في إيجاد الكلمات غير الأسماء؟" }, weight: 1 },
  { id: 20, category: "Language", text: { en: "Does the patient confuse names of family members or friends?", ar: "هل يخلط المريض بين أسماء أفراد العائلة أو الأصدقاء؟" }, weight: 2 },
  { id: 21, category: "Language", text: { en: "Does the patient have difficulty recognizing people familiar to him/her?", ar: "هل يواجه المريض صعوبة في التعرف على أشخاص مألوفين لديه؟" }, weight: 2 },
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
