import { useMemo } from "react";
import projectsData from "./data/projects.json";
import type { Project } from "./types";
import { Text } from "@/ui-stub";
import { useUrlState } from "@/hooks/useUrlState";
import { filterProjects } from "@/utils/filterProjects";
import { ProjectList } from "@/features/list/ProjectList";
import { Filters } from "@/features/list/Filters";
import "./App.css";

const projects = projectsData as Project[];

export default function App() {
  const { state, setState } = useUrlState();
  const filtered = filterProjects(projects, state);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const p of projects) for (const t of p.tags) set.add(t);
    return Array.from(set).sort();
  }, []);

  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <Text as="h1" id="app-title" tone="title">
          Project Hub Lite
        </Text>
        <Filters state={state} setState={setState} allTags={allTags} />
        <Text tone="muted" className="mb-3">
          Showing {filtered.length} of {projects.length} projects
        </Text>
        <ProjectList
          projects={filtered}
          selectedId={state.selected}
          onSelect={(id) => setState({ selected: id })}
        />
      </main>
    </div>
  );
}
