# Tournament documents Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the organisers' documents and align site content with the 2026/27 regulations.

**Architecture:** Data stays in hand-edited JSON under `src/data/`, typed via `turniej.model.ts`, checked by `waliduj`, exposed as signals by `TurniejStore`. Downloadable files are static assets in `public/materialy/`, linked relatively.

**Tech Stack:** Angular 21 (standalone, zoneless, signals), Tailwind 4 theme tokens, Vitest via `ng test`.

## Global Constraints

- Links to files are relative (`materialy/…`), never `/materialy/…` — deploy uses `--base-href /TURNIEJ-HS/`.
- Only existing theme colour tokens (`las`, `sygnal`, `zloto`, `atrament`, `atrament-slaby`, `warstwica`, `papier`, `papier-cien`, `las-jasny`).
- UI copy Polish; code, comments, commits English.
- Do not stage the user's local edits to `angular.json` and `src/data/punkty.json`.

---

### Task 1: Model, validator, store for materials and letter file

**Files:**
- Modify: `src/app/core/model/turniej.model.ts`, `src/app/core/model/walidacja.ts`, `src/app/core/dane.ts`, `src/app/core/turniej-store.ts`
- Create: `src/data/materialy.json`
- Test: `src/app/core/model/walidacja.spec.ts` (+ add `materialy: []` to every `DaneTurnieju` fixture in specs)

**Interfaces — Produces:**
- `interface Material { id: string; tytul: string; opis?: string; plik: string; format: string }`
- `DaneTurnieju.materialy: Material[]`
- `MiesiacTurnieju.listPlik?: string | null`
- `TurniejStore.materialy: Signal<Material[]>`, `TurniejStore.regulamin: Signal<Material | null>` (material with `id === 'regulamin'`)

- [ ] Step 1: failing validator tests — material without `tytul`, without `plik`, duplicated `id` each yield an error.
- [ ] Step 2: `npx ng test --watch=false` → FAIL.
- [ ] Step 3: implement model, validator loop, `dane.ts` import, store signals.
- [ ] Step 4: tests PASS; commit `feat(materialy): add materials data model and validation`.

### Task 2: Pages — Materiały, Zasady PDF link, Zadania letter link

**Files:**
- Create: `src/app/pages/materialy/materialy-page.{ts,html,spec.ts}`
- Modify: `src/app/app.routes.ts`, `src/app/layout/shell/shell.html`, `src/app/pages/zasady/zasady-page.html`, `src/app/pages/zadania/zadania-page.html`, `src/app/pages/zadania/zadania-page.spec.ts`

**Interfaces — Consumes:** `store.materialy()`, `store.regulamin()`, `miesiac.listPlik`.

- [ ] Step 1: failing specs — Materiały page renders each `tytul` and an `<a href="materialy/x.pdf" download>`; Zadania renders `Czytaj list` link with `href` equal to `listPlik` only when set.
- [ ] Step 2: run → FAIL.
- [ ] Step 3: implement page, route `materialy`, nav link, Zasady link, Zadania link.
- [ ] Step 4: PASS; commit `feat(materialy): add materials page and document links`.

### Task 3: Content and files

**Files:**
- Create: `public/materialy/regulamin-turnieju-2026-27.pdf`, `karta-tropu.pdf`, `konspekt-zbiorki.pdf`, `przyklady-tropow.docx`, `listy/2026-09-punkt-1.pdf`
- Modify: `src/data/turniej.json`, `zasady.json`, `nagrody.json`, `inspiracje.json`, `materialy.json`, `src/app/pages/inspiracje/inspiracje-page.html`, `README.md`

- [ ] Step 1: copy files; fill JSON per spec (quarters q1 `2026-09-19`–`2026-12-19`, q2 `2026-12-20`–`2027-03-21`, q3 `2027-03-22`–`2027-06-20`).
- [ ] Step 2: `npx ng test --watch=false` (validator reads real data), `npm run type-check`, `npx ng build`.
- [ ] Step 3: browser check of `/materialy`, `/zasady`, `/zadania`, `/nagrody`, `/inspiracje`; file links return 200.
- [ ] Step 4: commit `feat(dane): publish regulations, letters and materials`.
