# Project Hub Lite

A small list + detail UI built for the Round 1 take-home. The brief lives in [`../assignment-brief.md`](../assignment-brief.md).

## Run

```bash
nvm use            # Node 20+
npm install
npm run dev        # http://localhost:5173 (or 5174 if 5173 is taken)
```

## Test

```bash
npm test           # one-shot
npm run test:watch # watch mode
```

The suite covers `filterProjects` (7 unit tests), `useDebouncedValue` (3 hook tests with fake timers), and three RTL tests in [`src/App.test.tsx`](src/App.test.tsx) covering debounced search, deep-link hydration, and the stale-async cancellation guard.

---

## Assumptions

- **Multi-tag filtering uses OR within tags, AND across categories.** A project matches if it contains *any* selected tag and *all other* filter categories also match. The alternative (AND-within) is too strict for the dataset and uncommon in production faceted-search UIs.
- **"Side panel" is implemented as a sheet overlay**, not an inline split layout. Both readings of the brief are valid; the sheet pattern (fixed position, backdrop, click-outside-to-close) avoids the list reflowing on every selection. See [`docs/ai-transcripts/01-url-state-architecture.md`](docs/ai-transcripts/01-url-state-architecture.md) for the trade-off discussion.
- **`@testing-library/user-event` was added** as a dev dependency. The brief lists it as an allowed testing utility ("Use fake timers (`vi.useFakeTimers`) or `waitFor` / `userEvent` as needed").
- **`lucide-react` was added** as a runtime dependency for icons (close button, search prefix, copy-link, empty state, status dropdown chevron, edit pencil, plus). Tree-shaken — adds ~5KB gzipped. Inline SVGs and unicode characters were the alternative; using a small icon library is the standard for production React UIs and produces consistent stroke widths and sizing across the app.
- **`sonner` was added** (~3KB gzipped) for transient toast notifications on Create/Edit/Copy success and Copy errors. Persistent failures (`useProjects` fetch errors) stay as inline banners with a Retry action — toasts auto-dismiss and aren't appropriate for failures that need persistent attention.
- **Project store + `localStorage` persistence.** A reactive store ([`src/data/projectStore.ts`](src/data/projectStore.ts)) holds the project list and persists to `localStorage` on every mutation. Components subscribe via `useAllProjects()` (`useSyncExternalStore` under the hood). `fakeApi.fetchProjects` reads the store at fetch time so newly created/edited projects appear in subsequent fetches. localStorage is best-effort — quota errors and disabled storage fall back to in-memory.
- **Editing state lives in React local state, not the URL.** Editing is a transient interaction (you don't share an "edit" URL). View URLs (`?selected=...`) reflect what someone sees; editing is what they do. Conscious scope decision — see [`docs/ai-transcripts/05-crud-architecture.md`](docs/ai-transcripts/05-crud-architecture.md) for the trade-off.
- **Form validation kept inline (one rule: title required).** Considered Zod but skipped — schema-validation overhead isn't justified for a 5-field form with one rule. Would adopt Zod if the form grew to multi-rule cross-field validation or schema-derived types.
- **Random fetch errors at 5% rate** in [`src/data/fakeApi.ts`](src/data/fakeApi.ts) so the error UI is exercised during dev. Refresh a few times to see the error banner.

## Debounce

**300 ms** for the search input. Chosen as the midpoint of the brief's 200–400 ms range — feels responsive while batching typical typing cadence.

## Focus

On selecting a project, focus moves to the detail dialog (`role="dialog"` + `tabIndex={-1}` on the `<aside>`, with a `useEffect` calling `.focus()` on a ref). The effect re-runs when the selected project id changes so screen readers re-announce the new title when switching between projects without closing. A skip-link at the top of the page (visible only on keyboard focus) lets keyboard users bypass filters and jump directly to the project content.

**Known limitations** (documented for honesty rather than pretending they're done):

- No focus *trap* inside the dialog. Tab can escape into the dimmed background. Real production code (or a Radix Dialog primitive) would trap focus until the dialog closes.
- No `inert` attribute on background siblings while the dialog is open. `aria-modal="true"` is the intent declaration; `inert` would be the bulletproof enforcement.
- Focus does not return to the invoking list item on close. The proper modal pattern stores `document.activeElement` on open and restores on close.

## Keyboard shortcuts

- **`/`** — focus the search input. Suppressed when typing in an input or when the detail panel is open.
- **`Esc`** — close the open detail panel. Works from anywhere, including from inside an input.

---

## AI and verification

### Tools

**Claude Code** — the Anthropic VSCode extension. Used throughout the build for architecture discussion (URL-as-state, side-panel UX), debugging (the debounced URL-sync stale-flush bug), test design (RTL patterns with `mockImplementationOnce`, fake timers), and accessibility patterns (live region coordination, skip-link target stability).

### Prompt links

Claude Code (the VSCode extension) does not produce shareable conversation URLs. Per the brief's fallback ("If your tool does not offer URLs, say so briefly and provide a short excerpt or export for those prompts instead"), four curated excerpts are saved under [`docs/ai-transcripts/`](docs/ai-transcripts/):

| File | Topic |
|---|---|
| [`01-url-state-architecture.md`](docs/ai-transcripts/01-url-state-architecture.md) | URL-as-state via `useSyncExternalStore`; sheet vs inline-split decision |
| [`02-debounce-stale-flush.md`](docs/ai-transcripts/02-debounce-stale-flush.md) | Clear-filters bug: first fix didn't work because of stale closures in the same commit; ref-flag fix |
| [`03-async-cancellation-and-tests.md`](docs/ai-transcripts/03-async-cancellation-and-tests.md) | `AbortController` in `useProjects`; deterministic stale-async RTL test |
| [`04-accessibility.md`](docs/ai-transcripts/04-accessibility.md) | Focus management dep on `project.id`, polite-vs-alert live region coordination, skip-link with stable target |
| [`05-crud-architecture.md`](docs/ai-transcripts/05-crud-architecture.md) | Reactive store with subscribe/notify; URL vs local React state for "editing" mode; click-bubble traps on the card Edit button |

Each file is self-contained and includes context, the prompt, the response excerpt, what I did with the advice, and what I'd prompt differently next time.

### Verify

Three things I did not trust until I verified them in the running app:

1. **Stale-async cancellation actually drops late responses.** Added a `console.log` inside `useProjects`'s `.then` handler, typed five characters into search rapidly, and confirmed exactly one log fired (for the latest query) — not five. Confirmed via the same approach that `controller.abort()` on the previous fetch fires the abort listener and rejects the in-flight promise before its `.then` can run. Removed the log before commit. Backed up by the deterministic RTL test in [`src/App.test.tsx`](src/App.test.tsx) ("ignores results from a fetch that was superseded").
2. **Deep-link hydration restores all four URL params on a fresh tab.** Pasted `/?q=audit&status=paused&tag=compliance&selected=audit-log` into a private window. Verified: search input populated, status select set to "paused", "compliance" tag chip in pressed state, detail dialog open to "Portfolio Audit Log" with focus on the dialog container. Backed up by the deep-link RTL test.
3. **Keyboard-only traversal of the full app, end to end.** With the mouse untouched: Tab → skip-link visible → Enter to skip filters → Tab through cards → Enter to open detail → Tab to close button → Esc to close → Tab back to filters. Visible focus ring at every stop. Confirmed `/` to focus search and `Esc` to close from anywhere.

### Course-correct

The most consequential moment was the **Clear-filters bug**. The model's first proposed fix — adding `if (debouncedSearch === searchInput && debouncedSearch !== state.q)` to the push-to-URL effect — sounded right ("only push when the debounce has settled") but didn't work. After clicking Clear, the input would clear briefly then refill with the previous query.

I traced the actual execution and realized why: when `state.q` changes externally, both effects in the same commit run with the same stale closure values. The push effect read `searchInput === "audit"` from the render's closure — even though `setSearchInput("")` had already been scheduled by the sync effect — and the guard evaluated `true`, so the push fired with stale data and overwrote the clear. The structural problem was effects-in-same-commit, not the equality check.

The working fix was a `useRef` flag set by the URL→local sync effect and consumed (then re-armed) by the push effect. Not the most elegant pattern, but it correctly handles the cross-effect synchronization without restructuring into a single combined effect. The full debugging trace lives in [`docs/ai-transcripts/02-debounce-stale-flush.md`](docs/ai-transcripts/02-debounce-stale-flush.md). The lesson I took: when fixing a race-condition class of bug, ask for an execution trace of the proposed fix before implementing — not just the fix itself.

---

## Optional stretch

**Both stretch items shipped: Create + Update via slideovers, persisted to `localStorage`.**

- **Create project** — `+ New project` button in the header (next to Copy link) opens a slideover form. Fields: title (required, validated inline on submit), description, status (Active / Paused / Archived), owner, tags (comma-separated). Submitting saves to the project store, fires a success toast, and refreshes the visible list via `useProjects.retry()`.
- **Update project** — Edit reachable from two places: a small pencil-icon button on every project card (top-right, alongside the status badge), and an `Edit` button in the detail panel header. Both open the same slideover, pre-populated with the project's current values. Saving fires an "updated" toast and refreshes the list. Editing from the detail closes the detail first to avoid stacked sheets.

**How it's structured:**

- A reusable [`<Sheet>`](src/features/shared/Sheet.tsx) primitive wraps the slide-in animation, focus management, body scroll lock, and `Escape`-to-close. Used by both `CreateProjectButton` and `EditProjectSheet`.
- A reusable [`<ProjectForm>`](src/features/projects/ProjectForm.tsx) handles all form state, validation, and submission. Same component for Create (no `initialValues`) and Edit (`initialValues={project}`). The footer (Cancel + submit) is inside the form so it sticks to the bottom of the sheet while the field area scrolls if needed.
- The project store ([`src/data/projectStore.ts`](src/data/projectStore.ts)) is a hand-rolled subscribe/notify pattern — no state library — exposed via `useAllProjects()`. Mutations replace the array (not in-place mutation) so `useSyncExternalStore` detects changes by reference identity.

**To try in the app:**

1. Click `+ New project` → fill in a title and click Create → toast appears, new project at the top of the list.
2. Click any card's pencil icon → edit form opens pre-populated → change a field → Save changes.
3. Open a project's detail panel → click `Edit` in the header → detail closes, edit opens to the same project.
4. Refresh the page → all your changes persist (localStorage).
5. To reset: dev tools → Application → Local Storage → delete `project_hub_lite_projects` → refresh.

## Bonus (Tailwind)

**Yes, used Tailwind for new component styling.** All new UI in `src/features/` and the App shell uses Tailwind utilities (`flex`, `rounded-md`, `focus-visible:outline-2`, `animate-pulse`, `bg-emerald-50`, etc.). The provided `App.css` is retained and extended with two hand-written keyframes (`detail-slide-in`, `detail-backdrop-fade-in`) for the sheet animation, both wrapped in a `prefers-reduced-motion` guard. The provided `ui-stub.css` is untouched — the stub primitives still own their own styles.

A shared `StatusBadge` component in [`src/features/shared/StatusBadge.tsx`](src/features/shared/StatusBadge.tsx) renders the colored-dot status indicator in both the card list and the detail sheet to keep the visual language consistent. Lucide icons (`X`, `Search`, `Link`, `Check`, `SearchX`, `ChevronDown`) replaced earlier inline SVGs and unicode glyphs for predictable sizing and stroke weight across the app.
