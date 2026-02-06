import { useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { Sparkles, Palette, Type, Image as ImageIcon } from 'lucide-react';
import './App.css';

function App() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  const questions = [
    { id: 'brand_name', question: 'ما اسم المشروع أو العلامة التجارية؟', icon: Sparkles },
    { id: 'brand_desc', question: 'صف مشروعك في جملة واحدة', icon: Palette },
    { id: 'brand_essence', question: 'ما هي الشخصية التي تريدها للعلامة؟ (مثال: عصرية، كلاسيكية، ودية)', icon: Type },
    { id: 'target_audience', question: 'من هو جمهورك المستهدف؟', icon: ImageIcon },
    { id: 'brand_vibe', question: 'ما النمط المفضل؟ (مثال: بسيط، ملون، أنيق)', icon: Palette },
    { id: 'shapes_concept', question: 'هل تفضل أشكالًا معينة؟ (دوائر، مربعات، أشكال عضوية)', icon: ImageIcon },
    { id: 'color_preference', question: 'أي ملاحظات عن الألوان؟ (اختياري)', icon: Palette }
  ];

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [questions[step].id]: value });
    if (step < questions.length - 1) {
      setStep(step + 1);
    }
  };

  const generateIdentity = async () => {
    // 1. فحص أولي للمفتاح قبل البدء
    if (!apiKey) {
      setError('خطأ: مفتاح الـ API غير موجود. تأكد من إضافته في إعدادات Vercel باسم VITE_GEMINI_API_KEY');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    const prompt = `
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
        "strategy": "نص التحليل",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "الوصف",
        "visual_patterns": "الوصف",
        "shapes_analysis": "الوصف"
      }
    `;

    try {
      // 2. استخدام الموديل الصحيح والمستقر
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

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Gemini API Error:", errorData);
        throw new Error(errorData.error?.message || 'Failed to connect to AI');
      }

      const data = await response.json();
      
      // 3. طريقة استخراج النص من استجابة Gemini بشكل آمن
      const rawText = data.candidates[0].content.parts[0].text;
      const content = JSON.parse(rawText);
      
      setResult(content);
      setStep(questions.length);
    } catch (err) {
      console.error("Full Error Details:", err);
      setError(`عذراً، حدث خطأ: ${err.message}. تأكد من الاتصال وصلاحية المفتاح.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentQuestion = questions[step];
  const Icon = currentQuestion?.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {step < questions.length && !result ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              {Icon && <Icon className="w-8 h-8 text-purple-600" />}
              <h2 className="text-2xl font-bold text-gray-800">{currentQuestion.question}</h2>
            </div>
            
            <input
              type="text"
              className="w-full px-4 py-3 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none text-lg"
              placeholder="اكتب إجابتك هنا..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.target.value.trim()) {
                  handleAnswer(e.target.value);
                  e.target.value = '';
                }
              }}
            />
            
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={() => step > 0 && setStep(step - 1)}
                className="px-6 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                disabled={step === 0}
              >
                السابق
              </button>
              
              <span className="text-sm text-gray-500">
                {step + 1} / {questions.length}
              </span>
            </div>

            {step === questions.length - 1 && (
              <button
                onClick={generateIdentity}
                disabled={isGenerating}
                className="w-full mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
              >
                {isGenerating ? 'جاري التوليد...' : 'إنشاء الهوية البصرية'}
              </button>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                {error}
              </div>
            )}
          </div>
        ) : result ? (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-purple-600 mb-6">الهوية البصرية لـ {answers.brand_name}</h1>
            
            <section>
              <h2 className="text-xl font-bold mb-2">الاستراتيجية:</h2>
              <p className="text-gray-700">{result.strategy}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">الشعارات المقترحة:</h2>
              <ul className="list-disc list-inside space-y-1">
                {result.slogans?.map((slogan, i) => (
                  <li key={i} className="text-gray-700">{slogan}</li>
                ))}
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">الألوان:</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.colors?.map((color, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div 
                      className="w-12 h-12 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-semibold">{color.name}</p>
                      <p className="text-sm text-gray-600">{color.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold mb-2">الطباعة:</h2>
              <p className="text-gray-700">الخط: {result.typography?.primary}</p>
              <p className="text-gray-700">النمط: {result.typography?.style}</p>
            </section>

            <button
              onClick={() => {
                setStep(0);
                setAnswers({});
                setResult(null);
              }}
              className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              إنشاء هوية جديدة
            </button>
          </div>
        ) : null}
      </div>
      
      {/* Vercel Speed Insights Component */}
      <SpeedInsights />
    </div>
  );
}

export default App;
