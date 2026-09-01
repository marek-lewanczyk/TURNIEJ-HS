import {
  KATEGORIE_PUNKTOW,
  TOKENY_BARW,
  TYPY_EKSTRA,
  type DaneTurnieju,
  type Kwartal,
} from './turniej.model';

const WZORZEC_DATY = /^\d{4}-\d{2}-\d{2}$/;

function zachodza(a: Kwartal, b: Kwartal): boolean {
  return a.start <= b.koniec && b.start <= a.koniec;
}

/** ISO date, format and calendar validity (rejects e.g. `2026-13-45`). */
function dataPoprawna(data: unknown): data is string {
  if (typeof data !== 'string' || !WZORZEC_DATY.test(data)) {
    return false;
  }
  const [rok, miesiac, dzien] = data.split('-').map(Number);
  if (miesiac < 1 || miesiac > 12) {
    return false;
  }
  const dniWMiesiacu = new Date(Date.UTC(rok, miesiac, 0)).getUTCDate();
  return dzien >= 1 && dzien <= dniWMiesiacu;
}

/** Next calendar day, in UTC, for the quarter-coverage gap check below. */
function nastepnyDzien(iso: string): string {
  const data = new Date(`${iso}T00:00:00Z`);
  data.setUTCDate(data.getUTCDate() + 1);
  return data.toISOString().slice(0, 10);
}

function niepusty(wartosc: unknown): wartosc is string {
  return typeof wartosc === 'string' && wartosc.trim().length > 0;
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
    const etykieta = niepusty(zastep.id) ? zastep.id : '(brak id)';

    if (!niepusty(zastep.id)) {
      bledy.push(`zastęp ${etykieta}: brak wymaganego pola "id"`);
    } else {
      if (idZastepow.has(zastep.id)) {
        bledy.push(`zastęp ${zastep.id}: zduplikowane id`);
      }
      idZastepow.add(zastep.id);
    }

    if (!niepusty(zastep.nazwa)) {
      bledy.push(`zastęp ${etykieta}: brak wymaganego pola "nazwa"`);
    }

    if (!TOKENY_BARW.includes(zastep.barwa)) {
      bledy.push(`zastęp ${etykieta}: nieznana barwa "${zastep.barwa}"`);
    }
  }

  const idWpisow = new Set<string>();
  for (const wpis of wpisy) {
    const etykieta = niepusty(wpis.id) ? wpis.id : '(brak id)';

    if (!niepusty(wpis.id)) {
      bledy.push(`wpis ${etykieta}: brak wymaganego pola "id"`);
    } else {
      if (idWpisow.has(wpis.id)) {
        bledy.push(`wpis ${wpis.id}: zduplikowane id`);
      }
      idWpisow.add(wpis.id);
    }

    if (!niepusty(wpis.tytul)) {
      bledy.push(`wpis ${etykieta}: brak wymaganego pola "tytul"`);
    }

    if (!niepusty(wpis.zastepId)) {
      bledy.push(`wpis ${etykieta}: brak wymaganego pola "zastepId"`);
    } else if (!idZastepow.has(wpis.zastepId)) {
      bledy.push(`wpis ${etykieta}: nieznany zastepId "${wpis.zastepId}"`);
    }

    if (!dataPoprawna(wpis.data)) {
      bledy.push(`wpis ${etykieta}: nieprawidłowa data "${wpis.data}"`);
    } else if (wpis.data < turniej.start || wpis.data > turniej.koniec) {
      bledy.push(`wpis ${etykieta}: data ${wpis.data} poza okresem turnieju`);
    }

    if (!Number.isInteger(wpis.punkty)) {
      bledy.push(`wpis ${etykieta}: punkty muszą być liczbą całkowitą`);
    }
    if (!KATEGORIE_PUNKTOW.includes(wpis.kategoria)) {
      bledy.push(`wpis ${etykieta}: nieznana kategoria "${wpis.kategoria}"`);
    }
    if (wpis.ekstra !== undefined && !TYPY_EKSTRA.includes(wpis.ekstra)) {
      bledy.push(`wpis ${etykieta}: nieznany typ ekstra "${wpis.ekstra}"`);
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

  if (turniej.kwartaly.length > 0) {
    const posortowane = [...turniej.kwartaly].sort((a, b) => a.start.localeCompare(b.start));
    const pierwszy = posortowane[0];
    const ostatni = posortowane[posortowane.length - 1];

    if (pierwszy.start !== turniej.start) {
      bledy.push(
        `kwartały: luka w pokryciu turnieju przed pierwszym kwartałem (zaczyna się ${pierwszy.start}, turniej ${turniej.start})`,
      );
    }
    if (ostatni.koniec !== turniej.koniec) {
      bledy.push(
        `kwartały: luka w pokryciu turnieju po ostatnim kwartale (kończy się ${ostatni.koniec}, turniej ${turniej.koniec})`,
      );
    }
    for (let i = 0; i < posortowane.length - 1; i++) {
      const a = posortowane[i];
      const b = posortowane[i + 1];
      if (nastepnyDzien(a.koniec) !== b.start) {
        bledy.push(`kwartały: luka w pokryciu turnieju między ${a.id} a ${b.id}`);
      }
    }
  }

  const miejsca = new Set<number>();
  for (const nagroda of nagrody) {
    if (![1, 2, 3].includes(nagroda.miejsce)) {
      bledy.push(`nagroda: nieprawidłowe miejsce ${nagroda.miejsce}, dozwolone 1, 2 lub 3`);
    }
    if (miejsca.has(nagroda.miejsce)) {
      bledy.push(`nagroda: zduplikowane miejsce ${nagroda.miejsce}`);
    }
    miejsca.add(nagroda.miejsce);
  }

  return bledy;
}
