import { useEffect, useRef, type KeyboardEvent } from "react";
import { Button, Text } from "@/ui-stub";
import type { Project, ProjectStatus } from "@/types";

type Props = {
  project: Project;
  onClose: () => void;
};

const STATUS_TONE: Record<ProjectStatus, string> = {
  active: "bg-emerald-100 text-emerald-800",
  paused: "bg-amber-100 text-amber-800",
  archived: "bg-slate-200 text-slate-700",
};

export function ProjectDetail({ project, onClose }: Props) {
  const panelRef = useRef<HTMLElement>(null);

  // Move keyboard focus to the panel on open and when a different project
  // is selected (so the new title is announced by screen readers).
  useEffect(() => {
    panelRef.current?.focus();
  }, [project.id]);

  // Lock body scroll while the sheet is open so the dimmed list behind
  // doesn't scroll under the user's wheel/touch.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="detail-backdrop absolute inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
        aria-describedby="detail-description"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="detail-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white p-6 shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        <div className="flex items-start justify-between gap-2">
          <Text as="h2" id="detail-title" tone="title" className="!mb-0">
            {project.title}
          </Text>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close detail panel"
            className="!px-2 !py-0.5 text-lg leading-none"
          >
            ×
          </Button>
        </div>

        <span
          className={`mt-2 inline-block w-fit rounded px-2 py-0.5 text-xs font-medium ${STATUS_TONE[project.status]}`}
        >
          {project.status}
        </span>

        <Text as="p" id="detail-description" tone="body" className="mt-3">
          {project.description}
        </Text>

        <dl className="mt-4 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1 text-sm">
          <dt className="font-medium text-slate-700">Owner</dt>
          <dd className="text-slate-600">{project.owner}</dd>
          <dt className="font-medium text-slate-700">Updated</dt>
          <dd className="text-slate-600">
            <time dateTime={project.updatedAt}>
              {new Date(project.updatedAt).toLocaleDateString()}
            </time>
          </dd>
        </dl>

        <div className="mt-4">
          <span className="text-sm font-medium text-slate-700">Tags</span>
          <div className="mt-1 flex flex-wrap gap-2">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
