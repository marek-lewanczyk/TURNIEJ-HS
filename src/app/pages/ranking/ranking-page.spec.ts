import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { RankingPage } from './ranking-page';
import { DANE_TOKEN } from '../../core/turniej-store';
import type { DaneTurnieju } from '../../core/model/turniej.model';

const DANE_TESTOWE: DaneTurnieju = {
  turniej: {
    nazwa: 'T',
    organizator: 'O',
    start: '2026-09-19',
    koniec: '2027-06-20',
    kwartaly: [
      {
        id: 'q1',
        nazwa: 'Kwartał I',
        start: '2026-09-19',
        koniec: '2026-12-20',
        miesiace: [{ iso: '2026-10', nazwa: 'październik', list: null, punktPrawa: null }],
      },
      {
        id: 'q2',
        nazwa: 'Kwartał II',
        start: '2026-12-21',
        koniec: '2027-03-20',
        miesiace: [],
      },
    ],
  },
  zastepy: [
    { id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' },
    { id: 'cirrus', nazwa: 'Cirrus', barwa: 'sygnal', dolaczyl: '2026-09-19' },
  ],
  wpisy: [
    { id: 'w1', data: '2026-10-01', zastepId: 'aptus', tytul: 'Biwak', punkty: 8, kategoria: 'biwak' },
    { id: 'w2', data: '2027-01-05', zastepId: 'cirrus', tytul: 'Rajd', punkty: 20, kategoria: 'rajd' },
  ],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
  materialy: [],
};

function utworz() {
  TestBed.configureTestingModule({
    providers: [{ provide: DANE_TOKEN, useValue: DANE_TESTOWE }],
  });
  const fixture = TestBed.createComponent(RankingPage);
  fixture.detectChanges();
  return fixture;
}

describe('RankingPage', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders one bar per patrol, leader first', () => {
    const nazwy = [...utworz().nativeElement.querySelectorAll('app-slupek')].map(
      (el: Element) => el.textContent?.includes('Cirrus'),
    );
    expect(nazwy[0]).toBe(true);
    expect(nazwy).toHaveLength(2);
  });

  it('offers the whole tournament plus every quarter and month as filters', () => {
    const opcje = [...utworz().nativeElement.querySelectorAll('[data-filtr] button')].map(
      (b: Element) => b.textContent?.trim(),
    );
    expect(opcje).toEqual(['Cały turniej', 'Kwartał I', 'Kwartał II', 'październik']);
  });

  it('recomputes sums when a quarter is picked', () => {
    const fixture = utworz();
    const przyciski = fixture.nativeElement.querySelectorAll('[data-filtr] button');
    przyciski[1].click();
    fixture.detectChanges();

    const pierwszy = fixture.nativeElement.querySelector('app-slupek');
    expect(pierwszy.textContent).toContain('Aptus');
    expect(fixture.nativeElement.textContent).toContain('8');
  });

  it('announces the selected period and entry count in a polite live region', () => {
    const fixture = utworz();
    const region = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(region).not.toBeNull();
    expect(region.textContent).toContain('Cały turniej');
    expect(region.textContent).toContain('2 wpisy');
  });

  it('updates the live region text when the period changes', () => {
    const fixture = utworz();
    const przyciski = fixture.nativeElement.querySelectorAll('[data-filtr] button');
    przyciski[1].click();
    fixture.detectChanges();

    const region = fixture.nativeElement.querySelector('[aria-live="polite"]') as HTMLElement;
    expect(region.textContent).toContain('Kwartał I');
    expect(region.textContent).toContain('1 wpis');
  });

  it('marks the ranking list with list semantics for Safari/VoiceOver', () => {
    const ol = utworz().nativeElement.querySelector('ol');
    expect(ol.getAttribute('role')).toBe('list');
  });

  it('explains the empty state when nobody has scored yet', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: DANE_TOKEN, useValue: { ...DANE_TESTOWE, wpisy: [] } }],
    });
    const fixture = TestBed.createComponent(RankingPage);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Turniej dopiero się rozkręca');
  });
});
