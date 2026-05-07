import { useMemo } from "react";
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

  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <Text as="h1" id="app-title" tone="title">
          Project Hub Lite
        </Text>
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
