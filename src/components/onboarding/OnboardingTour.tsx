import React from 'react';
import { ArrowLeft, ArrowRight, X, Check, MousePointerClick } from 'lucide-react';
import { TourStep, Placement, getOnboardingUI } from './tours';
import { colorMix } from '../../lib/utils';
import { useLanguage } from '../../contexts/LanguageContext';

interface Props {
  steps: TourStep[];
  onClose: () => void;
}

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const TOOLTIP_W = 320;
const TOOLTIP_GAP = 14;

const findTarget = (selector?: string): HTMLElement | null => {
  if (!selector) return null;
  try {
    return document.querySelector(selector) as HTMLElement | null;
  } catch {
    return null;
  }
};

/** Element is actually painted and has usable size. */
const isVisible = (el: HTMLElement): boolean => {
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return false;
  const cs = window.getComputedStyle(el);
  if (cs.visibility === 'hidden' || cs.display === 'none') return false;
  if (cs.opacity !== '' && Number(cs.opacity) === 0) return false;

  return true;
};

/** Interactive targets must actually contain something clickable. */
const hasClickable = (el: HTMLElement): boolean => {
  if (el.matches('button, a, input, select, textarea, [role="button"]')) return true;
  const nodes = el.querySelectorAll<HTMLElement>('button, a, input, select, textarea, [role="button"]');
  for (const n of nodes) {
    if (!(n as HTMLButtonElement).disabled && isVisible(n)) return true;
  }
  return false;
};

/**
 * A step is usable only when its target exists, is visible and — for interactive
 * steps — offers something the user can actually click. Steps whose target is
 * hidden by permissions, by the current view or simply empty are skipped.
 */
export const isStepUsable = (step: TourStep): boolean => {
  if (!step.targetSelector) return true;
  const el = findTarget(step.targetSelector);
  if (!el || !isVisible(el)) return false;
  if (step.interactive && !hasClickable(el)) return false;
  return true;
};


const rectOf = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const MOBILE_BP = 640;

interface TooltipPos {
  top: number;
  left: number;
  width: number;
  effective: Placement;
}

export const computeTooltipPos = (
  rect: Rect | null,
  placement: Placement,
  vw: number,
  vh: number
): TooltipPos => {
  const isMobile = vw < MOBILE_BP;
  // Never wider than the viewport (minus 12px gutters on each side).
  const tW = Math.min(TOOLTIP_W, vw - 24);
  const tH = isMobile ? 220 : 180; // estimate; the card itself auto-sizes

  if (!rect) {
    return { top: Math.max(12, vh / 2 - tH / 2), left: (vw - tW) / 2, width: tW, effective: 'center' };
  }

  // Mobile / narrow screens: dock the card to the bottom (or to the top when the
  // highlighted element sits low on the screen) so it never covers the spotlight
  // and never overflows horizontally.
  if (isMobile) {
    const spotlightBottom = rect.top + rect.height;
    const roomBelow = vh - spotlightBottom;
    const dockTop = roomBelow < tH + 24 && rect.top > tH + 24;
    return {
      top: dockTop ? 12 : Math.max(12, vh - tH - 12),
      left: 12,
      width: vw - 24,
      effective: dockTop ? 'top' : 'bottom',
    };
  }

  if (placement === 'center') {
    return { top: vh / 2 - 100, left: vw / 2 - tW / 2, width: tW, effective: 'center' };
  }

  let top = 0;
  let left = 0;
  let effective: Placement = placement;

  const canBottom = rect.top + rect.height + TOOLTIP_GAP + tH < vh;
  const canTop = rect.top - TOOLTIP_GAP - tH > 0;
  const canRight = rect.left + rect.width + TOOLTIP_GAP + tW < vw;
  const canLeft = rect.left - TOOLTIP_GAP - tW > 0;

  if (placement === 'bottom' && !canBottom && canTop) effective = 'top';
  if (placement === 'top' && !canTop && canBottom) effective = 'bottom';
  if (placement === 'right' && !canRight && canLeft) effective = 'left';
  if (placement === 'left' && !canLeft && canRight) effective = 'right';
  // Tablet-ish widths: side placements often do not fit — fall back vertically.
  if ((effective === 'right' && !canRight) || (effective === 'left' && !canLeft)) {
    effective = canBottom ? 'bottom' : 'top';
  }

  switch (effective) {
    case 'top':
      top = rect.top - TOOLTIP_GAP - tH;
      left = rect.left + rect.width / 2 - tW / 2;
      break;
    case 'bottom':
      top = rect.top + rect.height + TOOLTIP_GAP;
      left = rect.left + rect.width / 2 - tW / 2;
      break;
    case 'left':
      top = rect.top + rect.height / 2 - tH / 2;
      left = rect.left - TOOLTIP_GAP - tW;
      break;
    case 'right':
      top = rect.top + rect.height / 2 - tH / 2;
      left = rect.left + rect.width + TOOLTIP_GAP;
      break;
  }

  // Clamp inside viewport with 8px margin.
  left = Math.max(8, Math.min(left, vw - tW - 8));
  top = Math.max(8, Math.min(top, vh - tH - 8));
  return { top, left, width: tW, effective };
};


