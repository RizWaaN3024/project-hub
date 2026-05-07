import { toast } from "sonner";
import { Sheet } from "@/features/shared/Sheet";
import { ProjectForm } from "./ProjectForm";
import { updateProject } from "@/data/projectStore";
import type { Project } from "@/types";

type Props = {
  project: Project;
  onClose: () => void;
  onUpdated?: (project: Project) => void;
};

export function EditProjectSheet({ project, onClose, onUpdated }: Props) {
  const handleSubmit = (updated: Project) => {
    const { id, ...patch } = updated;
    updateProject(id, patch);
    onClose();
    toast.success("Project updated", { description: updated.title });
    onUpdated?.(updated);
  };

  return (
    <Sheet
      onClose={onClose}
      title="Edit project"
      description="Update project details."
    >
      <ProjectForm
        initialValues={project}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Sheet>
  );
}
