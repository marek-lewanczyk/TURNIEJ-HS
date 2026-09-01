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
      const kontekst = probne.getContext('webgl2');
      if (!kontekst) {
        return false;
      }
      // This probe context is never rendered to and never disposed by anyone
      // else — release it explicitly instead of letting the canvas (and its
      // GPU-side context) sit around until GC gets to it.
      kontekst.getExtension('WEBGL_lose_context')?.loseContext();
      return true;
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

    // Belt-and-suspenders alongside the try/catch below: three.js's own
    // constructor already throws when context creation fails outright, but
    // a browser can also fire this event as a non-fatal warning while still
    // handing back a (degraded) context, in which case the constructor would
    // not throw at all. Catch that case too before building anything on it.
    let bladTworzeniaKontekstu = false;
    const naBladTworzeniaKontekstu = () => {
      bladTworzeniaKontekstu = true;
    };
    canvas.addEventListener('webglcontextcreationerror', naBladTworzeniaKontekstu, {
      once: true,
    });

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        canvas,
        antialias: false,
        alpha: false,
        powerPreference: 'low-power',
      });
    } catch {
      canvas.removeEventListener('webglcontextcreationerror', naBladTworzeniaKontekstu);
      this.dziala.set(false);
      return;
    }

    if (bladTworzeniaKontekstu) {
      canvas.removeEventListener('webglcontextcreationerror', naBladTworzeniaKontekstu);
      this.dziala.set(false);
      renderer.forceContextLoss();
      renderer.dispose();
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
      if (this.dziala() && widoczny && !spokojnie && document.visibilityState === 'visible') {
        uchwyt = requestAnimationFrame(klatka);
      } else {
        uchwyt = 0;
      }
    };

    const wznow = () => {
      if (
        !uchwyt &&
        this.dziala() &&
        widoczny &&
        !spokojnie &&
        document.visibilityState === 'visible'
      ) {
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

    // Idempotent: may run once from `onShaderError` below and again from
    // `destroyRef.onDestroy`, or the other way around if the component is
    // torn down first and a queued shader-error callback fires afterwards.
    let posprzatane = false;
    const sprzataj = () => {
      if (posprzatane) {
        return;
      }
      posprzatane = true;
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
      renderer.forceContextLoss();
      renderer.dispose();
    };

    // three.js does not throw when a shader fails to compile/link — it logs
    // to the console and silently continues, which with `alpha: false` and
    // the default clear colour paints an opaque black frame over the whole
    // page (this element sits at `-z-10` but still covers the body
    // background). Assigning this hook is the only way to be told about it;
    // it fires synchronously the first time the broken program is used,
    // i.e. from inside the very first `renderer.render(...)` call below.
    // Disposal is deferred to a microtask so we never dispose the renderer
    // while still inside its own render() call.
    renderer.debug.onShaderError = () => {
      this.dziala.set(false);
      queueMicrotask(sprzataj);
    };

    // One frame always renders, even under prefers-reduced-motion.
    renderer.render(scene, camera);
    wznow();

    this.destroyRef.onDestroy(sprzataj);
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
