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

Workflow (`.github/workflows/deploy.yml`) buduje z `--base-href /TURNIEJ-HS/` —
musi się zgadzać z nazwą repozytorium na GitHub. Jeśli repozytorium nazywa się
inaczej niż `TURNIEJ-HS`, zmień `--base-href` w workflow na `/nazwa-repo/`. Dla
strony typu `<user>.github.io` albo własnej domeny powinno być `/`.

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
