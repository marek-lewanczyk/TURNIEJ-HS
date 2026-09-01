import turniejJson from '../../data/turniej.json';
import zastepyJson from '../../data/zastepy.json';
import punktyJson from '../../data/punkty.json';
import inspiracjeJson from '../../data/inspiracje.json';
import zadaniaJson from '../../data/zadania.json';
import zasadyJson from '../../data/zasady.json';
import nagrodyJson from '../../data/nagrody.json';

import type { DaneTurnieju } from './model/turniej.model';

/**
 * The single seam between hand-edited JSON and typed code.
 * JSON imports widen every string literal, so the cast is unavoidable —
 * value-level correctness is enforced by `waliduj` in `walidacja.spec.ts`.
 */
export const DANE: DaneTurnieju = {
  turniej: turniejJson,
  zastepy: zastepyJson,
  wpisy: punktyJson,
  inspiracje: inspiracjeJson,
  zadania: zadaniaJson,
  zasady: zasadyJson,
  nagrody: nagrodyJson,
} as DaneTurnieju;
