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
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

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

  it('falls back to the gradient when the WebGL renderer constructor throws', () => {
    // Must have a `getExtension` that returns null, or `webglDostepny()`'s
    // own probe-release call (`kontekst.getExtension('WEBGL_lose_context')
    // ?.loseContext()`) throws first, `dziala` starts false, and this test
    // would land on the exact same trivial branch as the other three
    // (constructor never even reached — see the discrimination check in
    // the round-2 fix report). With `getExtension` present, `dziala` starts
    // true, and the real `WebGLRenderer` constructor throws as soon as it
    // tries to query capabilities on this otherwise-bogus context — the
    // untested half of the non-negotiable (dziala starts true, constructor
    // throws, dziala flips back to false and the gradient renders).
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      getExtension: () => null,
    } as never);
    // jsdom has no `matchMedia` at all (not even a stub that returns
    // `{ matches: false }`), and `uruchom()` reads it before the
    // `WebGLRenderer` constructor — without this, the whole function
    // throws right there, uncaught, and the constructor is never reached.
    vi.stubGlobal('matchMedia', () => ({ matches: false }));
    const fixture = utworz();
    expect(fixture.nativeElement.querySelector('[data-fallback]')).not.toBeNull();
  });
});
