import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { NagrodyPage } from './nagrody-page';
import { DANE_TOKEN } from '../../core/turniej-store';
import type { DaneTurnieju, Nagroda } from '../../core/model/turniej.model';

const PUSTE: DaneTurnieju = {
  turniej: { nazwa: 'T', organizator: 'O', start: '2026-09-19', koniec: '2027-06-20', kwartaly: [] },
  zastepy: [],
  wpisy: [],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
};

function utworz(nagrody: Nagroda[]) {
  TestBed.configureTestingModule({
    providers: [{ provide: DANE_TOKEN, useValue: { ...PUSTE, nagrody } }],
  });
  const fixture = TestBed.createComponent(NagrodyPage);
  fixture.detectChanges();
  return fixture;
}

describe('NagrodyPage', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('announces that prizes are coming when the file is empty', () => {
    expect(utworz([]).nativeElement.textContent).toContain('Nagrody zostaną ogłoszone');
  });

  it('previews three dimmed places while empty', () => {
    const kafle = utworz([]).nativeElement.querySelectorAll('[data-miejsce]');
    expect([...kafle].map((el: Element) => el.getAttribute('data-miejsce'))).toEqual([
      '1',
      '2',
      '3',
    ]);
  });

  it('renders the real prizes once they exist', () => {
    const tekst = utworz([
      { miejsce: 1, tytul: 'Wyprawa w Bieszczady', opis: 'Dla całego zastępu' },
      { miejsce: 2, tytul: 'Sprzęt biwakowy' },
    ]).nativeElement.textContent as string;
    expect(tekst).toContain('Wyprawa w Bieszczady');
    expect(tekst).toContain('Sprzęt biwakowy');
    expect(tekst).not.toContain('Nagrody zostaną ogłoszone');
  });

  it('orders prizes by place regardless of file order', () => {
    const kafle = utworz([
      { miejsce: 3, tytul: 'Trzecia' },
      { miejsce: 1, tytul: 'Pierwsza' },
    ]).nativeElement.querySelectorAll('[data-miejsce]');
    expect([...kafle].map((el: Element) => el.getAttribute('data-miejsce'))).toEqual(['1', '3']);
  });
});
