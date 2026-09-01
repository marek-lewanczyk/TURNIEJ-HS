# Turniej HS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static Angular site showing the running scoreboard of the Turniej Zastępów Starszoharcerskich, plus content tabs, deployed to GitHub Pages from manually edited JSON in the repo.

**Architecture:** Data lives as JSON under `src/data/` and is imported at build time; a signal-based `TurniejStore` derives the ranking; standalone lazy-routed pages render it. A deferred three.js component paints a topographic background that never carries information the DOM lacks.

**Tech Stack:** Angular 21.2 (zoneless, standalone, signals), Tailwind CSS 4, Vitest via `@angular/build:unit-test`, three.js, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-09-01-turniej-hs-design.md`

## Global Constraints

- Angular 21.2, zoneless. Never add `zone.js`, never call `provideZoneChangeDetection`.
- Standalone components only. No NgModules. No `@angular/animations` package — use the compiler's `animate.enter` / `animate.leave`.
- No state library. State is `signal` / `computed` inside `TurniejStore`.
- No HTTP. All data is imported from `src/data/*.json` at build time.
- UI copy, JSON content and commit-visible user-facing strings: **Polish**. Code identifiers, file names, commit messages: **English**.
- Dates are ISO strings `YYYY-MM-DD` and are compared lexicographically. Never construct a `Date` for range filtering — it introduces timezone bugs for no gain.
- Tailwind 4 tokens live in `src/styles/theme.css` under `@theme`. Do **not** write `--*: initial` or `--color-*: initial`; the default palette stays enabled.
- Every task ends green on `npm run type-check` and `npx ng test --watch=false`.
- Colour must never be the only carrier of meaning (podium places, extra-point markers).
- `prefers-reduced-motion: reduce` must disable every non-essential animation.

---

## File Structure

| Path | Responsibility |
|---|---|
| `src/data/*.json` | Hand-edited tournament data. The only files the maintainer touches to publish an update. |
| `src/app/core/model/turniej.model.ts` | Domain interfaces and unions. No logic. |
| `src/app/core/model/walidacja.ts` | Pure data validator, used by tests only. |
| `src/app/core/dane.ts` | Imports every JSON file, exports typed frozen constants. Single seam between data and code. |
| `src/app/core/teraz.ts` | `TERAZ` injection token returning today's ISO date — makes "current month" testable. |
| `src/app/core/turniej-store.ts` | Signals, period filter, derived ranking. |
| `src/app/layout/shell/shell.ts` | Header, tab navigation, footer, router outlet. |
| `src/app/shared/slupek/slupek.ts` | One ranking bar. Presentational, input-only. |
| `src/app/shared/pusty-stan/pusty-stan.ts` | Shared "nothing here yet" block. |
| `src/app/shared/teren/teren.ts` | three.js background. Self-contained, deferred, disposable. |
| `src/app/pages/<nazwa>/<nazwa>-page.ts` | One page per tab. |
| `.github/workflows/deploy.yml` | type-check → test → build → 404.html → Pages. |

---

## Task 1: Foundations — tsconfig, scripts, theme tokens

**Files:**
- Modify: `tsconfig.json` (compilerOptions)
- Modify: `package.json` (scripts)
- Create: `src/styles/theme.css`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: nothing.
- Produces: `resolveJsonModule` enabled (Task 2 needs it); npm script `type-check`; Tailwind tokens `--color-papier`, `--color-atrament`, `--color-warstwica`, `--color-las`, `--color-sygnal`, `--font-naglowek`, `--font-tresc` used by every later task.

- [ ] **Step 1: Enable JSON imports**

In `tsconfig.json`, inside `compilerOptions`, add after `"isolatedModules": true,`:

```json
    "resolveJsonModule": true,
```

- [ ] **Step 2: Add the type-check script**

In `package.json`, inside `"scripts"`, add after `"start": "ng serve",`:

```json
    "type-check": "tsc --noEmit -p tsconfig.app.json",
```

- [ ] **Step 3: Write the theme tokens**

Create `src/styles/theme.css`:

```css
@theme {
  /* Paper-and-map palette. Light only by design — see spec section 12. */
  --color-papier: oklch(0.97 0.012 85);
  --color-papier-cien: oklch(0.93 0.016 85);
  --color-atrament: oklch(0.27 0.02 250);
  --color-atrament-slaby: oklch(0.52 0.02 250);
  --color-warstwica: oklch(0.82 0.03 90);
  --color-las: oklch(0.48 0.09 150);
  --color-las-jasny: oklch(0.72 0.08 150);
  --color-sygnal: oklch(0.58 0.19 28);
  --color-zloto: oklch(0.78 0.12 85);

  --font-naglowek: 'Fraunces', ui-serif, Georgia, serif;
  --font-tresc: 'Inter', ui-sans-serif, system-ui, sans-serif;

  --ease-teren: cubic-bezier(0.22, 1, 0.36, 1);
}
```

- [ ] **Step 4: Wire the tokens and the fonts into global styles**

Replace the whole content of `src/styles.css`:

```css
@import 'tailwindcss';
@import './styles/theme.css';

/* Local fonts. If the woff2 files are absent the family stack in @theme
   degrades to the system serif/sans — the build never breaks over them. */
@font-face {
  font-family: 'Fraunces';
  src: url('/fonts/fraunces-variable.woff2') format('woff2-variations');
  font-weight: 300 900;
  font-display: swap;
}

@font-face {
  font-family: 'Inter';
  src: url('/fonts/inter-variable.woff2') format('woff2-variations');
  font-weight: 100 900;
  font-display: swap;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: var(--color-papier);
  color: var(--color-atrament);
  font-family: var(--font-tresc);
  /* Paper grain. Decorative only. */
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
}

h1, h2, h3 {
  font-family: var(--font-naglowek);
}

@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 5: Verify the build and the tokens compile**

Run: `npm run type-check && npx ng build --configuration development`
Expected: both exit 0. If Tailwind rejects `@theme`, the PostCSS plugin is not v4 — stop and check `.postcssrc.json` names `@tailwindcss/postcss`.

- [ ] **Step 6: Prove a token actually emits CSS**

Run: `grep -c 'papier' dist/TURNIEJ-HS/browser/styles*.css`
Expected: a count of at least 1. A zero here means the token never reached the stylesheet and every later `bg-papier` would silently emit nothing.

- [ ] **Step 7: Commit**

```bash
git add tsconfig.json package.json src/styles.css src/styles/theme.css
git commit -m "chore: enable json imports, add type-check script and theme tokens"
```

---

## Task 2: Domain model, data files, validator

**Files:**
- Create: `src/app/core/model/turniej.model.ts`
- Create: `src/app/core/model/walidacja.ts`
- Create: `src/app/core/dane.ts`
- Create: `src/data/turniej.json`, `zastepy.json`, `punkty.json`, `inspiracje.json`, `zadania.json`, `zasady.json`, `nagrody.json`
- Test: `src/app/core/model/walidacja.spec.ts`

**Interfaces:**
- Consumes: `resolveJsonModule` from Task 1.
- Produces:
  - types `Turniej`, `Kwartal`, `MiesiacTurnieju`, `Zastep`, `Wpis`, `KategoriaPunktow`, `TypEkstra`, `Nagroda`, `Inspiracja`, `KategoriaInspiracji`, `Zadanie`, `SekcjaZasad`, `DaneTurnieju`
  - `KATEGORIE_PUNKTOW: readonly KategoriaPunktow[]`, `TYPY_EKSTRA: readonly TypEkstra[]`
  - `waliduj(dane: DaneTurnieju): string[]`
  - `DANE: DaneTurnieju` from `src/app/core/dane.ts`

**Why the validator exists:** a JSON import widens `"trop"` to `string`, so the cast in `dane.ts` is unavoidable and TypeScript stops checking values at that seam. `waliduj` is where value-level correctness is actually enforced, and `walidacja.spec.ts` runs it against the real files so a typo fails CI instead of production.

- [ ] **Step 1: Write the domain types**

Create `src/app/core/model/turniej.model.ts`:

```ts
export type KategoriaPunktow =
  | 'obrzedowosc'
  | 'trop'
  | 'rajd'
  | 'biwak'
  | 'zbiorka'
  | 'sluzba'
  | 'inne';

export const KATEGORIE_PUNKTOW: readonly KategoriaPunktow[] = [
  'obrzedowosc',
  'trop',
  'rajd',
  'biwak',
  'zbiorka',
  'sluzba',
  'inne',
];

export type TypEkstra = 'list-miesiaca' | 'punkt-prawa' | 'zadanie-bazy';

export const TYPY_EKSTRA: readonly TypEkstra[] = [
  'list-miesiaca',
  'punkt-prawa',
  'zadanie-bazy',
];

/** Month of the tournament. `list` and `punktPrawa` are null until the
 *  organisers announce them; the UI renders that as "jeszcze nieogłoszony". */
export interface MiesiacTurnieju {
  /** `YYYY-MM` */
  iso: string;
  nazwa: string;
  list: string | null;
  punktPrawa: string | null;
}

export interface Kwartal {
  id: string;
  nazwa: string;
  /** ISO date, inclusive */
  start: string;
  /** ISO date, inclusive */
  koniec: string;
  miesiace: MiesiacTurnieju[];
}

export interface Turniej {
  nazwa: string;
  organizator: string;
  start: string;
  koniec: string;
  kwartaly: Kwartal[];
}

export interface Zastep {
  id: string;
  nazwa: string;
  /** Theme token name without the `--color-` prefix, e.g. `las`. */
  barwa: string;
  /** ISO date the patrol entered the tournament. */
  dolaczyl: string;
}

export interface Wpis {
  id: string;
  /** ISO date the points were awarded. */
  data: string;
  zastepId: string;
  tytul: string;
  opis?: string;
  punkty: number;
  kategoria: KategoriaPunktow;
  ekstra?: TypEkstra;
}

export interface Nagroda {
  miejsce: 1 | 2 | 3;
  tytul: string;
  opis?: string;
}

export interface Inspiracja {
  tytul: string;
  opis: string;
}

export interface KategoriaInspiracji {
  id: string;
  nazwa: string;
  inspiracje: Inspiracja[];
}

export interface Zadanie {
  id: string;
  tytul: string;
  opis: string;
}

export interface SekcjaZasad {
  id: string;
  naglowek: string;
  akapity: string[];
}

export interface DaneTurnieju {
  turniej: Turniej;
  zastepy: Zastep[];
  wpisy: Wpis[];
  inspiracje: KategoriaInspiracji[];
  zadania: Zadanie[];
  zasady: SekcjaZasad[];
  nagrody: Nagroda[];
}
```

