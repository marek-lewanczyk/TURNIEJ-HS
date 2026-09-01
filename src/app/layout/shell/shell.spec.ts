import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Shell } from './shell';
import { DANE_TOKEN } from '../../core/turniej-store';
import { DANE } from '../../core/dane';
import type { DaneTurnieju } from '../../core/model/turniej.model';

function utworz(dane: DaneTurnieju) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: DANE_TOKEN, useValue: dane }],
  });
  const fixture = TestBed.createComponent(Shell);
  fixture.detectChanges();
  return fixture;
}

/** The "wkrótce" marker sits in a nested span, so textContent carries the
 *  template's indentation. Collapse it before comparing. */
function tekst(element: Element): string {
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

describe('Shell', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('shows the tournament name and organiser', () => {
    const tekst = utworz(DANE).nativeElement.textContent as string;
    expect(tekst).toContain('Turniej Zastępów Starszoharcerskich');
    expect(tekst).toContain('Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia');
  });

  it('renders all five tabs', () => {
    const linki = utworz(DANE).nativeElement.querySelectorAll('nav a');
    expect([...linki].map((a: Element) => tekst(a))).toEqual([
      'Ranking',
      'Inspiracje',
      'Zadania',
      'Zasady',
      'Nagrody wkrótce',
    ]);
  });

  it('drops the "wkrótce" marker once prizes exist', () => {
    const dane: DaneTurnieju = { ...DANE, nagrody: [{ miejsce: 1, tytul: 'Wyprawa' }] };
    const linki = utworz(dane).nativeElement.querySelectorAll('nav a');
    expect(tekst(linki[4])).toBe('Nagrody');
  });
});
