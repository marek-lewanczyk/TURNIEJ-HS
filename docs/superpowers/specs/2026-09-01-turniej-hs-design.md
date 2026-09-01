# Turniej Zastępów Starszoharcerskich — design

Data: 2026-09-01
Status: zatwierdzony, gotowy do planu implementacji

## 1. Kontekst

Aplikacja publiczna prezentująca przebieg Turnieju Zastępów Starszoharcerskich
organizowanego przez Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia.
Turniej trwa od 19 września 2026 do 20 czerwca 2027.

Organizatorzy nie definiują zamkniętej puli punktowanych aktywności. Punkty
przyznają sobie wzajemnie zastępowi podczas spotkań, oceniając osiągnięcia
zrealizowane w danym okresie — urozmaicenie obrzędowości, zrealizowany trop,
miejsce na podium rajdu, biwak zastępu i inne. Liczba punktów zależy od decyzji
zastępowych, co pozwala uczestniczyć zastępom na różnych etapach działalności.

Punkty ekstra przysługują za:
- zbiórkę zastępu spójną z tematyką listu z danego miesiąca,
- trop oparty o punkt Prawa Harcerskiego przypisany do miesiąca w trwającym kwartale,
- zadanie z bazy przygotowanej przez organizatorów.

Punkty nie są przyznawane za indywidualne instrumenty metodyczne (stopnie,
sprawności, wyzwania), chyba że zadanie miesiąca się na nich opiera.

### Ograniczenia przyjęte w projekcie

- Punkty wprowadza ręcznie jedna osoba, edytując pliki w repozytorium i pushując
  na `main`. Aktualizacja strony następuje po deployu. Brak panelu administracyjnego,
  brak backendu, brak uwierzytelniania.
- Liczba zastępów nie jest znana z góry. Dopisanie zastępu w trakcie trwania
  turnieju musi być operacją na jednym pliku danych, bez zmian w kodzie.
- Na start istnieją dwa zastępy: Aptus i Cirrus.
- Hosting: GitHub Pages.

### Kryteria sukcesu

1. Dopisanie punktu = dodanie jednego obiektu do jednego pliku JSON.
2. Dopisanie zastępu = dodanie jednego obiektu do jednego pliku JSON.
3. Błąd w kształcie danych wychodzi w CI, nie na produkcji.
4. Ranking czytelny na telefonie i dostępny dla czytnika ekranu.
5. Strona wygląda na zrobioną celowo, nie na wygenerowaną z szablonu.

## 2. Stan wyjściowy repozytorium

Świeży `ng new` (Angular 21.2), workspace root = root repo. Zoneless — brak
`zone.js` w zależnościach. Tailwind 4 przez `@tailwindcss/postcss`. Vitest jako
runner testów (`@angular/build:unit-test`). Brak routingu, brak komponentów poza
`App`, brak Storybooka, brak ngrx.

Plik `.claude/skills/hs-workflow/SKILL.md` opisuje konwencje innego projektu
(LB-FRONT: ngrx, Storybook 1:1, `--color-*: initial`). Te konwencje **nie
obowiązują** w tym repozytorium. Obowiązują wyłącznie twarde reguły dotyczące
sięgania po aktualną dokumentację (context7) przed pisaniem kodu z użyciem
biblioteki.

## 3. Architektura

Statyczna aplikacja jednostronicowa. Trzy warstwy:

```
dane (JSON, build-time)  →  domena (interfejsy + TurniejStore, signals)  →  UI (standalone components)
                                                                              └─ warstwa WebGL (osobny chunk)
```

Brak zarządzania stanem w rozumieniu ngrx. Dane są niezmienne w czasie życia
aplikacji — jedynym stanem runtime jest wybrany filtr okresu i rozwinięte wiersze
rankingu. `computed()` wystarcza; store byłby narzutem bez zysku.

### 3.1 Dane

JSON importowany w czasie kompilacji (`resolveJsonModule: true` w `tsconfig.json`),
nie pobierany fetchem. Uzasadnienie: `tsc --noEmit` wykrywa błąd kształtu przed
deployem, znika loading state i ścieżka błędu sieci, a push i tak wymusza rebuild —
fetch nie kupiłby żadnej elastyczności.

Pliki w `src/data/`:

| Plik | Zawartość |
|---|---|
| `turniej.json` | nazwa, organizator, `start`, `koniec`, definicje kwartałów |
| `zastepy.json` | lista zastępów |
| `punkty.json` | lista wpisów punktowych |
| `inspiracje.json` | inspiracje pogrupowane kategoriami |
| `zadania.json` | baza zadań organizatorów + zadania/listy miesięcy |
| `zasady.json` | sekcje regulaminu |
| `nagrody.json` | nagrody za miejsca 1–3, pusta lista na start |