- [ ] **Step 2: Write the failing validator test**

Create `src/app/core/model/walidacja.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — `walidacja` and `dane` cannot be resolved.

- [ ] **Step 4: Write the validator**

Create `src/app/core/model/walidacja.ts`:

```ts
import {
  KATEGORIE_PUNKTOW,
  TYPY_EKSTRA,
  type DaneTurnieju,
  type Kwartal,
} from './turniej.model';

function zachodza(a: Kwartal, b: Kwartal): boolean {
  return a.start <= b.koniec && b.start <= a.koniec;
}

/**
 * Value-level check of the hand-edited data. TypeScript cannot do this —
 * a JSON import widens every string, so `dane.ts` has to cast.
 * Returns a list of Polish problem descriptions; empty means the data is sound.
 */
export function waliduj(dane: DaneTurnieju): string[] {
  const bledy: string[] = [];
  const { turniej, zastepy, wpisy, nagrody } = dane;

  const idZastepow = new Set<string>();
  for (const zastep of zastepy) {
    if (idZastepow.has(zastep.id)) {
      bledy.push(`zastęp ${zastep.id}: zduplikowane id`);
    }
    idZastepow.add(zastep.id);
  }

  const idWpisow = new Set<string>();
  for (const wpis of wpisy) {
    if (idWpisow.has(wpis.id)) {
      bledy.push(`wpis ${wpis.id}: zduplikowane id`);
    }
    idWpisow.add(wpis.id);

    if (!idZastepow.has(wpis.zastepId)) {
      bledy.push(`wpis ${wpis.id}: nieznany zastepId "${wpis.zastepId}"`);
    }
    if (wpis.data < turniej.start || wpis.data > turniej.koniec) {
      bledy.push(`wpis ${wpis.id}: data ${wpis.data} poza okresem turnieju`);
    }
    if (!Number.isInteger(wpis.punkty)) {
      bledy.push(`wpis ${wpis.id}: punkty muszą być liczbą całkowitą`);
    }
    if (!KATEGORIE_PUNKTOW.includes(wpis.kategoria)) {
      bledy.push(`wpis ${wpis.id}: nieznana kategoria "${wpis.kategoria}"`);
    }
    if (wpis.ekstra !== undefined && !TYPY_EKSTRA.includes(wpis.ekstra)) {
      bledy.push(`wpis ${wpis.id}: nieznany typ ekstra "${wpis.ekstra}"`);
    }
  }

  for (let i = 0; i < turniej.kwartaly.length; i++) {
    const kwartal = turniej.kwartaly[i];
    if (kwartal.start < turniej.start || kwartal.koniec > turniej.koniec) {
      bledy.push(`kwartał ${kwartal.id}: poza okresem turnieju`);
    }
    if (kwartal.start > kwartal.koniec) {
      bledy.push(`kwartał ${kwartal.id}: koniec przed startem`);
    }
    for (let j = 0; j < i; j++) {
      if (zachodza(kwartal, turniej.kwartaly[j])) {
        bledy.push(`kwartał ${kwartal.id}: zachodzi na kwartał ${turniej.kwartaly[j].id}`);
      }
    }
  }

  const miejsca = new Set<number>();
  for (const nagroda of nagrody) {
    if (miejsca.has(nagroda.miejsce)) {
      bledy.push(`nagroda: zduplikowane miejsce ${nagroda.miejsce}`);
    }
    miejsca.add(nagroda.miejsce);
  }

  return bledy;
}
```

- [ ] **Step 5: Write the data files**

Create `src/data/turniej.json`. Quarter boundaries are the spec's assumption, not an organiser decision — correct them here if the namiestnictwo publishes different ones.

```json
{
  "nazwa": "Turniej Zastępów Starszoharcerskich",
  "organizator": "Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia",
  "start": "2026-09-19",
  "koniec": "2027-06-20",
  "kwartaly": [
    {
      "id": "q1",
      "nazwa": "Kwartał I",
      "start": "2026-09-19",
      "koniec": "2026-12-20",
      "miesiace": [
        { "iso": "2026-09", "nazwa": "wrzesień", "list": null, "punktPrawa": null },
        { "iso": "2026-10", "nazwa": "październik", "list": null, "punktPrawa": null },
        { "iso": "2026-11", "nazwa": "listopad", "list": null, "punktPrawa": null },
        { "iso": "2026-12", "nazwa": "grudzień", "list": null, "punktPrawa": null }
      ]
    },
    {
      "id": "q2",
      "nazwa": "Kwartał II",
      "start": "2026-12-21",
      "koniec": "2027-03-20",
      "miesiace": [
        { "iso": "2027-01", "nazwa": "styczeń", "list": null, "punktPrawa": null },
        { "iso": "2027-02", "nazwa": "luty", "list": null, "punktPrawa": null },
        { "iso": "2027-03", "nazwa": "marzec", "list": null, "punktPrawa": null }
      ]
    },
    {
      "id": "q3",
      "nazwa": "Kwartał III",
      "start": "2027-03-21",
      "koniec": "2027-06-20",
      "miesiace": [
        { "iso": "2027-04", "nazwa": "kwiecień", "list": null, "punktPrawa": null },
        { "iso": "2027-05", "nazwa": "maj", "list": null, "punktPrawa": null },
        { "iso": "2027-06", "nazwa": "czerwiec", "list": null, "punktPrawa": null }
      ]
    }
  ]
}
```

Create `src/data/zastepy.json`:

```json
[
  { "id": "aptus", "nazwa": "Aptus", "barwa": "las", "dolaczyl": "2026-09-19" },
  { "id": "cirrus", "nazwa": "Cirrus", "barwa": "sygnal", "dolaczyl": "2026-09-19" }
]
```

Create `src/data/punkty.json` — empty until the first meeting awards anything:

```json
[]
```

Create `src/data/inspiracje.json`:

```json
[
  {
    "id": "obrzedowosc",
    "nazwa": "Obrzędowość",
    "inspiracje": [
      { "tytul": "Nazwa i okrzyk zastępu", "opis": "Wymyślcie własną nazwę, zawołanie i moment, w którym ich używacie." },
      { "tytul": "Totem zastępu", "opis": "Przedmiot, który wędruje na każdą zbiórkę i biwak i zbiera ślady waszych wypraw." },
      { "tytul": "Kronika", "opis": "Prowadźcie kronikę zastępu — ręcznie, w zeszycie, z wklejkami." },
      { "tytul": "Obrzęd przyjęcia", "opis": "Ustalcie, jak przyjmujecie do zastępu nową osobę." }
    ]
  },
  {
    "id": "wyjscia",
    "nazwa": "Wyjścia i wyprawy",
    "inspiracje": [
      { "tytul": "Biwak zastępu", "opis": "Zorganizujcie własny biwak — od planu, przez zakupy, po sprzątanie." },
      { "tytul": "Rajd", "opis": "Wystartujcie w rajdzie hufca albo chorągwi." },
      { "tytul": "Nocna gra terenowa", "opis": "Przygotujcie grę dla innego zastępu i przeprowadźcie ją po zmroku." },
      { "tytul": "Wyprawa bez telefonu", "opis": "Trasa na mapie papierowej, bez nawigacji." }
    ]
  },
  {
    "id": "tropy",
    "nazwa": "Tropy",
    "inspiracje": [
      { "tytul": "Trop na punkcie Prawa", "opis": "Zaplanujcie trop wokół punktu Prawa Harcerskiego przypisanego do miesiąca." },
      { "tytul": "Trop służby", "opis": "Trop, którego efektem jest coś zrobionego dla kogoś spoza drużyny." },
      { "tytul": "Trop rzemieślniczy", "opis": "Nauczcie się razem konkretnej umiejętności i pokażcie efekt." }
    ]
  },
  {
    "id": "sluzba",
    "nazwa": "Służba",
    "inspiracje": [
      { "tytul": "Służba w hufcu", "opis": "Obsługa imprezy hufca — warta, kuchnia, punkt gry." },
      { "tytul": "Służba lokalna", "opis": "Praca na rzecz dzielnicy, schroniska, biblioteki, sąsiadów." }
    ]
  },
  {
    "id": "zycie-zastepu",
    "nazwa": "Życie zastępu",
    "inspiracje": [
      { "tytul": "Zbiórka prowadzona przez każdego", "opis": "Każda osoba w zastępie prowadzi jedną zbiórkę w kwartale." },
      { "tytul": "Rada zastępu", "opis": "Regularna rada, na której planujecie kolejny miesiąc." },
      { "tytul": "Wspólny projekt", "opis": "Coś, co powstaje przez kilka zbiórek i zostaje po was." }
    ]
  }
]
```

Create `src/data/zadania.json`:

```json
[
  { "id": "z1", "tytul": "Mapa waszego terenu", "opis": "Narysujcie własną mapę okolicy zbiórek z miejscami, które coś dla was znaczą." },
  { "id": "z2", "tytul": "Wywiad z instruktorem", "opis": "Nagrajcie albo spiszcie rozmowę z instruktorem z waszego hufca o jego pierwszym zastępie." },
  { "id": "z3", "tytul": "Zastępowa książka kucharska", "opis": "Zbierzcie i przetestujcie pięć przepisów, które da się zrobić na biwaku." },
  { "id": "z4", "tytul": "Zbiórka w całości w terenie", "opis": "Przeprowadźcie zbiórkę bez wchodzenia do harcówki, niezależnie od pogody." },
  { "id": "z5", "tytul": "Godzina bez słów", "opis": "Zrealizujcie zadanie zespołowe, komunikując się wyłącznie bez mowy." },
  { "id": "z6", "tytul": "Ślad po sobie", "opis": "Zostawcie w hufcu coś, z czego skorzysta inny zastęp — grę, sprzęt, instrukcję." },
  { "id": "z7", "tytul": "Nocne niebo", "opis": "Rozpoznajcie i udokumentujcie pięć gwiazdozbiorów podczas wyjścia po zmroku." },
  { "id": "z8", "tytul": "Zastęp w obiektywie", "opis": "Zróbcie serię zdjęć opowiadającą jeden dzień z życia zastępu." }
]
```

Create `src/data/zasady.json`:

```json
[
  {
    "id": "przyznawanie",
    "naglowek": "Jak przyznajemy punkty",
    "akapity": [
      "Organizatorzy nie zakładają konkretnej puli punktowanych aktywności. Podczas spotkań zastępowi dzielą się osiągnięciami, które zrealizowali w danym okresie, i wzajemnie przyznają sobie za nie punkty.",
      "Punkty mogą zostać przyznane za urozmaicenie obrzędowości zastępu, zrealizowanie tropu, zajęcie miejsca na podium podczas rajdu, zorganizowanie biwaku zastępu i wiele innych — warto zajrzeć do listy inspiracji. Ich liczba zależy od decyzji innych zastępowych.",
      "Takie rozwiązanie dostosowuje turniej do zastępów na zróżnicowanych etapach działalności i odpowiada na naturalne potrzeby różnych jednostek."
    ]
  },
  {
    "id": "ekstra",
    "naglowek": "Punkty ekstra",
    "akapity": [
      "Zrealizowanie zbiórki zastępu spójnej z tematyką listu z danego miesiąca.",
      "Realizacja tropu opierającego się o punkt Prawa Harcerskiego przypisany do jednego z miesięcy aktualnie trwającego kwartału.",
      "Wykonanie zadania z bazy przygotowanej przez organizatorów."
    ]
  },
  {
    "id": "wylaczenia",
    "naglowek": "Czego nie punktujemy",
    "akapity": [
      "Punkty nie będą przyznawane za zdobywane indywidualnie instrumenty metodyczne, takie jak stopnie, sprawności i wyzwania — chyba że zadanie miesiąca będzie się na nich opierać."
    ]
  },
  {
    "id": "zastepy",
    "naglowek": "Dołączanie w trakcie",
    "akapity": [
      "Zastęp może dołączyć do turnieju w dowolnym momencie. Pojawia się wtedy w rankingu z zerową liczbą punktów i zbiera je na tych samych zasadach co pozostali."
    ]
  }
]
```

Create `src/data/nagrody.json`:

```json
[]
```

- [ ] **Step 6: Write the data seam**

Create `src/app/core/dane.ts`:

```ts
import turniejJson from '../../data/turniej.json';
import zastepyJson from '../../data/zastepy.json';
import punktyJson from '../../data/punkty.json';
import inspiracjeJson from '../../data/inspiracje.json';
import zadaniaJson from '../../data/zadania.json';
import zasadyJson from '../../data/zasady.json';
import nagrodyJson from '../../data/nagrody.json';

