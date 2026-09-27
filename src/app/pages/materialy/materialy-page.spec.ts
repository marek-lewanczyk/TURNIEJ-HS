import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { MaterialyPage } from './materialy-page';
import { DANE_TOKEN } from '../../core/turniej-store';
import type { DaneTurnieju, Material } from '../../core/model/turniej.model';

const PUSTE: DaneTurnieju = {
  turniej: { nazwa: 'T', organizator: 'O', start: '2026-09-19', koniec: '2027-06-20', kwartaly: [] },
  zastepy: [],
  wpisy: [],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
  materialy: [],
};

function utworz(materialy: Material[]) {
  TestBed.configureTestingModule({
    providers: [{ provide: DANE_TOKEN, useValue: { ...PUSTE, materialy } }],
  });
  const fixture = TestBed.createComponent(MaterialyPage);
  fixture.detectChanges();
  return fixture;
}

describe('MaterialyPage', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('renders a download link for every material', () => {
    const element: HTMLElement = utworz([
      { id: 'regulamin', tytul: 'Regulamin', opis: 'Pełny tekst', plik: 'materialy/r.pdf', format: 'PDF' },
      { id: 'karta', tytul: 'Karta tropu', plik: 'materialy/k.pdf', format: 'PDF' },
    ]).nativeElement;

    const linki = [...element.querySelectorAll('a[download]')];
    expect(linki.map((a) => a.getAttribute('href'))).toEqual(['materialy/r.pdf', 'materialy/k.pdf']);
    expect(element.textContent).toContain('Regulamin');
    expect(element.textContent).toContain('Pełny tekst');
    expect(element.textContent).toContain('Karta tropu');
  });

  it('shows an empty state when there are no materials', () => {
    expect(utworz([]).nativeElement.textContent).toContain('Materiały pojawią się');
  });
});
