import { computed, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { DANE } from './dane';
import { TERAZ } from './teraz';
import type {
  DaneTurnieju,
  Material,
  MiesiacTurnieju,
  Wpis,
  Zastep,
} from './model/turniej.model';

/** Lets tests swap the imported JSON for a fixture. */
export const DANE_TOKEN = new InjectionToken<DaneTurnieju>('DANE', {
  providedIn: 'root',
  factory: () => DANE,
});

export type OkresFiltru =
  | { rodzaj: 'caly' }
  | { rodzaj: 'kwartal'; id: string }
  | { rodzaj: 'miesiac'; iso: string };

export interface PozycjaRankingu {
  zastep: Zastep;
  suma: number;
  wpisy: Wpis[];
  miejsce: number;
  /** 0–100, width of the bar relative to the leader. */
  procentLidera: number;
}

@Injectable({ providedIn: 'root' })
export class TurniejStore {
  private readonly dane = inject(DANE_TOKEN);
  private readonly teraz = inject(TERAZ);

  readonly turniej = signal(this.dane.turniej).asReadonly();
  readonly zastepy = signal(this.dane.zastepy).asReadonly();
  readonly wpisy = signal(this.dane.wpisy).asReadonly();
  readonly inspiracje = signal(this.dane.inspiracje).asReadonly();
  readonly zadania = signal(this.dane.zadania).asReadonly();
  readonly zasady = signal(this.dane.zasady).asReadonly();
  readonly nagrody = signal(this.dane.nagrody).asReadonly();
  readonly materialy = signal(this.dane.materialy).asReadonly();

  /** The regulations document, linked from the Zasady page. Found by its fixed id. */
  readonly regulamin = computed<Material | null>(
    () => this.materialy().find((material) => material.id === 'regulamin') ?? null,
  );

  private readonly okresWewnetrzny = signal<OkresFiltru>({ rodzaj: 'caly' });
  readonly okres = this.okresWewnetrzny.asReadonly();

  readonly miesiace = computed<MiesiacTurnieju[]>(() =>
    this.turniej().kwartaly.flatMap((kwartal) => kwartal.miesiace),
  );

  readonly wpisyOkresu = computed<Wpis[]>(() => {
    const okres = this.okresWewnetrzny();
    const wpisy = this.wpisy();

    if (okres.rodzaj === 'caly') {
      return wpisy;
    }
    if (okres.rodzaj === 'miesiac') {
      return wpisy.filter((wpis) => wpis.data.startsWith(okres.iso));
    }
    const kwartal = this.turniej().kwartaly.find((k) => k.id === okres.id);
    if (!kwartal) {
      return [];
    }
    // ISO dates compare correctly as strings; no Date, no timezones.
    return wpisy.filter((wpis) => wpis.data >= kwartal.start && wpis.data <= kwartal.koniec);
  });

  readonly maksSuma = computed(() => {
    const sumy = this.sumy();
    let maks = 0;
    for (const suma of sumy.values()) {
      if (suma > maks) {
        maks = suma;
      }
    }
    return maks;
  });

  readonly ranking = computed<PozycjaRankingu[]>(() => {
    const sumy = this.sumy();
    const wpisyPerZastep = this.wpisyPerZastep();
    const maks = this.maksSuma();

    const posortowane = [...this.zastepy()].sort((a, b) => {
      const roznica = (sumy.get(b.id) ?? 0) - (sumy.get(a.id) ?? 0);
      return roznica !== 0 ? roznica : a.nazwa.localeCompare(b.nazwa, 'pl');
    });

    let poprzedniaSuma: number | null = null;
    let poprzednieMiejsce = 0;

    return posortowane.map((zastep, indeks) => {
      const suma = sumy.get(zastep.id) ?? 0;
      const miejsce = suma === poprzedniaSuma ? poprzednieMiejsce : indeks + 1;
      poprzedniaSuma = suma;
      poprzednieMiejsce = miejsce;

      return {
        zastep,
        suma,
        wpisy: wpisyPerZastep.get(zastep.id) ?? [],
        miejsce,
        procentLidera: maks > 0 ? Math.max(0, Math.round((suma / maks) * 100)) : 0,
      };
    });
  });

  readonly nagrodyDostepne = computed(() => this.nagrody().length > 0);

  readonly aktualnyMiesiac = computed<MiesiacTurnieju | null>(() => {
    const dzis = this.teraz();
    const turniej = this.turniej();
    if (dzis < turniej.start || dzis > turniej.koniec) {
      return null;
    }
    return this.miesiace().find((miesiac) => dzis.startsWith(miesiac.iso)) ?? null;
  });

  ustawOkres(okres: OkresFiltru): void {
    this.okresWewnetrzny.set(okres);
  }

  private readonly wpisyPerZastep = computed(() => {
    const mapa = new Map<string, Wpis[]>();
    for (const wpis of this.wpisyOkresu()) {
      const lista = mapa.get(wpis.zastepId);
      if (lista) {
        lista.push(wpis);
      } else {
        mapa.set(wpis.zastepId, [wpis]);
      }
    }
    for (const lista of mapa.values()) {
      lista.sort((a, b) => b.data.localeCompare(a.data));
    }
    return mapa;
  });

  private readonly sumy = computed(() => {
    const mapa = new Map<string, number>();
    for (const zastep of this.zastepy()) {
      mapa.set(zastep.id, 0);
    }
    for (const wpis of this.wpisyOkresu()) {
      mapa.set(wpis.zastepId, (mapa.get(wpis.zastepId) ?? 0) + wpis.punkty);
    }
    return mapa;
  });
}