import type { DaneTurnieju } from './model/turniej.model';

/**
 * The single seam between hand-edited JSON and typed code.
 * JSON imports widen every string literal, so the cast is unavoidable —
 * value-level correctness is enforced by `waliduj` in `walidacja.spec.ts`.
 */
export const DANE: DaneTurnieju = {
  turniej: turniejJson,
  zastepy: zastepyJson,
  wpisy: punktyJson,
  inspiracje: inspiracjeJson,
  zadania: zadaniaJson,
  zasady: zasadyJson,
  nagrody: nagrodyJson,
} as DaneTurnieju;
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS, 11 tests in `walidacja.spec.ts`.

- [ ] **Step 8: Verify types**

Run: `npm run type-check`
Expected: exit 0.

- [ ] **Step 9: Commit**

```bash
git add src/app/core src/data
git commit -m "feat: add tournament domain model, seed data and validator"
```

---

## Task 3: TurniejStore

**Files:**
- Create: `src/app/core/teraz.ts`
- Create: `src/app/core/turniej-store.ts`
- Test: `src/app/core/turniej-store.spec.ts`

**Interfaces:**
- Consumes: `DANE`, all model types from Task 2.
- Produces:
  - `TERAZ: InjectionToken<() => string>`
  - `type OkresFiltru = { rodzaj: 'caly' } | { rodzaj: 'kwartal'; id: string } | { rodzaj: 'miesiac'; iso: string }`
  - `interface PozycjaRankingu { zastep: Zastep; suma: number; wpisy: Wpis[]; miejsce: number; procentLidera: number }`
  - `TurniejStore` with readonly signals `turniej`, `zastepy`, `wpisy`, `inspiracje`, `zadania`, `zasady`, `nagrody`, `okres`; computed `wpisyOkresu`, `ranking`, `maksSuma`, `nagrodyDostepne`, `aktualnyMiesiac`, `miesiace`; method `ustawOkres(okres: OkresFiltru): void`

- [ ] **Step 1: Write the clock token**

Create `src/app/core/teraz.ts`:

```ts
import { InjectionToken } from '@angular/core';

/** Today's date as `YYYY-MM-DD`. Injected so tests can freeze it. */
export const TERAZ = new InjectionToken<() => string>('TERAZ', {
  providedIn: 'root',
  factory: () => () => new Date().toISOString().slice(0, 10),
});
```

- [ ] **Step 2: Write the failing store test**

Create `src/app/core/turniej-store.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { TERAZ } from './teraz';
import { TurniejStore } from './turniej-store';
import { DANE } from './dane';
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
```

Note the test injects data through a token, so add it in the next step.

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — `TurniejStore` and `DANE_TOKEN` cannot be resolved.

- [ ] **Step 4: Write the store**

Create `src/app/core/turniej-store.ts`:

```ts
import { computed, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { DANE } from './dane';
import { TERAZ } from './teraz';
import type {
  DaneTurnieju,
  MiesiacTurnieju,
  Wpis,
  Zastep,
} from './model/turniej.model';

/** Lets tests swap the imported JSON for a fixture. */
export const DANE_TOKEN = new InjectionToken<DaneTurnieju>('DANE', {
  providedIn: 'root',
  factory: () => DANE,
});

export type OkresFiltru =
  | { rodzaj: 'caly' }
  | { rodzaj: 'kwartal'; id: string }
  | { rodzaj: 'miesiac'; iso: string };

export interface PozycjaRankingu {
  zastep: Zastep;
  suma: number;
  wpisy: Wpis[];
  miejsce: number;
  /** 0–100, width of the bar relative to the leader. */
  procentLidera: number;
}

@Injectable({ providedIn: 'root' })
export class TurniejStore {
  private readonly dane = inject(DANE_TOKEN);
  private readonly teraz = inject(TERAZ);

  readonly turniej = signal(this.dane.turniej).asReadonly();
  readonly zastepy = signal(this.dane.zastepy).asReadonly();
  readonly wpisy = signal(this.dane.wpisy).asReadonly();
  readonly inspiracje = signal(this.dane.inspiracje).asReadonly();
  readonly zadania = signal(this.dane.zadania).asReadonly();
  readonly zasady = signal(this.dane.zasady).asReadonly();
  readonly nagrody = signal(this.dane.nagrody).asReadonly();

  private readonly okresWewnetrzny = signal<OkresFiltru>({ rodzaj: 'caly' });
  readonly okres = this.okresWewnetrzny.asReadonly();

  readonly miesiace = computed<MiesiacTurnieju[]>(() =>
    this.turniej().kwartaly.flatMap((kwartal) => kwartal.miesiace),
  );

  readonly wpisyOkresu = computed<Wpis[]>(() => {
    const okres = this.okresWewnetrzny();
    const wpisy = this.wpisy();

    if (okres.rodzaj === 'caly') {
      return wpisy;
    }
    if (okres.rodzaj === 'miesiac') {
      return wpisy.filter((wpis) => wpis.data.startsWith(okres.iso));
    }
    const kwartal = this.turniej().kwartaly.find((k) => k.id === okres.id);
    if (!kwartal) {
      return [];
    }
    // ISO dates compare correctly as strings; no Date, no timezones.
    return wpisy.filter((wpis) => wpis.data >= kwartal.start && wpis.data <= kwartal.koniec);
  });

  readonly maksSuma = computed(() => {
    const sumy = this.sumy();
    let maks = 0;
    for (const suma of sumy.values()) {
      if (suma > maks) {
        maks = suma;
      }
    }
    return maks;
  });

  readonly ranking = computed<PozycjaRankingu[]>(() => {
    const sumy = this.sumy();
    const wpisyPerZastep = this.wpisyPerZastep();
    const maks = this.maksSuma();

    const posortowane = [...this.zastepy()].sort((a, b) => {
      const roznica = (sumy.get(b.id) ?? 0) - (sumy.get(a.id) ?? 0);
      return roznica !== 0 ? roznica : a.nazwa.localeCompare(b.nazwa, 'pl');
    });

    let poprzedniaSuma: number | null = null;
    let poprzednieMiejsce = 0;

    return posortowane.map((zastep, indeks) => {
      const suma = sumy.get(zastep.id) ?? 0;
      const miejsce = suma === poprzedniaSuma ? poprzednieMiejsce : indeks + 1;
      poprzedniaSuma = suma;
      poprzednieMiejsce = miejsce;

      return {
        zastep,
        suma,
        wpisy: wpisyPerZastep.get(zastep.id) ?? [],
        miejsce,
        procentLidera: maks > 0 ? Math.max(0, Math.round((suma / maks) * 100)) : 0,
      };
    });
  });

  readonly nagrodyDostepne = computed(() => this.nagrody().length > 0);

  readonly aktualnyMiesiac = computed<MiesiacTurnieju | null>(() => {
    const dzis = this.teraz();
    const turniej = this.turniej();
    if (dzis < turniej.start || dzis > turniej.koniec) {
      return null;
    }
    return this.miesiace().find((miesiac) => dzis.startsWith(miesiac.iso)) ?? null;
  });

  ustawOkres(okres: OkresFiltru): void {
    this.okresWewnetrzny.set(okres);
  }

  private readonly wpisyPerZastep = computed(() => {
    const mapa = new Map<string, Wpis[]>();
    for (const wpis of this.wpisyOkresu()) {
      const lista = mapa.get(wpis.zastepId);
      if (lista) {
        lista.push(wpis);
      } else {
        mapa.set(wpis.zastepId, [wpis]);
      }
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => b.data.localeCompare(a.data));
    }
    return mapa;
  });

  private readonly sumy = computed(() => {
    const mapa = new Map<string, number>();
    for (const zastep of this.zastepy()) {
      mapa.set(zastep.id, 0);
    }
    for (const wpis of this.wpisyOkresu()) {
      mapa.set(wpis.zastepId, (mapa.get(wpis.zastepId) ?? 0) + wpis.punkty);
    }
    return mapa;
  });
}
```

