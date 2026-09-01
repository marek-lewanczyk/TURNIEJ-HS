import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-nagrody-page',
  templateUrl: './nagrody-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NagrodyPage {
  protected readonly store = inject(TurniejStore);
}
