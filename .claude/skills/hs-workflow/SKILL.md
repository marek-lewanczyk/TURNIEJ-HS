---
name: hs-workflow
description: Use when starting any development task in TURNIEJ-HS — new feature, new or changed shared component, Storybook story, colour/design token work, bug fix, refactor, code review, commit/PR, library or Angular API question, or long token-heavy session. Routes the task through the installed plugin stack (superpowers, compound-engineering, caveman, gstack) and MCP servers (context7, angular-cli), and carries the repo's Storybook and design-token conventions.
---

# LB-FRONT Workflow Router

Standalone Angular 21 app (`turniej-hs`, workspace root = repo root,
`angular.json` at `/…/TURNIEJ-HS/angular.json`). Zoneless, standalone components, esbuild
(`@angular/build`). State: classic @ngrx/store + effects. Design system documented in Storybook (see auto-memory).
This skill is a routing table: match the task type below, invoke the listed skills/tools
**in order**, then work. Process skills fire BEFORE code, always.

All commands below were run and verified in this repo. Paths relative to repo root.

## Hard rules (every task)

1. **Angular code about to be written or reviewed?** First:
   - `mcp__angular-cli__get_best_practices` with `workspacePath: "<repo>/angular.json"`
     (version-matched guide, Angular 21).
   - For concept questions: `mcp__angular-cli__search_documentation`; for snippets:
     `mcp__angular-cli__find_examples`. Prefer these over Grep for framework questions.
2. **Any library/API/SDK question** (even "well-known" ones): context7, never memory.
   `mcp__context7__resolve-library-id` → `mcp__context7__query-docs`, one concept per query.
   Pre-resolved IDs for this repo (verified 2026-07):
   | Lib | ID |
   |---|---|
   | Angular | `/websites/angular_dev` |
   | NgRx (store/effects) | `/ngrx/platform` |
3. **Caveman stays on.** Hooks activate it at session start (`full`). Prose compressed;
   code, commits, PRs, security warnings written normal. Long session / context pressure →
   delegate to `cavecrew-*` subagents (below) instead of reading files into main thread.
4. **Prose to user in Polish**, code/commits in English (user preference, auto-memory).
5. **Writing a Tailwind colour class?** `src/styles/theme.css` sets `--color-*: initial`, which
   removes Tailwind's default palette **and every utility built from it**. A class referencing an
   undefined token (`text-gray-500`, `bg-black/50`) emits **no CSS at all** — no build error, nothing
   in the console. Use an existing semantic token or add one to `@theme`; never a raw hue scale.
   `npm run tokens:check` enforces this and is chained into `npm run lint` and CI. It reads
   `class="…"` and `[class.x]` bindings; it does **not** see string-concatenated class names.

## Routing table

### New feature / behavior change
1. `Skill(superpowers:brainstorming)` — mandatory before any creative work. Produces design doc.
2. Multi-step? `Skill(compound-engineering:ce-plan)` (implementation-ready plan) or
   `Skill(superpowers:writing-plans)` for subagent-driven execution.
3. Isolation needed (parallel work, risky refactor): `Skill(superpowers:using-git-worktrees)`
   or `Skill(compound-engineering:ce-worktree)`.
4. Implementation: `Skill(superpowers:test-driven-development)` — RED/GREEN/REFACTOR.
   Before Angular code: hard rule 1. UI work: also `Skill(angular-developer)`; visual
   direction: `Skill(frontend-design)`.
5. Touching anything under `src/app/shared/**`? Follow the component route below — the story
   is part of the deliverable, not a follow-up.
6. After code: `Skill(compound-engineering:ce-simplify-code)` → review route below.

### New / changed component under `src/app/shared/**`
**A shared component is not done until it has a story.** Coverage is 1:1 today (26 components,
26 `*.stories.ts`) — keep it that way. Feature-local components under `src/app/features/**`
deliberately get **no** stories; `.storybook/main.ts`'s glob is scoped to `shared/` so they cannot
sneak in.

1. Build the component (feature route above, hard rules 1 and 5 apply).
2. Add `<name>.stories.ts` **next to the component**. Title exactly `Atoms/<Name>`,
   `Molecules/<Name>` or `Organisms/<Name>`; every meta carries `tags: ['autodocs']`.
   Props tables come from Compodoc reading the component's JSDoc — so write the JSDoc.
3. **One story per meaningful variant, not one knob-driven story.** Named stories are linkable
   and stable; Controls stay for exploration.
4. Pick the matching pattern:
   - **Config-object input** (most components): declare args flat and assemble the object in a
     local `config()` helper taking `Partial<XConfigInterface>` overrides — otherwise Controls
     shows one useless JSON blob. Every story must build a **fresh** `FormControl`; a shared
     module-scope control leaks touched/dirty state between stories.
   - **Attribute selector** (e.g. `button[app-button]`): cannot render via `component` alone —
     use `render` with an explicit `template`.
   - **Reads root-service state** (toast-container, confirm-dialog): override the service with a
     stub via `applicationConfig` so the rendered state is deterministic.
5. **Asset rule, learned the hard way:** before a story selects a variant resolved through a
   `*_SRC` const map, resolve it to its path and confirm the file exists under `public/`.
   Three broken-image stories shipped because nobody checked.