- [ ] **Step 5: Add the missing import to the test**

In `src/app/core/turniej-store.spec.ts`, change the store import line to:

```ts
import { DANE_TOKEN, TurniejStore } from './turniej-store';
```

and delete the now-unused `import { DANE } from './dane';`.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS, 11 tests in `turniej-store.spec.ts`. If the sort test fails, the comparator is wrong — fix `turniej-store.ts`, never the expectation.

- [ ] **Step 7: Commit**

```bash
git add src/app/core
git commit -m "feat: derive ranking, period filter and current month in TurniejStore"
```

---

## Task 4: Shell, routing, tab navigation

**Files:**
- Create: `src/app/layout/shell/shell.ts`, `shell.html`
- Create: `src/app/pages/ranking/ranking-page.ts`, `.html`
- Create: `src/app/pages/inspiracje/inspiracje-page.ts`, `.html`
- Create: `src/app/pages/zadania/zadania-page.ts`, `.html`
- Create: `src/app/pages/zasady/zasady-page.ts`, `.html`
- Create: `src/app/pages/nagrody/nagrody-page.ts`, `.html`
- Modify: `src/app/app.routes.ts`, `src/app/app.config.ts`, `src/app/app.html`, `src/app/app.ts`
- Delete: `src/app/app.css`
- Test: `src/app/layout/shell/shell.spec.ts`

**Interfaces:**
- Consumes: `TurniejStore` (`turniej`, `nagrodyDostepne`) from Task 3.
- Produces: five routed page components, each an empty shell that later tasks fill in. `Shell` renders `<router-outlet>` and the tab bar.

This task creates all five pages as near-empty stubs so routing is testable now; Tasks 5–7 fill them.

- [ ] **Step 1: Write the failing shell test**

Create `src/app/layout/shell/shell.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach } from 'vitest';
import { Shell } from './shell';
import { DANE_TOKEN } from '../../core/turniej-store';
import { DANE } from '../../core/dane';
import type { DaneTurnieju } from '../../core/model/turniej.model';

function utworz(dane: DaneTurnieju) {
  TestBed.configureTestingModule({
    providers: [provideRouter([]), { provide: DANE_TOKEN, useValue: dane }],
  });
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

  it('shows the tournament name and organiser', () => {
    const tekst = utworz(DANE).nativeElement.textContent as string;
    expect(tekst).toContain('Turniej Zastępów Starszoharcerskich');
    expect(tekst).toContain('Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia');
  });

  it('renders all five tabs', () => {
    const linki = utworz(DANE).nativeElement.querySelectorAll('nav a');
    expect([...linki].map((a: Element) => tekst(a))).toEqual([
      'Ranking',
      'Inspiracje',
      'Zadania',
      'Zasady',
      'Nagrody wkrótce',
    ]);
  });

  it('drops the "wkrótce" marker once prizes exist', () => {
    const dane: DaneTurnieju = { ...DANE, nagrody: [{ miejsce: 1, tytul: 'Wyprawa' }] };
    const linki = utworz(dane).nativeElement.querySelectorAll('nav a');
    expect(tekst(linki[4])).toBe('Nagrody');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — `Shell` cannot be resolved.

- [ ] **Step 3: Write the shell component**

Create `src/app/layout/shell/shell.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './shell.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Shell {
  protected readonly store = inject(TurniejStore);
}
```

Create `src/app/layout/shell/shell.html`:

```html
<div class="relative min-h-dvh">
  <header class="mx-auto w-full max-w-5xl px-5 pt-10 pb-6">
    <p class="text-xs uppercase tracking-[0.2em] text-atrament-slaby">
      {{ store.turniej().organizator }}
    </p>
    <h1 class="mt-2 text-4xl leading-tight font-semibold sm:text-5xl">
      {{ store.turniej().nazwa }}
    </h1>

    <nav aria-label="Sekcje turnieju" class="mt-8 flex flex-wrap gap-x-6 gap-y-2">
      <a
        routerLink="/"
        routerLinkActive="text-sygnal"
        [routerLinkActiveOptions]="{ exact: true }"
        class="border-b-2 border-transparent pb-1 text-sm font-medium hover:border-warstwica"
        >Ranking</a
      >
      <a routerLink="/inspiracje" routerLinkActive="text-sygnal"
        class="border-b-2 border-transparent pb-1 text-sm font-medium hover:border-warstwica"
        >Inspiracje</a
      >
      <a routerLink="/zadania" routerLinkActive="text-sygnal"
        class="border-b-2 border-transparent pb-1 text-sm font-medium hover:border-warstwica"
        >Zadania</a
      >
      <a routerLink="/zasady" routerLinkActive="text-sygnal"
        class="border-b-2 border-transparent pb-1 text-sm font-medium hover:border-warstwica"
        >Zasady</a
      >
      <a routerLink="/nagrody" routerLinkActive="text-sygnal"
        class="border-b-2 border-transparent pb-1 text-sm font-medium hover:border-warstwica"
        >Nagrody
        @if (!store.nagrodyDostepne()) {
          <span class="ml-1 text-xs text-atrament-slaby">wkrótce</span>
        }
      </a>
    </nav>
  </header>

  <main class="mx-auto w-full max-w-5xl px-5 pb-24">
    <router-outlet />
  </main>

  <footer class="mx-auto w-full max-w-5xl px-5 pb-10 text-xs text-atrament-slaby">
    {{ store.turniej().start }} – {{ store.turniej().koniec }}
  </footer>
</div>
```

- [ ] **Step 4: Create the five page stubs**

Each page follows the same shape. Create `src/app/pages/ranking/ranking-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-ranking-page',
  templateUrl: './ranking-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingPage {
  protected readonly store = inject(TurniejStore);
}
```

Create `src/app/pages/ranking/ranking-page.html`:

```html
<h2 class="text-2xl font-semibold">Ranking</h2>
```

Repeat for the other four, changing only the names:

| Directory | File stem | Class | Selector | Heading |
|---|---|---|---|---|
| `src/app/pages/inspiracje` | `inspiracje-page` | `InspiracjePage` | `app-inspiracje-page` | Inspiracje |
| `src/app/pages/zadania` | `zadania-page` | `ZadaniaPage` | `app-zadania-page` | Zadania |
| `src/app/pages/zasady` | `zasady-page` | `ZasadyPage` | `app-zasady-page` | Zasady |
| `src/app/pages/nagrody` | `nagrody-page` | `NagrodyPage` | `app-nagrody-page` | Nagrody |

- [ ] **Step 5: Wire the routes**

Replace `src/app/app.routes.ts`:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ranking/ranking-page').then((m) => m.RankingPage),
    title: 'Ranking — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'inspiracje',
    loadComponent: () =>
      import('./pages/inspiracje/inspiracje-page').then((m) => m.InspiracjePage),
    title: 'Inspiracje — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'zadania',
    loadComponent: () => import('./pages/zadania/zadania-page').then((m) => m.ZadaniaPage),
    title: 'Zadania — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'zasady',
    loadComponent: () => import('./pages/zasady/zasady-page').then((m) => m.ZasadyPage),
    title: 'Zasady — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'nagrody',
    loadComponent: () => import('./pages/nagrody/nagrody-page').then((m) => m.NagrodyPage),
    title: 'Nagrody — Turniej Zastępów Starszoharcerskich',
  },
  { path: '**', redirectTo: '' },
];
```

