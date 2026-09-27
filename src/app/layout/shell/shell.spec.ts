import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Shell } from './shell';
import { DANE_TOKEN } from '../../core/turniej-store';
import { DANE } from '../../core/dane';
import { routes } from '../../app.routes';
import type { DaneTurnieju } from '../../core/model/turniej.model';

async function utworz(dane: DaneTurnieju) {
  TestBed.configureTestingModule({
    // Listing Shell under `imports` (rather than only passing it to
    // `createComponent`) is what makes TestBed register its deferred
    // `<app-teren />` dependency so `compileComponents()` can resolve it.
    imports: [Shell],
    providers: [provideRouter([]), { provide: DANE_TOKEN, useValue: dane }],
  });
  // The shell now defers `<app-teren />`, an async-resolved dependency, so
  // TestBed needs to compile components before creating one synchronously.
  await TestBed.compileComponents();
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

  it('shows the tournament name and organiser', async () => {
    const tekst = (await utworz(DANE)).nativeElement.textContent as string;
    expect(tekst).toContain('Turniej Zastępów Starszoharcerskich');
    expect(tekst).toContain('Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia');
  });

  it('renders all six tabs', async () => {
    const linki = (await utworz(DANE)).nativeElement.querySelectorAll('nav a');
    expect([...linki].map((a: Element) => tekst(a))).toEqual([
      'Ranking',
      'Inspiracje',
      'Zadania',
      'Zasady',
      'Materiały',
      'Nagrody wkrótce',
    ]);
  });

  it('drops the "wkrótce" marker once prizes exist', async () => {
    const dane: DaneTurnieju = { ...DANE, nagrody: [{ miejsce: 1, tytul: 'Wyprawa' }] };
    const linki = (await utworz(dane)).nativeElement.querySelectorAll('nav a');
    expect(tekst(linki[5])).toBe('Nagrody');
  });

  it('marks only the active tab with aria-current, not colour alone', async () => {
    TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter(routes), { provide: DANE_TOKEN, useValue: DANE }],
    });
    await TestBed.compileComponents();
    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/zadania');
    fixture.detectChanges();

    const linki: Element[] = [...fixture.nativeElement.querySelectorAll('nav a')];
    const aktywny = linki[2]; // Zadania

    expect(aktywny.getAttribute('aria-current')).toBe('page');
    expect(aktywny.className).toContain('border-sygnal');
    // Mutually exclusive: the inactive border-colour utility must not also be
    // present, or the two utilities would tie in the cascade and the active
    // border would never render (see shell.html — a single computed [class]
    // rather than a static class plus a toggled one).
    expect(aktywny.className).not.toContain('border-transparent');

    for (const [i, link] of linki.entries()) {
      if (i === 2) continue;
      expect(link.getAttribute('aria-current')).toBeNull();
      expect(link.className).toContain('border-transparent');
      expect(link.className).not.toContain('border-sygnal');
    }
  });
});
