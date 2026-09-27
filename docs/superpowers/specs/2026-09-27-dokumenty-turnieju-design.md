# Tournament documents on the site — design

Date: 2026-09-27. Source documents: `Regulamin Turnieju Zastępów HS 2026-27.pdf`,
`karta TROPU.pdf`, `pusty konspekt zbiórki.pdf`, `1.pdf` (September letter),
`tropy HS.docx` (RN ZHP draft of example tropy).

## Goal

Bring the site in line with the official regulations and publish the
organisers' documents for download.

## Data changes (`src/data/`)

- `turniej.json` — quarters follow the scoring meetings, so an entry dated on the
  meeting day lands in the quarter it scores:
  - q1 `2026-09-19` – `2026-12-19` (nocka 18/19.12)
  - q2 `2026-12-20` – `2027-03-21` (RTL 19–21.03)
  - q3 `2027-03-22` – `2027-06-20` (zlot 18–20.06)
  Months stay assigned as today. September gets `list`, `punktPrawa` (point 1) and
  the new `listPlik`.
- `zasady.json` — full text of §1–§8, one section per paragraph, one `akapit` per
  numbered clause (sub-points `a)`… as separate akapity).
- `nagrody.json` — place 1 from §7.
- `inspiracje.json` — new category "Przykładowe tropy": 7 cards (one per trop
  category), `opis` lists that category's trop titles. Intro text on the page
  updated to §5 (patrol leaders propose points, organisers approve).
- New `materialy.json` — `Material { id, tytul, opis?, plik, format }`.

## Files

`public/materialy/` with ASCII names; letters under `public/materialy/listy/`.
Links are relative (no leading slash) so they respect `--base-href /TURNIEJ-HS/`.

## Code

- Model: `Material`, `DaneTurnieju.materialy`, optional `listPlik?: string | null`
  on `MiesiacTurnieju`.
- Validator: each material needs non-empty `id`, `tytul`, `plik`; `id` unique.
  File existence is not checked (specs cannot read the filesystem without a new
  dependency) — README says so.
- Store: `materialy` signal, `regulamin` computed (`id === 'regulamin'`).
- New page `/materialy` (lazy route, nav link "Materiały").
- Zasady page: "Pobierz regulamin (PDF)" link when `regulamin()` exists.
- Zadania page: "Czytaj list (PDF)" link when `listPlik` is set.

## Testing

Validator spec for materials; page specs for Materiały list and the Zadania
letter link. `type-check`, `ng test`, `ng build` green; visual check in browser.

## Out of scope

Converting the .docx to PDF; rendering letter text inline; file-existence check.
