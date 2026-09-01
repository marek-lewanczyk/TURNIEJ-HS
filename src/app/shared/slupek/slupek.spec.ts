import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Slupek } from './slupek';
import type { PozycjaRankingu } from '../../core/turniej-store';

const POZYCJA: PozycjaRankingu = {
  zastep: { id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' },
  suma: 15,
  wpisy: [
    {
      id: 'w1',
      data: '2026-10-01',
      zastepId: 'aptus',
      tytul: 'Biwak w Kolibkach',
      punkty: 15,
      kategoria: 'biwak',
      ekstra: 'zadanie-bazy',
    },
  ],
  miejsce: 1,
  procentLidera: 100,
};

function utworz(pozycja: PozycjaRankingu) {
  TestBed.configureTestingModule({});
  const fixture = TestBed.createComponent(Slupek);
  fixture.componentRef.setInput('pozycja', pozycja);
  fixture.detectChanges();
  return fixture;
}

describe('Slupek', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('shows place, name and points as text', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).toContain('1');
    expect(tekst).toContain('Aptus');
    expect(tekst).toContain('15');
  });

  it('sets the bar width from procentLidera', () => {
    const belka = utworz(POZYCJA).nativeElement.querySelector('[data-belka]') as HTMLElement;
    expect(belka.style.getPropertyValue('--pct')).toBe('100%');
  });

  it('hides the bar from assistive tech', () => {
    const belka = utworz(POZYCJA).nativeElement.querySelector('[data-belka]') as HTMLElement;
    expect(belka.getAttribute('aria-hidden')).toBe('true');
  });

  it('lists the patrol entries with an extra-points marker', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).toContain('Biwak w Kolibkach');
    expect(tekst).toContain('zadanie z bazy');
  });

  it('says so when the patrol has no entries in the period', () => {
    const tekst = utworz({ ...POZYCJA, wpisy: [], suma: 0, procentLidera: 0 }).nativeElement
      .textContent as string;
    expect(tekst).toContain('Brak wpisów w tym okresie');
  });

  // jsdom does not evaluate `prefers-reduced-motion` media queries or
  // scroll-driven (view()) animation timelines, so the actual cascade can
  // only be verified in a real browser (see task-5-report.md). This is a
  // regression guard against the rule being deleted: `.belka` runs on a
  // scroll-progress timeline, so zeroing `animation-duration` (as the global
  // reduced-motion block in styles.css does) has no effect on it — the
  // timeline itself must be dropped for reduced motion, which requires this
  // component-local override to keep existing.
  it('neutralises the bar reveal timeline under prefers-reduced-motion', () => {
    const style = (Slupek as unknown as { ɵcmp: { styles: string[] } }).ɵcmp.styles.join('\n');
    const blokRedukcji = style.match(
      /@media \(prefers-reduced-motion: reduce\)\s*{\s*\.belka(?:\[[^\]]*\])?\s*{([^}]*)}/,
    );
    expect(blokRedukcji).not.toBeNull();
    const [, deklaracje] = blokRedukcji as RegExpMatchArray;
    expect(deklaracje).toContain('animation-timeline: none');
    expect(deklaracje).toContain('transform: none');
  });
});
