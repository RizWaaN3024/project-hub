import { useState, type FormEvent } from "react";
import { ChevronDown } from "lucide-react";
import { Button, Text } from "@/ui-stub";
import type { Project, ProjectStatus } from "@/types";

type Props = {
  initialValues?: Project;
  submitLabel?: string;
  onSubmit: (project: Project) => void;
  onCancel: () => void;
};

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

function generateProjectId(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return slug ? `${slug}-${suffix}` : `project-${suffix}`;
}

export function ProjectForm({
  initialValues,
  submitLabel = "Save",
  onSubmit,
  onCancel,
}: Props) {
  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [description, setDescription] = useState(initialValues?.description ?? "");
  const [status, setStatus] = useState<ProjectStatus>(
    initialValues?.status ?? "active",
  );
  const [owner, setOwner] = useState(initialValues?.owner ?? "");
  const [tagsInput, setTagsInput] = useState(initialValues?.tags?.join(", ") ?? "");
  const [submitted, setSubmitted] = useState(false);

  const trimmedTitle = title.trim();
  const titleError = submitted && trimmedTitle.length === 0;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    if (trimmedTitle.length === 0) return;

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const project: Project = {
      id: initialValues?.id ?? generateProjectId(trimmedTitle),
      title: trimmedTitle,
      description: description.trim(),
      status,
      owner: owner.trim() || "Unassigned",
      updatedAt: new Date().toISOString(),
      tags,
    };

    onSubmit(project);
  };

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col" noValidate>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-1">
          <label htmlFor="form-title" className="text-sm font-medium text-slate-700">
            Title <span className="text-red-600" aria-hidden="true">*</span>
          </label>
          <input
            id="form-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-invalid={titleError || undefined}
            aria-describedby={titleError ? "form-title-error" : undefined}
            className={`rounded-md border px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 ${
              titleError ? "border-red-400" : "border-slate-300"
            }`}
          />
          {titleError && (
            <Text tone="muted" id="form-title-error" className="!text-red-600">
              Title is required.
            </Text>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="form-description" className="text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            id="form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="form-status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <div className="relative">
            <select
              id="form-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ProjectStatus)}
              className="w-full appearance-none rounded-md border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="form-owner" className="text-sm font-medium text-slate-700">
            Owner
          </label>
          <input
            id="form-owner"
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Team Aurora"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="form-tags" className="text-sm font-medium text-slate-700">
            Tags
          </label>
          <input
            id="form-tags"
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="metrics, reporting, ads"
            aria-describedby="form-tags-help"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          />
          <Text tone="muted" id="form-tags-help" className="!text-xs">
            Separate tags with commas.
          </Text>
        </div>
      </div>

      <footer className="flex items-center justify-end gap-2 border-t border-slate-200 px-4 py-3 sm:px-6">
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </footer>
    </form>
  );
}
