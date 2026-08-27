/**
 * Glossário de termos protegidos (marcas e nomes de produto) usado no
 * frontend para validar/corrigir títulos traduzidos antes de salvar.
 * Mantido em sincronia com supabase/functions/_shared/glossary.ts
 */
export const PROTECTED_TERMS: string[] = [
  'Conexão Implantes',
  'Hub Conexão',
  'Conexão',
  'Vulcano Actives',
  'Titânio Hard',
  'inLego',
  'Master Flex',
  'Start Flex',
  'Stop Drill',
  'Expertguide',
  'Index Sensitive',
  'Flex Gold NP',
  'Easy Grip',
  'Short HE RD',
  'Short NP BLT',
  'Easy',
  'Flash',
  'Slim',
  'Torq',
  'Sensitive',
  'SPIN',
  'DISC',
  'Gatekeeper',
];

const TERMS_BY_LENGTH = [...PROTECTED_TERMS].sort((a, b) => b.length - a.length);

export function findProtectedTerms(text: string): string[] {
  const found: string[] = [];
  let rest = text;
  for (const term of TERMS_BY_LENGTH) {
    const idx = rest.toLowerCase().indexOf(term.toLowerCase());
    if (idx >= 0) {
      found.push(term);
      rest = rest.slice(0, idx) + ' '.repeat(term.length) + rest.slice(idx + term.length);
    }
  }
  return found;
}

/** Corrige a grafia canônica dos termos protegidos numa string. */
export function enforceProtectedCasing(text: string): string {
  let out = text;
  for (const term of TERMS_BY_LENGTH) {
    const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(escaped, 'gi'), term);
  }
  return out;
}

/** Termos protegidos que existiam no original e sumiram da tradução. */
export function missingProtectedTerms(original: string, translated: string): string[] {
  const expected = findProtectedTerms(original);
  const lower = translated.toLowerCase();
  return expected.filter((t) => !lower.includes(t.toLowerCase()));
}

/**
 * Normaliza um título de material/trilha para o padrão da plataforma:
 * - espaços colapsados e aparados;
 * - espaçamento correto em torno de ":" (sem espaço antes, um depois);
 * - numeração "01." mantida com um espaço após o ponto;
 * - grafia canônica dos termos protegidos.
 */
export function normalizeTitle(input: string | null | undefined): string {
  if (!input) return '';
  let out = input.replace(/\s+/g, ' ').trim();
  out = out.replace(/\s*:\s*/g, ': ');
  out = out.replace(/^(\d{1,2})\s*\.\s*/, '$1. ');
  out = enforceProtectedCasing(out);
  return out.trim();
}
