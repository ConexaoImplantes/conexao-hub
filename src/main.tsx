import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Detect color-mix support
const supportsColorMix = (() => {
  try {
    return CSS.supports('color', 'color-mix(in srgb, red 50%, blue)');
  } catch {
    return false;
  }
})();

if (!supportsColorMix) {
  document.documentElement.classList.add('no-color-mix');

  // Runtime polyfill: observe DOM for elements with inline color-mix styles
  // and replace with computed fallback values
  const COLOR_MIX_RE = /color-mix\(in srgb,\s*([^,]+?)\s+(\d+)%,\s*transparent\)/g;
  
  // Map CSS variable names to their fallback hex values
  const varFallbacks: Record<string, string> = {
    'var(--color-surface)': '#1e293b',
    'var(--color-accent)': '#c9a655',
    'var(--color-border)': '#334155',
    'var(--color-bg)': '#0f172a',
    'var(--color-warning)': '#eab308',
    'var(--color-error)': '#ef4444',
    'var(--color-success)': '#22c55e',
    'var(--color-glass-tint)': '#1e293b',
    'var(--color-header-bg)': '#0f172a',
    'var(--color-gradient-start)': '#c9a655',
    'var(--color-gradient-mid)': '#e8d48b',
    'var(--color-gradient-end)': '#a8873a',
    'var(--color-text-main)': '#f8fafc',
    'var(--env-blob1-color)': '#c9a655',
    'var(--color-input-bg)': '#1e293b',
  };

  function hexToRgba(hex: string, alpha: number): string {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  function replaceColorMix(value: string): string {
    return value.replace(COLOR_MIX_RE, (_match, colorExpr, pctStr) => {
      const pct = parseInt(pctStr, 10) / 100;
      const trimmed = colorExpr.trim();
      const fallbackHex = varFallbacks[trimmed];
      if (fallbackHex) {
        return hexToRgba(fallbackHex, pct);
      }
      // If it's a direct hex color
      if (trimmed.startsWith('#')) {
        return hexToRgba(trimmed, pct);
      }
      // Can't resolve - return semi-transparent dark
      return `rgba(30,41,59,${pct})`;
    });
  }

  // Patch inline styles after each render cycle
  const patchStyles = () => {
    const elements = document.querySelectorAll<HTMLElement>('[style]');
    elements.forEach(el => {
      const style = el.getAttribute('style');
      if (style && style.includes('color-mix')) {
        el.setAttribute('style', replaceColorMix(style));
      }
    });
  };

  // Use MutationObserver to catch dynamically added elements
  const observer = new MutationObserver((mutations) => {
    let needsPatch = false;
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        needsPatch = true;
        break;
      }
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        const el = mutation.target as HTMLElement;
        const style = el.getAttribute('style');
        if (style && style.includes('color-mix')) {
          el.setAttribute('style', replaceColorMix(style));
        }
      }
    }
    if (needsPatch) {
      requestAnimationFrame(patchStyles);
    }
  });

  // Start observing after initial render
  requestAnimationFrame(() => {
    patchStyles();
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
    });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
