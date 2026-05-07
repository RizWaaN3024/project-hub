# Stale-async cancellation + RTL test design

> Tool: Claude Code (Anthropic VSCode extension). No shareable URL is produced.

---

## Context

The brief calls out stale-async explicitly: *"ignore or cancel results that
no longer match the current filters (no flicker from late responses)."*
This is the highest-leverage technical item in the assignment, and the
design of the simulated `fetchProjects` API needed to mirror what real code
would look like.

## Prompt

> I need to wrap `filterProjects` in a simulated async API for the loading
> /error/empty states the brief asks for. The simulation needs to expose the
> stale-async race convincingly enough that I can both (a) demonstrate it in
> the browser and (b) write a deterministic RTL test for it.
>
> Two cancellation primitives I'm choosing between:
>
> 1. `AbortController` — pass `signal` into the fetch, listener rejects on
>    abort. Mirrors real `fetch()` ergonomics.
> 2. Request-id counter — increment per call, drop late results whose id
>    isn't the latest.
>
> Which is more appropriate for an interview-grade submission, and how does
> the choice affect testability?

## Response excerpt

> AbortController is the right call:
>
> 1. It is the standard primitive for cancellation on the web platform.
>    Reviewers expect to see it; using a hand-rolled counter signals
>    unfamiliarity with the modern API.
> 2. It carries over verbatim to a real `fetch()` (just pass `signal` into
>    `fetch(url, { signal })`). The counter pattern would have to be
>    rewritten when migrating to a real network call.
> 3. Testability is the same or better: you can mock `fetchProjects` with
>    `mockImplementationOnce` and have the mock honor the `signal` —
>    that's exactly what production code does, so the test is realistic.
>
> The shape:
>
> ```ts
> function fetchProjects(filters, signal) {
>   return new Promise((resolve, reject) => {
>     const id = setTimeout(() => {
>       if (signal.aborted) return;
>       resolve(filterProjects(allProjects, filters));
>     }, randomDelay());
>     signal.addEventListener("abort", () => {
>       clearTimeout(id);
>       reject(new DOMException("Aborted", "AbortError"));
>     });
>   });
> }
> ```
>
> Inside the consumer hook, the cleanup function calls `controller.abort()`.
> The `.catch` filters `AbortError` and ignores it silently — without that
> filter, every filter change flashes an error.

## What I did

Implemented `src/data/fakeApi.ts` and `src/hooks/useProjects.ts` per the
shape above. Verified live by adding a temporary `console.log` inside the
hook's `.then`, typing five characters rapidly in search, and confirming
that exactly **one** "✓ resolved" log fired (for the latest query) — not
five. The intermediate fetches were aborted and their `.then` never ran.
Removed the log before commit.

---

## RTL test for stale-async

The harder part was making this race testable without flakiness.

## Prompt (test design)

> I want one RTL test that proves the stale-async guard works. The test
> needs to:
>
> - Start a fetch (filter A) that does NOT resolve immediately.
> - Trigger a filter change (filter B) — this aborts A's controller.
> - Resolve B's promise; the list should render B's data.
> - Try to resolve A's promise. The promise was already rejected by abort,
>   so this should be a no-op — the list must NOT update with stale data.
>
> What's the cleanest way to expose per-call resolution control to the
> test, and what does the abort listener inside the mocked promise need to
> look like?

## Response excerpt

> Use `vi.mocked(fetchProjects).mockImplementationOnce(...)` twice — once
> per fetch you want to control. Each mock returns a Promise whose
> `resolve` is captured into a test-local variable, and which honors the
> abort signal:
>
> ```ts
> let resolveFirst, resolveSecond;
> vi.mocked(fetchProjects)
>   .mockImplementationOnce((_filters, signal) =>
>     new Promise((resolve, reject) => {
>       resolveFirst = resolve;
>       signal.addEventListener("abort", () =>
>         reject(new DOMException("Aborted", "AbortError"))
>       );
>     }))
>   .mockImplementationOnce(/* same shape, captures resolveSecond */);
> ```
>
> The abort listener mirrors real `fakeApi`. When `useProjects`'s effect
> cleanup runs `controller.abort()`, the first mock's listener fires
> reject. The promise becomes rejected. Calling `resolveFirst()` later is
> a no-op — fulfilled-after-rejection is silently discarded. That's
> exactly what we want.
>
> The pivotal assertion: after resolving B, render shows B's data. After
> attempting to resolve A, render *still* shows B's data — never A's.

## What I did

Wrote the test exactly as described. Also added a `default` mock in
`beforeEach` that forwards to `filterProjects` instantly, so the other two
RTL tests (debounce, deep-link) get fast deterministic resolution without
each having to mock per-test. Suite runs in under 200 ms.

## What I'd prompt differently next time

I asked for the design before writing the test, which was right. What I'd
add: ask for a *failure mode* of the proposed test — "if the abort logic
in `useProjects` were broken, what specifically would this test fail on,
and what would the failure message say?" If the answer is vague, the test
isn't actually verifying the thing it claims to verify.
