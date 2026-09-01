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