- [ ] **Step 6: Enable view transitions and scroll restoration**

Replace `src/app/app.config.ts`:

```ts
import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import {
  provideRouter,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
    ),
  ],
};
```

- [ ] **Step 7: Point the root component at the shell**

Replace `src/app/app.ts`:

```ts
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Shell } from './layout/shell/shell';

@Component({
  selector: 'app-root',
  imports: [Shell],
  template: '<app-shell />',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
```

Delete `src/app/app.html` and `src/app/app.css`. Replace `src/app/app.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { App } from './app';

describe('App', () => {
  it('creates and renders the shell', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('app-shell')).not.toBeNull();
  });
});
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS — shell tests, app test, plus everything from Tasks 2–3.

- [ ] **Step 9: Verify the tabs in a browser**

Run: `npm start`, open `http://localhost:4200/`, click through all five tabs. Confirm: URLs change without `#`, the active tab is marked, Nagrody shows the "wkrótce" marker, and reloading on `/zasady` still renders (dev server handles the SPA fallback — the Pages equivalent lands in Task 9).

- [ ] **Step 10: Commit**

```bash
git add src/app
git rm --cached src/app/app.html src/app/app.css 2>/dev/null || true
git commit -m "feat: add shell layout, tab navigation and lazy routed pages"
```

---

## Task 5: Ranking bars and period filter

**Files:**
- Create: `src/app/shared/slupek/slupek.ts`
- Modify: `src/app/pages/ranking/ranking-page.ts`, `ranking-page.html`
- Test: `src/app/shared/slupek/slupek.spec.ts`, `src/app/pages/ranking/ranking-page.spec.ts`

**Interfaces:**
- Consumes: `TurniejStore.ranking()`, `.okres()`, `.ustawOkres()`, `.turniej()`, `PozycjaRankingu` from Task 3.
- Produces: `Slupek` component with `input.required<PozycjaRankingu>()` named `pozycja`.

- [ ] **Step 1: Write the failing bar test**

Create `src/app/shared/slupek/slupek.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';
import { Slupek } from './slupek';
import type { PozycjaRankingu } from '../../core/turniej-store';

const POZYCJA: PozycjaRankingu = {
  zastep: { id: 'aptus', nazwa: 'Aptus', barwa: 'las', dolaczyl: '2026-09-19' },
  suma: 15,
  wpisy: [
    {
      id: 'w1',
      data: '2026-10-01',
      zastepId: 'aptus',
      tytul: 'Biwak w Kolibkach',
      punkty: 15,
      kategoria: 'biwak',
      ekstra: 'zadanie-bazy',
    },
  ],
  miejsce: 1,
  procentLidera: 100,
};

function utworz(pozycja: PozycjaRankingu) {
  TestBed.configureTestingModule({});
  const fixture = TestBed.createComponent(Slupek);
  fixture.componentRef.setInput('pozycja', pozycja);
  fixture.detectChanges();
  return fixture;
}

describe('Slupek', () => {
  beforeEach(() => TestBed.resetTestingModule());

  it('shows place, name and points as text', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).toContain('1');
    expect(tekst).toContain('Aptus');
    expect(tekst).toContain('15');
  });

  it('sets the bar width from procentLidera', () => {
    const belka = utworz(POZYCJA).nativeElement.querySelector('[data-belka]') as HTMLElement;
    expect(belka.style.getPropertyValue('--pct')).toBe('100%');
  });

  it('hides the bar from assistive tech', () => {
    const belka = utworz(POZYCJA).nativeElement.querySelector('[data-belka]') as HTMLElement;
    expect(belka.getAttribute('aria-hidden')).toBe('true');
  });

  it('lists the patrol entries with an extra-points marker', () => {
    const tekst = utworz(POZYCJA).nativeElement.textContent as string;
    expect(tekst).toContain('Biwak w Kolibkach');
    expect(tekst).toContain('zadanie z bazy');
  });

  it('says so when the patrol has no entries in the period', () => {
    const tekst = utworz({ ...POZYCJA, wpisy: [], suma: 0, procentLidera: 0 }).nativeElement
      .textContent as string;
    expect(tekst).toContain('Brak wpisów w tym okresie');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — `Slupek` cannot be resolved.

- [ ] **Step 3: Write the bar component**

Create `src/app/shared/slupek/slupek.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PozycjaRankingu } from '../../core/turniej-store';
import type { TypEkstra } from '../../core/model/turniej.model';

const OPIS_EKSTRA: Record<TypEkstra, string> = {
  'list-miesiaca': 'list miesiąca',
  'punkt-prawa': 'punkt Prawa',
  'zadanie-bazy': 'zadanie z bazy',
};

