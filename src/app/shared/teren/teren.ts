import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';
import { FRAGMENT_SHADER, VERTEX_SHADER } from './teren.glsl';
import { TurniejStore } from '../../core/turniej-store';

const MAKS_OBOZOW = 16;

@Component({
  selector: 'app-teren',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      @if (dziala()) {
        <canvas #plotno class="h-full w-full"></canvas>
      } @else {
        <div data-fallback class="h-full w-full bg-linear-to-b from-papier to-papier-cien"></div>
      }
    </div>
  `,
})
export class Teren {
  private readonly store = inject(TurniejStore);
  private readonly destroyRef = inject(DestroyRef);
  private readonly plotno = viewChild<ElementRef<HTMLCanvasElement>>('plotno');

  /** Flipped to false the moment anything about WebGL disappoints us. */
  protected readonly dziala = signal(this.webglDostepny());

  constructor() {
    afterNextRender(() => this.uruchom());
  }

  private webglDostepny(): boolean {
    if (typeof document === 'undefined') {
      return false;
    }
    try {
      const probne = document.createElement('canvas');
      return probne.getContext('webgl2') !== null;
    } catch {
      return false;
    }
  }

  private uruchom(): void {
    const canvas = this.plotno()?.nativeElement;
    if (!canvas || !this.dziala()) {
      return;
    }

    const spokojnie = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      this.dziala.set(false);
      return;
    }

    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

    const styl = getComputedStyle(document.body);
    // Theme tokens are `oklch()` strings. three.js's `Color` only understands
    // rgb()/hsl()/hex/named CSS colours — it silently ignores `oklch(...)`
    // and leaves the colour white, which would look plausible-but-wrong.
    // Painting the raw CSS colour into a 1x1 canvas and reading the pixel
    // back forces the browser itself to resolve it to concrete sRGB bytes,
    // which `Color` can then parse correctly.
    const proba = document.createElement('canvas');
    proba.width = 1;
    proba.height = 1;
    const kontekst2d = proba.getContext('2d');

    const kolor = (nazwa: string, zapas: string): Color => {
      const wartosc = styl.getPropertyValue(nazwa).trim();
      if (!kontekst2d) {
        return new Color(zapas);
      }
      try {
        // Seed with the fallback first: an invalid `wartosc` is silently
        // ignored by the fillStyle setter, so the seeded colour survives.
        kontekst2d.fillStyle = zapas;
        kontekst2d.fillStyle = wartosc || zapas;
        kontekst2d.fillRect(0, 0, 1, 1);
        const [r, g, b] = kontekst2d.getImageData(0, 0, 1, 1).data;
        return new Color(`rgb(${r}, ${g}, ${b})`);
      } catch {
        return new Color(zapas);
      }
    };

    const obozy = Array.from({ length: MAKS_OBOZOW }, () => new Vector3(0, 0, 0));
    this.rozstawObozy(obozy);

    const material = new ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms: {
        uCzas: { value: 0 },
        uRozmiar: { value: new Vector2(1, 1) },
        uKursor: { value: new Vector2(0, 0) },
        uScroll: { value: 0 },
        uKolorTla: { value: kolor('--color-papier', '#f6f1e7') },
        uKolorLinii: { value: kolor('--color-warstwica', '#d8cdb6') },
        uKolorAkcentu: { value: kolor('--color-las-jasny', '#8fbf9f') },
        uLiczbaObozow: { value: Math.min(this.store.zastepy().length, MAKS_OBOZOW) },
        uObozy: { value: obozy },
      },
    });

    const scene = new Scene();
    scene.add(new Mesh(new PlaneGeometry(2, 2), material));
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const dopasuj = () => {
      const { clientWidth, clientHeight } = canvas;
      renderer.setSize(clientWidth, clientHeight, false);
      material.uniforms['uRozmiar'].value.set(clientWidth, clientHeight);
    };
    dopasuj();

    const naKursor = (zdarzenie: PointerEvent) => {
      material.uniforms['uKursor'].value.set(
        zdarzenie.clientX / innerWidth - 0.5,
        0.5 - zdarzenie.clientY / innerHeight,
      );
    };

    const naScroll = () => {
      const zasieg = Math.max(document.body.scrollHeight - innerHeight, 1);
      material.uniforms['uScroll'].value = scrollY / zasieg;
    };

    let widoczny = true;
    let uchwyt = 0;
    const start = performance.now();

    const klatka = () => {
      material.uniforms['uCzas'].value = (performance.now() - start) / 1000;
      renderer.render(scene, camera);
      if (widoczny && !spokojnie && document.visibilityState === 'visible') {
        uchwyt = requestAnimationFrame(klatka);
      } else {
        uchwyt = 0;
      }
    };

    const wznow = () => {
      if (!uchwyt && widoczny && !spokojnie && document.visibilityState === 'visible') {
        uchwyt = requestAnimationFrame(klatka);
      }
    };

    const obserwator = new IntersectionObserver(([wpis]) => {
      widoczny = wpis.isIntersecting;
      wznow();
    });
    obserwator.observe(canvas);

    const naWidocznosc = () => wznow();
    const naResize = () => {
      dopasuj();
      renderer.render(scene, camera);
    };

    addEventListener('pointermove', naKursor, { passive: true });
    addEventListener('scroll', naScroll, { passive: true });
    addEventListener('resize', naResize);
    document.addEventListener('visibilitychange', naWidocznosc);

    // One frame always renders, even under prefers-reduced-motion.
    renderer.render(scene, camera);
    wznow();

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(uchwyt);
      obserwator.disconnect();
      removeEventListener('pointermove', naKursor);
      removeEventListener('scroll', naScroll);
      removeEventListener('resize', naResize);
      document.removeEventListener('visibilitychange', naWidocznosc);
      material.dispose();
      scene.traverse((obiekt) => {
        if (obiekt instanceof Mesh) {
          obiekt.geometry.dispose();
        }
      });
      renderer.dispose();
    });
  }

  /** Deterministic scatter — same patrol always lands on the same spot. */
  private rozstawObozy(obozy: Vector3[]): void {
    const ranking = this.store.ranking();
    const maks = Math.max(...ranking.map((pozycja) => pozycja.suma), 1);

    ranking.slice(0, MAKS_OBOZOW).forEach((pozycja, indeks) => {
      const kat = (indeks * 2.399963) % (Math.PI * 2);
      const promien = 0.18 + 0.28 * ((indeks % 5) / 5);
      obozy[indeks].set(
        0.5 + Math.cos(kat) * promien,
        0.5 + Math.sin(kat) * promien,
        0.25 + (0.75 * Math.max(pozycja.suma, 0)) / maks,
      );
    });
  }
}
