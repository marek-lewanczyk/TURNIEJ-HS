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