@Component({
  selector: 'app-slupek',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .belka {
      width: var(--pct);
      transform-origin: left center;
      animation: wjazd 900ms var(--ease-teren) both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }

    @keyframes wjazd {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
  `,
  template: `
    <details class="group border-b border-warstwica py-4">
      <summary class="cursor-pointer list-none">
        <div class="flex items-baseline gap-3">
          <span
            class="w-8 shrink-0 font-naglowek text-lg tabular-nums"
            [class.text-sygnal]="pozycja().miejsce <= 3"
            >{{ pozycja().miejsce }}.</span
          >
          <span class="flex-1 font-medium">
            {{ pozycja().zastep.nazwa }}
            @if (pozycja().miejsce <= 3) {
              <span class="ml-1 text-xs uppercase tracking-wider text-atrament-slaby"
                >podium</span
              >
            }
          </span>
          <span class="font-naglowek text-xl tabular-nums">{{ pozycja().suma }}</span>
          <span class="text-xs text-atrament-slaby">pkt</span>
        </div>

        <div class="mt-2 ml-11 h-2 rounded-full bg-papier-cien" aria-hidden="true">
          <div
            data-belka
            class="belka h-full rounded-full bg-las"
            [style.--pct.%]="pozycja().procentLidera"
          ></div>
        </div>
      </summary>

      <div class="mt-4 ml-11 space-y-3">
        @for (wpis of pozycja().wpisy; track wpis.id) {
          <div class="flex gap-3 text-sm">
            <span class="w-24 shrink-0 tabular-nums text-atrament-slaby">{{ wpis.data }}</span>
            <span class="flex-1">
              {{ wpis.tytul }}
              @if (wpis.ekstra) {
                <span class="ml-1 rounded bg-zloto/30 px-1.5 py-0.5 text-xs"
                  >ekstra: {{ opisEkstra()[wpis.ekstra] }}</span
                >
              }
              @if (wpis.opis) {
                <span class="block text-atrament-slaby">{{ wpis.opis }}</span>
              }
            </span>
            <span class="tabular-nums">{{ wpis.punkty > 0 ? '+' : '' }}{{ wpis.punkty }}</span>
          </div>
        } @empty {
          <p class="text-sm text-atrament-slaby">Brak wpisów w tym okresie.</p>
        }
      </div>
    </details>
  `,
})
export class Slupek {
  readonly pozycja = input.required<PozycjaRankingu>();
  protected readonly opisEkstra = computed(() => OPIS_EKSTRA);
}
```

Note: `[style.--pct.%]` produces the literal string `100%` on the element's inline style, which is what the test asserts.

- [ ] **Step 4: Run the bar tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS.

- [ ] **Step 5: Write the failing ranking page test**

Create `src/app/pages/ranking/ranking-page.spec.ts`:

```ts
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
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — no `[data-filtr]`, no `app-slupek` in the page.

- [ ] **Step 7: Build the ranking page**

Replace `src/app/pages/ranking/ranking-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Slupek } from '../../shared/slupek/slupek';
import { TurniejStore, type OkresFiltru } from '../../core/turniej-store';

interface OpcjaFiltru {
  etykieta: string;
  okres: OkresFiltru;
}

@Component({
  selector: 'app-ranking-page',
  imports: [Slupek],
  templateUrl: './ranking-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingPage {
  protected readonly store = inject(TurniejStore);

  protected readonly opcje = computed<OpcjaFiltru[]>(() => [
    { etykieta: 'Cały turniej', okres: { rodzaj: 'caly' } },
    ...this.store.turniej().kwartaly.map((kwartal) => ({
      etykieta: kwartal.nazwa,
      okres: { rodzaj: 'kwartal', id: kwartal.id } as OkresFiltru,
    })),
    ...this.store.miesiace().map((miesiac) => ({
      etykieta: miesiac.nazwa,
      okres: { rodzaj: 'miesiac', iso: miesiac.iso } as OkresFiltru,
    })),
  ]);

  protected readonly pustyRanking = computed(() => this.store.wpisyOkresu().length === 0);

  protected czyAktywna(okres: OkresFiltru): boolean {
    const biezacy = this.store.okres();
    if (biezacy.rodzaj !== okres.rodzaj) {
      return false;
    }
    if (biezacy.rodzaj === 'kwartal' && okres.rodzaj === 'kwartal') {
      return biezacy.id === okres.id;
    }
    if (biezacy.rodzaj === 'miesiac' && okres.rodzaj === 'miesiac') {
      return biezacy.iso === okres.iso;
    }
    return true;
  }

  protected wybierz(okres: OkresFiltru): void {
    this.store.ustawOkres(okres);
  }
}
```

Replace `src/app/pages/ranking/ranking-page.html`:

```html
<h2 class="sr-only">Ranking zastępów</h2>

<div data-filtr class="mb-8 flex flex-wrap gap-2" role="group" aria-label="Okres">
  @for (opcja of opcje(); track opcja.etykieta) {
    <button
      type="button"
      class="rounded-full border border-warstwica px-3 py-1 text-sm"
      [class.bg-atrament]="czyAktywna(opcja.okres)"
      [class.text-papier]="czyAktywna(opcja.okres)"
      [attr.aria-pressed]="czyAktywna(opcja.okres)"
      (click)="wybierz(opcja.okres)"
    >
      {{ opcja.etykieta }}
    </button>
  }
</div>

@if (pustyRanking()) {
  <p class="rounded-lg border border-warstwica bg-papier-cien/40 p-6 text-sm">
    Turniej dopiero się rozkręca — w tym okresie nie ma jeszcze żadnych punktów.
    Zastępy pojawią się tu, gdy zastępowi przyznają sobie pierwsze osiągnięcia.
  </p>
}

<ol class="list-none">
  @for (pozycja of store.ranking(); track pozycja.zastep.id) {
    <li animate.enter="wjazd-wiersza">
      <app-slupek [pozycja]="pozycja" />
    </li>
  }
</ol>
```

Add to `src/styles.css`, at the end:

```css
.wjazd-wiersza {
  animation: wjazd-wiersza 320ms var(--ease-teren) both;
}

@keyframes wjazd-wiersza {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
```

- [ ] **Step 8: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS.

- [ ] **Step 9: Check it in a browser**

Run `npm start`, open `http://localhost:4200/`. With `punkty.json` still empty you should see the empty-state paragraph plus both patrols at 0. Temporarily paste two entries into `src/data/punkty.json` and confirm: bars scale, the leader is first, expanding a row lists its entries, and switching the filter changes the sums. Revert the temporary entries before committing.

- [ ] **Step 10: Commit**

```bash
git add src/app/shared/slupek src/app/pages/ranking src/styles.css
git commit -m "feat: render ranking bars with period filter and per-patrol entries"
```

---

## Task 6: Content pages — inspiracje, zadania, zasady

**Files:**
- Create: `src/app/shared/pusty-stan/pusty-stan.ts`
- Modify: `src/app/pages/inspiracje/inspiracje-page.ts` + `.html`
- Modify: `src/app/pages/zadania/zadania-page.ts` + `.html`
- Modify: `src/app/pages/zasady/zasady-page.ts` + `.html`
- Test: `src/app/pages/zadania/zadania-page.spec.ts`

**Interfaces:**
- Consumes: `TurniejStore.inspiracje()`, `.zadania()`, `.zasady()`, `.miesiace()`, `.aktualnyMiesiac()`, `TERAZ` from Task 3.
- Produces: `PustyStan` component with inputs `naglowek: string` and `tresc: string`, reused by Task 7.

The Zadania page carries the only real logic here — the month list with its "not announced yet" state — so it gets the test. Inspiracje and Zasady are straight loops over data and are covered by the shell smoke test plus the browser check.

- [ ] **Step 1: Write the shared empty state**

Create `src/app/shared/pusty-stan/pusty-stan.ts`:

```ts
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-pusty-stan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-dashed border-warstwica p-6">
      <p class="font-naglowek text-lg">{{ naglowek() }}</p>
      <p class="mt-1 text-sm text-atrament-slaby">{{ tresc() }}</p>
    </div>
  `,
})
export class PustyStan {
  readonly naglowek = input.required<string>();
  readonly tresc = input.required<string>();
}
```

- [ ] **Step 2: Write the failing zadania test**

Create `src/app/pages/zadania/zadania-page.spec.ts`:

```ts
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — the page is still the stub with only a heading.

- [ ] **Step 4: Build the zadania page**

Replace `src/app/pages/zadania/zadania-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-zadania-page',
  templateUrl: './zadania-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZadaniaPage {
  protected readonly store = inject(TurniejStore);
}
```

Replace `src/app/pages/zadania/zadania-page.html`:

```html
<h2 class="text-2xl font-semibold">Zadania</h2>

<section class="mt-8">
  <h3 class="font-naglowek text-lg">Miesiące turnieju</h3>
  <p class="mt-1 text-sm text-atrament-slaby">
    Zbiórka spójna z listem miesiąca i trop oparty o przypisany punkt Prawa dają punkty ekstra.
  </p>

  <ul class="mt-4 space-y-2">
    @for (miesiac of store.miesiace(); track miesiac.iso) {
      <li
        class="rounded-lg border border-warstwica p-4"
        [attr.data-biezacy]="miesiac.iso === store.aktualnyMiesiac()?.iso ? '' : null"
        [class.border-sygnal]="miesiac.iso === store.aktualnyMiesiac()?.iso"
      >
        <p class="font-medium">
          {{ miesiac.nazwa }}
          @if (miesiac.iso === store.aktualnyMiesiac()?.iso) {
            <span class="ml-2 text-xs uppercase tracking-wider text-sygnal">teraz</span>
          }
        </p>
        <p class="mt-1 text-sm">
          List:
          @if (miesiac.list) {
            {{ miesiac.list }}
          } @else {
            <span class="text-atrament-slaby">jeszcze nieogłoszony</span>
          }
        </p>
        <p class="text-sm">
          Punkt Prawa:
          @if (miesiac.punktPrawa) {
            {{ miesiac.punktPrawa }}
          } @else {
            <span class="text-atrament-slaby">jeszcze nieogłoszony</span>
          }
        </p>
      </li>
    }
  </ul>
</section>

<section class="mt-12">
  <h3 class="font-naglowek text-lg">Baza zadań</h3>
  <p class="mt-1 text-sm text-atrament-slaby">
    Wykonanie zadania z tej listy daje punkty ekstra.
  </p>

  <ul class="mt-4 grid gap-4 sm:grid-cols-2">
    @for (zadanie of store.zadania(); track zadanie.id) {
      <li class="rounded-lg border border-warstwica p-4">
        <p class="font-medium">{{ zadanie.tytul }}</p>
        <p class="mt-1 text-sm text-atrament-slaby">{{ zadanie.opis }}</p>
      </li>
    }
  </ul>
</section>
```

- [ ] **Step 5: Build the inspiracje page**

Replace `src/app/pages/inspiracje/inspiracje-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-inspiracje-page',
  templateUrl: './inspiracje-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiracjePage {
  protected readonly store = inject(TurniejStore);
}
```

Replace `src/app/pages/inspiracje/inspiracje-page.html`:

```html
<h2 class="text-2xl font-semibold">Inspiracje</h2>
<p class="mt-2 max-w-2xl text-sm text-atrament-slaby">
  Lista nie jest zamknięta ani obowiązkowa. To punkt wyjścia — liczbę punktów za
  osiągnięcie ustalają zastępowi między sobą.
</p>

@for (kategoria of store.inspiracje(); track kategoria.id) {
  <section class="mt-10">
    <h3 class="font-naglowek text-lg">{{ kategoria.nazwa }}</h3>
    <ul class="mt-3 grid gap-3 sm:grid-cols-2">
      @for (inspiracja of kategoria.inspiracje; track inspiracja.tytul) {
        <li class="rounded-lg border border-warstwica p-4">
          <p class="font-medium">{{ inspiracja.tytul }}</p>
          <p class="mt-1 text-sm text-atrament-slaby">{{ inspiracja.opis }}</p>
        </li>
      }
    </ul>
  </section>
}
```

- [ ] **Step 6: Build the zasady page**

Replace `src/app/pages/zasady/zasady-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-zasady-page',
  templateUrl: './zasady-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZasadyPage {
  protected readonly store = inject(TurniejStore);
}
```

Replace `src/app/pages/zasady/zasady-page.html`:

```html
<h2 class="text-2xl font-semibold">Zasady</h2>

@for (sekcja of store.zasady(); track sekcja.id) {
  <section class="mt-10 max-w-2xl">
    <h3 class="font-naglowek text-lg">{{ sekcja.naglowek }}</h3>
    @for (akapit of sekcja.akapity; track $index) {
      <p class="mt-3 text-sm leading-relaxed">{{ akapit }}</p>
    }
  </section>
}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS.

- [ ] **Step 8: Check the three pages in a browser**

Run `npm start` and open `/inspiracje`, `/zadania`, `/zasady`. Confirm every seeded item renders, months without a letter say "jeszcze nieogłoszony", and nothing overflows horizontally at 375 px width.

- [ ] **Step 9: Commit**

```bash
git add src/app/pages src/app/shared/pusty-stan
git commit -m "feat: build inspiracje, zadania and zasady pages from data"
```

---

## Task 7: Nagrody page with the "Wkrótce" state

**Files:**
- Modify: `src/app/pages/nagrody/nagrody-page.ts` + `.html`
- Test: `src/app/pages/nagrody/nagrody-page.spec.ts`

**Interfaces:**
- Consumes: `TurniejStore.nagrody()`, `.nagrodyDostepne()` from Task 3; `PustyStan` from Task 6.
- Produces: nothing later tasks depend on.

- [ ] **Step 1: Write the failing test**

Create `src/app/pages/nagrody/nagrody-page.spec.ts`:

```ts
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
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — the page is still the stub.

- [ ] **Step 3: Build the page**

Replace `src/app/pages/nagrody/nagrody-page.ts`:

```ts
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PustyStan } from '../../shared/pusty-stan/pusty-stan';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-nagrody-page',
  imports: [PustyStan],
  templateUrl: './nagrody-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NagrodyPage {
  protected readonly store = inject(TurniejStore);

  protected readonly posortowane = computed(() =>
    [...this.store.nagrody()].sort((a, b) => a.miejsce - b.miejsce),
  );

  protected readonly zapowiedz: readonly (1 | 2 | 3)[] = [1, 2, 3];
}
```

Replace `src/app/pages/nagrody/nagrody-page.html`:

```html
<h2 class="text-2xl font-semibold">Nagrody</h2>

@if (store.nagrodyDostepne()) {
  <ul class="mt-8 grid gap-4 sm:grid-cols-3">
    @for (nagroda of posortowane(); track nagroda.miejsce) {
      <li
        [attr.data-miejsce]="nagroda.miejsce"
        class="rounded-lg border border-warstwica p-5"
        [class.border-zloto]="nagroda.miejsce === 1"
      >
        <p class="font-naglowek text-3xl tabular-nums">{{ nagroda.miejsce }}</p>
        <p class="mt-2 font-medium">{{ nagroda.tytul }}</p>
        @if (nagroda.opis) {
          <p class="mt-1 text-sm text-atrament-slaby">{{ nagroda.opis }}</p>
        }
      </li>
    }
  </ul>
} @else {
  <div class="mt-8">
    <app-pusty-stan
      naglowek="Wkrótce"
      tresc="Nagrody zostaną ogłoszone w trakcie turnieju. Trafią tutaj, gdy tylko organizatorzy je potwierdzą."
    />
  </div>

  <ul class="mt-6 grid gap-4 opacity-40 sm:grid-cols-3" aria-hidden="true">
    @for (miejsce of zapowiedz; track miejsce) {
      <li [attr.data-miejsce]="miejsce" class="rounded-lg border border-dashed border-warstwica p-5">
        <p class="font-naglowek text-3xl tabular-nums">{{ miejsce }}</p>
        <p class="mt-2 h-4 w-2/3 rounded bg-papier-cien"></p>
      </li>
    }
  </ul>
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/nagrody
git commit -m "feat: add prizes page with an explicit coming-soon state"
```

---

## Task 8: WebGL topographic background

**Files:**
- Modify: `package.json` (dependencies)
- Create: `src/app/shared/teren/teren.ts`
- Create: `src/app/shared/teren/teren.glsl.ts`
- Modify: `src/app/layout/shell/shell.html`
- Test: `src/app/shared/teren/teren.spec.ts`

**Interfaces:**
- Consumes: `TurniejStore.ranking()` from Task 3 (marker brightness).
- Produces: `<app-teren />` — a fixed, `aria-hidden` background layer. Nothing depends on its output.

**Non-negotiable:** this component must never be able to break the page. Every failure path ends in a CSS gradient.

- [ ] **Step 1: Install three.js**

Run: `npm install three@^0.182.0 && npm install -D @types/three@^0.182.0`

Then check the installed version: `node -p "require('three/package.json').version"`. If it differs from `0.182`, that is fine — pin whatever npm resolved into `package.json` and move on.

- [ ] **Step 2: Write the failing fallback test**

Create `src/app/shared/teren/teren.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach, vi, afterEach } from 'vitest';
import { Teren } from './teren';
import { DANE_TOKEN } from '../../core/turniej-store';
import type { DaneTurnieju } from '../../core/model/turniej.model';

const DANE_TESTOWE: DaneTurnieju = {
  turniej: { nazwa: 'T', organizator: 'O', start: '2026-09-19', koniec: '2027-06-20', kwartaly: [] },
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
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx ng test --watch=false`
Expected: FAIL — `Teren` cannot be resolved.

- [ ] **Step 4: Write the shaders**

Create `src/app/shared/teren/teren.glsl.ts`:

```ts
export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Topographic contour lines over fBm noise.
 * Colours arrive as uniforms so the shader stays in step with the theme tokens.
 */
export const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;

  uniform float uCzas;
  uniform vec2 uRozmiar;
  uniform vec2 uKursor;
  uniform float uScroll;
  uniform vec3 uKolorTla;
  uniform vec3 uKolorLinii;
  uniform vec3 uKolorAkcentu;
  uniform int uLiczbaObozow;
  uniform vec3 uObozy[16]; // xy = position, z = brightness 0..1

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float suma = 0.0;
    float amplituda = 0.5;
    for (int i = 0; i < 5; i++) {
      suma += amplituda * noise(p);
      p *= 2.02;
      amplituda *= 0.5;
    }
    return suma;
  }

  void main() {
    vec2 uv = vUv;
    float proporcje = uRozmiar.x / max(uRozmiar.y, 1.0);
    vec2 p = vec2(uv.x * proporcje, uv.y);

    // Slow drift plus scroll and a light parallax toward the cursor.
    p += vec2(uCzas * 0.008, uScroll * 0.35);
    p += uKursor * 0.03;

    float wysokosc = fbm(p * 3.2);

    // Contour lines: bands of equal height, anti-aliased by the height gradient.
    float odstep = 0.055;
    float warstwica = abs(fract(wysokosc / odstep) - 0.5);
    float grubosc = fwidth(wysokosc / odstep) * 1.4;
    float linia = 1.0 - smoothstep(0.0, grubosc, warstwica);

    vec3 kolor = mix(uKolorTla, uKolorLinii, linia * 0.55);

    // Camp markers, one soft glow per patrol.
    for (int i = 0; i < 16; i++) {
      if (i >= uLiczbaObozow) {
        break;
      }
      vec2 obozUv = vec2(uObozy[i].x * proporcje, uObozy[i].y);
      float dystans = distance(p - vec2(uCzas * 0.008, uScroll * 0.35) - uKursor * 0.03, obozUv);
      float blask = exp(-dystans * 26.0) * uObozy[i].z;
      kolor = mix(kolor, uKolorAkcentu, clamp(blask, 0.0, 0.8));
    }

    gl_FragColor = vec4(kolor, 1.0);
  }
`;
```

- [ ] **Step 5: Write the component**

Create `src/app/shared/teren/teren.ts`:

```ts
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './teren.glsl';
import { TurniejStore } from '../../core/turniej-store';

const MAKS_OBOZOW = 16;

@Component({
  selector: 'app-teren',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      @if (dziala()) {
        <canvas #plotno class="h-full w-full"></canvas>
      } @else {
        <div
          data-fallback
          class="h-full w-full bg-linear-to-b from-papier to-papier-cien"
        ></div>
      }
    </div>
  `,
})
export class Teren {
  private readonly store = inject(TurniejStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly plotno = viewChild<ElementRef<HTMLCanvasElement>>('plotno');

  /** Flipped to false the moment anything about WebGL disappoints us. */
  protected readonly dziala = signal(this.webglDostepny());

  constructor() {
    afterNextRender(() => this.uruchom());
  }

  private webglDostepny(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }
    try {
      const probne = document.createElement('canvas');
      return probne.getContext('webgl2') !== null;
    } catch {
      return false;
    }
  }

  private uruchom(): void {
    const canvas = this.plotno()?.nativeElement;
    if (!canvas || !this.dziala()) {
      return;
    }

    const spokojnie = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      this.dziala.set(false);
      return;
    }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const styl = getComputedStyle(document.body);
    const kolor = (nazwa: string, zapas: string) =>
      new Color(styl.getPropertyValue(nazwa).trim() || zapas);

    const obozy = Array.from({ length: MAKS_OBOZOW }, () => new Vector3(0, 0, 0));
    this.rozstawObozy(obozy);

    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uCzas: { value: 0 },
        uRozmiar: { value: new Vector2(1, 1) },
        uKursor: { value: new Vector2(0, 0) },
        uScroll: { value: 0 },
        uKolorTla: { value: kolor('--color-papier', '#f6f1e7') },
        uKolorLinii: { value: kolor('--color-warstwica', '#d8cdb6') },
        uKolorAkcentu: { value: kolor('--color-las-jasny', '#8fbf9f') },
        uLiczbaObozow: { value: Math.min(this.store.zastepy().length, MAKS_OBOZOW) },
        uObozy: { value: obozy },
      },
    });

    const scene = new Scene();
    scene.add(new Mesh(new PlaneGeometry(2, 2), material));
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const dopasuj = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      material.uniforms['uRozmiar'].value.set(clientWidth, clientHeight);
    };
    dopasuj();

    const naKursor = (zdarzenie: PointerEvent) => {
      material.uniforms['uKursor'].value.set(
        zdarzenie.clientX / innerWidth - 0.5,
        0.5 - zdarzenie.clientY / innerHeight,
      );
    };

    const naScroll = () => {
      const zasieg = Math.max(document.body.scrollHeight - innerHeight, 1);
      material.uniforms['uScroll'].value = scrollY / zasieg;
    };

    let widoczny = true;
    let uchwyt = 0;
    const start = performance.now();

    const klatka = () => {
      material.uniforms['uCzas'].value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      if (widoczny && !spokojnie && document.visibilityState === 'visible') {
        uchwyt = requestAnimationFrame(klatka);
      } else {
        uchwyt = 0;
      }
    };

    const wznow = () => {
      if (!uchwyt && widoczny && !spokojnie && document.visibilityState === 'visible') {
        uchwyt = requestAnimationFrame(klatka);
      }
    };

    const obserwator = new IntersectionObserver(([wpis]) => {
      widoczny = wpis.isIntersecting;
      wznow();
    });
    obserwator.observe(canvas);

    const naWidocznosc = () => wznow();
    const naResize = () => {
      dopasuj();
      renderer.render(scene, camera);
    };

    addEventListener('pointermove', naKursor, { passive: true });
    addEventListener('scroll', naScroll, { passive: true });
    addEventListener('resize', naResize);
    document.addEventListener('visibilitychange', naWidocznosc);

    // One frame always renders, even under prefers-reduced-motion.
    renderer.render(scene, camera);
    wznow();

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(uchwyt);
      obserwator.disconnect();
      removeEventListener('pointermove', naKursor);
      removeEventListener('scroll', naScroll);
      removeEventListener('resize', naResize);
      document.removeEventListener('visibilitychange', naWidocznosc);
      material.dispose();
      scene.traverse((obiekt) => {
        if (obiekt instanceof Mesh) {
          obiekt.geometry.dispose();
        }
      });
      renderer.dispose();
    });
  }

  /** Deterministic scatter — same patrol always lands on the same spot. */
  private rozstawObozy(obozy: Vector3[]): void {
    const ranking = this.store.ranking();
    const maks = Math.max(...ranking.map((pozycja) => pozycja.suma), 1);

    ranking.slice(0, MAKS_OBOZOW).forEach((pozycja, indeks) => {
      const kat = (indeks * 2.399963) % (Math.PI * 2);
      const promien = 0.18 + 0.28 * ((indeks % 5) / 5);
      obozy[indeks].set(
        0.5 + Math.cos(kat) * promien,
        0.5 + Math.sin(kat) * promien,
        0.25 + 0.75 * Math.max(pozycja.suma, 0) / maks,
      );
    });
  }
}
```

- [ ] **Step 6: Mount it behind the shell**

In `src/app/layout/shell/shell.ts`, add `Teren` to the imports array and to the module imports:

```ts
import { Teren } from '../../shared/teren/teren';
```

and change the decorator's `imports` to `[RouterOutlet, RouterLink, RouterLinkActive, Teren]`.

In `src/app/layout/shell/shell.html`, insert as the first child of the outer `<div>`:

```html
  @defer (on viewport) {
    <app-teren />
  } @placeholder {
    <div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true"></div>
  }
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npx ng test --watch=false`
Expected: PASS. In jsdom `getContext('webgl2')` returns `null`, so `Teren` renders the gradient and three.js never initialises — which is exactly the path under test.

- [ ] **Step 8: Verify the real thing in a browser**

Run `npm start` and open `http://localhost:4200/`.

Check all five:
1. Contour lines are visible behind the content and drift slowly.
2. Moving the pointer shifts the pattern slightly; scrolling moves it further.
3. Patrol glows are visible — with an empty `punkty.json` every glow sits at the 0.25 floor, which is intended.
4. DevTools → Rendering → "Emulate CSS prefers-reduced-motion" set to reduce, reload: the background renders once and stops. Confirm in the Performance panel that no rAF loop runs.
5. Switch to another browser tab for a few seconds, come back: the animation resumes and no frames were burned while hidden.

- [ ] **Step 9: Check the bundle split**

Run: `npx ng build`
Expected: three.js sits in a lazy chunk, not in the initial bundle. Confirm the initial bundle stays under the 500 kB warning budget — the build prints a warning if it does not. If three.js landed in the initial bundle, the `@defer` block is not wrapping `<app-teren>` correctly.

- [ ] **Step 10: Commit**

```bash
git add package.json package-lock.json src/app/shared/teren src/app/layout/shell
git commit -m "feat: add deferred three.js topographic background with safe fallbacks"
```

---

## Task 9: CI and GitHub Pages deploy

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: `npm run type-check` from Task 1; the build output at `dist/TURNIEJ-HS/browser`.
- Produces: a deployed site. Nothing depends on it.

**Before starting:** the repository has no git remote yet (`git remote -v` is empty). The base href below assumes the GitHub repository is named `TURNIEJ-HS`, giving `https://<user>.github.io/TURNIEJ-HS/`. If the repository has a different name, change `--base-href` to match. For a user/organisation site (`<user>.github.io`) or a custom domain, use `--base-href /`.

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: deploy

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm

      - run: npm ci

      - name: Type-check
        run: npm run type-check

      - name: Test
        run: npx ng test --watch=false

      - name: Build
        run: npx ng build --base-href /TURNIEJ-HS/

      - name: SPA fallback for GitHub Pages
        run: cp dist/TURNIEJ-HS/browser/index.html dist/TURNIEJ-HS/browser/404.html

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/TURNIEJ-HS/browser

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Verify the build output path is right**

Run: `npx ng build --base-href /TURNIEJ-HS/ && ls dist/TURNIEJ-HS/browser/index.html`
Expected: the file exists. If the path differs, the project name in `angular.json` differs — update every `dist/...` path in the workflow to match.

- [ ] **Step 3: Verify the base href landed in the HTML**

Run: `grep '<base' dist/TURNIEJ-HS/browser/index.html`
Expected: `<base href="/TURNIEJ-HS/">`. A missing or `/` base href means deep links break once deployed.

- [ ] **Step 4: Rewrite the README for this project**

Replace `README.md`:

````markdown
# Turniej Zastępów Starszoharcerskich

Tablica wyników turnieju organizowanego przez Namiestnictwo Starszoharcerskie
Hufca ZHP Gdynia, od 19 września 2026 do 20 czerwca 2027.

Strona jest statyczna. Nie ma panelu administracyjnego — wszystkie dane to pliki
JSON w `src/data/`, a publikacja odbywa się przez push na `main`.

## Jak dopisać punkty

Dodaj obiekt na końcu tablicy w `src/data/punkty.json`:

```json
{
  "id": "2026-10-12-aptus-biwak",
  "data": "2026-10-12",
  "zastepId": "aptus",
  "tytul": "Biwak zastępu w Kolibkach",
  "opis": "Dwa dni, własna kuchnia, gra nocna.",
  "punkty": 12,
  "kategoria": "biwak",
  "ekstra": "zadanie-bazy"
}
```

- `id` — dowolny, byle unikalny. Wygodna konwencja: `data-zastęp-skrót`.
- `zastepId` — musi istnieć w `zastepy.json`.
- `kategoria` — jedna z: `obrzedowosc`, `trop`, `rajd`, `biwak`, `zbiorka`, `sluzba`, `inne`.
- `ekstra` — pomiń, jeśli to zwykłe punkty. W przeciwnym razie: `list-miesiaca`,
  `punkt-prawa` albo `zadanie-bazy`.
- `punkty` — liczba całkowita, może być ujemna.

## Jak dopisać zastęp

Dodaj obiekt do `src/data/zastepy.json`:

```json
{ "id": "borealis", "nazwa": "Borealis", "barwa": "zloto", "dolaczyl": "2027-01-10" }
```

Zastęp pojawi się w rankingu od razu, z zerem punktów.

## Jak ogłosić list miesiąca albo punkt Prawa

W `src/data/turniej.json` znajdź miesiąc i zamień `null` na treść:

```json
{ "iso": "2026-10", "nazwa": "październik", "list": "O odwadze", "punktPrawa": "Punkt 3" }
```

## Jak ogłosić nagrody

Wypełnij `src/data/nagrody.json`. Dopóki tablica jest pusta, zakładka pokazuje
stan „Wkrótce".

```json
[
  { "miejsce": 1, "tytul": "Wyprawa w Bieszczady", "opis": "Dla całego zastępu" },
  { "miejsce": 2, "tytul": "Sprzęt biwakowy" },
  { "miejsce": 3, "tytul": "Zestaw map i kompas" }
]
```

## Publikacja

```bash
git add src/data
git commit -m "data: add October points"
git push
```

GitHub Actions sprawdza typy, uruchamia testy, buduje i publikuje na GitHub Pages.
Literówka w danych zatrzymuje deploy na teście `walidacja.spec.ts` — strona zostaje
na poprzedniej, poprawnej wersji.

## Praca lokalna

```bash
npm install
npm start              # http://localhost:4200
npm run type-check
npx ng test --watch=false
npx ng build
```

## Dokumentacja projektu

- Design: `docs/superpowers/specs/2026-09-01-turniej-hs-design.md`
- Plan wdrożenia: `docs/superpowers/plans/2026-09-01-turniej-hs.md`
````

- [ ] **Step 5: Run the full verification suite one last time**

Run: `npm run type-check && npx ng test --watch=false && npx ng build`
Expected: all three exit 0.

- [ ] **Step 6: Commit**

```bash
git add .github README.md
git commit -m "ci: build, test and deploy to GitHub Pages"
```

- [ ] **Step 7: Turn on Pages (manual, in the browser)**

After pushing to GitHub: repository → Settings → Pages → Source → **GitHub Actions**. Then re-run the `deploy` workflow and open the URL it prints. Verify a deep link works: append `/zasady` to the deployed URL and reload — the 404.html fallback should render the page rather than GitHub's 404.

---

## Self-Review

**Spec coverage:**

| Spec section | Task |
|---|---|
| 3.1 Data files | 2 |
| 3.2 Domain model | 2 |
| 3.3 TurniejStore | 3 |
| 3.4 Validation | 2 |
| 4 Routing, view transitions, Pages fallback | 4, 9 |
| 4 Prizes tab always visible with "Wkrótce" | 4 (nav marker), 7 (page) |
| 5 Ranking bars, expansion, filter, a11y | 5 |
| 6 WebGL layer and its safeguards | 8 |
| 7 Tokens, fonts, paper texture | 1 |
| 8 Tests | 2, 3, 4, 5, 6, 7, 8 |
| 9 CI and deploy | 9 |
| 10 File structure | matches the table above |
| 11 Implementation order | Tasks 1–9 in order |

Two deviations from the spec's file list, both deliberate: `PustyStan` arrives in Task 6 (its first consumer is the prizes page in Task 7), and `DANE_TOKEN` lives in `turniej-store.ts` rather than `dane.ts` so the store owns its own injection seam.

**Placeholder scan:** no TBD / TODO / "handle edge cases" / "similar to Task N" remain. Every code step carries the literal code.

**Type consistency:** `PozycjaRankingu`, `OkresFiltru`, `DANE_TOKEN`, `TERAZ`, `waliduj`, `DANE` are named identically everywhere they appear. Tasks 5–8 consume only members declared in Tasks 2–3.
