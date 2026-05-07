import { Card, Stack } from "@/ui-stub";

type Props = {
  count?: number;
};

export function ProjectListSkeleton({ count = 3 }: Props) {
  return (
    <Stack direction="column" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <div className="animate-pulse">
            <div className="h-5 w-3/5 rounded bg-slate-200" />
            <div className="mt-3 flex flex-wrap gap-2">
              <div className="h-4 w-16 rounded bg-slate-200" />
              <div className="h-4 w-12 rounded bg-slate-100" />
              <div className="h-4 w-20 rounded bg-slate-100" />
              <div className="h-4 w-14 rounded bg-slate-100" />
            </div>
          </div>
        </Card>
      ))}
    </Stack>
  );
}
