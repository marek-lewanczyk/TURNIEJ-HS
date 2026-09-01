import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { PustyStan } from '../../shared/pusty-stan/pusty-stan';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-nagrody-page',
  imports: [PustyStan],
  templateUrl: './nagrody-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NagrodyPage {
  protected readonly store = inject(TurniejStore);

  protected readonly posortowane = computed(() =>
    [...this.store.nagrody()].sort((a, b) => a.miejsce - b.miejsce),
  );

  protected readonly zapowiedz: readonly (1 | 2 | 3)[] = [1, 2, 3];
}
