import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Slupek } from './slupek';
import { DANE_TOKEN, type PozycjaRankingu } from '../../core/turniej-store';
import type { DaneTurnieju } from '../../core/model/turniej.model';

const DANE_TESTOWE: DaneTurnieju = {
  turniej: {
    nazwa: 'T',
    organizator: 'O',
    start: '2026-09-19',
    koniec: '2027-06-20',
    kwartaly: [],
  },
  zastepy: [],
  wpisy: [],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
  materialy: [],
};

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

function utworz(pozycja: PozycjaRankingu, dane: DaneTurnieju = DANE_TESTOWE) {
  TestBed.configureTestingModule({
    providers: [{ provide: DANE_TOKEN, useValue: dane }],
  });
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

  it('renders a category pill next to the entry title', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).toContain('biwak');
  });

  it('binds the bar colour to the patrol token, never a hardcoded class', () => {
    const fixture = utworz(POZYCJA);
    const belka = fixture.nativeElement.querySelector('[data-belka]') as HTMLElement;
    expect(belka.style.backgroundColor).toBe('var(--color-las)');
    expect(belka.className).not.toContain('bg-las');
  });

  it('says nothing about joining when dolaczyl equals the tournament start', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).not.toContain('Dołączył do turnieju');
  });

  it('says so when the patrol joined mid-tournament', () => {
    const pozycja: PozycjaRankingu = {
      ...POZYCJA,
      zastep: { ...POZYCJA.zastep, dolaczyl: '2027-01-10' },
    };
    const tekst = utworz(pozycja).nativeElement.textContent as string;
    expect(tekst).toContain('Dołączył do turnieju 2027-01-10');
  });

  it('renders a chevron disclosure affordance', () => {
    const chevron = utworz(POZYCJA).nativeElement.querySelector('.chevron');
    expect(chevron).not.toBeNull();
    expect(chevron.getAttribute('aria-hidden')).toBe('true');
  });

  // jsdom does not evaluate the `details[open]` cascade the way a real
  // browser does, so the actual rotation can only be verified in a real
  // browser (see the fix report). This is a regression guard against the
  // rule being deleted or reverted back to a Tailwind group-open utility —
  // verified in a real browser check not to animate this SVG icon.
  it('carries the open-state rotation rule for the chevron', () => {
    const style = (Slupek as unknown as { ɵcmp: { styles: string[] } }).ɵcmp.styles.join('\n');
    const blokOtwarcia = style.match(
      /details\[open\](?:\[[^\]]*\])?\s*\.chevron(?:\[[^\]]*\])?\s*{([^}]*)}/,
    );
    expect(blokOtwarcia).not.toBeNull();
    const [, deklaracje] = blokOtwarcia as RegExpMatchArray;
    expect(deklaracje).toContain('transform: rotate(90deg)');
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

  it('hides podium treatment when place is 1 but suma is 0', () => {
    const pozycja: PozycjaRankingu = {
      ...POZYCJA,
      suma: 0,
      procentLidera: 0,
      wpisy: [],
    };
    const fixture = utworz(pozycja);
    const tekst = fixture.nativeElement.textContent as string;
    expect(tekst).not.toContain('podium');

    const miejsceSpan = fixture.nativeElement.querySelector('.font-naglowek.text-lg') as HTMLElement;
    expect(miejsceSpan).not.toBeNull();
    expect(miejsceSpan.classList.contains('text-sygnal')).toBe(false);
  });

  it('shows podium treatment when place is 1 and suma is positive', () => {
    const fixture = utworz(POZYCJA);
    const tekst = fixture.nativeElement.textContent as string;
    expect(tekst).toContain('podium');

    const miejsceSpan = fixture.nativeElement.querySelector('.font-naglowek.text-lg') as HTMLElement;
    expect(miejsceSpan).not.toBeNull();
    expect(miejsceSpan.classList.contains('text-sygnal')).toBe(true);
  });
});
