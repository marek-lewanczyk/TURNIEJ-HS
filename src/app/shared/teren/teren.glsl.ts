export const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

/**
 * Topographic contour lines over fBm noise.
 * Colours arrive as uniforms so the shader stays in step with the theme tokens.
 */
export const FRAGMENT_SHADER = /* glsl */ `
  precision mediump float;

  varying vec2 vUv;

  uniform float uCzas;
  uniform vec2 uRozmiar;
  uniform vec2 uKursor;
  uniform float uScroll;
  uniform vec3 uKolorTla;
  uniform vec3 uKolorLinii;
  uniform vec3 uKolorAkcentu;
  uniform int uLiczbaObozow;
  uniform vec3 uObozy[16]; // xy = position, z = brightness 0..1

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float suma = 0.0;
    float amplituda = 0.5;
    for (int i = 0; i < 5; i++) {
      suma += amplituda * noise(p);
      p *= 2.02;
      amplituda *= 0.5;
    }
    return suma;
  }

  void main() {
    vec2 uv = vUv;
    float proporcje = uRozmiar.x / max(uRozmiar.y, 1.0);
    vec2 p = vec2(uv.x * proporcje, uv.y);

    // Slow drift plus scroll and a light parallax toward the cursor.
    p += vec2(uCzas * 0.008, uScroll * 0.35);
    p += uKursor * 0.03;

    float wysokosc = fbm(p * 3.2);

    // Contour lines: bands of equal height, anti-aliased by the height gradient.
    float odstep = 0.055;
    float warstwica = abs(fract(wysokosc / odstep) - 0.5);
    float grubosc = fwidth(wysokosc / odstep) * 1.4;
    float linia = 1.0 - smoothstep(0.0, grubosc, warstwica);

    vec3 kolor = mix(uKolorTla, uKolorLinii, linia * 0.55);

    // Camp markers, one soft glow per patrol.
    for (int i = 0; i < 16; i++) {
      if (i >= uLiczbaObozow) {
        break;
      }
      vec2 obozUv = vec2(uObozy[i].x * proporcje, uObozy[i].y);
      float dystans = distance(p - vec2(uCzas * 0.008, uScroll * 0.35) - uKursor * 0.03, obozUv);
      float blask = exp(-dystans * 26.0) * uObozy[i].z;
      kolor = mix(kolor, uKolorAkcentu, clamp(blask, 0.0, 0.8));
    }

    gl_FragColor = vec4(kolor, 1.0);
  }
`;
