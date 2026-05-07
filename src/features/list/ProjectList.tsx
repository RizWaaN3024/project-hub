import { Stack, Text } from "@/ui-stub";
import type { Project } from "@/types";
import { ProjectListItem } from "./ProjectListItem";

type Props = {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

export function ProjectList({ projects, selectedId, onSelect }: Props) {
  if (projects.length === 0) {
    return (
      <section aria-label="Projects" className="rounded-md border border-slate-200 bg-white p-6 text-center">
        <Text tone="muted">No projects match your filters.</Text>
      </section>
    );
  }

  return (
    <section aria-label="Projects">
      <Stack direction="column">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            isSelected={project.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </Stack>
    </section>
  );
}
