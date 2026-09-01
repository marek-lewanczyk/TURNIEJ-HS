import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/ranking/ranking-page').then((m) => m.RankingPage),
    title: 'Ranking — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'inspiracje',
    loadComponent: () =>
      import('./pages/inspiracje/inspiracje-page').then((m) => m.InspiracjePage),
    title: 'Inspiracje — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'zadania',
    loadComponent: () => import('./pages/zadania/zadania-page').then((m) => m.ZadaniaPage),
    title: 'Zadania — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'zasady',
    loadComponent: () => import('./pages/zasady/zasady-page').then((m) => m.ZasadyPage),
    title: 'Zasady — Turniej Zastępów Starszoharcerskich',
  },
  {
    path: 'nagrody',
    loadComponent: () => import('./pages/nagrody/nagrody-page').then((m) => m.NagrodyPage),
    title: 'Nagrody — Turniej Zastępów Starszoharcerskich',
  },
  { path: '**', redirectTo: '' },
];
