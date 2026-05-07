import type { KeyboardEvent } from "react";
import { Card, Text } from "@/ui-stub";
import type { Project } from "@/types";
import { StatusBadge } from "@/features/shared/StatusBadge";

type Props = {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

export function ProjectListItem({ project, isSelected, onSelect }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project.id);
    }
  };

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(project.id)}
      onKeyDown={handleKey}
      className={`relative cursor-pointer overflow-hidden transition hover:-translate-y-px hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 ${
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
        <Text as="h3" tone="title" className="!mb-0">
          {project.title}
        </Text>
        <StatusBadge status={project.status} />
      </div>
      <Text tone="muted" className="!mt-1 line-clamp-1">
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
