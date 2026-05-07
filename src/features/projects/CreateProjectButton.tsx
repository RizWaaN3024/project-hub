import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Sheet } from "@/features/shared/Sheet";
import { ProjectForm } from "./ProjectForm";
import { addProject } from "@/data/projectStore";
import type { Project } from "@/types";

type Props = {
  onCreated?: (project: Project) => void;
};

export function CreateProjectButton({ onCreated }: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (project: Project) => {
    addProject(project);
    setOpen(false);
    toast.success("Project created", { description: project.title });
    onCreated?.(project);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-sky-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2"
      >
        <Plus aria-hidden="true" className="h-4 w-4" />
        <span>New project</span>
      </button>

      {open && (
        <Sheet
          onClose={() => setOpen(false)}
          title="New project"
          description="Add a project to your hub."
        >
          <ProjectForm
            submitLabel="Create project"
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </Sheet>
      )}
    </>
  );
}
