import { describe, expect, it } from 'vitest';
import { TOKENY_BARW } from './turniej.model';

/**
 * Guards `TOKENY_BARW` against drifting from the `--color-*` tokens declared in
 * `src/styles/theme.css` (see the comment on `TOKENY_BARW` in ./turniej.model.ts).
 *
 * This test cannot read theme.css directly — verified, not assumed:
 *  - `node:fs` needs `@types/node`, which `tsconfig.spec.json` does not install
 *    (its `types` array is `["vitest/globals"]` only) — constraint says not to add it.
 *  - `import tresc from '../../../styles/theme.css?raw'` does NOT yield raw text
 *    under `@angular/build:unit-test`: its stylesheet esbuild plugin intercepts
 *    every `.css`-suffixed specifier by extension regardless of query string and
 *    returns the CSS-Modules locals object for it — empty here, since theme.css
 *    has no class selectors. Confirmed with `typeof tresc === 'object'` and
 *    `JSON.stringify(tresc) === '{}'` at runtime, not a string, so a naive
 *    `.matchAll` over it throws rather than silently passing.
 *  - No `scripts/**\/*.spec.mjs` / plain-Node vitest project exists in this repo
 *    (no `scripts/` directory, no second vitest config, no `test:scripts` in
 *    package.json) to fall back to for an untyped, non-Angular-pipeline read.
 *
 * So this asserts what's readable without a new dependency: `TOKENY_BARW` against
 * a literal mirror of theme.css's token list, kept in this file. It catches
 * `TOKENY_BARW` drifting from that mirror; it does NOT catch theme.css itself
 * drifting from the mirror, which stays a manual-review responsibility for
 * whoever edits either list — hence the loud comments on both.
 */
const TOKENY_TEMATU = [
  'papier',
  'papier-cien',
  'atrament',
  'atrament-slaby',
  'warstwica',
  'las',
  'las-jasny',
  'sygnal',
  'zloto',
];

describe('TOKENY_BARW', () => {
  it('matches the literal mirror of the --color-* tokens declared in theme.css, in both directions', () => {
    expect(new Set(TOKENY_BARW)).toEqual(new Set(TOKENY_TEMATU));
  });
});
