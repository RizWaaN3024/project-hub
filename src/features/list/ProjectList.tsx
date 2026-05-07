import { Stack } from "@/ui-stub";
import type { Project } from "@/types";
import { ProjectListItem } from "./ProjectListItem";

type Props = {
  projects: Project[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
};

export function ProjectList({ projects, selectedId, onSelect, onEdit }: Props) {
  return (
    <section aria-label="Projects">
      <Stack direction="column">
        {projects.map((project) => (
          <ProjectListItem
            key={project.id}
            project={project}
            isSelected={project.id === selectedId}
            onSelect={onSelect}
            onEdit={onEdit}
          />
        ))}
      </Stack>
    </section>
  );
}
