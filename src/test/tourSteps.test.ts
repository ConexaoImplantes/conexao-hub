import { describe, it, expect, beforeEach } from 'vitest';
import { isStepUsable } from '../components/onboarding/OnboardingTour';

const withSize = (el: Element, w = 100, h = 40) => {
  (el as HTMLElement).getBoundingClientRect = () =>
    ({ top: 0, left: 0, width: w, height: h, right: w, bottom: h, x: 0, y: 0, toJSON: () => ({}) }) as DOMRect;
};

describe('isStepUsable', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps steps without a selector', () => {
    expect(isStepUsable({ title: 't', body: 'b' } as any)).toBe(true);
  });

  it('skips missing targets (permission-gated)', () => {
    expect(isStepUsable({ targetSelector: '[data-tour="nope"]', title: 't', body: 'b' } as any)).toBe(false);
  });

  it('skips zero-size / hidden targets', () => {
    document.body.innerHTML = '<div data-tour="x"></div>';
    expect(isStepUsable({ targetSelector: '[data-tour="x"]', title: 't', body: 'b' } as any)).toBe(false);
  });

  it('skips interactive steps whose target has nothing clickable', () => {
    document.body.innerHTML = '<div data-tour="filters"><span>only text</span></div>';
    withSize(document.querySelector('[data-tour="filters"]')!);
    expect(
      isStepUsable({ targetSelector: '[data-tour="filters"]', title: 't', body: 'b', interactive: true } as any)
    ).toBe(false);
  });

  it('keeps interactive steps with a visible clickable child', () => {
    document.body.innerHTML = '<div data-tour="filters"><button>PDF</button></div>';
    withSize(document.querySelector('[data-tour="filters"]')!);
    withSize(document.querySelector('button')!, 60, 24);
    expect(
      isStepUsable({ targetSelector: '[data-tour="filters"]', title: 't', body: 'b', interactive: true } as any)
    ).toBe(true);
  });
});
