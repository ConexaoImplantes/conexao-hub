import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Cross-browser color-mix helper.
 * Returns `color-mix(in srgb, ...)` on supported browsers,
 * or an rgba fallback on older ones (Safari <16.2, etc.).
 *
 * @param color  CSS color value (hex, rgb, var(--...), named)
 * @param pct    Percentage of the color (0-100), rest is transparent
 * @param fallbackRgba  Fallback rgba string for unsupported browsers
 */
const _supportsColorMix: boolean | null = null;
let supportsColorMix: boolean;

function checkColorMixSupport(): boolean {
  if (typeof window === 'undefined') return true;
  if (_supportsColorMix !== null) return _supportsColorMix;
  try {
    return CSS.supports('color', 'color-mix(in srgb, red 50%, blue)');
  } catch {
    return false;
  }
}

/**
 * Generates a color-mix CSS value with a fallback for unsupported browsers.
 *
 * Usage:
 *   style={{ backgroundColor: colorMix('var(--color-surface)', 40, 'rgba(30,41,59,0.4)') }}
 *
 * If color-mix is supported: returns "color-mix(in srgb, var(--color-surface) 40%, transparent)"
 * If not supported: returns the fallback value
 */
export function colorMix(color: string, pct: number, fallback: string): string {
  if (supportsColorMix === undefined) {
    supportsColorMix = checkColorMixSupport();
  }
  if (supportsColorMix) {
    return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
  }
  return fallback;
}

/**
 * Generates a color-mix CSS border value with fallback.
 */
export function colorMixBorder(color: string, pct: number, fallback: string): string {
  if (supportsColorMix === undefined) {
    supportsColorMix = checkColorMixSupport();
  }
  if (supportsColorMix) {
    return `1px solid color-mix(in srgb, ${color} ${pct}%, transparent)`;
  }
  return `1px solid ${fallback}`;
}
