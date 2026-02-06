const generateIdentity = async () => {
    // 1. التحقق من وجود المفتاح في بيئة العمل
    if (!apiKey) {
      setError('خطأ: مفتاح الـ API غير موجود. تأكد من إضافته في إعدادات Vercel باسم VITE_GEMINI_API_KEY');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    // بناء الأمر (Prompt) مع إضافة طلب الملخص والبرومبت الإنجليزي الاحترافي
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
        "general_summary": "ملخص خبير وشامل يدمج الرؤية الاستراتيجية بالهوية البصرية المقترحة بأسلوب أكاديمي ملهم",
        "strategy": "نص التحليل الاستراتيجي",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب سيكولوجي"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط"},
        "logo_concept": "وصف فكرة الشعار العميقة",
        "visual_patterns": "الوصف البصري المساعد",
        "shapes_analysis": "التحليل الهندسي للأشكال",
        "ai_image_prompt": "A professional, ultra-high-definition branding prompt for AI generators. Create a masterpiece logo for '${answers.brand_name}'. Style: ${answers.brand_vibe}. Concept: Incorporate '${answers.shapes_concept}' reflecting '${answers.brand_essence}'. Aesthetics: Minimalist, clean, symmetrical, golden ratio, professional studio lighting, 8k resolution, trending on Behance. Colors: High-fidelity rendering of ${answers.color_preference}. If the brand name is in Arabic, use elegant, modern, and sharp Arabic calligraphy."
      }
    `;

    try {
      // 2. طلب البيانات من Gemini API
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to connect to AI');
      }

      const data = await response.json();
      
      // 3. استخراج وتحويل النص إلى كائن JSON
      const rawText = data.candidates[0].content.parts[0].text;
      const content = JSON.parse(rawText);
      
      setResult(content);
      
      // تأكد أن متغير questions معرف في ملفك أو استبدله بعدد الأسئلة لديك يدوياً
      if (typeof questions !== 'undefined') {
        setStep(questions.length);
      } else {
        setStep(100); // الانتقال لصفحة النتائج مباشرة
      }

    } catch (err) {
      console.error("Full Error Details:", err);
      setError(`عذراً، حدث خطأ: ${err.message}.`);
    } finally {
      setIsGenerating(false);
    }
  };