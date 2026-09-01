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
          // Spans the whole tournament so the base fixture has no coverage
          // gap by default; individual tests shrink it back down.
          start: '2026-09-19',
          koniec: '2027-06-20',
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

  it('rejects an entry with the date omitted entirely', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { data?: string }).data = undefined;
    expect(waliduj(dane)).toContain('wpis w1: nieprawidłowa data "undefined"');
    // Must not also fall through to the range check on `undefined < start`.
    expect(waliduj(dane)).not.toContain('wpis w1: data undefined poza okresem turnieju');
  });

  it('rejects an entry with an impossible calendar date inside the lexical range', () => {
    const dane = bazoweDane();
    dane.wpisy[0].data = '2026-13-45';
    expect(waliduj(dane)).toContain('wpis w1: nieprawidłowa data "2026-13-45"');
  });

  it('rejects an entry with no id', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { id?: string }).id = undefined;
    expect(waliduj(dane)).toContain('wpis (brak id): brak wymaganego pola "id"');
  });

  it('rejects an entry with no title', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { tytul?: string }).tytul = undefined;
    expect(waliduj(dane)).toContain('wpis w1: brak wymaganego pola "tytul"');
  });

  it('rejects an entry with no zastepId', () => {
    const dane = bazoweDane();
    (dane.wpisy[0] as { zastepId?: string }).zastepId = undefined;
    expect(waliduj(dane)).toContain('wpis w1: brak wymaganego pola "zastepId"');
  });

  it('rejects a patrol with no id', () => {
    const dane = bazoweDane();
    (dane.zastepy[0] as { id?: string }).id = undefined;
    expect(waliduj(dane)).toContain('zastęp (brak id): brak wymaganego pola "id"');
  });

  it('rejects a patrol with no name', () => {
    const dane = bazoweDane();
    (dane.zastepy[0] as { nazwa?: string }).nazwa = undefined;
    expect(waliduj(dane)).toContain('zastęp aptus: brak wymaganego pola "nazwa"');
  });

  it('rejects a patrol with an unknown colour token', () => {
    const dane = bazoweDane();
    dane.zastepy[0].barwa = 'fiolet';
    expect(waliduj(dane)).toContain('zastęp aptus: nieznana barwa "fiolet"');
  });

  it('rejects a prize place outside 1–3', () => {
    const dane = bazoweDane();
    dane.nagrody = [{ miejsce: 4 as 1 | 2 | 3, tytul: 'A' }];
    expect(waliduj(dane)).toContain('nagroda: nieprawidłowe miejsce 4, dozwolone 1, 2 lub 3');
  });

  it('rejects a quarter outside the tournament range', () => {
    const dane = bazoweDane();
    dane.turniej.kwartaly[0].koniec = '2027-07-01';
    expect(waliduj(dane)).toContain('kwartał q1: poza okresem turnieju');
  });

  it('rejects a quarter whose end precedes its start', () => {
    const dane = bazoweDane();
    dane.turniej.kwartaly[0].koniec = '2026-01-01';
    expect(waliduj(dane)).toContain('kwartał q1: koniec przed startem');
  });

  it('rejects quarters that leave a gap between them', () => {
    const dane = bazoweDane();
    dane.turniej.koniec = '2027-06-20';
    dane.turniej.kwartaly[0].koniec = '2026-11-30';
    dane.turniej.kwartaly.push({
      id: 'q2',
      nazwa: 'Drugi',
      start: '2026-12-15',
      koniec: '2027-06-20',
      miesiace: [],
    });
    expect(waliduj(dane)).toContain('kwartały: luka w pokryciu turnieju między q1 a q2');
  });

  it('rejects quarters that leave a gap before the tournament starts', () => {
    const dane = bazoweDane();
    dane.turniej.kwartaly[0].start = '2026-10-01';
    dane.turniej.kwartaly[0].koniec = '2027-06-20';
    expect(waliduj(dane)).toContain(
      'kwartały: luka w pokryciu turnieju przed pierwszym kwartałem (zaczyna się 2026-10-01, turniej 2026-09-19)',
    );
  });

  it('rejects quarters that leave a gap after the last one ends', () => {
    const dane = bazoweDane();
    dane.turniej.kwartaly[0].start = '2026-09-19';
    dane.turniej.kwartaly[0].koniec = '2027-01-01';
    expect(waliduj(dane)).toContain(
      'kwartały: luka w pokryciu turnieju po ostatnim kwartale (kończy się 2027-01-01, turniej 2027-06-20)',
    );
  });

  it('accepts the real data shipped in src/data', () => {
    expect(waliduj(DANE)).toEqual([]);
  });
});
