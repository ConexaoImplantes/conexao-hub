/**
 * Normalize a person's name to Title Case following PT-BR conventions:
 * - First letter of every "main" word uppercase, remaining lowercase.
 * - Common connective particles ("de", "da", "do", "dos", "das", "e",
 *   "di", "du", "del", "la", "van", "von", "y") stay lowercase, except
 *   when they are the very first word.
 * - Preserves hyphens and apostrophes (e.g. "Anne-Marie", "D'Ávila").
 */
const LOWERCASE_PARTICLES = new Set([
  'de', 'da', 'do', 'dos', 'das', 'e',
  'di', 'du', 'del', 'la', 'van', 'von', 'y',
]);

function capitalizeToken(token: string): string {
  if (!token) return token;
  // Handle hyphenated segments recursively
  if (token.includes('-')) {
    return token.split('-').map(capitalizeToken).join('-');
  }
  // Handle apostrophes: capitalize each side (D'Ávila, O'Brien)
  if (token.includes("'")) {
    return token.split("'").map(capitalizeToken).join("'");
  }
  const lower = token.toLocaleLowerCase('pt-BR');
  return lower.charAt(0).toLocaleUpperCase('pt-BR') + lower.slice(1);
}

export function normalizeName(input: string | null | undefined): string {
  if (!input) return '';
  const trimmed = input.replace(/\s+/g, ' ').trim();
  if (!trimmed) return '';
  const words = trimmed.split(' ');
  return words
    .map((word, idx) => {
      const lower = word.toLocaleLowerCase('pt-BR');
      if (idx > 0 && LOWERCASE_PARTICLES.has(lower)) return lower;
      return capitalizeToken(word);
    })
    .join(' ');
}
