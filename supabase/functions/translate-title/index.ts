import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  enforceProtectedCasing,
  glossaryPromptBlock,
  missingProtectedTerms,
} from "../_shared/glossary.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Langs = "pt-br" | "en-us" | "es-es";

/** Normaliza espaçamento/pontuação e a grafia dos termos protegidos. */
function normalize(text: string): string {
  return enforceProtectedCasing(
    text.replace(/\s+/g, " ").trim().replace(/\s*:\s*/g, ": ").replace(/^(\d{1,2})\s*\.\s*/, "$1. "),
  ).trim();
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { text } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const source = normalize(text);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a professional translator for dental/medical marketing materials.
Translate the given material title into three languages. Keep it concise, professional, and technically accurate for the dental industry.

${glossaryPromptBlock(source)}

Also keep any leading numbering (e.g. "03. ") exactly as in the source.

Return ONLY a valid JSON object with this exact structure, no markdown, no code blocks:
{"pt-br": "...", "en-us": "...", "es-es": "..."}
If the input is already in one of the languages, keep it as-is for that language and translate to the others.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: source },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      return new Response(JSON.stringify({ error: "Translation failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    let content = data.choices?.[0]?.message?.content || "";
    content = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();

    const raw = JSON.parse(content) as Record<Langs, string>;
    const translations: Record<string, string> = {};
    const warnings: string[] = [];

    for (const lang of ["pt-br", "en-us", "es-es"] as Langs[]) {
      const value = typeof raw[lang] === "string" ? normalize(raw[lang]) : "";
      if (!value) {
        translations[lang] = source;
        continue;
      }
      const missing = missingProtectedTerms(source, value);
      if (missing.length > 0) {
        // Nome de produto/marca foi traduzido ou removido: descarta e mantém o original.
        console.warn("protected terms lost in translation", { lang, missing, value });
        warnings.push(`${lang}: termos protegidos alterados (${missing.join(", ")}) — mantido original`);
        translations[lang] = source;
      } else {
        translations[lang] = value;
      }
    }

    return new Response(JSON.stringify({ translations, warnings }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("translate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
