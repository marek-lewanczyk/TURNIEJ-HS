import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { ZadaniaPage } from './zadania-page';
import { DANE_TOKEN } from '../../core/turniej-store';
import { TERAZ } from '../../core/teraz';
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
        miesiace: [
          { iso: '2026-09', nazwa: 'wrzesień', list: 'O początkach', punktPrawa: 'Pierwszy' },
          { iso: '2026-10', nazwa: 'październik', list: null, punktPrawa: null },
        ],
      },
    ],
  },
  zastepy: [],
  wpisy: [],
  inspiracje: [],
  zadania: [{ id: 'z1', tytul: 'Mapa terenu', opis: 'Narysujcie mapę.' }],
  zasady: [],
  nagrody: [],
  materialy: [],
};

function utworz(dzis: string) {
  TestBed.configureTestingModule({
    providers: [
      { provide: DANE_TOKEN, useValue: DANE_TESTOWE },
      { provide: TERAZ, useValue: () => dzis },
    ],
  });
  const fixture = TestBed.createComponent(ZadaniaPage);
  fixture.detectChanges();
  return fixture;
}

describe('ZadaniaPage', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('lists the task base', () => {
    expect(utworz('2026-09-25').nativeElement.textContent).toContain('Mapa terenu');
  });

  it('shows the announced letter and law point for a month', () => {
    const tekst = utworz('2026-09-25').nativeElement.textContent as string;
    expect(tekst).toContain('O początkach');
    expect(tekst).toContain('Pierwszy');
  });

  it('marks an unannounced month instead of failing', () => {
    expect(utworz('2026-09-25').nativeElement.textContent).toContain('jeszcze nieogłoszony');
  });

  it('marks the current month', () => {
    const biezacy = utworz('2026-10-05').nativeElement.querySelector('[data-biezacy]');
    expect(biezacy?.textContent).toContain('październik');
  });

  it('marks no month as current outside the tournament', () => {
    expect(utworz('2027-09-01').nativeElement.querySelector('[data-biezacy]')).toBeNull();
  });
});
