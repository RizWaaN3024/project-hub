# URL-as-state architecture + side-panel pattern

> Tool: Claude Code (Anthropic VSCode extension). No shareable URL is produced.
> The exchange below is a faithful summary of the prompts and the substance of
> the responses that shaped this submission.

---

## Context

Round 1 take-home, ~30 minutes in. The brief requires `q`, `status`, `tag`, and
`selected` to be reflected in the URL such that refresh and bookmarking restore
the same view. I needed to lock in the state-management approach before writing
any feature code.

## Prompt

> I want URL params (`?q=…&status=…&tag=…&selected=…`) to be the single source
> of truth for filter and selection state. Two options I'm weighing:
>
> 1. `useState` per filter + a `useEffect` that mirrors them to the URL.
> 2. URL is the *only* state. Components read it via `useSyncExternalStore`
>    subscribed to `popstate`.
>
> Concern with (1): two sources of truth → drift on back/forward navigation.
> Concern with (2): `history.replaceState` doesn't fire `popstate`, so writes
> from one component wouldn't notify another.
>
> Is (2) the right call, and what's the canonical way to handle the
> write-notification gap?

## Key parts of the response

- (2) is correct. Avoid the dual-source pattern; URL is the only writable
  store, components are pure readers.
- Use `useSyncExternalStore(subscribe, getSnapshot, getSnapshot)` —
  `getSnapshot` returns `window.location.search`, subscribe listens on both
  `popstate` (browser back/forward) AND a custom `urlstatechange` event.
- The custom event is the canonical fix for the write-notification gap: every
  `setState` in the hook calls `history.replaceState` then dispatches the
  custom event. All `useUrlState` instances re-read.
- Inside `setState`, read the current URL synchronously (not from the closure
  state) so concurrent updates don't race.

## What I did

Implemented `src/hooks/useUrlState.ts` exactly as described above. Verified
manually in browser:

- Manual URL edits → state matches.
- `setState` calls → URL updates, state matches, all consumers re-render.
- Browser back/forward → state reverts.
- Refresh on a deep-linked URL → state hydrates correctly.
- Junk values (e.g. `?status=banana`) → parsed to `null` defensively.

## Side-panel UX — second decision in the same domain

The brief says "side panel next to the list." Two interpretations:

- **Inline split** — list shrinks to share a row with the detail panel.
- **Sheet / overlay** — panel fixed-positions over the right edge with a
  backdrop; list stays put underneath.

I built the inline version first. It worked but felt off — every selection
caused the list to reflow, which read as jarring rather than smooth.

## Prompt (follow-up)

> Built the inline split layout. UX is rough — every card click reflows the
> entire list area. shadcn/Radix `<Sheet>` does a fixed overlay instead. The
> brief allows either reading of "side panel." Which is right for a list+detail
> tool, and what does going to overlay cost me in scope (focus trap, scroll
> lock, etc.)?

## Key parts of the response

- Both readings of "side panel" are defensible; the brief is ambiguous on
  purpose.
- For a small dataset and modern UX expectations, the sheet pattern is
  clearly better — no reflow, more space, the slide-in animation already
  written makes more sense from the screen edge.
- Full Radix-Dialog parity adds: focus trap, `inert` on background siblings,
  precise scroll-lock with scrollbar compensation.
- Cheap-but-defensible scope: `role="dialog"`, `aria-modal="true"`,
  `aria-labelledby` + `aria-describedby`, naive `body { overflow: hidden }`
  scroll-lock, click-on-backdrop-to-close, `Esc` handler. Skip the focus
  trap — document it.

## What I did

Refactored `ProjectDetail` to a fixed-position sheet with backdrop. Kept
`tabIndex={-1}` + `useEffect`-based focus management. Documented the focus
trap and `inert` omissions in the README as known limitations.

## What I'd prompt differently next time

I should have asked the UX-pattern question *before* writing the inline
version — it cost ~30 minutes of refactor I could have avoided. The lesson:
when there's a decision the brief leaves open, surface it explicitly to the
model with the trade-offs, don't pick the path of least resistance and then
re-do it. Write the question, get the comparison, choose with intent.
