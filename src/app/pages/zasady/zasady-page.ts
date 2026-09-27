import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-zasady-page',
  templateUrl: './zasady-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZasadyPage {
  protected readonly store = inject(TurniejStore);

  /** Lettered sub-clauses (`a) …`) are indented under their numbered clause. */
  protected czyPodpunkt(akapit: string): boolean {
    return /^[a-z]\) /.test(akapit);
  }
}
