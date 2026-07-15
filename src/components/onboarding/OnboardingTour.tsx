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

const rectOf = (el: HTMLElement): Rect => {
  const r = el.getBoundingClientRect();
  return { top: r.top, left: r.left, width: r.width, height: r.height };
};

const computeTooltipPos = (
  rect: Rect | null,
  placement: Placement,
  vw: number,
  vh: number
): { top: number; left: number; effective: Placement } => {
  if (!rect || placement === 'center') {
    return { top: vh / 2 - 100, left: vw / 2 - TOOLTIP_W / 2, effective: 'center' };
  }
  const tW = TOOLTIP_W;
  const tH = 180; // estimate; height auto-adjusts, arrow ok
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
  return { top, left, effective };
};

export const OnboardingTour: React.FC<Props> = ({ steps, onClose }) => {
  const [index, setIndex] = React.useState(0);
  const [rect, setRect] = React.useState<Rect | null>(null);
  const [viewport, setViewport] = React.useState({ w: window.innerWidth, h: window.innerHeight });
  const { language } = useLanguage();
  const ui = getOnboardingUI(language);
  const step = steps[index];

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
    window.addEventListener('scroll', update, true);
    const interval = window.setInterval(update, 400); // keep in sync with layout shifts
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
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
        setIndex((i) => Math.min(i + 1, steps.length - 1));
      }, 250);
    };
    target.addEventListener(evt, handler, { once: true });
    return () => target.removeEventListener(evt, handler);
  }, [step, steps.length]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (!step?.interactive) {
        if (e.key === 'ArrowRight') setIndex((i) => Math.min(i + 1, steps.length - 1));
        if (e.key === 'ArrowLeft') setIndex((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, steps.length, step]);

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
  const isLast = index === steps.length - 1;

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
        className="absolute pointer-events-auto rounded-2xl p-5 liquid-glass animate-slide-up"
        style={{
          top: pos.top,
          left: pos.left,
          width: TOOLTIP_W,
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
          aria-label="Fechar tour"
        >
          <X size={16} />
        </button>

        <div
          className="text-[10px] font-bold uppercase tracking-wider mb-1"
          style={{ color: 'var(--color-accent)' }}
        >
          Passo {index + 1} de {steps.length}
        </div>
        <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--color-text-main)' }}>
          {step.title}
        </h3>
        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
          {step.body}
        </p>

        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-medium underline-offset-2 hover:underline"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Pular
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
              disabled={isFirst}
              className="px-3 py-1.5 rounded-lg text-xs font-medium border inline-flex items-center gap-1 disabled:opacity-40"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-main)',
                backgroundColor: 'transparent',
              }}
            >
              <ArrowLeft size={12} /> Anterior
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
                Concluir <Check size={12} />
              </button>
            ) : step.interactive ? (
              <span
                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 animate-pulse"
                style={{
                  backgroundColor: colorMix('var(--color-accent)', 15, 'rgba(201,166,85,0.15)'),
                  color: 'var(--color-accent)',
                  border: `1px dashed ${colorMix('var(--color-accent)', 40, 'rgba(201,166,85,0.4)')}`,
                }}
              >
                <MousePointerClick size={12} />
                {step.interactiveHint || 'Clique para continuar'}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setIndex((i) => Math.min(steps.length - 1, i + 1))}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                style={{
                  backgroundColor: 'var(--color-btn-primary-bg)',
                  color: 'var(--color-btn-primary-text)',
                }}
              >
                Próximo <ArrowRight size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
