import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { PustyStan } from '../../shared/pusty-stan/pusty-stan';
import { TurniejStore } from '../../core/turniej-store';

@Component({
  selector: 'app-materialy-page',
  imports: [PustyStan],
  templateUrl: './materialy-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialyPage {
  protected readonly store = inject(TurniejStore);
}
