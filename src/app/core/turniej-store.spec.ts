import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { TERAZ } from './teraz';
import { DANE_TOKEN, TurniejStore } from './turniej-store';
import type { DaneTurnieju, Wpis } from './model/turniej.model';

const TURNIEJ_TESTOWY: DaneTurnieju = {
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
          { iso: '2026-09', nazwa: 'wrzesień', list: 'Początek', punktPrawa: null },
          { iso: '2026-10', nazwa: 'październik', list: null, punktPrawa: null },
        ],
      },
      {
        id: 'q2',
        nazwa: 'Kwartał II',
        start: '2026-12-21',
        koniec: '2027-03-20',
        miesiace: [{ iso: '2027-01', nazwa: 'styczeń', list: null, punktPrawa: null }],
      },
    ],
  },
  zastepy: [
    { id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' },
    { id: 'cirrus', nazwa: 'Cirrus', barwa: 'sygnal', dolaczyl: '2026-09-19' },
    { id: 'nowy', nazwa: 'Nowy', barwa: 'zloto', dolaczyl: '2027-01-10' },
  ],
  wpisy: [
    wpis('w1', '2026-09-19', 'aptus', 10),
    wpis('w2', '2026-12-20', 'aptus', 5),
    wpis('w3', '2026-12-21', 'cirrus', 15),
    wpis('w4', '2027-01-15', 'cirrus', -3),
  ],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
};

function wpis(id: string, data: string, zastepId: string, punkty: number): Wpis {
  return { id, data, zastepId, tytul: id, punkty, kategoria: 'inne' };
}

function utworz(dane: DaneTurnieju = TURNIEJ_TESTOWY, dzis = '2026-10-05'): TurniejStore {
  TestBed.configureTestingModule({
    providers: [
      { provide: DANE_TOKEN, useValue: dane },
      { provide: TERAZ, useValue: () => dzis },
    ],
  });
  return TestBed.inject(TurniejStore);
}

describe('TurniejStore', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('sums points per patrol and sorts descending', () => {
    const store = utworz();
    expect(store.ranking().map((p) => [p.zastep.id, p.suma])).toEqual([
      ['aptus', 15],
      ['cirrus', 12],
      ['nowy', 0],
    ]);
  });

  it('includes a patrol with no entries at zero', () => {
    const store = utworz();
    const nowy = store.ranking().find((p) => p.zastep.id === 'nowy');
    expect(nowy?.suma).toBe(0);
    expect(nowy?.wpisy).toEqual([]);
  });

  it('uses competition ranking for ties', () => {
    const dane: DaneTurnieju = {
      ...TURNIEJ_TESTOWY,
      wpisy: [wpis('a', '2026-10-01', 'aptus', 5), wpis('b', '2026-10-01', 'cirrus', 5)],
    };
    const store = utworz(dane);
    expect(store.ranking().map((p) => p.miejsce)).toEqual([1, 1, 3]);
  });

  it('filters by quarter, boundaries inclusive', () => {
    const store = utworz();
    store.ustawOkres({ rodzaj: 'kwartal', id: 'q1' });
    expect(store.wpisyOkresu().map((w) => w.id)).toEqual(['w1', 'w2']);
  });

  it('filters by month', () => {
    const store = utworz();
    store.ustawOkres({ rodzaj: 'miesiac', iso: '2027-01' });
    expect(store.wpisyOkresu().map((w) => w.id)).toEqual(['w4']);
  });

  it('scales bars against the leader', () => {
    const store = utworz();
    const [lider, drugi] = store.ranking();
    expect(lider.procentLidera).toBe(100);
    expect(drugi.procentLidera).toBe(80);
  });

  it('returns zero width when nobody has positive points', () => {
    const dane: DaneTurnieju = {
      ...TURNIEJ_TESTOWY,
      wpisy: [wpis('a', '2026-10-01', 'aptus', -4)],
    };
    const store = utworz(dane);
    expect(store.maksSuma()).toBe(0);
    expect(store.ranking().every((p) => p.procentLidera === 0)).toBe(true);
  });

  it('reports prizes as unavailable while the file is empty', () => {
    expect(utworz().nagrodyDostepne()).toBe(false);
  });

  it('finds the current tournament month', () => {
    expect(utworz(TURNIEJ_TESTOWY, '2026-10-05').aktualnyMiesiac()?.iso).toBe('2026-10');
  });

  it('returns null outside the tournament', () => {
    expect(utworz(TURNIEJ_TESTOWY, '2027-09-01').aktualnyMiesiac()).toBeNull();
  });

  it('flattens months across quarters in order', () => {
    expect(utworz().miesiace().map((m) => m.iso)).toEqual(['2026-09', '2026-10', '2027-01']);
  });
});
