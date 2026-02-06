const generateIdentity = async () => {
  // 1. التحقق من وجود المفتاح
  if (!apiKey) {
    setError('خطأ: مفتاح الـ API غير موجود. أضفه في إعدادات Vercel باسم VITE_GEMINI_API_KEY');
    return;
  }

  setIsGenerating(true);
  setError(null);

  // صياغة الأمر الموجه للذكاء الاصطناعي
  const prompt = `
    أنت خبير استراتيجي في بناء العلامات التجارية. بناءً على هذه المعطيات، قم بإنشاء وثيقة هوية بصرية كاملة باللغة العربية:
    - اسم المشروع: ${answers.brand_name}
    - وصف النشاط: ${answers.brand_desc}
    - جوهر الشخصية: ${answers.brand_essence}
    - الجمهور المستهدف: ${answers.target_audience}
    - النمط البصري: ${answers.brand_vibe}
    - الأشكال الهندسية: ${answers.shapes_concept}
    - تفضيلات الألوان: ${answers.color_preference}

    المطلوب نتيجة بصيغة JSON حصراً بهذا الهيكل:
    {
      "strategy_summary": "ملخص استراتيجي عميق يربط بين الجمهور والوعد التسويقي للمشروع",
      "brand_story": "قصة موجزة وملهمة للعلامة التجارية",
      "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
      "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "التحليل النفسي للون"}],
      "typography": {"primary": "اسم الخط المقترح", "style": "سبب الاختيار"},
      "logo_concept": "وصف فني احترافي لفكرة الشعار",
      "ai_image_prompt": "An ultra-professional, 8k high-resolution branding presentation. The central focus is a masterpiece logo for a project named '${answers.brand_name}'. Style: ${answers.brand_vibe}. Typography: Clean, modern, high-end corporate fonts (incorporating elegant Arabic calligraphy if the name is Arabic). Aesthetics: Minimalist, perfectly balanced, symmetrical, following the golden ratio. Texture: Sharp vectors, premium finish. Lighting: Cinematic studio lighting. Environment: Clean neutral background. Instructions: No distorted text, no blurry edges, trending on Behance and Dribbble."
    }
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          responseMimeType: "application/json",
          temperature: 0.8 // درجة حرارة أعلى قليلاً لزيادة الإبداع في الصياغة
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'فشل الاتصال بالذكاء الاصطناعي');
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const content = JSON.parse(rawText);
    
    // تعيين النتيجة والانتقال لصفحة العرض النهائية
    setResult(content);
    setStep(questions.length + 1); // تأكد من أن هذا الرقم ينقلك لصفحة النتائج

  } catch (err) {
    console.error("Build Error:", err);
    setError(`حدث خطأ أثناء الابتكار: ${err.message}`);
  } finally {
    setIsGenerating(false);
  }
};