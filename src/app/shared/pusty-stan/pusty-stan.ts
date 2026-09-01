import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-pusty-stan',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-lg border border-dashed border-warstwica p-6">
      <p class="font-naglowek text-lg">{{ naglowek() }}</p>
      <p class="mt-1 text-sm text-atrament-slaby">{{ tresc() }}</p>
    </div>
  `,
})
export class PustyStan {
  readonly naglowek = input.required<string>();
  readonly tresc = input.required<string>();
}
