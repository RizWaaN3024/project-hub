import { useEffect, useRef } from "react";
import { Pencil, X } from "lucide-react";
import { Text } from "@/ui-stub";
import type { Project } from "@/types";
import { StatusBadge } from "@/features/shared/StatusBadge";

type Props = {
  project: Project;
  onClose: () => void;
  onEdit: (id: string) => void;
};

export function ProjectDetail({ project, onClose, onEdit }: Props) {
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
        className="detail-panel absolute right-0 top-0 flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
      >
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="mb-2">
              <StatusBadge status={project.status} />
            </div>
            <Text
              as="h2"
              id="detail-title"
              tone="title"
              className="!mb-0 break-words"
            >
              {project.title}
            </Text>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(project.id)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <Pencil aria-hidden="true" className="h-3.5 w-3.5 text-slate-500" />
              <span>Edit</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close detail panel"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 sm:px-6">
          <Text as="p" id="detail-description" tone="body">
            {project.description}
          </Text>

          <dl className="mt-5 grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1.5 text-sm">
            <dt className="font-medium text-slate-700">Owner</dt>
            <dd className="text-slate-600">{project.owner}</dd>
            <dt className="font-medium text-slate-700">Updated</dt>
            <dd className="text-slate-600">
              <time dateTime={project.updatedAt}>
                {new Date(project.updatedAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
            </dd>
          </dl>

          <div className="mt-5">
            <span className="text-sm font-medium text-slate-700">Tags</span>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
