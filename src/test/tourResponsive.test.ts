import { describe, it, expect } from 'vitest';
import { computeTooltipPos } from '../components/onboarding/OnboardingTour';

const rect = { top: 100, left: 20, width: 200, height: 60 };

describe('computeTooltipPos responsiveness', () => {
  it('mobile: docked full width and inside the viewport', () => {
    const p = computeTooltipPos(rect, 'right', 390, 844);
    expect(p.left).toBe(12);
    expect(p.width).toBe(366);
    expect(p.top + 220).toBeLessThanOrEqual(844);
  });

  it('mobile: docks to the top when the target sits low', () => {
    const p = computeTooltipPos({ ...rect, top: 700 }, 'bottom', 390, 844);
    expect(p.top).toBe(12);
  });

  it('tablet: keeps the card fully inside the viewport', () => {
    const p = computeTooltipPos({ top: 100, left: 700, width: 200, height: 60 }, 'right', 820, 1180);
    expect(p.left).toBeGreaterThanOrEqual(8);
    expect(p.left + p.width).toBeLessThanOrEqual(820);
  });

  it('desktop: keeps the requested placement and fits', () => {
    const p = computeTooltipPos(rect, 'right', 1440, 900);
    expect(p.effective).toBe('right');
    expect(p.width).toBe(320);
    expect(p.left + p.width).toBeLessThanOrEqual(1440);
  });
});
