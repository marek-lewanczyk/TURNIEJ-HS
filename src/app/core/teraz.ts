import { InjectionToken } from '@angular/core';

/** Today's date as `YYYY-MM-DD`. Injected so tests can freeze it. */
export const TERAZ = new InjectionToken<() => string>('TERAZ', {
  providedIn: 'root',
  factory: () => () => new Date().toISOString().slice(0, 10),
});
