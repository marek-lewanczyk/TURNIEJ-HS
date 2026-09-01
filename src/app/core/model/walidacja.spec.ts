import { describe, expect, it } from 'vitest';
import { DANE } from '../dane';
import { waliduj } from './walidacja';
import type { DaneTurnieju } from './turniej.model';

function bazoweDane(): DaneTurnieju {
  return {
    turniej: {
      nazwa: 'T',
      organizator: 'O',
      start: '2026-09-19',
      koniec: '2027-06-20',
      kwartaly: [
        {
          id: 'q1',
          nazwa: 'Pierwszy',
          start: '2026-09-19',
          koniec: '2026-12-20',
          miesiace: [{ iso: '2026-09', nazwa: 'wrzesień', list: null, punktPrawa: null }],
        },
      ],
    },
    zastepy: [{ id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' }],
    wpisy: [
      {
        id: 'w1',
        data: '2026-10-01',
        zastepId: 'aptus',
        tytul: 'Biwak',
        punkty: 5,
        kategoria: 'biwak',
      },
    ],
    inspiracje: [],
    zadania: [],
    zasady: [],
    nagrody: [],
  };
}

describe('waliduj', () => {
  it('accepts well-formed data', () => {
    expect(waliduj(bazoweDane())).toEqual([]);
  });

  it('rejects an entry pointing at an unknown patrol', () => {
    const dane = bazoweDane();
    dane.wpisy[0].zastepId = 'widmo';
    expect(waliduj(dane)).toContain('wpis w1: nieznany zastepId "widmo"');
  });

  it('rejects duplicate entry ids', () => {
    const dane = bazoweDane();
    dane.wpisy.push({ ...dane.wpisy[0] });
    expect(waliduj(dane)).toContain('wpis w1: zduplikowane id');
  });

  it('rejects an entry dated outside the tournament', () => {
    const dane = bazoweDane();
    dane.wpisy[0].data = '2027-08-01';
    expect(waliduj(dane)).toContain('wpis w1: data 2027-08-01 poza okresem turnieju');
  });

  it('rejects non-integer points', () => {
    const dane = bazoweDane();
    dane.wpisy[0].punkty = 2.5;
    expect(waliduj(dane)).toContain('wpis w1: punkty muszą być liczbą całkowitą');
  });

  it('rejects an unknown category', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { kategoria: string }).kategoria = 'ognisko';
    expect(waliduj(dane)).toContain('wpis w1: nieznana kategoria "ognisko"');
  });

  it('rejects an unknown extra type', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { ekstra?: string }).ekstra = 'bonus';
    expect(waliduj(dane)).toContain('wpis w1: nieznany typ ekstra "bonus"');
  });

  it('rejects overlapping quarters', () => {
    const dane = bazoweDane();
    dane.turniej.kwartaly.push({
      id: 'q2',
      nazwa: 'Drugi',
      start: '2026-12-01',
      koniec: '2027-03-20',
      miesiace: [],
    });
    expect(waliduj(dane)).toContain('kwartał q2: zachodzi na kwartał q1');
  });

  it('rejects duplicate prize places', () => {
    const dane = bazoweDane();
    dane.nagrody = [
      { miejsce: 1, tytul: 'A' },
      { miejsce: 1, tytul: 'B' },
    ];
    expect(waliduj(dane)).toContain('nagroda: zduplikowane miejsce 1');
  });

  it('rejects a duplicate patrol id', () => {
    const dane = bazoweDane();
    dane.zastepy.push({ ...dane.zastepy[0], nazwa: 'Klon' });
    expect(waliduj(dane)).toContain('zastęp aptus: zduplikowane id');
  });

  it('accepts the real data shipped in src/data', () => {
    expect(waliduj(DANE)).toEqual([]);
  });
});
