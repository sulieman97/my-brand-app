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
      "general_summary": "ملخص عام وشامل يدمج الرؤية الاستراتيجية بالهوية البصرية المقترحة بأسلوب خبير",
      "strategy": "نص التحليل الاستراتيجي",
      "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
      "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب"}],
      "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
      "logo_concept": "وصف فكرة الشعار",
      "visual_patterns": "الوصف",
      "shapes_analysis": "الوصف",
      "ai_image_prompt": "A professional, high-end branding prompt for AI image generators (like Midjourney or DALL-E). Create a minimalist and modern logo design for '${answers.brand_name}'. The design should reflect '${answers.brand_essence}' and follow '${answers.brand_vibe}' style. Incorporate '${answers.shapes_concept}' using a color palette of '${answers.color_preference}'. Requirements: ultra-high resolution, 8k, centered composition, golden ratio, clean lines, professional studio lighting, trending on Behance. If the brand name is in Arabic, ensure the typography is elegant, modern Arabic calligraphy."
    }
  `;

  try {
    // 2. استخدام الموديل المستقر
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
    
    // 3. استخراج النص وتحويله لـ JSON
    const rawText = data.candidates[0].content.parts[0].text;
    const content = JSON.parse(rawText);
    
    setResult(content);
    // تأكد من أن step تأخذ القيمة الصحيحة لعرض صفحة النتائج
    setStep(questions.length + 1); 

  } catch (err) {
    console.error("Full Error Details:", err);
    setError(`عذراً، حدث خطأ: ${err.message}. تأكد من الاتصال وصلاحية المفتاح.`);
  } finally {
    setIsGenerating(false);
  }
};