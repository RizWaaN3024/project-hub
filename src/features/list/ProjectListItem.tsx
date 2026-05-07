import type { KeyboardEvent, MouseEvent } from "react";
import { Pencil } from "lucide-react";
import { Card, Text } from "@/ui-stub";
import type { Project } from "@/types";
import { StatusBadge } from "@/features/shared/StatusBadge";

type Props = {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onEdit: (id: string) => void;
};

export function ProjectListItem({ project, isSelected, onSelect, onEdit }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project.id);
    }
  };

  const handleEditClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(project.id);
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.stopPropagation();
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(project.id)}
      onKeyDown={handleKey}
      className={`group relative cursor-pointer overflow-hidden transition hover:-translate-y-px hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 ${
        isSelected ? "ring-2 ring-sky-500" : ""
      }`}
    >
      {isSelected && (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-1 bg-sky-500"
        />
      )}
      <div className="flex items-start justify-between gap-3">
        <Text as="h3" tone="title" className="!mb-0 min-w-0 flex-1">
          {project.title}
        </Text>
        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={project.status} />
          <button
            type="button"
            onClick={handleEditClick}
            onKeyDown={handleEditKeyDown}
            aria-label={`Edit ${project.title}`}
            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2"
          >
            <Pencil aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <Text tone="muted" className="!mt-1 line-clamp-2 sm:line-clamp-1">
        {project.description}
      </Text>
      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}
