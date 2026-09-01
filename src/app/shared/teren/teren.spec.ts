import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { Teren } from './teren';
import { DANE_TOKEN } from '../../core/turniej-store';
import type { DaneTurnieju } from '../../core/model/turniej.model';

const DANE_TESTOWE: DaneTurnieju = {
  turniej: {
    nazwa: 'T',
    organizator: 'O',
    start: '2026-09-19',
    koniec: '2027-06-20',
    kwartaly: [],
  },
  zastepy: [{ id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' }],
  wpisy: [],
  inspiracje: [],
  zadania: [],
  zasady: [],
  nagrody: [],
};

function utworz() {
  TestBed.configureTestingModule({
    providers: [{ provide: DANE_TOKEN, useValue: DANE_TESTOWE }],
  });
  const fixture = TestBed.createComponent(Teren);
  fixture.detectChanges();
  return fixture;
}

describe('Teren', () => {
  beforeEach(() => TestBed.resetTestingModule());
  afterEach(() => vi.restoreAllMocks());

  it('falls back to a gradient when WebGL is unavailable', () => {
    // jsdom has no WebGL, so getContext returns null without any stubbing.
    const fixture = utworz();
    expect(fixture.nativeElement.querySelector('[data-fallback]')).not.toBeNull();
  });

  it('hides itself from assistive technology', () => {
    expect(utworz().nativeElement.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('does not throw when destroyed before the renderer starts', () => {
    const fixture = utworz();
    expect(() => fixture.destroy()).not.toThrow();
  });
});
