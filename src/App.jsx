import React, { useState } from 'react';
import { 
  Palette, RefreshCw, CheckCircle2, Briefcase, Sparkles, ArrowRight, ArrowLeft,
  Layout, User, Info, Shapes, MessageSquare, ClipboardCheck, FileText
} from 'lucide-react';

// تأكد من وضع المفتاح هنا أو التأكد من وجوده في إعدادات Vercel
// البحث عن المفتاح في بيئة النظام بدلاً من وضعه يدوياً
// تأكد أن الاسم في Vercel مطابق تماماً لهذا: VITE_GEMINI_API_KEY
const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

// داخل دالة generateIdentity، استبدل رابط الـ fetch بهذا الرابط المستقر:
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { 
      responseMimeType: "application/json",
      temperature: 0.7 
    }
  })
});
const App = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const questions = [
    {
      id: 'project_info',
      title: 'معلومات الأساس',
      question: 'ما هو اسم العلامة التجارية ووصفها المختصر؟',
      type: 'mixed',
      fields: [
        { id: 'brand_name', label: 'اسم المشروع', placeholder: 'مثال: أكاديمية سليمان' },
        { id: 'brand_desc', label: 'وصف المشروع (بسطرين)', placeholder: 'اشرح ماذا تقدم ومن تخدم...' }
      ],
      description: 'الاسم والوصف يحددان النغمة الصوتية للهوية البصرية واللفظية.',
      icon: <Briefcase className="w-6 h-6 text-indigo-500" />
    },
    {
      id: 'brand_essence',
      title: 'شخصية العلامة',
      question: 'كيف تصف شخصية علامتك التجارية؟',
      type: 'multiple-choice',
      options: ['رسمية وجادة', 'ودودة ومرحة', 'مبتكرة وجريئة', 'هادئة وموثوقة', 'فاخرة وحصرية'],
      description: 'تساعدنا الشخصية في تحديد زوايا التصميم ونوع الخطوط.',
      icon: <Sparkles className="w-6 h-6 text-pink-500" />
    },
    {
      id: 'target_audience',
      title: 'الجمهور المستهدف',
      question: 'من هي الفئة التي تخاطبها بشكل أساسي؟',
      type: 'multiple-choice',
      options: ['رواد أعمال ناشئين', 'طلاب وعشاق تعلم', 'شركات كبرى B2B', 'أفراد يبحثون عن الرفاهية', 'عامة الناس'],
      description: 'التصميم يجب أن يتحدث بلغة بصرية يفهمها جمهورك.',
      icon: <User className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'brand_vibe',
      title: 'النمط البصري',
      question: 'ما هو التوجه البصري الذي تنجذب إليه؟',
      type: 'multiple-choice',
      options: ['بسيط (Minimalist)', 'كلاسيكي (Heritage)', 'تقني (Cyber/Modern)', 'هندسي حاد', 'فني يدوي'],
      description: 'هذا يحدد "المزاج العام" للهوية.',
      icon: <Layout className="w-6 h-6 text-orange-500" />
    },
    {
      id: 'shapes_concept',
      title: 'الأشكال والأنماط',
      question: 'ما هي الأشكال التي تشعر أنها تمثل قيمك؟',
      type: 'multiple-choice',
      options: ['دوائر ومنحنيات', 'مربعات ومستطيلات', 'مثلثات وأسهم', 'خطوط انسيابية', 'أشكال هندسية معقدة'],
      description: 'الأشكال الهندسية تحمل معاني نفسية عميقة.',
      icon: <Shapes className="w-6 h-6 text-purple-500" />
    },
    {
      id: 'color_preference',
      title: 'عالم الألوان',
      question: 'هل هناك ألوان تفضل تجنبها أو التركيز عليها؟',
      type: 'text',
      placeholder: 'مثال: أحب الأزرق الملكي، ابتعد عن الأصفر الفاقع...',
      description: 'الألوان هي المسؤولة عن 80% من التعرف على العلامة.',
      icon: <Palette className="w-6 h-6 text-green-500" />
    }
  ];

  const handleAnswer = (id, value) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      generateIdentity();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  const generateIdentity = async () => {
    if (!apiKey || apiKey === "ضع_مفتاحك_هنا") {
      setError('يرجى إضافة مفتاح الـ API الخاص بك.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const promptText = `
      Return ONLY a JSON object for this brand identity:
      - Name: ${answers.brand_name}
      - Desc: ${answers.brand_desc}
      - Personality: ${answers.brand_essence}
      - Audience: ${answers.target_audience}
      - Style: ${answers.brand_vibe}
      - Shapes: ${answers.shapes_concept}
      - Colors: ${answers.color_preference}

      JSON Structure:
      {
        "strategy": "تحليل استراتيجي",
        "general_summary": "ملخص شامل",
        "slogans": ["3 اقتراحات"],
        "colors": [{"name": "اسم اللون", "hex": "#000000", "reason": "السبب"}],
        "typography": {"primary": "اسم الخط", "style": "نمط"},
        "logo_concept": "وصف الشعار",
        "visual_patterns": "الأنماط",
        "shapes_analysis": "تحليل الأشكال",
        "professional_ai_prompt": "English AI prompt for image generation"
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { responseMimeType: "application/json", temperature: 0.7 }
        })
      });

      if (!response.ok) throw new Error("فشل الاتصال بـ Gemini");
      const data = await response.json();
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(content);
      setStep(questions.length);
    } catch (err) {
      setError('حدث خطأ أثناء التوليد. تأكد من المفتاح وحاول مجدداً.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center" dir="rtl">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-4 py-2 leading-tight">
          من الاستراتيجية إلى الواجهة: بناء العلامة
        </h1>
        <p className="text-slate-500 text-lg">مساعدك الذكي في بناء الهوية البصرية الاحترافية</p>
      </header>

      <main className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 relative min-h-[550px] flex flex-col transition-all">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
            <h3 className="text-2xl font-black mb-3">جاري بناء عالمك البصري...</h3>
            <p className="text-slate-500">نقوم بتحليل الشخصية وابتكار الألوان والأنماط.</p>
          </div>
        )}

        {step < questions.length ? (
          <div className="p-8 md:p-12 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
               <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div key={idx} className={`h-1.5 w-6 rounded-full transition-all ${idx <= step ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  ))}
               </div>
               <span className="text-sm font-bold text-slate-400">{step + 1} / {questions.length}</span>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl">{questions[step].icon}</div>
                <h2 className="text-2xl font-black text-slate-800">{questions[step].question}</h2>
              </div>
              
              <div className="flex gap-3 bg-amber-50/50 p-4 rounded-2xl mb-8 border border-amber-100 italic text-sm text-amber-800">
                <Info className="w-5 h-5 shrink-0" /> {questions[step].description}
              </div>

              {questions[step].type === 'mixed' ? (
                <div className="space-y-4">
                  {questions[step].fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-xs font-bold text-slate-500 mb-2 mr-1">{field.label}</label>
                      <input
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all outline-none"
                        placeholder={field.placeholder}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleAnswer(field.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ) : questions[step].type === 'multiple-choice' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[step].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(questions[step].id, option)}
                      className={`p-4 text-right rounded-2xl border-2 transition-all flex items-center justify-between ${
                        answers[questions[step].id] === option 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' 
                        : 'border-slate-100 hover:border-indigo-200 text-slate-600'
                      }`}
                    >
                      <span className="font-bold">{option}</span>
                      {answers[questions[step].id] === option && <CheckCircle2 className="w-5 h-5" />}
                    </button>
                  ))}
                </div>
              ) : (
                <textarea
                  className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 rounded-2xl outline-none min-h-[150px]"
                  placeholder={questions[step].placeholder}
                  value={answers[questions[step].id] || ''}
                  onChange={(e) => handleAnswer(questions[step].id, e.target.value)}
                />
              )}
            </div>

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-50">
              <button onClick={prevStep} disabled={step === 0} className="text-slate-400 font-bold disabled:opacity-30">السابق</button>
              {error && <p className="text-red-500 text-[10px]">{error}</p>}
              <button
                onClick={nextStep}
                disabled={questions[step].type === 'mixed' ? (!answers.brand_name || !answers.brand_desc) : !answers[questions[step].id]}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all disabled:opacity-20"
              >
                {step === questions.length - 1 ? 'استخراج الهوية' : 'التالي'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 animate-in zoom-in-95">
            {result && (
              <div className="space-y-10">
                <section className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100">
                  <h3 className="flex items-center gap-2 text-indigo-800 font-black text-xl mb-4"><FileText /> الملخص الاستراتيجي</h3>
                  <p className="text-slate-700 leading-relaxed">{result.general_summary}</p>
                </section>

                <section>
                  <h3 className="flex items-center gap-2 text-indigo-700 font-black text-xl mb-4"><MessageSquare /> الشعارات (Slogans)</h3>
                  <div className="grid gap-3">
                    {result.slogans.map((s, i) => (
                      <div key={i} className="p-4 bg-slate-50 border-r-4 border-indigo-600 rounded-xl font-bold">"{s}"</div>
                    ))}
                  </div>
                </section>

                <section>
                  <h3 className="font-black text-xl mb-6 flex items-center gap-2"><Palette className="text-orange-500"/> لوحة الألوان</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.colors.map((c, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl">
                        <div className="w-12 h-12 rounded-xl shadow-inner" style={{ backgroundColor: c.hex }} />
                        <div>
                          <p className="font-black text-sm">{c.name}</p>
                          <code className="text-xs text-indigo-600">{c.hex}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="bg-slate-900 text-white p-6 rounded-[2rem]">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-indigo-300 flex items-center gap-2"><Sparkles /> AI Prompt</h3>
                    <button onClick={() => copyToClipboard(result.professional_ai_prompt)} className="text-xs bg-indigo-600 px-3 py-1 rounded-lg">
                      {copied ? 'تم!' : 'نسخ'}
                    </button>
                  </div>
                  <p className="text-xs font-mono text-left opacity-80" dir="ltr">{result.professional_ai_prompt}</p>
                </section>

                <button onClick={() => { setStep(0); setResult(null); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black">جلسة جديدة</button>
              </div>
            )}
          </div>
        )}
      </main>
      <footer className="mt-8 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">
        BY Trainer Sulieman Alkhateeb | v2.5
      </footer>
    </div>
  );
};

export default App;