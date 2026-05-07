import type { ChangeEvent } from "react";
import { Button, Stack, Text } from "@/ui-stub";
import type { ProjectStatus } from "@/types";
import type { UrlState } from "@/hooks/useUrlState";

type Props = {
  state: UrlState;
  setState: (patch: Partial<UrlState>) => void;
  allTags: string[];
};

const STATUS_OPTIONS: { value: ProjectStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "archived", label: "Archived" },
];

export function Filters({ state, setState, allTags }: Props) {
  const hasActiveFilters =
    state.q.length > 0 || state.status !== null || state.tags.length > 0;

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setState({ q: e.target.value });
  };

  const handleStatus = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setState({ status: value === "" ? null : (value as ProjectStatus) });
  };

  const toggleTag = (tag: string) => {
    const next = state.tags.includes(tag)
      ? state.tags.filter((t) => t !== tag)
      : [...state.tags, tag];
    setState({ tags: next });
  };

  const clear = () => {
    setState({ q: "", status: null, tags: [] });
  };

  return (
    <section
      aria-labelledby="filters-heading"
      className="mb-4 rounded-md border border-slate-200 bg-white p-4"
    >
      <Text as="h2" id="filters-heading" tone="title" className="!mb-3">
        Filters
      </Text>

      <Stack direction="column" className="gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="filter-search" className="text-sm font-medium text-slate-700">
            Search
          </label>
          <input
            id="filter-search"
            type="search"
            value={state.q}
            onChange={handleSearch}
            placeholder="Search title or description"
            className="rounded-md border border-slate-300 px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="filter-status" className="text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="filter-status"
            value={state.status ?? ""}
            onChange={handleStatus}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span id="filter-tags-label" className="text-sm font-medium text-slate-700">
            Tags
          </span>
          <div
            role="group"
            aria-labelledby="filter-tags-label"
            className="flex flex-wrap gap-2"
          >
            {allTags.map((tag) => {
              const active = state.tags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-3 py-1 text-xs transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-500 focus-visible:outline-offset-2 ${
                    active
                      ? "border-sky-500 bg-sky-500 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {hasActiveFilters && (
          <div>
            <Button variant="ghost" onClick={clear}>
              Clear filters
            </Button>
          </div>
        )}
      </Stack>
    </section>
  );
}
