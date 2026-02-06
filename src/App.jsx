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
        "strategy": "نص التحليل الاستراتيجي العميق للمشروع",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب السيكولوجي لاستخدامه"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط وتبريره"},
        "logo_concept": "وصف دقيق لفكرة الشعار",
        "visual_patterns": "الوصف البصري للأنماط المساعدة",
        "shapes_analysis": "تحليل الأشكال الهندسية المختارة",
        "image_generation_prompt": "Create an ultra-high-definition, professional branding presentation. The logo features the text '${answers.brand_name}' in elegant typography. Design style: [Detailed Style from brand_vibe]. Composition: Minimalist, clean, and balanced using golden ratio principles. Lighting: Studio lighting with soft shadows. Quality: 8k resolution, vector style precision, trending on Behance. Must strictly adhere to the color palette [Mention colors from color_preference]. If the brand name is in Arabic, render it in a modern calligraphic or high-end corporate Arabic font."
      }

      ملاحظة هامة جداً: الـ image_generation_prompt يجب أن يكون باللغة الإنجليزية، مفصلاً، ويجمع كل المعطيات السابقة لإنتاج صورة شعار أو هوية بصرية مبهرة.
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
      
      // 3. استخراج النص وتحويله لـ JSON
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
  };const generateIdentity = async () => {
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
        "strategy": "نص التحليل الاستراتيجي العميق للمشروع",
        "slogans": ["سلوجان 1", "سلوجان 2", "سلوجان 3"],
        "colors": [{"name": "اسم اللون", "hex": "كود اللون", "reason": "السبب السيكولوجي لاستخدامه"}],
        "typography": {"primary": "اسم الخط", "style": "نمط الخط وتبريره"},
        "logo_concept": "وصف دقيق لفكرة الشعار",
        "visual_patterns": "الوصف البصري للأنماط المساعدة",
        "shapes_analysis": "تحليل الأشكال الهندسية المختارة",
        "image_generation_prompt": "Create an ultra-high-definition, professional branding presentation. The logo features the text '${answers.brand_name}' in elegant typography. Design style: [Detailed Style from brand_vibe]. Composition: Minimalist, clean, and balanced using golden ratio principles. Lighting: Studio lighting with soft shadows. Quality: 8k resolution, vector style precision, trending on Behance. Must strictly adhere to the color palette [Mention colors from color_preference]. If the brand name is in Arabic, render it in a modern calligraphic or high-end corporate Arabic font."
      }

      ملاحظة هامة جداً: الـ image_generation_prompt يجب أن يكون باللغة الإنجليزية، مفصلاً، ويجمع كل المعطيات السابقة لإنتاج صورة شعار أو هوية بصرية مبهرة.
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
      
      // 3. استخراج النص وتحويله لـ JSON
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