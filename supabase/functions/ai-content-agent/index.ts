import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  type: 'article' | 'social' | 'ideas' | 'rewrite';
  topic?: string;
  prompt?: string;
  framework?: string;
  platform?: string;
  existingContent?: string;
  category?: string;
  tone?: string;
  language?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const body = await req.json() as GenerateRequest;
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");

    if (!geminiApiKey) {
      return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { GoogleGenAI } = await import("https://esm.sh/@google/genai@2.10.0");
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    const lang = body.language || "pl";
    const tone = body.tone || "profesjonalny, ale przystępny";

    let systemPrompt = "";
    let userPrompt = "";

    if (body.type === "article") {
      systemPrompt = `Jesteś ekspertem HR i copywriterem. Piszesz artykuły blogowe w języku ${lang}. Ton: ${tone}. Zawsze używaj HTML tags (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <a>). Struktura: wstęp, 3-4 sekcje z nagłówkami, podsumowanie. Minimum 800 słów.`;
      userPrompt = `Napisz artykuł na temat: "${body.topic}".
Kategoria: ${body.category || 'HR'}
${body.framework ? `Framework copywritingowy: ${body.framework}` : ''}
${body.prompt ? `Dodatkowe instrukcje: ${body.prompt}` : ''}

Zwróć JSON z polami:
{
  "title": "tytuł artykułu",
  "slug": "slug-url",
  "excerpt": "krótki opis 1-2 zdania",
  "content": "pełna treść w HTML",
  "seoTitle": "tytuł SEO max 60 znaków",
  "seoDescription": "opis SEO max 160 znaków",
  "tags": ["tag1", "tag2"],
  "category": "kategoria"
}`;
    } else if (body.type === "social") {
      const platformLimits: Record<string, number> = {
        linkedin: 3000,
        facebook: 5000,
        instagram: 2200,
      };
      const limit = platformLimits[body.platform || 'linkedin'] || 3000;
      systemPrompt = `Jesteś ekspertem social media dla branży HR/B2B. Piszesz w języku ${lang}. Ton: ${tone}.`;
      userPrompt = `Napisz post na ${body.platform || 'LinkedIn'} na temat: "${body.topic}".
Limit znaków: ${limit}.
${body.framework ? `Framework: ${body.framework}` : ''}
${body.prompt ? `Dodatkowe instrukcje: ${body.prompt}` : ''}

Zwróć JSON:
{
  "content": "treść posta",
  "hashtags": "#hr #zaangażowanie #praca",
  "framework": "${body.framework || ''}"
}`;
    } else if (body.type === "ideas") {
      systemPrompt = `Jesteś strategiem treści HR. Znasz trendy HR, analitykę, zaangażowanie, employer branding. Piszesz w języku ${lang}.`;
      userPrompt = `Wygeneruj 5 pomysłów na artykuły blogowe${body.category ? ` w kategorii "${body.category}"` : ' HR'}.
${body.prompt ? `Kontekst: ${body.prompt}` : ''}

Zwróć JSON:
{
  "ideas": [
    { "title": "tytuł", "slug": "slug", "excerpt": "opis", "category": "kategoria", "reason": "dlaczego warto" }
  ]
}`;
    } else if (body.type === "rewrite") {
      systemPrompt = `Jesteś edytorem i copywriterem. Ulepszasz tekst w języku ${lang}. Ton: ${tone}. Zachowaj znaczenie, popraw styl i czytelność.`;
      userPrompt = `Przepisz i ulepsz ten tekst:
${body.existingContent}

${body.prompt ? `Instrukcje: ${body.prompt}` : ''}

Zwróć JSON:
{
  "content": "ulepszona treść w HTML"
}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown type" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.8,
      },
    });

    const text = response.text || "";
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { raw: text };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
