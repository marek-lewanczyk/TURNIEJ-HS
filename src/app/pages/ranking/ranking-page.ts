import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Slupek } from '../../shared/slupek/slupek';
import { TurniejStore, type OkresFiltru } from '../../core/turniej-store';

/** Polish plural forms of "wpis" for the live-region announcement. */
function odmienWpisy(liczba: number): string {
  const modulo10 = liczba % 10;
  const modulo100 = liczba % 100;
  if (liczba === 1) {
    return 'wpis';
  }
  if (modulo10 >= 2 && modulo10 <= 4 && !(modulo100 >= 12 && modulo100 <= 14)) {
    return 'wpisy';
  }
  return 'wpisów';
}

interface OpcjaFiltru {
  etykieta: string;
  /** Composite of `rodzaj` plus id/iso — `etykieta` alone would collide if a
   *  quarter were ever renamed to match a month name, crashing `@for` with
   *  NG0955 (duplicate track key). */
  klucz: string;
  okres: OkresFiltru;
}

@Component({
  selector: 'app-ranking-page',
  imports: [Slupek],
  templateUrl: './ranking-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingPage {
  protected readonly store = inject(TurniejStore);

  protected readonly opcje = computed<OpcjaFiltru[]>(() => [
    { etykieta: 'Cały turniej', klucz: 'caly', okres: { rodzaj: 'caly' } },
    ...this.store.turniej().kwartaly.map((kwartal) => ({
      etykieta: kwartal.nazwa,
      klucz: `kwartal:${kwartal.id}`,
      okres: { rodzaj: 'kwartal', id: kwartal.id } as OkresFiltru,
    })),
    ...this.store.miesiace().map((miesiac) => ({
      etykieta: miesiac.nazwa,
      klucz: `miesiac:${miesiac.iso}`,
      okres: { rodzaj: 'miesiac', iso: miesiac.iso } as OkresFiltru,
    })),
  ]);

  protected readonly pustyRanking = computed(() => this.store.wpisyOkresu().length === 0);

  /** Announced in a polite live region so a screen-reader user hears that
   *  the list underneath changed when the period filter is pressed. */
  protected readonly komunikatOkresu = computed(() => {
    const etykieta = this.opcje().find((opcja) => this.czyAktywna(opcja.okres))?.etykieta ?? '';
    const liczba = this.store.wpisyOkresu().length;
    const wpisow = odmienWpisy(liczba);
    return `Wybrany okres: ${etykieta}. ${liczba} ${wpisow} w tym okresie.`;
  });

  protected czyAktywna(okres: OkresFiltru): boolean {
    const biezacy = this.store.okres();
    if (biezacy.rodzaj !== okres.rodzaj) {
      return false;
    }
    if (biezacy.rodzaj === 'kwartal' && okres.rodzaj === 'kwartal') {
      return biezacy.id === okres.id;
    }
    if (biezacy.rodzaj === 'miesiac' && okres.rodzaj === 'miesiac') {
      return biezacy.iso === okres.iso;
    }
    return true;
  }

  protected wybierz(okres: OkresFiltru): void {
    this.store.ustawOkres(okres);
  }
}
