import type { ProjectStatus } from "@/types";

const STYLES: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  active: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  paused: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  archived: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const style = STYLES[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium capitalize ${style.bg} ${style.text}`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${style.dot}`}
      />
      {status}
    </span>
  );
}
