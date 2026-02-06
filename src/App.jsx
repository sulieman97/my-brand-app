import React, { useState } from 'react';

// تأكد من إضافة VITE_GEMINI_API_KEY في إعدادات Vercel (Environment Variables)
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

  // مصفوفة الأسئلة (لضبط عدد الخطوات)
  const questions = [
    { key: 'brand_name', label: 'ما هو اسم مشروعك؟' },
    { key: 'brand_desc', label: 'صف مشروعك باختصار:' },
    { key: 'target_audience', label: 'من هو جمهورك المستهدف؟' }
    // يمكنك إضافة باقي الأسئلة هنا
  ];

  // 1. الجزء البرمجي: دالة توليد الهوية والملخص
  const generateIdentity = async () => {
    if (!apiKey) {
      setError('خطأ: مفتاح الـ API مفقود. أضفه في إعدادات Vercel باسم VITE_GEMINI_API_KEY');
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
        "strategy": "نص التحليل الاستراتيجي",
        "summary": "ملخص عام ملهم وموجز وشامل يجمع الرؤية الاستراتيجية بالهوية البصرية بأسلوب خبير",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "وصف فكرة الشعار",
        "visual_patterns": "الوصف البصري المساعد",
        "shapes_analysis": "التحليل الهندسي",
        "ai_visual_prompt": "A professional, ultra-high-definition English prompt for AI image generators (Midjourney/DALL-E 3). Create a minimalist logo for '${answers.brand_name}'. Style: ${answers.brand_vibe}. Concept: High-end branding reflecting ${answers.brand_essence}. Details: 8k resolution, golden ratio, studio lighting, clean vectors. If the brand name is in Arabic, use modern and elegant Arabic typography."
      }
    `;

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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

      if (!response.ok) throw new Error('فشل في الاتصال بالذكاء الاصطناعي');

      const data = await response.json();
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      
      setResult(content);
      setStep(100); // الانتقال لعرض النتائج
    } catch (err) {
      setError(`عذراً، حدث خطأ: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. جزء الواجهة (UI)
  return (
    <div style={{ direction: 'rtl', padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#00a884' }}>مختبر الهندسة الاستراتيجية (STP)</h1>
        <p>بناء الهوية والملخص الاستراتيجي بواسطة AI</p>
      </header>

      {error && <div style={{ color: 'red', backgroundColor: '#fee', padding: '10px', borderRadius: '5px' }}>{error}</div>}

      {/* نموذج إدخال البيانات - يظهر في البداية */}
      {step < questions.length && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="اسم المشروع" 
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd' }}
            onChange={(e) => setAnswers({...answers, brand_name: e.target.value})} 
          />
          <textarea 
            placeholder="وصف المشروع" 
            style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ddd', height: '80px' }}
            onChange={(e) => setAnswers({...answers, brand_desc: e.target.value})} 
          />
          <button 
            onClick={generateIdentity} 
            disabled={isGenerating}
            style={{ padding: '15px', backgroundColor: '#00a884', color: '#white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {isGenerating ? 'جاري تحليل البيانات...' : 'إنشاء الهوية والملخص النهائي'}
          </button>
        </div>
      )}

      {/* 3. عرض النتائج النهائية (الزر والملخص والبرومبت) */}
      {result && step === 100 && (
        <div style={{ marginTop: '30px', animation: 'fadeIn 0.5s ease' }}>
          
          <section style={{ backgroundColor: '#f0fdfa', padding: '20px', borderRadius: '12px', borderRight: '6px solid #00a884', marginBottom: '25px' }}>
            <h3 style={{ marginTop: 0 }}>📜 الخلاصة الاستراتيجية للمشروع</h3>
            <p style={{ lineHeight: '1.8', color: '#2c3e50', fontSize: '17px' }}>{result.summary}</p>
          </section>

          <section style={{ backgroundColor: '#1a252f', color: '#white', padding: '25px', borderRadius: '15px' }}>
            <h4 style={{ marginTop: 0, color: '#00a884' }}>🤖 Prompt التصميم الاحترافي (لإنشاء الصور)</h4>
            <div style={{ backgroundColor: '#2c3e50', padding: '15px', borderRadius: '8px', marginBottom: '15px', direction: 'ltr', textAlign: 'left' }}>
              <code style={{ color: '#ecf0f1', fontSize: '14px', wordBreak: 'break-all' }}>
                {result.ai_visual_prompt}
              </code>
            </div>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(result.ai_visual_prompt);
                alert('تم نسخ البرومبت بنجاح! يمكنك استخدامه الآن في Midjourney أو DALL-E');
              }}
              style={{ padding: '12px 25px', backgroundColor: '#00a884', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', width: '100%' }}
            >
              نسخ البرومبت لإنشاء الشعار
            </button>
          </section>

          <footer style={{ textAlign: 'center', marginTop: '50px', borderTop: '1px solid #eee', paddingTop: '20px', color: '#7f8c8d' }}>
            <p>بإشراف: <strong>سليمان الخطيب</strong></p>
            <small>مختبر الهندسة الاستراتيجية - جميع الحقوق محفوظة</small>
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;