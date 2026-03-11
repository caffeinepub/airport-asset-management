import { Skeleton } from "@/components/ui/skeleton";

const SKELETON_ROWS_5 = ["a", "b", "c", "d", "e"];
const SKELETON_ROWS_4 = ["a", "b", "c", "d"];
const SKELETON_ROWS_6 = ["a", "b", "c", "d", "e", "f"];
const SKELETON_ROWS_3 = ["a", "b", "c"];

export { SKELETON_ROWS_4, SKELETON_ROWS_5, SKELETON_ROWS_6, SKELETON_ROWS_3 };

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  const keys =
    rows === 3
      ? SKELETON_ROWS_3
      : rows === 6
        ? SKELETON_ROWS_6
        : SKELETON_ROWS_5;
  return (
    <div className="space-y-2" data-ocid="assets.loading_state">
      {keys.map((k) => (
        <div key={k} className="flex gap-4 px-4 py-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-6 rounded-xl border border-border bg-card space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-32" />
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm text-muted-foreground font-medium">Loading...</p>
      </div>
    </div>
  );
}