### 3.2 Model domeny

Interfejsy w `src/app/core/model/`. Kształty:

```ts
interface Turniej {
  nazwa: string;          // "Turniej Zastępów Starszoharcerskich"
  organizator: string;    // "Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia"
  start: string;          // ISO date, "2026-09-19"
  koniec: string;         // ISO date, "2027-06-20"
  kwartaly: Kwartal[];
}

interface Kwartal {
  id: string;             // "q1"
  nazwa: string;
  start: string;          // ISO date
  koniec: string;         // ISO date
  miesiace: MiesiacTurnieju[];
}

interface Zastep {
  id: string;             // slug, klucz obcy z Wpis.zastepId
  nazwa: string;          // "Aptus"
  barwa: string;          // token motywu, nie surowy hex
  dolaczyl: string;       // ISO date — zastęp może wejść w trakcie
}

type KategoriaPunktow =
  | 'obrzedowosc' | 'trop' | 'rajd' | 'biwak' | 'zbiorka' | 'sluzba' | 'inne';

type TypEkstra = 'list-miesiaca' | 'punkt-prawa' | 'zadanie-bazy';

interface Wpis {
  id: string;             // unikalny, stabilny
  data: string;           // ISO date przyznania
  zastepId: string;
  tytul: string;
  opis?: string;
  punkty: number;         // liczba całkowita, może być ujemna
  kategoria: KategoriaPunktow;
  ekstra?: TypEkstra;     // obecność = punkty ekstra, pokazywane znacznikiem
}

interface Nagroda {
  miejsce: 1 | 2 | 3;
  tytul: string;
  opis?: string;
}
```

Podobnie typowane: `Inspiracja`, `KategoriaInspiracji`, `Zadanie`,
`MiesiacTurnieju` (miesiąc `YYYY-MM`, temat listu, punkt Prawa Harcerskiego),
`SekcjaZasad`.

Granice kwartałów nie są jeszcze ustalone przez organizatorów. Implementacja
przyjmuje podział turnieju na trzy równe kwartały po trzy miesiące:
`q1` 2026-09-19 – 2026-12-20, `q2` 2026-12-21 – 2027-03-20,
`q3` 2027-03-21 – 2027-06-20. Wartości są danymi, nie kodem — korekta to edycja
`turniej.json`. Tematy listów i punkty Prawa Harcerskiego przypisane do miesięcy
wchodzą do `turniej.json` w miarę ogłaszania ich przez organizatorów; miesiąc bez
przypisanego tematu renderuje się jako „jeszcze nieogłoszony", nie jako błąd.

### 3.3 TurniejStore

`@Injectable({ providedIn: 'root' })`, wyłącznie signale, zero RxJS.

Wejścia (stałe z importów JSON, wystawione jako `readonly signal`): `turniej`,
`zastepy`, `wpisy`, `inspiracje`, `zadania`, `zasady`, `nagrody`.

Stan zapisywalny: `okres: WritableSignal<OkresFiltru>` gdzie
`OkresFiltru = { rodzaj: 'caly' } | { rodzaj: 'kwartal'; id: string } | { rodzaj: 'miesiac'; iso: string }`.

Pochodne (`computed`):
- `wpisyOkresu` — wpisy przefiltrowane po zakresie dat wybranego okresu,
- `ranking` — `PozycjaRankingu[]`: `{ zastep, suma, wpisy, miejsce, procentLidera }`,
  posortowane malejąco po sumie; remis → to samo miejsce, kolejne miejsce
  przeskakuje (1, 2, 2, 4),
- `maksSuma` — do skalowania słupków,
- `nagrodyDostepne` — `nagrody().length > 0`,
- `aktualnyMiesiac` — miesiąc turnieju zawierający dzisiejszą datę, `null` poza
  okresem turnieju.

`procentLidera` to `0` gdy `maksSuma <= 0`; dzielenie przez zero i ujemne
szerokości słupka są tu realnym przypadkiem (wpis karny na starcie).

### 3.4 Walidacja danych

Funkcja `waliduj(dane): BladDanych[]` w `src/app/core/model/walidacja.ts`,
uruchamiana **wyłącznie w teście** (`walidacja.spec.ts`), nie w bundlu produkcyjnym.

Sprawdza:
- każdy `Wpis.zastepId` wskazuje istniejący zastęp,
- `Wpis.id` unikalne,
- `Wpis.data` mieści się w `[turniej.start, turniej.koniec]`,
- `Wpis.punkty` jest liczbą całkowitą,
- kwartały nie zachodzą na siebie i mieszczą się w okresie turnieju,
- `Nagroda.miejsce` unikalne.

