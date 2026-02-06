import React, { useState } from 'react';

// تأكد من إضافة VITE_GEMINI_API_KEY في إعدادات Vercel
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  // حالة تخزين الإجابات
  const [answers, setAnswers] = useState({
    brand_name: '',
    brand_desc: '',
    brand_essence: '',
    target_audience: '',
    brand_vibe: '',
    shapes_concept: '',
    color_preference: ''
  });

  // مصفوفة الأسئلة الافتراضية (تأكد من مطابقتها لعدد خطواتك)
  const questions = [
    { key: 'brand_name', label: 'اسم المشروع' },
    { key: 'brand_desc', label: 'الوصف' },
    { key: 'brand_essence', label: 'الشخصية' },
    { key: 'target_audience', label: 'الجمهور' },
    { key: 'brand_vibe', label: 'النمط' },
    { key: 'shapes_concept', label: 'الأشكال' },
    { key: 'color_preference', label: 'الألوان' }
  ];

  // دالة لإعادة ضبط الجلسة (جلسة عصف جديدة)
  const resetSession = () => {
    setAnswers({
      brand_name: '',
      brand_desc: '',
      brand_essence: '',
      target_audience: '',
      brand_vibe: '',
      shapes_concept: '',
      color_preference: ''
    });
    setResult(null);
    setStep(0);
    setError(null);
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

      المطلوب نتيجة بصيغة JSON حصراً بهذا الهيكل (يجب إضافة حقل للملخص وحقل للبرومبت الإنجليزي):
      {
        "strategy": "نص التحليل",
        "summary": "ملخص عام ملهم وموجز وشامل يجمع الرؤية الاستراتيجية بالهوية البصرية بأسلوب خبير",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "الوصف",
        "visual_patterns": "الوصف",
        "shapes_analysis": "الوصف",
        "ai_visual_prompt": "A professional, ultra-high-definition English prompt for AI image generators (Midjourney/DALL-E 3). Create a masterpiece minimalist logo for '${answers.brand_name}'. Style: ${answers.brand_vibe}. Concept: High-end branding reflecting ${answers.brand_essence}. Details: 8k resolution, golden ratio, studio lighting, clean vectors, trending on Behance. If the brand name is in Arabic, use elegant and modern Arabic calligraphy."
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

  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '900px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#00a884' }}>مختبر الهندسة الاستراتيجية (STP)</h1>
        <p>بناء العلامة التجارية في عصر الذكاء الاصطناعي</p>
      </header>

      {error && <div style={{ color: 'red', background: '#fee', padding: '10px', borderRadius: '5px', marginBottom: '20px' }}>{error}</div>}

      {/* مدخلات المستخدم - تظهر قبل النتيجة */}
      {step < questions.length && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="اسم المشروع" 
            value={answers.brand_name}
            onChange={(e) => setAnswers({...answers, brand_name: e.target.value})} 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <textarea 
            placeholder="وصف المشروع" 
            value={answers.brand_desc}
            onChange={(e) => setAnswers({...answers, brand_desc: e.target.value})} 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', minHeight: '80px' }}
          />
          {/* يمكنك إضافة باقي الحقول هنا بنفس الطريقة */}
          
          <button 
            onClick={generateIdentity} 
            disabled={isGenerating}
            style={{ padding: '15px', backgroundColor: '#00a884', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isGenerating ? 'جاري الابتكار...' : 'تحليل وإنشاء الهوية الاستراتيجية'}
          </button>
        </div>
      )}

      {/* عرض النتائج النهائية */}
      {result && (
        <div style={{ marginTop: '20px', animation: 'fadeIn 0.5s' }}>
          
          <section style={{ background: '#f0fdf4', padding: '20px', borderRadius: '15px', borderRight: '6px solid #00a884', marginBottom: '25px' }}>
            <h3 style={{ marginTop: 0, color: '#00a884' }}>📜 الخلاصة الاستراتيجية</h3>
            <p style={{ lineHeight: '1.8', fontSize: '16px' }}>{result.summary}</p>
          </section>

          <section style={{ background: '#1e293b', color: 'white', padding: '25px', borderRadius: '15px', marginBottom: '25px' }}>
            <h4 style={{ marginTop: 0, color: '#00a884' }}>🤖 Prompt التصميم الاحترافي (لإنشاء الصورة)</h4>
            <div style={{ background: '#0f172a', padding: '15px', borderRadius: '8px', direction: 'ltr', textAlign: 'left', marginBottom: '15px' }}>
              <code style={{ fontSize: '14px', wordBreak: 'break-all', color: '#cbd5e1' }}>{result.ai_visual_prompt}</code>
            </div>
            <button 
              onClick={() => { navigator.clipboard.writeText(result.ai_visual_prompt); alert('تم نسخ البرومبت!'); }}
              style={{ backgroundColor: '#00a884', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer' }}
            >
              نسخ البرومبت لإنشاء الشعار
            </button>
          </section>

          {/* زر جلسة عصف جديدة */}
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <button 
              onClick={resetSession}
              style={{ padding: '12px 30px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '50px', cursor: 'pointer', fontSize: '16px', transition: '0.3s' }}
            >
              🔄 ابدأ جلسة عصف ذهني جديدة
            </button>
            <p style={{ marginTop: '20px', fontWeight: 'bold', color: '#334155' }}>By Sulieman alkhateeb</p>
          </div>

        </div>
      )}
    </div>
  );
}

export default App;