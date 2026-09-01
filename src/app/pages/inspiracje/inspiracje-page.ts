import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-inspiracje-page',
  templateUrl: './inspiracje-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspiracjePage {
  protected readonly store = inject(TurniejStore);
}