Test kończy się błędem wypisującym listę problemów. Literówka w danych zatrzymuje
deploy w CI.

## 4. Routing i nawigacja

```
''            → RankingPage   (tytuł: Ranking)
'inspiracje'  → InspiracjePage
'zadania'     → ZadaniaPage
'zasady'      → ZasadyPage
'nagrody'     → NagrodyPage
'**'          → redirect ''
```

Wszystkie trasy lazy (`loadComponent`).

`provideRouter(routes, withViewTransitions(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }))`.
View Transitions API obsługuje przejścia między zakładkami natywnie przez router;
w przeglądarkach bez wsparcia nawigacja działa bez animacji.

**Nagrody** są w nawigacji od pierwszego dnia. Gdy `nagrody.json` jest pusty,
strona renderuje stan „Wkrótce" — krótki komunikat, że nagrody zostaną ogłoszone
w trakcie turnieju, plus trzy wygaszone kafle miejsc 1–3 jako zapowiedź układu.
Pozycja w nawigacji dostaje wtedy dyskretny znacznik „wkrótce". Po wypełnieniu
pliku strona pokazuje właściwe nagrody bez żadnej zmiany w kodzie.

### GitHub Pages

Build z `--base-href /TURNIEJ-HS/`. Krok deployu kopiuje `index.html` na
`404.html` w katalogu wyjściowym — Pages serwuje `404.html` dla nieznanych ścieżek,
co daje działające deep-linki przy czystych URL-ach, bez `#`.

## 5. Ranking

Rdzeń aplikacji, w całości DOM — nie WebGL. Powód: słupek w perspektywie 3D czyta
się gorzej niż pozioma belka, tekstu nie da się zaznaczyć, a czytnik ekranu nie
widzi zawartości canvasu.

Układ: lista poziomych słupków, jeden wiersz na zastęp. W wierszu miejsce, nazwa
zastępu, belka i liczba punktów. Belka ma szerokość ze zmiennej CSS `--pct`
ustawianej z `procentLidera`. Miejsca 1–3 wyróżnione wizualnie (nie kolorem samym
w sobie — także wagą typografii i znacznikiem, żeby działało bez rozróżniania barw).

Wiersz jest rozwijalny — `<details>`/`<summary>`, bo daje zachowanie rozwijania,
semantykę i obsługę klawiatury bez pisania własnego JS — i odsłania wpisy zastępu w wybranym okresie: data, tytuł, kategoria, punkty, znacznik
„ekstra" z nazwą podstawy (list miesiąca / punkt Prawa / zadanie z bazy).

Filtr okresu: cały turniej / konkretny kwartał / konkretny miesiąc. Zmiana filtru
przelicza `computed()`; wiersze wchodzą i wychodzą przez `animate.enter` /
`animate.leave` (Angular 21, API kompilatora — bez pakietu `@angular/animations`).

Wjazd słupków sterowany `animation-timeline: view()` — belka rośnie, gdy wiersz
wchodzi w widok. Przy `prefers-reduced-motion: reduce` belki są od razu w docelowej
szerokości.

Dostępność: lista jest tekstem, słupek dekoracją nad prawdziwą liczbą. Każdy wiersz
niesie w treści miejsce, nazwę i punkty. Belka dostaje `aria-hidden`.

Nowy zastęp dopisany w trakcie pojawia się w rankingu od razu po deployu, także gdy
ma zero punktów — z sumą 0 i pustą belką.

## 6. Warstwa WebGL

Komponent `<app-teren>` w `src/app/shared/teren/`, ładowany `@defer (on viewport)`.
three.js (~160 kB gz) trafia do osobnego chunku i nie blokuje pierwszego renderu.

Scena: proceduralny teren renderowany shaderem rysującym **warstwice mapy
topograficznej** — fBm noise jako wysokość, funkcja warstwicowa na jej podstawie.
Paleta z tokenów motywu: kremowe tło, atramentowe linie, akcent leśnej zieleni.
Kamera dryfuje wraz z postępem scrolla, dochodzi lekki parallax za kursorem.

Znaczniki obozów: jeden punkt świetlny na zastęp, jasność skalowana punktacją.
Wiąże tło z danymi, zamiast robić z niego tapetę. Znaczniki czyta z `TurniejStore`,
więc dopisany zastęp pojawia się także na mapie.

Bezpieczniki — to najbardziej awaryjny fragment aplikacji:
- `prefers-reduced-motion: reduce` → jedna klatka statyczna, pętla RAF nie startuje;
- brak kontekstu WebGL → gradient CSS w tle, aplikacja działa bez zmian;
- `IntersectionObserver` + `visibilitychange` → pętla zatrzymana, gdy canvas jest
  poza widokiem lub karta w tle;
