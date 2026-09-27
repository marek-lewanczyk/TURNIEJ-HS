# Turniej Zastępów Starszoharcerskich

Tablica wyników turnieju organizowanego przez Namiestnictwo Starszoharcerskie
Hufca ZHP Gdynia, od 19 września 2026 do 20 czerwca 2027.

Strona jest statyczna. Nie ma panelu administracyjnego — wszystkie dane to osiem
plików JSON w `src/data/`, a publikacja odbywa się przez push na `main`.

## Spis treści

| Co chcesz zrobić | Plik | Gdzie się pojawi |
|---|---|---|
| [Dopisać punkty](#dopisać-punkty) | `punkty.json` | Ranking |
| [Dopisać zastęp](#dopisać-zastęp) | `zastepy.json` | Ranking |
| [Ogłosić list miesiąca albo punkt Prawa](#ogłosić-list-miesiąca-albo-punkt-prawa) | `turniej.json` | Zadania |
| [Ogłosić nagrody](#ogłosić-nagrody) | `nagrody.json` | Nagrody |
| [Dodać zadanie do bazy](#dodać-zadanie-do-bazy) | `zadania.json` | Zadania |
| [Dodać inspirację](#dodać-inspirację) | `inspiracje.json` | Inspiracje |
| [Zmienić zasady](#zmienić-zasady) | `zasady.json` | Zasady |
| [Dodać materiał do pobrania](#dodać-materiał-do-pobrania) | `materialy.json` + `public/materialy/` | Materiały |
| [Zmienić nazwę, daty albo kwartały](#zmienić-nazwę-daty-albo-kwartały) | `turniej.json` | cała strona |

## Co zmieniasz w trakcie turnieju

Większość plików ustawia się raz, na starcie. Regularnie zmieniają się tylko te:

| Kiedy | Plik | Co robisz |
|---|---|---|
| 1. dnia każdego miesiąca | `turniej.json` (+ PDF listu) | Uzupełniasz `list`, `punktPrawa` i `listPlik` bieżącego miesiąca — [instrukcja](#ogłosić-list-miesiąca-albo-punkt-prawa) |
| Po każdym spotkaniu punktacyjnym (nocka 18/19.12, RTL 19–21.03, zlot 18–20.06) | `punkty.json` | Dopisujesz zatwierdzone punkty wszystkich zastępów — [instrukcja](#dopisać-punkty) |
| Gdy nowy zastęp się zgłosi (od początku kwartału) | `zastepy.json` | [instrukcja](#dopisać-zastęp) |
| Najpóźniej przed III kwartałem | `nagrody.json` | Dopisujesz nagrody za 2. i 3. miejsce, jeśli będą — [instrukcja](#ogłosić-nagrody) |
| Gdy pojawi się nowy dokument | `materialy.json` (+ plik) | [instrukcja](#dodać-materiał-do-pobrania) |
| Gdy zmieni się regulamin | `zasady.json` + nowy PDF regulaminu | [instrukcja](#zmienić-zasady) |

`inspiracje.json`, `zadania.json` i kwartały w `turniej.json` zmieniasz tylko wtedy,
gdy organizatorzy tak postanowią.

## Jak edytować plik — krok po kroku

Są dwie drogi. Do pojedynczych poprawek wystarczy przeglądarka; do większych
zmian (np. punkty po spotkaniu) wygodniej lokalnie, bo od razu widać efekt.

### Droga A: w przeglądarce, na GitHubie

Nie trzeba nic instalować.

1. Otwórz repozytorium na GitHubie i wejdź w folder `src/data/`.
2. Kliknij plik, który chcesz zmienić (np. `punkty.json`).
3. Kliknij ikonę ołówka (**Edit this file**) w prawym górnym rogu podglądu.
4. Wprowadź zmianę. Wzory wpisów znajdziesz w sekcjach niżej — najprościej
   skopiować istniejący wpis i podmienić wartości.
5. Kliknij **Commit changes…**. W polu opisu wpisz, co zmieniasz, np.
   `data: punkty z nocki zastępowych`. Zostaw zaznaczone
   **Commit directly to the main branch** i zatwierdź.
6. Wejdź w zakładkę **Actions**. Po ok. dwóch minutach przy Twoim commicie pojawi
   się zielony ✓ — strona jest zaktualizowana. Czerwony ✗ opisuje sekcja
   [Gdy deploy się nie uda](#gdy-deploy-się-nie-uda).

**Dodanie pliku (PDF listu, nowy materiał):** wejdź w folder docelowy
(`public/materialy/` albo `public/materialy/listy/`), kliknij
**Add file → Upload files**, przeciągnij plik i zatwierdź przez **Commit changes**.
Najpierw nadaj plikowi nazwę bez spacji i polskich znaków (np.
`2026-10-punkt-2.pdf`). Dopiero potem edytuj JSON, który na ten plik wskazuje —
wtedy link działa od pierwszego deployu.

### Droga B: lokalnie, na komputerze

Wymaga zainstalowanego Node.js i sklonowanego repozytorium (patrz
[Praca lokalna](#praca-lokalna)).

1. Pobierz najnowszą wersję: `git pull`.
2. Uruchom podgląd: `npm start` i otwórz http://localhost:4200.
3. Edytuj plik w `src/data/` w dowolnym edytorze (np. VS Code — podkreśli
   błędy składni JSON na czerwono). Strona przeładuje się sama po zapisie.
4. Sprawdź, czy wszystko wygląda dobrze, a potem uruchom testy — to ten sam
   walidator, który zatrzymałby deploy:

   ```bash
   npx ng test --watch=false
   ```

5. Opublikuj:

   ```bash
   git add src/data public/materialy
   git commit -m "data: punkty z nocki zastępowych"
   git push
   ```

### Przykład: punkty po nocce zastępowych

Zastępowi zaproponowali, organizatorzy zatwierdzili: Grom 15 pkt za biwak,
Asy 8 pkt za trop plus 5 pkt ekstra za trop na punkt Prawa. Do tablicy w
`punkty.json` dopisujesz trzy obiekty — każde osiągnięcie osobno, z datą spotkania:

```json
{ "id": "2026-12-19-grom-biwak", "data": "2026-12-19", "zastepId": "grom", "tytul": "Biwak zastępu", "punkty": 15, "kategoria": "biwak" },
{ "id": "2026-12-19-asy-trop", "data": "2026-12-19", "zastepId": "asy", "tytul": "Trop „Zero hejtu”", "punkty": 8, "kategoria": "trop" },
{ "id": "2026-12-19-asy-trop-ekstra", "data": "2026-12-19", "zastepId": "asy", "tytul": "Trop na punkt Prawa miesiąca", "punkty": 5, "kategoria": "trop", "ekstra": "punkt-prawa" }
```

Pamiętaj o przecinku między poprzednim ostatnim wpisem a nowymi i o braku
przecinka po ostatnim. Aktualne `id` zastępów są w `zastepy.json`.

### Przykład: list na październik

1. Wgraj PDF jako `public/materialy/listy/2026-10-punkt-2.pdf`.
2. W `turniej.json` znajdź październik i zamień `null` na treść:

```json
{
  "iso": "2026-10",
  "nazwa": "październik",
  "list": "Temat listu",
  "punktPrawa": "2. Na słowie harcerza polegaj jak na Zawiszy.",
  "listPlik": "materialy/listy/2026-10-punkt-2.pdf"
}
```

### Gdy deploy się nie uda

Strona zostaje wtedy na poprzedniej, poprawnej wersji — nic się nie psuje.

1. W zakładce **Actions** kliknij czerwony przebieg, potem krok, który się nie
   powiódł (**Test** albo **Build**).
2. Szukaj linii z nazwą pliku:
   - **Build** z `✘ [ERROR]` i ścieżką `src/data/…json:9:131` — błąd składni
     (zwykle przecinek albo cudzysłów) w podanej linii.
   - **Test** z komunikatem po polsku, np. `wpis 2026-12-19-grom-biwak: nieznany
     zastepId "Grom"` — walidator mówi dokładnie, który wpis i które pole.
3. Popraw plik (drogą A albo B) i zatwierdź ponownie.

## Zanim zaczniesz — trzy rzeczy o JSON

**Przecinki.** Elementy w tablicy i pola w obiekcie rozdziela przecinek, ale po
ostatnim przecinka **nie ma**. To najczęstszy błąd. Deploy zatrzyma się z
komunikatem, który wskazuje plik i linię:

```
✘ [ERROR] JSON does not support trailing commas
    src/data/zadania.json:9:131:
```

Sam `npm run type-check` tego **nie** wyłapie — przecinek na końcu wypada dopiero
przy budowaniu. Jeśli chcesz sprawdzić plik lokalnie przed pushem, uruchom
`npx ng build`, nie `type-check`.

**Cudzysłowy.** Zawsze podwójne `"`, nigdy `'` ani `„”`. Tekst wpisujesz między
cudzysłowy; liczby (`punkty`, `miejsce`) bez cudzysłowów.

**Polskie znaki** działają normalnie — pliki są w UTF-8. Nie trzeba nic zamieniać.

Jeśli coś pomylisz, deploy się zatrzyma i strona zostanie na poprzedniej,
poprawnej wersji. Nic nie da się zepsuć nieodwracalnie.

---

## Dopisać punkty

Plik: `src/data/punkty.json`. Dodaj obiekt na końcu tablicy:

```json
{
  "id": "2026-12-19-grom-biwak",
  "data": "2026-12-19",
  "zastepId": "grom",
  "tytul": "Biwak zastępu w Kolibkach",
  "opis": "Dwa dni, własna kuchnia, gra nocna.",
  "punkty": 12,
  "kategoria": "biwak",
  "ekstra": "zadanie-bazy"
}
```

Wszystkie pola poza `opis` i `ekstra` są wymagane.

- `id` — dowolny, byle unikalny i niepusty. Wygodna konwencja: `data-zastęp-skrót`.
- `data` — data przyznania punktów, format ISO `RRRR-MM-DD` (np. `2026-12-19`),
  w obrębie trwania turnieju: od `2026-09-19` do `2027-06-20` włącznie.
  Walidator odrzuca też daty, których nie ma w kalendarzu, np. `2026-02-30`.
  Według regulaminu (§5 ust. 1) punkty przyznaje się tylko na spotkaniach
  punktacyjnych, więc wpisuj datę spotkania: nocka `2026-12-19`, RTL
  `2027-03-19`–`2027-03-21`, zlot `2027-06-18`–`2027-06-20`. Kwartały w
  `turniej.json` są tak ustawione, żeby każde spotkanie wpadało do swojego kwartału.
- `zastepId` — musi istnieć w `zastepy.json`. Uwaga: to `id` zastępu, nie jego
  nazwa — `lesny-zwiad`, nie `Leśny Zwiad`.
- `tytul` — krótki tytuł osiągnięcia, niepusty. Pokazuje się w rozwinięciu wiersza.
- `opis` — pomiń albo dopisz jedno zdanie szczegółów. Wyświetla się pod tytułem.
- `punkty` — liczba całkowita. Może być ujemna (kara), nie może być ułamkiem.
- `kategoria` — dokładnie jedna z:
  `obrzedowosc`, `trop`, `rajd`, `biwak`, `zbiorka`, `sluzba`, `inne`.
  Pojawia się jako mała pigułka obok tytułu.
- `ekstra` — **pomiń, jeśli to zwykłe punkty.** W przeciwnym razie jedna z:
  `list-miesiaca`, `punkt-prawa`, `zadanie-bazy`. Dodaje przy wpisie znacznik
  „ekstra" z nazwą podstawy.

Kolejność wpisów w pliku nie ma znaczenia — strona sortuje je sama, od najnowszych.

---

## Dopisać zastęp

Plik: `src/data/zastepy.json`. Dodaj obiekt do tablicy:

```json
{ "id": "borealis", "nazwa": "Borealis", "barwa": "zloto", "dolaczyl": "2026-12-20" }
```

- `id` — bez polskich znaków i spacji, małymi literami. To on trafia potem do
  `zastepId` we wpisach punktowych, więc raz ustawiony nie powinien się zmieniać.
- `nazwa` — tak, jak ma się wyświetlić w rankingu.
- `barwa` — kolor słupka. Token z motywu (`src/styles/theme.css`), bez przedrostka
  `--color-`. Dozwolone: `las`, `sygnal`, `zloto`, `las-jasny`, `atrament`,
  `atrament-slaby`, `warstwica`, `papier`, `papier-cien`.
  W praktyce sensowne są cztery pierwsze — `papier`, `papier-cien` i `warstwica`
  są prawie niewidoczne na tle strony.
- `dolaczyl` — data ISO wejścia do turnieju. Regulamin (§3 ust. 6) pozwala dołączyć
  z początkiem najbliższego kwartału, więc wpisz dzień startu kwartału. Jeśli zastęp gra od początku, wpisz
  `2026-09-19` — to jedyna wartość, przy której strona nie dopisuje informacji
  o dołączeniu w trakcie.

Zastęp pojawi się w rankingu od razu po deployu, z zerem punktów. Zastępy można
dopisywać przez cały czas trwania turnieju.

---

## Ogłosić list miesiąca albo punkt Prawa

Plik: `src/data/turniej.json`. Miesiące siedzą **wewnątrz kwartałów**, w polu
`miesiace`. Znajdź właściwy i zamień `null` na treść:

```json
{ "iso": "2026-10", "nazwa": "październik", "list": "O odwadze", "punktPrawa": "Punkt 3",
  "listPlik": "materialy/listy/2026-10-punkt-3.pdf" }
```

- `iso` i `nazwa` — już są, nie ruszaj.
- `list` — temat listu z tego miesiąca. `null` dopóki nieogłoszony.
- `punktPrawa` — punkt Prawa Harcerskiego przypisany do tego miesiąca. `null`
  dopóki nieogłoszony.
- `listPlik` — pomiń, jeśli list nie ma pliku. W przeciwnym razie wrzuć PDF do
  `public/materialy/listy/` i wpisz ścieżkę **bez** ukośnika na początku, np.
  `materialy/listy/2026-10-punkt-3.pdf`. Przy miesiącu pojawi się link „Czytaj list (PDF)”.

Dopóki wartość jest `null`, zakładka Zadania pokazuje przy tym miesiącu „jeszcze
nieogłoszony". To normalny stan, nie błąd — możesz ogłaszać listy pojedynczo, w
miarę jak zapadają decyzje. Oba pola są niezależne: list może być ogłoszony, a
punkt Prawa jeszcze nie.

Bieżący miesiąc strona wyróżnia sama, na podstawie dzisiejszej daty.

---

## Ogłosić nagrody

Plik: `src/data/nagrody.json`. Dopóki tablica jest pusta (`[]`), zakładka Nagrody
pokazuje stan „Wkrótce" i trzy wygaszone kafle. Nie trzeba nic więcej robić, żeby
to przełączyć — wystarczy wypełnić plik:

```json
[
  { "miejsce": 1, "tytul": "Wyprawa w Bieszczady", "opis": "Dla całego zastępu" },
  { "miejsce": 2, "tytul": "Sprzęt biwakowy" },
  { "miejsce": 3, "tytul": "Zestaw map i kompas" }
]
```

- `miejsce` — `1`, `2` albo `3`, bez cudzysłowów, każde najwyżej raz.
- `tytul` — nazwa nagrody.
- `opis` — pomiń albo dopisz szczegóły.

Kolejność w pliku nie ma znaczenia, strona sortuje po miejscu. Można ogłosić
same pierwsze miejsce i dopisać resztę później.

---

## Dodać zadanie do bazy

Plik: `src/data/zadania.json`. To baza zadań przygotowana przez organizatorów —
wykonanie któregokolwiek daje punkty ekstra (`"ekstra": "zadanie-bazy"` we wpisie
punktowym). Dodaj obiekt do tablicy:

```json
{
  "id": "z9",
  "tytul": "Nocne niebo",
  "opis": "Rozpoznajcie i udokumentujcie pięć gwiazdozbiorów podczas wyjścia po zmroku."
}
```

- `id` — unikalny, dowolny. W pliku jest konwencja `z1`, `z2`, … — trzymaj się jej.
- `tytul` — krótki, jedno-, dwuwyrazowy.
- `opis` — jedno zdanie mówiące, co trzeba zrobić.

Zadania wyświetlają się w kolejności z pliku, w siatce dwukolumnowej.

> **Uwaga:** zakładka Zadania pokazuje dwie rzeczy z **dwóch różnych plików** —
> miesiące z listami pochodzą z `turniej.json`, a baza zadań z `zadania.json`.
> Jeśli szukasz miejsca na temat listu, to sekcja wyżej.

---

## Dodać inspirację

Plik: `src/data/inspiracje.json`. Lista pomysłów na punktowane aktywności —
nie jest zamknięta ani obowiązkowa, ma pomagać zastępowym wymyślać, za co
przyznawać punkty.

Plik to tablica **kategorii**, a każda kategoria ma w środku tablicę inspiracji:

```json
{
  "id": "wyjscia",
  "nazwa": "Wyjścia i wyprawy",
  "inspiracje": [
    { "tytul": "Biwak zastępu", "opis": "Zorganizujcie własny biwak — od planu, przez zakupy, po sprzątanie." },
    { "tytul": "Rajd", "opis": "Wystartujcie w rajdzie hufca albo chorągwi." }
  ]
}
```

Żeby dodać pojedynczą inspirację do istniejącej kategorii, dopisz obiekt
`{ "tytul": …, "opis": … }` do jej tablicy `inspiracje`. Żeby dodać całą nową
kategorię, dopisz obiekt jak powyżej na końcu pliku.

- `id` (kategorii) — unikalny, bez spacji i polskich znaków.
- `nazwa` (kategorii) — nagłówek sekcji na stronie.
- `tytul`, `opis` (inspiracji) — oba wymagane, oba jednoliniowe.

Kategorie i inspiracje wyświetlają się w kolejności z pliku.

---

## Zmienić zasady

Plik: `src/data/zasady.json`. Treść regulaminu, podzielona na sekcje. Każda
sekcja to nagłówek i lista akapitów:

```json
{
  "id": "ekstra",
  "naglowek": "Punkty ekstra",
  "akapity": [
    "Zrealizowanie zbiórki zastępu spójnej z tematyką listu z danego miesiąca.",
    "Realizacja tropu opierającego się o punkt Prawa Harcerskiego przypisany do jednego z miesięcy aktualnie trwającego kwartału.",
    "Wykonanie zadania z bazy przygotowanej przez organizatorów."
  ]
}
```

- `id` — unikalny, bez spacji.
- `naglowek` — nagłówek sekcji.
- `akapity` — tablica tekstów. Każdy element to osobny akapit na stronie.
  Jeden długi akapit rozbij na kilka elementów, zamiast wstawiać `\n`.

Sekcje wyświetlają się w kolejności z pliku, więc kolejność w pliku to kolejność
czytania regulaminu.

---

## Dodać materiał do pobrania

Dwa kroki. Najpierw wrzuć plik do `public/materialy/` — nazwa bez spacji i
polskich znaków, np. `karta-tropu.pdf`. Potem dopisz obiekt do
`src/data/materialy.json`:

```json
{
  "id": "karta-tropu",
  "tytul": "Karta tropu starszoharcerskiego",
  "opis": "Do zaplanowania tropu: cel, zadania, terminy i ocena.",
  "plik": "materialy/karta-tropu.pdf",
  "format": "PDF"
}
```

- `id` — unikalny. Materiał o `id` równym `regulamin` jest dodatkowo podlinkowany
  na zakładce Zasady („Pobierz regulamin”).
- `plik` — ścieżka **bez** `/` na początku. Strona działa pod adresem
  `/TURNIEJ-HS/`, a ścieżka z ukośnikiem prowadziłaby poza nią — walidator to odrzuci.
- `format` — krótka etykieta przy linku (`PDF`, `DOCX`).
- `opis` — opcjonalny.

Materiały wyświetlają się w kolejności z pliku.

---

## Zmienić nazwę, daty albo kwartały

Plik: `src/data/turniej.json`. Tu siedzi szkielet całego turnieju:

```json
{
  "nazwa": "Turniej Zastępów Starszoharcerskich",
  "organizator": "Namiestnictwo Starszoharcerskie Hufca ZHP Gdynia",
  "start": "2026-09-19",
  "koniec": "2027-06-20",
  "kwartaly": [ … ]
}
```

`nazwa` i `organizator` pokazują się w nagłówku każdej podstrony. `start` i
`koniec` wyznaczają dozwolony zakres dat wpisów punktowych i pojawiają się
w stopce.

### Kwartały

Kwartały napędzają filtr okresu w rankingu. Każdy ma `id`, `nazwa`, `start`,
`koniec` (obie daty włącznie) i tablicę `miesiace`.

Granice kwartałów wynikają z regulaminu (§4 ust. 1) i spotkań punktacyjnych:
I `2026-09-19`–`2026-12-19` (z nocką 18/19.12), II `2026-12-20`–`2027-03-21`
(z RTL-em), III `2027-03-22`–`2027-06-20` (ze zlotem). W regulaminie daty graniczne
się nakładają, a walidator na to nie pozwala, dlatego każda granica przypada
po spotkaniu punktacyjnym.

Walidator pilnuje trzech rzeczy i zatrzyma deploy, jeśli któraś nie zagra:

1. Kwartały **nie zachodzą** na siebie.
2. Kwartały **szczelnie pokrywają** cały turniej — pierwszy zaczyna się dokładnie
   w dniu startu, ostatni kończy dokładnie w dniu końca, a między kolejnymi nie ma
   ani jednego dnia luki. Kwartał kończący się `2026-12-20` i następny zaczynający
   się `2026-12-21` są w porządku; luka choćby jednodniowa nie.
3. Żaden kwartał nie wychodzi poza okres turnieju, a jego `koniec` nie jest
   wcześniejszy niż `start`.

Ta szczelność ma konkretny powód: gdyby została luka, wpisy z tych dni liczyłyby
się do sumy „Cały turniej", ale nie pokazałyby się w żadnym filtrze kwartalnym.
Znikałyby po cichu.

Miesiące w `miesiace` napędzają zarówno filtr miesięczny w rankingu, jak i listę
na zakładce Zadania. Dodanie miesiąca opisano w sekcji [o liście miesiąca](#ogłosić-list-miesiąca-albo-punkt-prawa).

---

## Co sprawdza walidator, a czego nie

Przed każdym deployem uruchamiany jest test `walidacja.spec.ts`, który czyta
prawdziwe pliki z `src/data/`. Jeśli znajdzie problem, deploy się zatrzymuje
i strona zostaje na poprzedniej wersji.

**Sprawdza:**

- `punkty.json` — obecność `id`, `tytul`, `zastepId`, `data`; unikalność `id`;
  istnienie zastępu; poprawność i zakres daty; całkowitość punktów; poprawność
  `kategoria` i `ekstra`.
- `zastepy.json` — obecność i unikalność `id`, obecność `nazwa`, znajomość
  `barwa`, poprawność `dolaczyl`.
- `turniej.json` — poprawność wszystkich dat, brak zachodzenia i szczelne
  pokrycie kwartałów.
- `nagrody.json` — `miejsce` w zbiorze 1–3, bez duplikatów.
- `materialy.json` — obecność i unikalność `id`, obecność `tytul` i `plik`,
  brak `/` na początku `plik`.

**Nie sprawdza** — a warto przejrzeć samemu po edycji:

- `inspiracje.json`, `zadania.json`, `zasady.json` — żadnego pola. Pusty `tytul`
  albo brakujący `opis` przejdzie i wyrenderuje pusty kafel na stronie.
- Istnienie plików — ani `plik` w materiałach, ani `listPlik` nie są sprawdzane
  pod kątem tego, czy plik naprawdę leży w `public/`. Literówka w nazwie da
  zepsuty link; po dodaniu pliku kliknij go raz na `npm start`.
- `miesiace` w kwartałach — `iso` i `nazwa` nie są weryfikowane; miesiąc z błędnym
  `iso` po prostu nie złapie żadnych wpisów w filtrze.
- Sens treści. Literówka w tytule to nadal literówka.

Dlatego po większej zmianie treści warto raz zerknąć na stronę lokalnie
(`npm start`), zanim się pushuje.

---

## Publikacja

```bash
git add src/data
git commit -m "data: add October points"
git push
```

GitHub Actions sprawdza typy, uruchamia testy, buduje i publikuje na GitHub Pages.
Cały przebieg trwa około dwóch minut; stronę widać po jego zakończeniu.

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

`npm start` przeładowuje stronę sam po każdej zmianie w plikach JSON — najszybszy
sposób sprawdzenia, czy wpis wygląda tak, jak miał.

## Dokumentacja projektu

- Design: `docs/superpowers/specs/2026-09-01-turniej-hs-design.md`
- Plan wdrożenia: `docs/superpowers/plans/2026-09-01-turniej-hs.md`
