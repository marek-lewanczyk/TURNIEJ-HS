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

Wszystkie pola poza `opis` i `ekstra` są wymagane — brak któregokolwiek albo pusty
tekst zatrzymuje deploy na `walidacja.spec.ts` zamiast wejść na produkcję jako
puste miejsce w rankingu.

- `id` — dowolny, byle unikalny i niepusty. Wygodna konwencja: `data-zastęp-skrót`.
- `data` — data przyznania punktów, format ISO `RRRR-MM-DD` (np. `2026-10-12`),
  w obrębie trwania turnieju: od `2026-09-19` do `2027-06-20` włącznie.
- `zastepId` — musi istnieć w `zastepy.json`.
- `tytul` — krótki tytuł osiągnięcia, niepusty.
- `kategoria` — jedna z: `obrzedowosc`, `trop`, `rajd`, `biwak`, `zbiorka`, `sluzba`, `inne`.
- `ekstra` — pomiń, jeśli to zwykłe punkty. W przeciwnym razie: `list-miesiaca`,
  `punkt-prawa` albo `zadanie-bazy`.
- `punkty` — liczba całkowita, może być ujemna.

## Jak dopisać zastęp

Dodaj obiekt do `src/data/zastepy.json`:

```json
{ "id": "borealis", "nazwa": "Borealis", "barwa": "zloto", "dolaczyl": "2027-01-10" }
```

- `id`, `nazwa` — wymagane, niepuste.
- `barwa` — token koloru z motywu (`src/styles/theme.css`), bez przedrostka
  `--color-`. Dozwolone wartości: `papier`, `papier-cien`, `atrament`,
  `atrament-slaby`, `warstwica`, `las`, `las-jasny`, `sygnal`, `zloto`. Inna
  wartość zatrzymuje deploy na teście walidacji zamiast dać niewidzialny,
  przezroczysty słupek na stronie.
- `dolaczyl` — data ISO, kiedy zastęp wszedł do turnieju. Jeśli zastęp gra od
  początku, wpisz datę startu turnieju (`2026-09-19`) — to jedyna wartość, przy
  której strona nie pokazuje dodatkowej informacji o dołączeniu w trakcie.

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

`miejsce` musi być `1`, `2` albo `3`, każde najwyżej raz — inna wartość albo
duplikat zatrzymuje deploy na teście walidacji.

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

### Włączenie GitHub Pages (jednorazowo, przed pierwszym pushem)

Zanim workflow zadziała, repozytorium musi mieć włączone publikowanie przez
Actions: **Settings → Pages → Source: „GitHub Actions"**. Bez tego kroku
pierwszy deploy kończy się błędem uprawnień, który nic nie mówi osobie bez
doświadczenia programistycznego — jeśli tak się stanie, to jest dokładnie ten
brakujący krok.

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
