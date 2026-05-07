# Debounced URL sync — the stale-flush bug

> Tool: Claude Code (Anthropic VSCode extension). No shareable URL is produced.

---

## Context

After wiring debounced search, the polished empty/error states, and a
`Clear filters` button in both `Filters` and `EmptyState`, I tested the
recovery flow: type a query, then click Clear. The search input cleared
visually for a fraction of a second, then refilled with the previous query.

This was the most consequential bug of the session because the working fix
isn't the obvious one.

## First prompt

> The Clear filters button doesn't clear the search input. State sequence
> as I understand it:
>
> 1. `setState({ q: "" })` → URL drops `q` → `state.q = ""`
> 2. `useEffect` (URL → local sync): `setSearchInput("")`. Input clears. ✓
> 3. `useEffect` (local debounced → URL push): sees `debouncedSearch === "audit"`
>    and `state.q === ""`. They differ. So it pushes `setState({ q: "audit" })`,
>    overwriting the clear.
>
> Is the canonical fix to add a `searchInput === debouncedSearch` guard, so
> the push effect only flushes when the debounce has settled?

## Response excerpt

> Good diagnosis. That guard reads correctly: "only push when the debounce
> has caught up to the latest user input." It works for typing because while
> the user is mid-type, `searchInput` and `debouncedSearch` diverge, so the
> push is suppressed. After the user pauses, they converge, push fires.

I added the guard. Tested. **Bug still present.**

## Second prompt

> Adding `if (debouncedSearch === searchInput && debouncedSearch !== state.q)`
> didn't work. Pre-fix sequence and post-fix sequence look identical at the
> moment of Clear:
>
> - `state.q = ""`, `searchInput = "audit"`, `debouncedSearch = "audit"`.
> - Effect (a) calls `setSearchInput("")`.
> - Effect (b) runs in the SAME commit. Reads `searchInput` from this
>   render's closure — still `"audit"`. So `searchInput === debouncedSearch`
>   evaluates to `true` from stale closure values.
>
> The guard checks the right invariant on the *next* render but the wrong one
> *now*. What's the canonical fix for this — flag, ref, restructure?

## Response excerpt

> Correct read. Two effects in the same commit see the same stale closure.
> `setSearchInput` schedules an update for the *next* render, but effect (b)
> in the *current* commit closes over the pre-update value. The guard is
> structurally insufficient.
>
> Cleanest fix: a `useRef` flag set by the URL→local sync effect and consumed
> (and reset) by the push effect on the next encounter. The flag says "the
> URL just changed externally — push effect, stand down for one cycle."
>
> ```ts
> const skipNextPushRef = useRef(false);
>
> useEffect(() => {
>   setSearchInput(state.q);
>   skipNextPushRef.current = true;
> }, [state.q]);
>
> useEffect(() => {
>   if (skipNextPushRef.current) {
>     skipNextPushRef.current = false;
>     return;
>   }
>   if (debouncedSearch === searchInput && debouncedSearch !== state.q) {
>     setState({ q: debouncedSearch });
>   }
> }, [debouncedSearch, state.q, setState, searchInput]);
> ```
>
> Effects in the same commit run in declaration order. The sync effect
> raises the flag synchronously; the push effect honors it before doing
> anything that uses the stale closure values. After this commit completes,
> the next render lands with `searchInput` actually updated — the flag is
> already cleared, so normal typing→push behavior resumes immediately.

## What I did

Implemented the ref flag. Verified the full matrix:

- Type → wait → URL updates 300ms later. ✓
- Type → click Clear → input clears and stays cleared. ✓
- Type → click Clear from empty state → same. ✓
- Browser back through a typed query → input syncs to URL value. ✓
- Re-typing after Clear → debounced push to URL works on first character. ✓

I also retained the `searchInput === debouncedSearch` guard — it's a
necessary condition (don't push pre-debounce values) even though it's
not sufficient on its own.

## What I'd prompt differently next time

The first prompt accepted the model's first answer too quickly. I should
have asked it to *trace effect ordering inside the same commit* before
implementing — that would have surfaced the closure problem before I wrote
broken code. The lesson: when fixing a race-condition class of bug, ask
for an execution trace of the proposed fix, not just the fix.
