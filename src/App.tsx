import { useMemo } from "react";
import projectsData from "./data/projects.json";
import type { Project } from "./types";
import { Button, Text } from "@/ui-stub";
import { useUrlState } from "@/hooks/useUrlState";
import { useProjects } from "@/hooks/useProjects";
import { ProjectList } from "@/features/list/ProjectList";
import { ProjectListSkeleton } from "@/features/list/ProjectListSkeleton";
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
  const statusMessage = isInitialLoad
    ? "Loading projects"
    : error
      ? `Error: ${error.message}`
      : `Showing ${filtered.length} of ${projects.length} projects`;

  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <Text as="h1" id="app-title" tone="title">
          Project Hub Lite
        </Text>
        <Filters state={state} setState={setState} allTags={allTags} />

        <Text
          tone="muted"
          className="mb-3"
          role="status"
          aria-live="polite"
        >
          {statusMessage}
        </Text>

        {error && !loading && (
          <div className="mb-3 rounded-md border border-red-200 bg-red-50 p-3">
            <Text tone="body" className="!mb-2 text-red-800">
              {error.message}
            </Text>
            <Button onClick={retry}>Retry</Button>
          </div>
        )}

        {isInitialLoad ? (
          <ProjectListSkeleton />
        ) : !error ? (
          <ProjectList
            projects={filtered}
            selectedId={state.selected}
            onSelect={(id) => setState({ selected: id })}
          />
        ) : null}

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
