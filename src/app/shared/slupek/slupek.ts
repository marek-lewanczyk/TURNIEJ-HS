import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import type { PozycjaRankingu } from '../../core/turniej-store';
import { TurniejStore } from '../../core/turniej-store';
import type { KategoriaPunktow, TypEkstra } from '../../core/model/turniej.model';

export const OPIS_EKSTRA: Record<TypEkstra, string> = {
  'list-miesiaca': 'list miesiąca',
  'punkt-prawa': 'punkt Prawa',
  'zadanie-bazy': 'zadanie z bazy',
};

export const OPIS_KATEGORII: Record<KategoriaPunktow, string> = {
  obrzedowosc: 'obrzędowość',
  trop: 'trop',
  rajd: 'rajd',
  biwak: 'biwak',
  zbiorka: 'zbiórka',
  sluzba: 'służba',
  inne: 'inne',
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

    /* The global reduced-motion block in styles.css zeroes animation-duration,
       but that has no effect here: this animation runs on a scroll-driven
       progress timeline (view()), not the document's time timeline, so its
       keyframe position is a function of scroll progress within
       animation-range, never of wall-clock duration. Zeroing the duration
       only makes each frame instantaneous — it does not stop the timeline
       from mapping scroll position to keyframe progress. The animation must
       be neutralised at its source instead: drop the timeline entirely and
       pin the element at its resting (fully revealed) transform. */
    @media (prefers-reduced-motion: reduce) {
      .belka {
        animation: none;
        animation-timeline: none;
        transform: none;
      }
    }

    /* A plain CSS transition on the document time timeline, unlike .belka
       above — the global reduced-motion block's transition-duration
       override is sufficient here, no component-local escape hatch needed.

       Authored as plain CSS rather than a Tailwind group-open utility: this
       project's Tailwind build never emitted a rule for the group-open
       variant paired with an arbitrary property, and separately, Tailwind's
       built-in "rotate" utility family sets the standalone CSS "rotate"
       property (Transforms Level 2) rather than "transform" — observed not
       to animate on this SVG icon in the automated browser check used to
       verify this component, unlike a plain HTML element with the same
       rule. The long-supported "transform" property showed neither gap, so
       the open-state rule below reads the "open" attribute directly instead
       of going through the "group" class on <details>. */
    .chevron {
      transition: transform 200ms var(--ease-teren);
    }

    details[open] .chevron {
      transform: rotate(90deg);
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
          <span class="chevron inline-flex h-4 w-4 shrink-0 text-atrament-slaby" aria-hidden="true">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
        </div>

        <div class="mt-2 ml-11 h-2 rounded-full bg-papier-cien">
          <div
            data-belka
            class="belka h-full rounded-full"
            aria-hidden="true"
            [style.--pct.%]="pozycja().procentLidera"
            [style.background-color]="'var(--color-' + pozycja().zastep.barwa + ')'"
          ></div>
        </div>
      </summary>

      <div class="mt-4 ml-11 space-y-3">
        @if (dolaczylPozniej()) {
          <p class="text-xs text-atrament-slaby">
            Dołączył do turnieju {{ pozycja().zastep.dolaczyl }}.
          </p>
        }
        @for (wpis of pozycja().wpisy; track wpis.id) {
          <div class="flex gap-3 text-sm">
            <span class="w-24 shrink-0 tabular-nums text-atrament-slaby">{{ wpis.data }}</span>
            <span class="flex-1">
              {{ wpis.tytul }}
              <span class="ml-1 rounded border border-warstwica px-1.5 py-0.5 text-xs text-atrament-slaby"
                >{{ opisKategorii[wpis.kategoria] }}</span
              >
              @if (wpis.ekstra) {
                <span class="ml-1 rounded bg-zloto/30 px-1.5 py-0.5 text-xs"
                  >ekstra: {{ opisEkstra[wpis.ekstra] }}</span
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
  private readonly store = inject(TurniejStore);

  readonly pozycja = input.required<PozycjaRankingu>();

  protected readonly opisEkstra = OPIS_EKSTRA;
  protected readonly opisKategorii = OPIS_KATEGORII;

  /** True when the patrol joined after the tournament's own start date —
   *  a `dolaczyl` equal to the start says nothing worth surfacing. */
  protected readonly dolaczylPozniej = computed(
    () => this.pozycja().zastep.dolaczyl > this.store.turniej().start,
  );
}
