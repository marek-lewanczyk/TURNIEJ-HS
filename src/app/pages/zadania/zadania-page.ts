import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-zadania-page',
  templateUrl: './zadania-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZadaniaPage {
  protected readonly store = inject(TurniejStore);
}
