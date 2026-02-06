import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Type, 
  Target, 
  Briefcase, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw,
  Layout,
  User,
  CheckCircle2,
  Info,
  Shapes,
  MessageSquare,
  Globe
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const App = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

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
      description: 'تساعدنا الشخصية في تحديد زوايا التصميم (حادة أم مستديرة) ونوع الخطوط.',
      icon: <Sparkles className="w-6 h-6 text-pink-500" />
    },
    {
      id: 'target_audience',
      title: 'الجمهور المستهدف',
      question: 'من هي الفئة التي تخاطبها بشكل أساسي؟',
      type: 'multiple-choice',
      options: ['رواد أعمال ناشئين', 'طلاب وعشاق تعلم', 'شركات كبرى B2B', 'أفراد يبحثون عن الرفاهية', 'عامة الناس'],
      description: 'التصميم يجب أن يتحدث بلغة بصرية يفهمها ويحبها جمهورك المستهدف.',
      icon: <User className="w-6 h-6 text-blue-500" />
    },
    {
      id: 'brand_vibe',
      title: 'النمط البصري',
      question: 'ما هو التوجه البصري الذي تنجذب إليه؟',
      type: 'multiple-choice',
      options: ['بسيط (Minimalist)', 'كلاسيكي (Heritage)', 'تقني (Cyber/Modern)', 'هندسي حاد', 'فني يدوي'],
      description: 'هذا يحدد "المزاج العام" للهوية وكيف سيشعر العميل عند رؤية تصاميمك.',
      icon: <Layout className="w-6 h-6 text-orange-500" />
    },
    {
      id: 'shapes_concept',
      title: 'الأشكال والأنماط',
      question: 'ما هي الأشكال التي تشعر أنها تمثل قيمك؟',
      type: 'multiple-choice',
      options: ['دوائر ومنحنيات (تواصل وليونة)', 'مربعات ومستطيلات (استقرار ونظام)', 'مثلثات وأسهم (نمو واتجاه)', 'خطوط انسيابية', 'أشكال هندسية معقدة'],
      description: 'الأشكال الهندسية تحمل معاني نفسية عميقة؛ الدائرة تعني المجتمع، والمربع يعني الثقة.',
      icon: <Shapes className="w-6 h-6 text-purple-500" />
    },
    {
      id: 'color_preference',
      title: 'عالم الألوان',
      question: 'هل هناك ألوان تفضل تجنبها أو التركيز عليها؟',
      type: 'text',
      placeholder: 'مثال: أحب الأزرق الملكي، ابتعد عن الأصفر الفاقع...',
      description: 'الألوان هي أول ما تدركه العين، وهي المسؤولة عن 80% من التعرف على العلامة.',
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
    setIsGenerating(true);
    setError(null);
    
    const prompt = `
      بناءً على المعطيات التالية، قم بإنشاء وثيقة هوية بصرية كاملة:
      - اسم المشروع: ${answers.brand_name}
      - الوصف: ${answers.brand_desc}
      - الشخصية: ${answers.brand_essence}
      - الجمهور: ${answers.target_audience}
      - النمط: ${answers.brand_vibe}
      - الأشكال: ${answers.shapes_concept}
      - ملاحظات الألوان: ${answers.color_preference}

      المطلوب نتيجة بصيغة JSON:
      {
        "strategy": "تحليل استراتيجي عميق",
        "slogans": ["3 اقتراحات لسلوجان جذاب"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب النفسي"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "وصف دقيق لمكونات الشعار والأشكال المستخدمة",
        "visual_patterns": "اقتراح لأنماط (Patterns) تستخدم في المطبوعات",
        "shapes_analysis": "تحليل للأشكال الهندسية المقترحة"
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (!response.ok) throw new Error();
      const data = await response.json();
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(content);
      setStep(questions.length);
    } catch (err) {
      setError('حدث خطأ. يرجى التأكد من ملء البيانات والمحاولة ثانية.');
      setIsGenerating(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center overflow-x-hidden" dir="rtl">
      {/* Header */}
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-4 py-2">
          من الاستراتيجية إلى الواجهة: بناء العلامة والتسويق الرقمي
        </h1>
        <div className="flex justify-center items-center gap-2 text-slate-500">
          <Sparkles className="w-5 h-5 text-yellow-500" />
          <p className="text-lg">مساعدك الذكي في بناء الهوية البصرية الاحترافية</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 overflow-hidden border border-slate-100 relative min-h-[600px] flex flex-col transition-all">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
            <div className="relative">
              <RefreshCw className="w-16 h-16 text-indigo-600 animate-spin mb-6" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black mb-3">جاري بناء عالمك البصري...</h3>
            <p className="text-slate-500 max-w-xs">نقوم بتحليل الشخصية، الألوان، الأنماط الهندسية، وابتكار شعارات لفظية تناسب طموحك.</p>
          </div>
        )}

        {step < questions.length ? (
          <div className="p-8 md:p-12 flex-1 flex flex-col">
            {/* Progress */}
            <div className="flex items-center justify-between mb-8">
               <div className="flex gap-1">
                  {questions.map((_, idx) => (
                    <div key={idx} className={`h-1.5 w-6 rounded-full transition-all ${idx <= step ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                  ))}
               </div>
               <span className="text-sm font-bold text-slate-400">{step + 1} / {questions.length}</span>
            </div>

            {/* Question Card */}
            <div className="flex-1 animate-in slide-in-from-left-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-50 rounded-2xl">
                  {questions[step].icon}
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">
                    {questions[step].question}
                  </h2>
                </div>
              </div>

              {/* Info Box */}
              <div className="flex gap-3 bg-amber-50/50 p-4 rounded-2xl mb-8 border border-amber-100">
                <Info className="w-5 h-5 text-amber-600 shrink-0" />
                <p className="text-sm text-amber-800 leading-relaxed italic">
                  {questions[step].description}
                </p>
              </div>

              {/* Input Fields */}
              {questions[step].type === 'mixed' ? (
                <div className="space-y-4">
                  {questions[step].fields.map(field => (
                    <div key={field.id}>
                      <label className="block text-sm font-bold text-slate-700 mb-2 mr-1">{field.label}</label>
                      <input
                        type="text"
                        className="w-full p-4 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all outline-none"
                        placeholder={field.placeholder}
                        value={answers[field.id] || ''}
                        onChange={(e) => handleAnswer(field.id, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              ) : questions[step].type === 'text' ? (
                <textarea
                  className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-[1.5rem] outline-none transition-all min-h-[180px] text-lg"
                  placeholder={questions[step].placeholder}
                  value={answers[questions[step].id] || ''}
                  onChange={(e) => handleAnswer(questions[step].id, e.target.value)}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[step].options.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleAnswer(questions[step].id, option)}
                      className={`p-4 text-right rounded-2xl border-2 transition-all duration-300 flex items-center justify-between group ${
                        answers[questions[step].id] === option 
                        ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50 text-slate-600'
                      }`}
                    >
                      <span className="font-bold">{option}</span>
                      {answers[questions[step].id] === option && <CheckCircle2 className="w-5 h-5 text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-50">
              <button
                onClick={prevStep}
                disabled={step === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                  step === 0 ? 'text-slate-300 opacity-50 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowRight className="w-4 h-4" /> السابق
              </button>
              
              <button
                onClick={nextStep}
                disabled={questions[step].type === 'mixed' ? (!answers.brand_name || !answers.brand_desc) : !answers[questions[step].id]}
                className="flex items-center gap-3 bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {step === questions.length - 1 ? 'استخراج الهوية' : 'السؤال التالي'} <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Result Section */
          <div className="p-8 md:p-12 animate-in zoom-in-95 duration-500">
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="text-green-600 w-10 h-10" />
              </div>
              <h2 className="text-3xl font-black text-slate-800">هوية علامتك جاهزة!</h2>
              <p className="text-slate-500">بناءً على استراتيجية: {answers.brand_name}</p>
            </div>

            {result && (
              <div className="space-y-10">
                {/* 1. Slogans */}
                <section>
                  <h3 className="flex items-center gap-2 text-indigo-700 font-black text-xl mb-4">
                    <MessageSquare className="w-6 h-6" /> المقترحات اللفظية (Slogans)
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {result.slogans.map((slogan, i) => (
                      <div key={i} className="p-4 bg-slate-50 border-r-4 border-indigo-600 rounded-xl font-bold text-lg text-slate-800">
                        "{slogan}"
                      </div>
                    ))}
                  </div>
                </section>

                {/* 2. Colors */}
                <section>
                  <h3 className="flex items-center gap-2 text-slate-800 font-black text-xl mb-6">
                    <Palette className="w-6 h-6 text-orange-500" /> لوحة الألوان الاستراتيجية
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.colors.map((color, idx) => (
                      <div key={idx} className="flex items-start gap-4 p-4 border border-slate-100 rounded-2xl hover:shadow-md transition-shadow">
                        <div 
                          className="w-14 h-14 rounded-2xl shadow-inner border border-black/5 shrink-0" 
                          style={{ backgroundColor: color.hex }}
                        />
                        <div>
                          <p className="font-black text-slate-800 mb-1">{color.name}</p>
                          <code className="text-xs bg-slate-100 px-2 py-1 rounded text-indigo-600 font-mono uppercase">{color.hex}</code>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed">{color.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3. Logo & Shapes */}
                <section className="bg-indigo-900 text-white p-8 rounded-[2rem] shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="flex items-center gap-2 font-black text-xl mb-4 text-indigo-200">
                                <Shapes className="w-6 h-6" /> مفهوم الشعار والأشكال
                            </h3>
                            <p className="text-indigo-50 leading-relaxed text-sm">{result.logo_concept}</p>
                            <div className="mt-4 pt-4 border-t border-indigo-800">
                                <p className="text-xs text-indigo-300 font-bold uppercase tracking-widest mb-2">تحليل هندسي</p>
                                <p className="text-sm italic text-indigo-100">{result.shapes_analysis}</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <h3 className="font-black text-indigo-200 mb-2">الخط المقترح</h3>
                                <p className="text-2xl font-serif">{result.typography.primary}</p>
                                <p className="text-xs text-indigo-300">{result.typography.style}</p>
                            </div>
                            <div>
                                <h3 className="font-black text-indigo-200 mb-2">الأنماط (Patterns)</h3>
                                <p className="text-sm text-indigo-100">{result.visual_patterns}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <button 
                  onClick={() => { setStep(0); setAnswers({}); setResult(null); }}
                  className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3"
                >
                  <RefreshCw className="w-5 h-5" /> بدء جلسة عصف ذهني جديدة
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 pb-8 text-center w-full max-w-4xl">
        <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-8" />
        <p className="text-slate-400 text-sm tracking-[0.2em] font-medium uppercase mb-2">
            Professional Identity Consultant v2.0
        </p>
        <p className="text-lg">
          BY <span className="text-indigo-900 font-black px-2">Trainer Sulieman Alkhateeb</span>
        </p>
      </footer>
    </div>
  );
};

export default App;