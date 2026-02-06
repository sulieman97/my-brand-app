import React, { useState, useEffect } from 'react';
import { 
  Palette, 
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
  ClipboardCheck,
  FileText,
  Cpu
} from 'lucide-react';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY; 

const App = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // اختيار الموديل (تم إضافة 2.5 Flash و 5 موديلات متنوعة)
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');

  const models = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (الأسرع)' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp' },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (الأعمق)' },
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (المستقر)' },
    { id: 'gemini-1.0-pro', name: 'Gemini 1.0 Pro' }
  ];

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
      description: 'التصميم يتحدث بلغة بصرية يفهمها جمهورك.',
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
      placeholder: 'أضف تفضيلاتك اللونية هنا...',
      description: 'الألوان مسؤولة عن 80% من التعرف على العلامة.',
      icon: <Palette className="w-6 h-6 text-green-500" />
    }
  ];

  const handleAnswer = (id, value) => setAnswers(prev => ({ ...prev, [id]: value }));
  const nextStep = () => step < questions.length - 1 ? setStep(step + 1) : generateIdentity();
  const prevStep = () => step > 0 && setStep(step - 1);
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateIdentity = async () => {
    if (!apiKey) {
      setError("خطأ: مفتاح الـ API غير معرف في Vercel باسم VITE_GEMINI_API_KEY");
      return;
    }
    setIsGenerating(true);
    setError(null);
    
    const promptText = `
      بناءً على المعطيات التالية، قم بإنشاء وثيقة هوية بصرية كاملة باللغة العربية:
      - اسم المشروع: ${answers.brand_name}
      - الوصف: ${answers.brand_desc}
      - الشخصية: ${answers.brand_essence}
      - الجمهور: ${answers.target_audience}
      - النمط: ${answers.brand_vibe}
      - الأشكال: ${answers.shapes_concept}
      - ملاحظات الألوان: ${answers.color_preference}

      المطلوب نتيجة بصيغة JSON حصراً بهذا الهيكل:
      {
        "strategy": "تحليل استراتيجي عميق",
        "general_summary": "ملخص عام ملهم وشامل للهوية والنتيجة الاستراتيجية بأسلوب خبير",
        "slogans": ["3 اقتراحات"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "الوصف",
        "visual_patterns": "الوصف",
        "shapes_analysis": "الوصف",
        "professional_ai_prompt": "A professional English prompt for Midjourney/DALL-E: high-end minimalist logo for ${answers.brand_name}, style: ${answers.brand_vibe}, reflecting ${answers.brand_essence}, palette: ${answers.color_preference}, 8k resolution, vector, symmetrical, on white background. If name is Arabic, use modern Arabic calligraphy."
      }
    `;

    try {
      // استخدام الموديل المختار ديناميكياً
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          generationConfig: { 
            responseMimeType: "application/json",
            temperature: 0.7 
          }
        })
      });

      if (!response.ok) throw new Error(`الموديل ${selectedModel} غير متاح حالياً أو المفتاح خاطئ.`);
      
      const data = await response.json();
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(content);
      setStep(questions.length);
    } catch (err) {
      setError(`فشل: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8 flex flex-col items-center" dir="rtl">
      <header className="w-full max-w-4xl text-center mb-8">
        <h1 className="text-3xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-4 py-2">
          مختبر الهندسة الاستراتيجية 2.5
        </h1>
        {/* اختيار الموديل من الواجهة */}
        <div className="flex justify-center items-center gap-2 bg-white p-2 rounded-full shadow-sm border border-slate-200 w-fit mx-auto">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <select 
            value={selectedModel} 
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-transparent text-sm font-bold outline-none cursor-pointer"
          >
            {models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
      </header>

      <main className="w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 relative min-h-[550px] flex flex-col transition-all">
        {isGenerating && (
          <div className="absolute inset-0 bg-white/90 z-50 flex flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
            <RefreshCw className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <h3 className="text-2xl font-black">جاري المعالجة بواسطة {selectedModel}...</h3>
          </div>
        )}

        {error && <div className="p-4 bg-red-50 text-red-600 text-center font-bold border-b">{error}</div>}

        {step < questions.length ? (
          <div className="p-8 md:p-12 flex-1 flex flex-col">
             <div className="flex items-center justify-between mb-8 opacity-50">
               <span className="text-sm font-black">خطوة {step + 1} من {questions.length}</span>
            </div>

            <div className="flex-1 animate-in slide-in-from-left duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-50 rounded-2xl">{questions[step].icon}</div>
                <h2 className="text-2xl font-black">{questions[step].question}</h2>
              </div>
              
              <div className="mb-6 bg-slate-50 p-4 rounded-xl text-sm italic text-slate-500 border-r-2 border-indigo-200">
                {questions[step].description}
              </div>

              {questions[step].type === 'mixed' ? (
                <div className="space-y-4">
                  {questions[step].fields.map(f => (
                    <input key={f.id} type="text" placeholder={f.label} className="w-full p-4 bg-slate-50 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all" value={answers[f.id] || ''} onChange={(e) => handleAnswer(f.id, e.target.value)} />
                  ))}
                </div>
              ) : questions[step].type === 'text' ? (
                <textarea className="w-full p-4 bg-slate-50 rounded-xl min-h-[150px] outline-none focus:ring-2 ring-indigo-500" placeholder={questions[step].placeholder} value={answers[questions[step].id] || ''} onChange={(e) => handleAnswer(questions[step].id, e.target.value)} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {questions[step].options.map(opt => (
                    <button key={opt} onClick={() => handleAnswer(questions[step].id, opt)} className={`p-4 text-right rounded-xl border-2 transition-all font-bold ${answers[questions[step].id] === opt ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg' : 'border-slate-100 hover:bg-slate-50'}`}>{opt}</button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between mt-12 pt-6 border-t">
              <button onClick={prevStep} disabled={step === 0} className="px-6 py-2 font-bold text-slate-400 disabled:opacity-30">السابق</button>
              <button onClick={nextStep} disabled={questions[step].type === 'mixed' ? (!answers.brand_name || !answers.brand_desc) : !answers[questions[step].id]} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-indigo-700 transition-all">
                {step === questions.length - 1 ? 'إنشاء الهوية الكاملة' : 'السؤال التالي'}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-8 md:p-12 animate-in zoom-in duration-500">
            {result && (
              <div className="space-y-8">
                <div className="text-center mb-6">
                  <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-2" />
                  <h2 className="text-2xl font-black text-slate-800">اكتمل التحليل الاستراتيجي</h2>
                </div>

                {/* الملخص العام الاستراتيجي */}
                <section className="bg-indigo-50 p-6 rounded-[2rem] border-r-8 border-indigo-600">
                  <h3 className="font-black text-indigo-900 mb-3 flex items-center gap-2 text-xl"><FileText /> الملخص الاستراتيجي للعلامة</h3>
                  <p className="leading-relaxed text-lg text-slate-800 italic">"{result.general_summary}"</p>
                </section>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <h4 className="font-bold mb-2 text-indigo-700">الشعار المقترح</h4>
                    <p>{result.logo_concept}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <h4 className="font-bold mb-2 text-indigo-700">الخطوط والأشكال</h4>
                    <p>{result.typography.primary} - {result.shapes_analysis}</p>
                  </div>
                </div>

                {/* برومبت الصور الاحترافي */}
                <section className="bg-slate-900 text-white p-8 rounded-[2rem] shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-indigo-300 flex items-center gap-2"><Sparkles /> Professional AI Prompt</h3>
                    <button onClick={() => copyToClipboard(result.professional_ai_prompt)} className="flex items-center gap-2 bg-indigo-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-500 transition-all">
                      {copied ? <CheckCircle2 size={14} /> : <ClipboardCheck size={14} />} {copied ? 'تم النسخ!' : 'نسخ البرومبت'}
                    </button>
                  </div>
                  <div className="bg-black/30 p-4 rounded-xl border border-white/10">
                    <p className="text-sm font-mono text-left text-indigo-100" dir="ltr">{result.professional_ai_prompt}</p>
                  </div>
                </section>

                {/* زر جلسة جديدة */}
                <button onClick={() => { setStep(0); setAnswers({}); setResult(null); }} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-3">
                  <RefreshCw size={22} /> بدء جلسة عصف ذهني جديدة
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="mt-12 text-center">
        <div className="h-px bg-slate-200 w-64 mx-auto mb-6"></div>
        <p className="text-slate-400 text-xs tracking-widest uppercase mb-2">Strategic Design Lab v2.5</p>
        <p className="text-lg">BY <span className="text-indigo-900 font-black">Trainer Sulieman Alkhateeb</span></p>
      </footer>
    </div>
  );
};

export default App;