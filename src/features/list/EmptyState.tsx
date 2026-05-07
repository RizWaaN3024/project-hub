import { SearchX } from "lucide-react";
import { Button, Text } from "@/ui-stub";

type Props = {
  onClearFilters: () => void;
};

export function EmptyState({ onClearFilters }: Props) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-6 text-center sm:p-10">
      <div
        aria-hidden="true"
        className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500"
      >
        <SearchX className="h-5 w-5" />
      </div>
      <Text as="h2" tone="title" className="!mb-1">
        No projects match your filters
      </Text>
      <Text tone="muted" className="!mb-4">
        Try removing a filter or clearing them all.
      </Text>
      <Button onClick={onClearFilters}>Clear filters</Button>
    </div>
  );
}
