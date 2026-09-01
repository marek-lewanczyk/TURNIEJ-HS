import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-ranking-page',
  templateUrl: './ranking-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RankingPage {
  protected readonly store = inject(TurniejStore);
}
