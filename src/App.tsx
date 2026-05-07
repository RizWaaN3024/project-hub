import { useEffect, useMemo } from "react";
import projectsData from "./data/projects.json";
import type { Project } from "./types";
import { Button, Text } from "@/ui-stub";
import { useUrlState } from "@/hooks/useUrlState";
import { useProjects } from "@/hooks/useProjects";
import { ProjectList } from "@/features/list/ProjectList";
import { ProjectListSkeleton } from "@/features/list/ProjectListSkeleton";
import { EmptyState } from "@/features/list/EmptyState";
import { Filters } from "@/features/list/Filters";
import { ProjectDetail } from "@/features/detail/ProjectDetail";
import { CopyLinkButton } from "@/features/shared/CopyLinkButton";
import "./App.css";

const projects = projectsData as Project[];

export default function App() {
  const { state, setState } = useUrlState();
  const { data: filtered, loading, error, retry } = useProjects(
    state.q,
    state.status,
    state.tags,
  );
  const selected = projects.find((p) => p.id === state.selected) ?? null;

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tags) set.add(t);
    return Array.from(set).sort();
  }, []);

  const isInitialLoad = loading && filtered.length === 0 && !error;
  const isEmpty = !loading && !error && filtered.length === 0;
  const showList = !isInitialLoad && !error && filtered.length > 0;

  const clearFilters = () =>
    setState({ q: "", status: null, tags: [] });

  // Global keyboard shortcuts:
  //   "/"  → focus search (when not typing and panel is closed)
  //   Esc  → close detail panel (works even from inside an input)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTypingInInput =
        !!target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (e.key === "Escape") {
        if (state.selected) {
          e.preventDefault();
          setState({ selected: null });
        }
        return;
      }

      if (isTypingInInput) return;

      if (
        e.key === "/" &&
        !state.selected &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.altKey
      ) {
        e.preventDefault();
        const input = document.getElementById(
          "filter-search",
        ) as HTMLInputElement | null;
        if (input) {
          input.focus();
          input.select();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [state.selected, setState]);

  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Text as="h1" id="app-title" tone="title" className="!mb-0">
            Project Hub Lite
          </Text>
          <CopyLinkButton />
        </div>
        <Filters state={state} setState={setState} allTags={allTags} />

        {!error && (
          <Text
            tone="muted"
            className="mb-3"
            role="status"
            aria-live="polite"
          >
            {isInitialLoad
              ? "Loading projects"
              : `Showing ${filtered.length} of ${projects.length} projects`}
          </Text>
        )}

        {error && !loading && (
          <div
            role="alert"
            className="mb-3 rounded-md border border-red-200 bg-red-50 p-4"
          >
            <Text as="h2" tone="title" className="!mb-1 text-red-800">
              Couldn't load projects
            </Text>
            <Text tone="body" className="!mb-3 text-red-700">
              {error.message}
            </Text>
            <Button onClick={retry}>Try again</Button>
          </div>
        )}

        {isInitialLoad && <ProjectListSkeleton />}
        {showList && (
          <ProjectList
            projects={filtered}
            selectedId={state.selected}
            onSelect={(id) => setState({ selected: id })}
          />
        )}
        {isEmpty && <EmptyState onClearFilters={clearFilters} />}

        {selected && (
          <ProjectDetail
            project={selected}
            onClose={() => setState({ selected: null })}
          />
        )}
      </main>
    </div>
  );
}
