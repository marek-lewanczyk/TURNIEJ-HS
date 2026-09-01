import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { PozycjaRankingu } from '../../core/turniej-store';
import type { TypEkstra } from '../../core/model/turniej.model';

const OPIS_EKSTRA: Record<TypEkstra, string> = {
  'list-miesiaca': 'list miesiąca',
  'punkt-prawa': 'punkt Prawa',
  'zadanie-bazy': 'zadanie z bazy',
};

@Component({
  selector: 'app-slupek',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .belka {
      width: var(--pct);
      transform-origin: left center;
      animation: wjazd 900ms var(--ease-teren) both;
      animation-timeline: view();
      animation-range: entry 0% cover 30%;
    }

    @keyframes wjazd {
      from {
        transform: scaleX(0);
      }
      to {
        transform: scaleX(1);
      }
    }
  `,
  template: `
    <details class="group border-b border-warstwica py-4">
      <summary class="cursor-pointer list-none">
        <div class="flex items-baseline gap-3">
          <span
            class="w-8 shrink-0 font-naglowek text-lg tabular-nums"
            [class.text-sygnal]="pozycja().miejsce <= 3"
            >{{ pozycja().miejsce }}.</span
          >
          <span class="flex-1 font-medium">
            {{ pozycja().zastep.nazwa }}
            @if (pozycja().miejsce <= 3) {
              <span class="ml-1 text-xs uppercase tracking-wider text-atrament-slaby"
                >podium</span
              >
            }
          </span>
          <span class="font-naglowek text-xl tabular-nums">{{ pozycja().suma }}</span>
          <span class="text-xs text-atrament-slaby">pkt</span>
        </div>

        <div class="mt-2 ml-11 h-2 rounded-full bg-papier-cien">
          <div
            data-belka
            class="belka h-full rounded-full bg-las"
            aria-hidden="true"
            [style.--pct.%]="pozycja().procentLidera"
          ></div>
        </div>
      </summary>

      <div class="mt-4 ml-11 space-y-3">
        @for (wpis of pozycja().wpisy; track wpis.id) {
          <div class="flex gap-3 text-sm">
            <span class="w-24 shrink-0 tabular-nums text-atrament-slaby">{{ wpis.data }}</span>
            <span class="flex-1">
              {{ wpis.tytul }}
              @if (wpis.ekstra) {
                <span class="ml-1 rounded bg-zloto/30 px-1.5 py-0.5 text-xs"
                  >ekstra: {{ opisEkstra()[wpis.ekstra] }}</span
                >
              }
              @if (wpis.opis) {
                <span class="block text-atrament-slaby">{{ wpis.opis }}</span>
              }
            </span>
            <span class="tabular-nums">{{ wpis.punkty > 0 ? '+' : '' }}{{ wpis.punkty }}</span>
          </div>
        } @empty {
          <p class="text-sm text-atrament-slaby">Brak wpisów w tym okresie.</p>
        }
      </div>
    </details>
  `,
})
export class Slupek {
  readonly pozycja = input.required<PozycjaRankingu>();
  protected readonly opisEkstra = computed(() => OPIS_EKSTRA);
}
