# CRUD architecture: project store, edit-state location, click-bubble traps

> Tool: Claude Code (Anthropic VSCode extension). No shareable URL.

---

## Context

After completing the required behavior the brief explicitly grades, I had
time to attempt the optional stretch (Create + Update via slideovers). The
architecture decisions for this step were trickier than the rest of the
build because they had to thread mutation flow through every layer that
already existed without breaking the simulated-async + AbortController
contract that the RTL tests depend on.

---

## Prompt 1 — Data architecture

> The current data layer is read-only: `fakeApi.fetchProjects` filters a
> static JSON array. I need to add Create and Update without:
>
> 1. Breaking the simulated-async + AbortController contract (used in the
>    deep-link and stale-async RTL tests)
> 2. Refactoring `useProjects` to also handle mutations
> 3. Adding a state library
>
> I'm considering a module-level mutable store with a subscribe/notify
> pattern. Components consume via `useSyncExternalStore`.
> `fakeApi.fetchProjects` reads from the store at fetch time. After a
> mutation, the create/edit handler calls `useProjects.retry()` to
> re-fetch with current filters.
>
> Is that the right shape, and what are the gotchas?

## Response excerpt

> Yes, that's the right shape. Three things to lock in:
>
> 1. **The mutation pattern matters.** Replace the array
>    (`allProjects = [project, ...allProjects]`), don't mutate
>    (`allProjects.push(project)`). `useSyncExternalStore` detects
>    changes by reference identity. `.push` keeps the same reference
>    and React doesn't re-render. This is the most common bug in
>    hand-rolled React stores.
>
> 2. **`fakeApi` must read from the store inside the function**, not at
>    module load. Otherwise it captures the initial array forever and
>    new projects never show up.
>
> 3. **localStorage persistence: best-effort.** Wrap loads and writes in
>    try/catch. Quota exceeded, private mode (Safari), corrupted JSON —
>    degrade to in-memory rather than crashing. Don't let telemetry-grade
>    persistence sink the user's session.

I implemented this. Verified by adding a `console.log` inside the store's
`addProject` and confirming both consumers re-rendered (`useAllProjects()`
in App, plus `useProjects` re-fetched via `retry()`).

---

## Prompt 2 — Where does "currently editing" state live?

> Three options for the editing state:
>
> 1. URL: `?edit=<id>`. Fits the URL-as-state pattern we've been
>    consistent about.
> 2. App's local `useState`. Transient.
> 3. Lifted into the project store.
>
> (3) feels wrong — the store is for data, not UI state. (1) vs (2)?
> The URL pattern is consistent but editing isn't really a "view"
> someone shares.

## Response excerpt

> (2) — local React `useState`. URL-as-state is for *views people might
> share or bookmark*. Editing is a transient interaction. A deep link to
> `?edit=foo` would auto-open someone else's edit form on page load,
> which is confusing at best and dangerous at worst (someone shares a
> URL that opens a destructive form on the recipient's machine). View
> URLs reflect what someone *sees*; editing is what they *do*. The
> conceptual cleanness of "URL is state" only applies to the view layer.

That principle — *URL is for views, useState is for transient
interactions* — is now load-bearing for the entire app. Documented in
the README's Assumptions section.

---

## Prompt 3 — Click-bubble traps on the Edit button

> Cards are clickable (open detail panel). I'm adding a small pencil-icon
> Edit button to each card. Concerns:
>
> 1. Click on Edit must NOT bubble to card → no accidental detail open.
> 2. Keyboard activation (Enter/Space on focused Edit) must NOT bubble.
> 3. Visual: shouldn't compete with the status badge.
>
> Plan: pencil icon button next to the status badge, `e.stopPropagation()`
> on click. Always-visible (no hover-reveal trick) since touch devices
> have no hover.

## Response excerpt

> Plan is right. One subtlety: when a button is focused and the user
> presses Enter or Space, TWO bubbling events fire that you have to
> intercept:
>
> - The `keydown` itself bubbles to the card's `onKeyDown` handler.
> - The button's `click` event (which native buttons synthesize from
>   Enter/Space) ALSO bubbles to the card's `onClick`.
>
> `stopPropagation` on `onClick` handles the second case. You also need
> `stopPropagation` on `onKeyDown` (for Enter/Space) to handle the
> first. With both, the card stays inert when keyboard-activating the
> Edit button. Without one, the detail panel opens unexpectedly.

I added both handlers. Verified by tabbing to the Edit button on a card
and pressing Enter — only the edit sheet opened, not the detail panel.
Without the keydown stopPropagation, both opened.

---

## What I'd prompt differently next time

I asked the data-architecture question first, which was right — getting
the layer right before writing UI code saves rewrites. What I should
have asked *at the same time*: **"what about test impact?"** I had to
retrofit a `localStorage.clear()` in `setup.ts` because tests were
reading stale store state across runs (from earlier test mutations into
the persisted store). Asking proactively about the test surface for any
new mutable layer would catch that earlier — before tests started
flaking and I had to debug the cause.
