# Project Hub Lite — starter

This folder is the **official starter** for the Round 1 take-home. Read the full assignment here: **[`../assignment-brief.md`](../assignment-brief.md)**.

In real systems we often ship **micro frontends** and a **design system as a separate package**; here, `src/ui-stub/` mimics consuming that shared module locally.

## Quick start

```bash
npm install
npm run dev
```

```bash
npm test
```

Use **Node 20+** (see `.nvmrc`).

## What is included

- Vite + React 18 + TypeScript
- Mock data: `src/data/projects.json` (includes `tags: string[]` per project)
- Stub UI primitives: `src/ui-stub/` (import from `@/ui-stub`)
- Vitest + React Testing Library (`npm test`)
- **Tailwind CSS** — `tailwindcss`, `postcss`, `autoprefixer`; `tailwind.config.js` and `postcss.config.js` at the project root; `src/index.css` includes `@tailwind` directives. Optional **bonus** per the assignment brief; you can keep using `App.css` / `ui-stub.css` only if you prefer.
- A minimal `App.tsx` so the app runs; **replace** it with your solution per the brief

## Path alias

`@/` maps to `src/` (see `vite.config.ts` and `tsconfig.json`).

## Version history

As you implement the assignment, preserve your work in **meaningful chunks** over the course of the exercise—**not** one monolithic drop of the entire solution at the end. Use whatever workflow you prefer; the goal is a history that reflects how the app evolved.