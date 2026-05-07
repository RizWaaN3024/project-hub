import projectsData from "./data/projects.json";
import type { Project } from "./types";
import { Text } from "@/ui-stub";
import { useUrlState } from "@/hooks/useUrlState";
import { filterProjects } from "@/utils/filterProjects";
import { ProjectList } from "@/features/list/ProjectList";
import "./App.css";

const projects = projectsData as Project[];

export default function App() {
  const { state, setState } = useUrlState();
  const filtered = filterProjects(projects, state);

  return (
    <div className="app-shell">
      <main aria-labelledby="app-title">
        <Text as="h1" id="app-title" tone="title">
          Project Hub Lite
        </Text>
        <Text tone="muted" className="mt-1 mb-4">
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
