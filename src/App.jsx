import React, { useState } from 'react';

// تأكد من إضافة VITE_GEMINI_API_KEY في إعدادات Vercel (Environment Variables)
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

function App() {
  const [step, setStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const [answers, setAnswers] = useState({
    brand_name: '',
    brand_desc: '',
    brand_essence: '',
    target_audience: '',
    brand_vibe: '',
    shapes_concept: '',
    color_preference: ''
  });

  const generateIdentity = async () => {
    if (!apiKey) {
      setError('خطأ: مفتاح الـ API مفقود. أضفه في إعدادات Vercel باسم VITE_GEMINI_API_KEY');
      return;
    }

    setIsGenerating(true);
    setError(null);

    const promptText = `
      أنت خبير استراتيجي. قم بإنشاء وثيقة هوية بصرية كاملة باللغة العربية بناءً على:
      - اسم المشروع: ${answers.brand_name}
      - الوصف: ${answers.brand_desc}
      - الشخصية: ${answers.brand_essence}
      - الجمهور: ${answers.target_audience}
      - النمط: ${answers.brand_vibe}
      - الأشكال: ${answers.shapes_concept}
      - الألوان: ${answers.color_preference}

      المطلوب JSON حصراً:
      {
        "general_summary": "ملخص خبير يدمج الاستراتيجية بالهوية بأسلوب أكاديمي",
        "strategy": "التحليل الاستراتيجي",
        "slogans": ["1", "2", "3"],
        "colors": [{"name": "اسم", "hex": "كود", "reason": "سبب"}],
        "typography": {"primary": "خط", "style": "نمط"},
        "logo_concept": "فكرة الشعار",
        "ai_image_prompt": "Professional 8k ultra-hd prompt for '${answers.brand_name}'. Style: ${answers.brand_vibe}. Minimalist, golden ratio, high-end typography, Behance style. If Arabic, use modern calligraphy."
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

      if (!response.ok) throw new Error('فشل في جلب البيانات من AI');

      const data = await response.json();
      const content = JSON.parse(data.candidates[0].content.parts[0].text);
      setResult(content);
      setStep(100); 

    } catch (err) {
      setError(`حدث خطأ: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ direction: 'rtl', padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', color: '#00a884' }}>مختبر الهندسة الاستراتيجية (STP)</h1>
      
      {error && <p style={{ color: 'red', background: '#fee', padding: '10px' }}>{error}</p>}

      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input placeholder="اسم المشروع" value={answers.brand_name} onChange={e => setAnswers({...answers, brand_name: e.target.value})} />
          <textarea placeholder="وصف المشروع" value={answers.brand_desc} onChange={e => setAnswers({...answers, brand_desc: e.target.value})} />
          <input placeholder="الجمهور" value={answers.target_audience} onChange={e => setAnswers({...answers, target_audience: e.target.value})} />
          <input placeholder="تفضيلات الألوان" value={answers.color_preference} onChange={e => setAnswers({...answers, color_preference: e.target.value})} />
          <button 
            onClick={generateIdentity} 
            disabled={isGenerating}
            style={{ padding: '15px', background: '#00a884', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px' }}
          >
            {isGenerating ? 'جاري التحليل والابتكار...' : 'إنشاء الهوية والملخص'}
          </button>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '30px', border: '1px solid #ddd', padding: '20px', borderRadius: '10px' }}>
          <h3>📋 الملخص العام:</h3>
          <p>{result.general_summary}</p>
          
          <div style={{ background: '#f4f4f4', padding: '15px', marginTop: '20px' }}>
            <h3>🤖 البرومبت الاحترافي لإنشاء الصور:</h3>
            <code style={{ display: 'block', direction: 'ltr', textAlign: 'left', wordBreak: 'break-all' }}>
              {result.ai_image_prompt}
            </code>
          </div>
          
          <footer style={{ marginTop: '30px', textAlign: 'center', fontWeight: 'bold' }}>
            By Sulieman alkhateeb
          </footer>
        </div>
      )}
    </div>
  );
}

export default App;