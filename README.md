# Turniej Zastępów Starszoharcerskich

Tablica wyników turnieju organizowanego przez Namiestnictwo Starszoharcerskie
Hufca ZHP Gdynia, od 19 września 2026 do 20 czerwca 2027.

Strona jest statyczna. Nie ma panelu administracyjnego — wszystkie dane to siedem
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
| [Zmienić nazwę, daty albo kwartały](#zmienić-nazwę-daty-albo-kwartały) | `turniej.json` | cała strona |

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

Wszystkie pola poza `opis` i `ekstra` są wymagane.

- `id` — dowolny, byle unikalny i niepusty. Wygodna konwencja: `data-zastęp-skrót`.
- `data` — data przyznania punktów, format ISO `RRRR-MM-DD` (np. `2026-10-12`),
  w obrębie trwania turnieju: od `2026-09-19` do `2027-06-20` włącznie.
  Walidator odrzuca też daty, których nie ma w kalendarzu, np. `2026-02-30`.
- `zastepId` — musi istnieć w `zastepy.json`. Uwaga: to `id` zastępu, nie jego
  nazwa — `aptus`, nie `Aptus`.
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
{ "id": "borealis", "nazwa": "Borealis", "barwa": "zloto", "dolaczyl": "2027-01-10" }
```

- `id` — bez polskich znaków i spacji, małymi literami. To on trafia potem do
  `zastepId` we wpisach punktowych, więc raz ustawiony nie powinien się zmieniać.
- `nazwa` — tak, jak ma się wyświetlić w rankingu.
- `barwa` — kolor słupka. Token z motywu (`src/styles/theme.css`), bez przedrostka
  `--color-`. Dozwolone: `las`, `sygnal`, `zloto`, `las-jasny`, `atrament`,
  `atrament-slaby`, `warstwica`, `papier`, `papier-cien`.
  W praktyce sensowne są cztery pierwsze — `papier`, `papier-cien` i `warstwica`
  są prawie niewidoczne na tle strony.
- `dolaczyl` — data ISO wejścia do turnieju. Jeśli zastęp gra od początku, wpisz
  `2026-09-19` — to jedyna wartość, przy której strona nie dopisuje informacji
  o dołączeniu w trakcie.

Zastęp pojawi się w rankingu od razu po deployu, z zerem punktów. Zastępy można
dopisywać przez cały czas trwania turnieju.

---

## Ogłosić list miesiąca albo punkt Prawa

Plik: `src/data/turniej.json`. Miesiące siedzą **wewnątrz kwartałów**, w polu
`miesiace`. Znajdź właściwy i zamień `null` na treść:

```json
{ "iso": "2026-10", "nazwa": "październik", "list": "O odwadze", "punktPrawa": "Punkt 3" }
```

- `iso` i `nazwa` — już są, nie ruszaj.
- `list` — temat listu z tego miesiąca. `null` dopóki nieogłoszony.
- `punktPrawa` — punkt Prawa Harcerskiego przypisany do tego miesiąca. `null`
  dopóki nieogłoszony.

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

**Podział kwartałów w pliku to założenie przyjęte przy budowie strony, nie
decyzja namiestnictwa** — jeśli organizatorzy ustalili inne granice, popraw je tutaj.

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

**Nie sprawdza** — a warto przejrzeć samemu po edycji:

- `inspiracje.json`, `zadania.json`, `zasady.json` — żadnego pola. Pusty `tytul`
  albo brakujący `opis` przejdzie i wyrenderuje pusty kafel na stronie.
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