6. Verify **in a browser**, not just by building. `build-storybook` and `index.json` prove a story
   *registered*, never that it *renders*. Run `npm run storybook`, open
   `http://localhost:6006/iframe.html?id=<story-id>` and read the DOM / computed styles. Story ids
   kebab-case the export name (`DateObject` → `--date-object`) — read real ids from
   `storybook-static/index.json` rather than guessing.
7. Prose (descriptions, MDX) in **English**, matching the JSDoc. Demo content shown *inside*
   components stays **Polish** — it is a Polish-language app.

Do **not** add `import '../src/styles.css'` to `.storybook/preview.ts`. Tailwind reaches the canvas
through `angular.json` `build.options.styles` + `browserTarget`; re-adding the import breaks the build.

### Bug / failing test / unexpected behavior
- Quick inline: `Skill(superpowers:systematic-debugging)` — 4-phase root cause, no fix
  before investigation.
- Full loop to PR: `Skill(compound-engineering:ce-debug)` — reproduce → trace → fix → polish.
- Never propose fix before root cause established.

### Locate code / map directory / "where is X"
`Agent(subagent_type: "caveman:cavecrew-investigator")` — read-only, returns `file:line`
table, ~60% cheaper than Explore. Use instead of grepping in main thread when >2 files involved.

### Small mechanical edit (1–2 files, obvious scope)
`Agent(subagent_type: "caveman:cavecrew-builder")` — refuses 3+ file scope by design;
if it refuses, that's a signal to go through the feature route instead.

### Code review
- Working diff, cheap pass: `Agent(subagent_type: "caveman:cavecrew-reviewer")` or
  `Skill(caveman:caveman-review)` — one line per finding.
- Pre-PR, thorough: `Skill(compound-engineering:ce-code-review)` — multi-agent, report-only.
- Received feedback on your PR: `Skill(superpowers:receiving-code-review)` (verify before
  implementing), then `Skill(compound-engineering:ce-resolve-pr-feedback)`.
- Security audit: `Skill(gstack, args: "run /cso security audit")` — router dispatches to
  gstack's OWASP+STRIDE skill.

### Commit / PR / ship
- Message only: `Skill(caveman:caveman-commit)` — Conventional Commits, matches repo
  history (`fix(auth):`, `feat(emergency-call):`, `chore(release):`).
- Commit+push+PR: `Skill(compound-engineering:ce-commit-push-pr)`.
- Watch PR to merge: `Skill(compound-engineering:ce-babysit-pr)`.
- Before claiming done: `Skill(superpowers:verification-before-completion)` + Verify section below.

### After solving a non-obvious problem
`Skill(compound-engineering:ce-compound)` — capture learning in `docs/solutions/` so next
loop starts smarter. Also update auto-memory if it's a durable project fact.

### Browser QA / visual check
`Skill(compound-engineering:ce-test-browser)` for branch-affected pages, or in-app Browser
pane (`mcp__Claude_Browser__preview_start`) against `npm start` dev server. gstack `/qa`
available via `Skill(gstack, args: "…")` router.

Component-level visual work is faster in Storybook (`npm run storybook`, port 6006) than in the
app. Two gotchas: a stale server may already hold 6006 (`lsof -ti:6006 | xargs kill -9`), and
screenshots occasionally return a cached frame from another page — prefer DOM and
`getComputedStyle` evidence over screenshots when verifying colour.

### Token pressure / long session
- Level up compression: `/caveman ultra`.
- Fat memory file: `Skill(caveman:caveman-compress)` on the file.
- Stats: `Skill(caveman:caveman-stats)`.
- Prefer cavecrew subagents for all exploration; main thread only decides.

### gstack anything (plan reviews, QA, ship pipeline, retro, diagrams)
Only the router is installed as a skill: `Skill(gstack, args: "<what you want>")`.
Individual gstack slash-skills are NOT directly invocable in this project — always go
through the router.

## Verify (run before "done")

```bash
npm run type-check
```
`tsc --noEmit -p tsconfig.app.json`. Covers `src/**/*.ts` including `*.stories.ts`; excludes specs.

```bash
npm run lint
```
Chains `ng lint && npm run tokens:check`, and lints `.storybook/**/*.ts` too. A failure naming a
colour class means that class emits no CSS — fix the class or add the token, never weaken the check.

```bash
npx ng test --watch=false
```
`--watch=false` required — bare `npm test` hangs in watch mode. Vitest prints sub-phase timings
summed across workers, so they legitimately exceed the wall-clock `Duration` line; that is not an anomaly.

```bash
npm run test:scripts
```
Vitest over `scripts/**/*.spec.mjs` via `vitest.scripts.config.mts`. The Angular test builder cannot
see `scripts/` (`tsconfig.spec.json` includes only `src/**/*.spec.ts`), hence the separate config.
Never add a bare `vitest.config.*` — the Angular builder may auto-discover it.

Touched a component, a story or a colour token? Also:

```bash
npm run build-storybook
```
Runs in CI as well. Exit 0 is necessary but **not sufficient** — it proves stories registered, not
that they render. Do the browser check from the component route.