export const OnboardingTour: React.FC<Props> = ({ steps: rawSteps, onClose }) => {
  const { language } = useLanguage();
  const ui = getOnboardingUI(language);

  // Initial filter: drop steps whose target is missing/hidden/empty right now
  // (permission-gated tabs, filters not rendered in the current view, etc.).
  const steps = React.useMemo(() => rawSteps.filter(isStepUsable), [rawSteps]);

  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [viewport, setViewport] = React.useState({ w: window.innerWidth, h: window.innerHeight });

  /** Nearest usable index walking in `dir`; -1 when none. */
  const findUsable = React.useCallback(
    (from: number, dir: 1 | -1) => {
      for (let i = from; i >= 0 && i < steps.length; i += dir) {
        if (isStepUsable(steps[i])) return i;
      }
      return -1;
    },
    [steps]
  );

  const goNext = React.useCallback(() => {
    setIndex((i) => {
      const n = findUsable(i + 1, 1);
      // Nothing usable ahead: the tour is over — never leave the user stuck.
      if (n === -1) {
        onClose();
        return i;
      }
      return n;
    });
  }, [findUsable, onClose]);

  const goPrev = React.useCallback(() => {
    setIndex((i) => {
      const p = findUsable(i - 1, -1);
      return p === -1 ? i : p;
    });
  }, [findUsable]);


  // If the current index falls off the end after filtering, clamp it.
  React.useEffect(() => {
    if (index > steps.length - 1) setIndex(Math.max(0, steps.length - 1));
  }, [steps.length, index]);

  // If there are no visible steps at all, close immediately.
  React.useEffect(() => {
    if (steps.length === 0) onClose();
  }, [steps.length, onClose]);

  const step = steps[index];

  // Step counter based on the steps that are actually reachable right now, so
  // the user never sees a jump like "step 2 of 7" -> "step 6 of 7" when a whole
  // section of the UI is not on screen (e.g. filters while viewing Trails).
  const [progress, setProgress] = React.useState({ current: 1, total: steps.length });
  React.useEffect(() => {
    const compute = () => {
      let total = 0;
      let current = 1;
      steps.forEach((s, i) => {
        const usable = isStepUsable(s);
        if (usable) total += 1;
        if (i === index) current = usable ? total : total + 1;
      });
      setProgress({ current: Math.max(1, current), total: Math.max(total, current) });
    };
    compute();
    const t = window.setInterval(compute, 500);
    return () => window.clearInterval(t);
  }, [steps, index]);


  // The app can change while the tour runs (switching to Trails hides the type
  // filters, a tab unmounts its content...). Keep checking the current step and
  // move on when its target is no longer highlightable.
  React.useEffect(() => {
    if (!step) return;
    const check = () => {
      if (isStepUsable(step)) return;
      const next = findUsable(index + 1, 1);
      if (next !== -1) setIndex(next);
      else {
        const prev = findUsable(index - 1, -1);
        if (prev !== -1) setIndex(prev);
        else onClose();
      }
    };
    const t = window.setInterval(check, 500);
    return () => window.clearInterval(t);
  }, [step, index, findUsable, onClose]);


  // Recompute target rect on step change, resize, scroll.
  React.useEffect(() => {
    if (!step) return;
    if (step.onEnter) step.onEnter();

    let raf = 0;
    const update = () => {
      const target = findTarget(step.targetSelector);
      if (!target) {
        setRect(null);
        return;
      }
      // Bring target into view before measuring.
      const r = target.getBoundingClientRect();
      if (r.top < 60 || r.bottom > window.innerHeight - 60) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      raf = requestAnimationFrame(() => setRect(rectOf(target)));
    };
    update();
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
      update();
    };
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    window.addEventListener('scroll', update, true);
    const interval = window.setInterval(update, 400); // keep in sync with layout shifts
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', update, true);
      window.clearInterval(interval);
    };
  }, [step]);

  // Wait for the user to interact with the target element on interactive steps.
  React.useEffect(() => {
    if (!step?.interactive) return;
    const target = findTarget(step.targetSelector);
    if (!target) return;
    const evt = step.advanceEvent || 'click';
    const handler = () => {
      // Delay slightly so the app's own click handlers run first (tab switch, etc.).
      window.setTimeout(() => {
        goNext();
      }, 250);
    };
    target.addEventListener(evt, handler, { once: true });
    return () => target.removeEventListener(evt, handler);
  }, [step, goNext]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!step?.interactive) {
        if (e.key === 'ArrowRight') goNext();
        if (e.key === 'ArrowLeft') goPrev();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, step, goNext, goPrev]);

  if (!step) return null;

  const placement: Placement = step.placement || (rect ? 'bottom' : 'center');
  const pos = computeTooltipPos(rect, placement, viewport.w, viewport.h);

  const spotlight = rect
    ? {
        top: rect.top - PADDING,
        left: rect.left - PADDING,
        width: rect.width + PADDING * 2,
        height: rect.height + PADDING * 2,
      }
    : null;

  const isFirst = index === 0;
  const isLast = findUsable(index + 1, 1) === -1;

  return (
    <div className="fixed inset-0 z-[1100] pointer-events-none">
      {/* Backdrop with spotlight hole via 4 shaded rectangles (no clip-path complexity). */}
      {spotlight ? (
        <>
          <div
            className="absolute pointer-events-auto"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: spotlight.top,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
            onClick={onClose}
          />
          <div
            className="absolute pointer-events-auto"
            style={{
              top: spotlight.top + spotlight.height,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
            onClick={onClose}
          />
          <div
            className="absolute pointer-events-auto"
            style={{
              top: spotlight.top,
              left: 0,
              width: spotlight.left,
              height: spotlight.height,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
            onClick={onClose}
          />
          <div
            className="absolute pointer-events-auto"
            style={{
              top: spotlight.top,
              left: spotlight.left + spotlight.width,
              right: 0,
              height: spotlight.height,
              backgroundColor: 'rgba(0,0,0,0.65)',
            }}
            onClick={onClose}
          />
          {/* Highlight ring */}
          <div
            className="absolute pointer-events-none rounded-xl transition-all duration-300"
            style={{
              top: spotlight.top,
              left: spotlight.left,
              width: spotlight.width,
              height: spotlight.height,
              boxShadow: `0 0 0 2px var(--color-accent), 0 0 24px 4px ${colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')}`,
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 pointer-events-auto"
          style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}
          onClick={onClose}
        />
      )}

      {/* Tooltip */}
      <div
        className="absolute pointer-events-auto rounded-2xl p-4 sm:p-5 liquid-glass animate-slide-up"
        style={{
          top: pos.top,
          left: pos.left,
          width: pos.width,
          maxWidth: 'calc(100vw - 24px)',
          maxHeight: 'calc(100vh - 24px)',
          overflowY: 'auto',
          backgroundColor: 'var(--color-card)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-2 right-2 p-1 rounded-md"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={ui.closeTour}
        >
          <X size={16} />
        </button>

        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-accent)' }}
        >
          {ui.stepOf(progress.current, progress.total)}
        </div>
        <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--color-text-main)' }}>
          {step.title}
        </h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {step.body}
        </p>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {ui.skip}
          </button>
          <div className="flex items-center gap-2 ml-auto">

            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1 disabled:opacity-40"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-main)',
                backgroundColor: 'transparent',
              }}
            >
              <ArrowLeft size={12} /> {ui.previous}
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--color-btn-primary-bg)',
                  color: 'var(--color-btn-primary-text)',
                }}
              >
                {ui.finish} <Check size={12} />
              </button>
            ) : step.interactive ? (
              <>
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 animate-pulse"
                  style={{
                    backgroundColor: colorMix('var(--color-accent)', 15, 'rgba(201,166,85,0.15)'),
                    color: 'var(--color-accent)',
                    border: `1px dashed ${colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')}`,
                  }}
                >
                  <MousePointerClick size={12} />
                  {step.interactiveHint || ui.clickToContinue}
                </span>
                {/* Escape hatch: interactive steps must never block the tour. */}
                <button
                  type="button"
                  onClick={goNext}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 border"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-main)',
                    backgroundColor: 'transparent',
                  }}
                >
                  {ui.skipStep} <ArrowRight size={12} />
                </button>
              </>

            ) : (
              <button
                type="button"
                onClick={goNext}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--color-btn-primary-bg)',
                  color: 'var(--color-btn-primary-text)',
                }}
              >
                {ui.next} <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
