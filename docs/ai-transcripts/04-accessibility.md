# Accessibility — focus management, live regions, skip-link

> Tool: Claude Code (Anthropic VSCode extension). No shareable URL is produced.

---

## Context

The brief is explicit on a11y requirements: keyboard reachability, labels,
heading hierarchy, focus rings, and **focus management when opening the
detail region**. I treated accessibility as a first-class constraint
throughout the build rather than a final pass — but the live-region
coordination and skip-link decisions came up as discrete questions.

---

## Focus management for the detail panel

## Prompt

> The detail panel is a sheet (`role="dialog"`, `aria-modal="true"`,
> `aria-labelledby`, `aria-describedby`). The brief requires that focus
> moves to the detail region on selection. I'm planning:
>
> ```tsx
> const ref = useRef<HTMLElement>(null);
> useEffect(() => { ref.current?.focus(); }, [project.id]);
> ```
>
> with `tabIndex={-1}` on the `<aside>`. Two questions:
>
> 1. Why `[project.id]` and not `[]` or `[selected]` — does the dependency
>    matter beyond initial open?
> 2. Should I also return focus to the invoking list item on close, and is
>    that worth the implementation cost in this scope?

## Response excerpt

> 1. The dependency matters because the panel can be re-targeted while
>    open: a deep link could change `?selected=...` via browser back, or
>    the user could pick a different card. Without `[project.id]`, focus
>    would land on the panel once and never re-announce. With it, every
>    project switch re-runs the effect and screen readers re-read the new
>    title. That's the correct behavior.
>
> 2. Returning focus to the invoking element is the proper modal pattern
>    (track `document.activeElement` on open, restore on close). For your
>    scope, skipping it is defensible if you document it. Reviewers who
>    grade a11y deeply will check; documenting it as a known limitation
>    earns more points than half-implementing it.

## What I did

Implemented as described. Documented the close-return-focus omission in
the README's *Focus* section as a known limitation. Verified manually:
opening from a card → focus on dialog; switching to another card while
open → focus re-moves and SR re-reads title.

---

## Live region coordination — `role="status"` vs `role="alert"`

## Prompt

> I have two competing live regions:
>
> - `role="status" aria-live="polite"` for the result count and "Loading
>   projects" message (above the list).
> - `role="alert"` for the error banner (when fetch fails).
>
> Both fire on a state change. With both rendered simultaneously during
> error, screen readers would announce "Error: …" politely AND "Couldn't
> load projects" assertively — duplicate/conflicting announcements.
>
> What's the right pattern? Suppress the polite region on error, or
> suppress the alert when status is already announcing?

## Response excerpt

> Suppress the polite region during error. `role="alert"` exists
> specifically because some content is time-sensitive enough to interrupt;
> a failed fetch qualifies. The polite region should defer to it.
>
> ```tsx
> {!error && (
>   <Text role="status" aria-live="polite">…</Text>
> )}
> {error && !loading && (
>   <div role="alert">…</div>
> )}
> ```
>
> Don't try to swap `role` on a single element dynamically — screen reader
> engines cache the role at creation time, so role swaps are unreliable.
> Two mutually-exclusive elements is the safer pattern.

## What I did

Implemented exactly as suggested. The polite region also correctly
distinguishes "Loading projects" (only shown while `loading && data.length
=== 0`, i.e. first load) from the count message — so subsequent re-fetches
during filter changes don't re-announce "Loading" to screen reader users
on every keystroke.

---

## Skip-link for keyboard users

## Prompt

> Tab order on first page load: Copy Link → Search → Status select → all
> tag chips → Clear filters → first card. That's ~12 tab stops before
> reaching the actual content. WCAG 2.4.1 (Bypass Blocks) wants a way to
> jump past repeated navigation.
>
> I'm planning a skip-link that's `sr-only` by default and reveals on
> focus. Issue: the skip target depends on which state branch is rendered
> — list, skeleton, or empty-state are all different elements. What's the
> stable target?

## Response excerpt

> Wrap the dynamic branches in a stable container with a fixed `id` and
> `tabIndex={-1}`. The skip-link targets the wrapper, which always
> exists, regardless of which branch renders inside.
>
> ```tsx
> <a href="#project-content" className="sr-only focus:not-sr-only …">
>   Skip to projects
> </a>
> …
> <div id="project-content" tabIndex={-1} className="focus:outline-none">
>   {isInitialLoad && <Skeleton />}
>   {showList && <ProjectList />}
>   {isEmpty && <EmptyState />}
> </div>
> ```
>
> `tabIndex={-1}` makes the wrapper programmatically focusable so the
> browser focuses it on link activation. `focus:outline-none` removes the
> default focus ring on the wrapper itself — it isn't a control, the
> child is.

## What I did

Implemented and verified: Tab once on a fresh page reveals the sky-blue
skip-link in the top-left; Enter jumps focus to the content wrapper; next
Tab lands on the first card. Without the skip-link, the same flow takes
~12 Tab presses.

## What I'd prompt differently next time

For each a11y decision I asked one question and accepted the answer.
What I should have done at the end: ask for an a11y *audit* — "given the
final tree, what's the most likely a11y regression, and how would I
catch it?" That meta-question would have surfaced anything I missed
without my having to know what to ask about. The lesson: pair targeted
questions with one wide-net question per concern area.
