/**
 * Glossário de termos protegidos (marcas, linhas e nomes de produto).
 * Estes termos NUNCA podem ser traduzidos, reordenados ou flexionados
 * em nenhum idioma — devem aparecer exatamente como no original.
 */
export const PROTECTED_TERMS: string[] = [
  // Marca / institucional
  "Conexão Implantes",
  "Hub Conexão",
  "Conexão",
  // Linhas e produtos
  "Vulcano Actives",
  "Titânio Hard",
  "inLego",
  "Master Flex",
  "Start Flex",
  "Stop Drill",
  "Expertguide",
  "Index Sensitive",
  "Flex Gold NP",
  "Easy Grip",
  "Short HE RD",
  "Short NP BLT",
  "Easy",
  "Flash",
  "Slim",
  "Torq",
  "Sensitive",
  // Metodologias / siglas
  "SPIN",
  "DISC",
  "Gatekeeper",
  "Sales Rocket",
];

/** Ordena do termo mais longo para o mais curto (evita casar "Easy" dentro de "Easy Grip"). */
const TERMS_BY_LENGTH = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length);

/** Termos protegidos presentes em um texto. */
export function findProtectedTerms(text: string): string[] {
  const found: string[] = [];
  let rest = text;
  for (const term of TERMS_BY_LENGTH) {
    const idx = rest.toLowerCase().indexOf(term.toLowerCase());
    if (idx >= 0) {
      found.push(term);
      rest = rest.slice(0, idx) + " ".repeat(term.length) + rest.slice(idx + term.length);
    }
  }
  return found;
}

/**
 * Corrige a grafia dos termos protegidos numa tradução:
 * qualquer variação de caixa é substituída pela forma canônica.
 */
export function enforceProtectedCasing(text: string): string {
  let out = text;
  for (const term of TERMS_BY_LENGTH) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(escaped, "gi"), term);
  }
  return out;
}

/**
 * Valida uma tradução: todo termo protegido do original precisa aparecer
 * intacto na tradução. Retorna a lista de termos ausentes.
 */
export function missingProtectedTerms(original: string, translated: string): string[] {
  const expected = findProtectedTerms(original);
  const lower = translated.toLowerCase();
  return expected.filter((t) => !lower.includes(t.toLowerCase()));
}

/** Bloco de instruções para o prompt do modelo. */
export function glossaryPromptBlock(original: string): string {
  const relevant = findProtectedTerms(original);
  const list = (relevant.length ? relevant : PROTECTED_TERMS).map((t) => `- ${t}`).join("\n");
  return `PROTECTED TERMS — brand, product line and product names. NEVER translate, NEVER reorder, NEVER inflect, NEVER change spelling or capitalization of these. Copy them character by character:
${list}

STRUCTURE RULE: keep the exact same structure as the source title. If the source is "Prefix: Name", the translation must also be "TranslatedPrefix: Name" with the protected name in the same position. Do not move a product name before or after a common noun (e.g. never turn "Kit Stop Drill" into "Stop Drill Kit", never turn "Implante: Easy Grip" into "Easy Grip Implant").`;
}
