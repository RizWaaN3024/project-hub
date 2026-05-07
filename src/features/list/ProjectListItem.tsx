import type { KeyboardEvent } from "react";
import { Card, Text } from "@/ui-stub";
import type { Project, ProjectStatus } from "@/types";

type Props = {
  project: Project;
  isSelected: boolean;
  onSelect: (id: string) => void;
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  archived: "bg-slate-200 text-slate-700",
};

export function ProjectListItem({ project, isSelected, onSelect }: Props) {
  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(project.id);
    }
  };

  const selectedRing = isSelected ? "ring-2 ring-sky-500" : "ring-0";

  return (
    <Card
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(project.id)}
      onKeyDown={handleKey}
      className={`cursor-pointer transition hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 ${selectedRing}`}
    >
      <Text as="h3" tone="title">
        {project.title}
      </Text>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <span
          className={`inline-block rounded px-2 py-0.5 text-xs font-medium ${STATUS_TONE[project.status]}`}
        >
          {project.status}
        </span>
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>
    </Card>
  );
}
