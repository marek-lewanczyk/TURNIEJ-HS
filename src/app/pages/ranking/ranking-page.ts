import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Slupek } from '../../shared/slupek/slupek';
import { TurniejStore, type OkresFiltru } from '../../core/turniej-store';

interface OpcjaFiltru {
  etykieta: string;
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
    { etykieta: 'Cały turniej', okres: { rodzaj: 'caly' } },
    ...this.store.turniej().kwartaly.map((kwartal) => ({
      etykieta: kwartal.nazwa,
      okres: { rodzaj: 'kwartal', id: kwartal.id } as OkresFiltru,
    })),
    ...this.store.miesiace().map((miesiac) => ({
      etykieta: miesiac.nazwa,
      okres: { rodzaj: 'miesiac', iso: miesiac.iso } as OkresFiltru,
    })),
  ]);

  protected readonly pustyRanking = computed(() => this.store.wpisyOkresu().length === 0);

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