- `devicePixelRatio` cięty do 2, `powerPreference: 'low-power'`;
- `DestroyRef` zwalnia geometrie, materiały i kontekst renderera.

Aplikacja zoneless, więc pętla renderowania nie wywołuje wykrywania zmian. Canvas
dostaje `aria-hidden="true"` — nie niesie informacji niedostępnej w DOM.

## 7. Warstwa wizualna

Kierunek: jasny, mapowy, papierowy. Kremowe tło, linie jak na mapie
topograficznej, akcent leśnej zieleni i sygnałowej czerwieni, serif w nagłówkach.
Czytelne w dzień, na telefonie, w terenie.

Tokeny w `src/styles/theme.css` przez Tailwind 4 `@theme`:
`--color-papier`, `--color-atrament`, `--color-warstwica`, `--color-las`,
`--color-sygnal`, plus skala odcieni pochodnych. Domyślna paleta Tailwinda zostaje
włączona — trik `--color-*: initial` z LB-FRONT nie jest tu przenoszony, bo powoduje
ciche emitowanie zerowego CSS dla klas spoza motywu.

Typografia: nagłówki Fraunces (serif), treść Inter (sans). Oba pliki lokalnie w
`public/fonts/`, `font-display: swap` — bez zapytań do Google Fonts.

Tekstura papieru jako inline SVG noise na tle, o niskiej nieprzezroczystości.

Teksty interfejsu po polsku. Kod, nazwy plików, commity po angielsku.

## 8. Testy

`ng test --watch=false` (Vitest przez `@angular/build:unit-test`).

Zakres:
- `walidacja.spec.ts` — walidacja rzeczywistych plików z `src/data/`; ten test
  broni produkcji przed literówką w danych;
- `turniej-store.spec.ts` — sumowanie punktów, sortowanie, obsługa remisu,
  filtr okresu (granice zakresów włącznie), `procentLidera` przy `maksSuma <= 0`,
  zastęp bez wpisów, wpis ujemny;
- `ranking-page.spec.ts` — render z danymi testowymi, rozwinięcie wiersza,
  zmiana filtru;
- `nagrody-page.spec.ts` — stan „Wkrótce" przy pustej liście, właściwy render przy
  wypełnionej;
- `teren.spec.ts` — smoke: komponent montuje się i pokazuje fallback, gdy
  `getContext('webgl2')` zwraca `null`.

Praca zgodnie z TDD: test przed implementacją, na każdym kroku.

## 9. CI i deploy

GitHub Actions, workflow na push do `main`:

1. `npm ci`
2. `npm run type-check` (`tsc --noEmit -p tsconfig.app.json`) — skrypt do dodania
3. `npx ng test --watch=false`
4. `npx ng build --base-href /TURNIEJ-HS/`
5. kopia `dist/TURNIEJ-HS/browser/index.html` → `404.html`
6. deploy na GitHub Pages (`actions/deploy-pages`)

Nieudany test lub type-check zatrzymuje deploy.

## 10. Struktura plików

```
src/
  data/                        pliki JSON (patrz 3.1)
  styles/theme.css             tokeny @theme
  styles.css                   import tailwindcss + theme
  app/
    core/
      model/                   interfejsy, walidacja
      turniej-store.ts
    shared/
      teren/                   komponent WebGL
      slupek/                  belka rankingu
      pusty-stan/              wspólny stan „Wkrótce" / brak danych
    layout/
      shell/                   nagłówek, nawigacja, stopka
    pages/
      ranking/
      inspiracje/
      zadania/
      zasady/
      nagrody/
```

## 11. Kolejność implementacji

1. Model domeny, pliki danych, walidacja, `TurniejStore` — TDD, bez UI.
2. Shell aplikacji, routing, nawigacja, tokeny motywu, typografia.
3. Strona rankingu ze słupkami i filtrem okresu.
4. Strony treściowe: inspiracje, zadania, zasady, nagrody (ze stanem „Wkrótce").
5. Warstwa WebGL wraz z bezpiecznikami.
6. CI i deploy na GitHub Pages.

Każdy krok kończy się przechodzącym `type-check` i zestawem testów.

## 12. Świadomie poza zakresem

- Panel administracyjny i jakikolwiek zapis z poziomu przeglądarki.
- Uwierzytelnianie, role, uprawnienia.
- Wykres punktów w czasie — dane to umożliwiają, ale nie ma na to zamówienia.
- Tryb ciemny — kierunek wizualny jest celowo jasny i papierowy.
- Storybook.
- Internacjonalizacja.
