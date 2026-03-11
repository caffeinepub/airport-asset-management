import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChevronRight,
  Package,
  TrendingUp,
  UserCheck,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useMemo } from "react";
import { StatCardSkeleton } from "../components/LoadingState";
import { StatusBadge } from "../components/StatusBadge";
import { useAssetStats, useListAssets } from "../hooks/useQueries";
import {
  categoryLabel,
  formatCurrency,
  formatTimestamp,
} from "../utils/formatters";

interface DashboardPageProps {
  onNavigateToAssets: () => void;
  onNavigateToAsset: (id: bigint) => void;
}

export function DashboardPage({
  onNavigateToAssets,
  onNavigateToAsset,
}: DashboardPageProps) {
  const { data: stats, isLoading: statsLoading } = useAssetStats();
  const { data: assets, isLoading: assetsLoading } = useListAssets();

  // Sort by most recently added (by id, higher = newer)
  const recentAssets = useMemo(() => {
    if (!assets) return [];
    return [...assets].sort((a, b) => (a.id > b.id ? -1 : 1)).slice(0, 5);
  }, [assets]);

  const statCards = [
    {
      label: "Total Assets",
      value: stats ? Number(stats.total).toString() : "—",
      icon: Package,
      color: "text-primary",
      bg: "bg-primary/8",
    },
    {
      label: "Under Maintenance",
      value: stats ? Number(stats.underMaintenance).toString() : "—",
      icon: Wrench,
      color: "text-[oklch(var(--status-maintenance))]",
      bg: "bg-[oklch(var(--status-maintenance-bg))]",
    },
    {
      label: "Assigned",
      value: stats ? Number(stats.assigned).toString() : "—",
      icon: UserCheck,
      color: "text-[oklch(var(--status-active))]",
      bg: "bg-[oklch(var(--status-active-bg))]",
    },
    {
      label: "Recently Added",
      value: stats ? Number(stats.recentlyAdded).toString() : "—",
      icon: TrendingUp,
      color: "text-sidebar-primary",
      bg: "bg-sidebar-primary/10",
    },
  ];

  return (
    <div className="space-y-7" data-ocid="dashboard.page">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Overview of all airport assets and current status
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsLoading
          ? ["a", "b", "c", "d"].map((k) => <StatCardSkeleton key={k} />)
          : statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.06, duration: 0.3 }}
                  className="bg-card border border-border rounded-xl p-5 shadow-xs hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      {card.label}
                    </p>
                    <div
                      className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center`}
                    >
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                  </div>
                  <p className="font-display text-3xl font-bold text-foreground">
                    {card.value}
                  </p>
                </motion.div>
              );
            })}
      </div>

      {/* Recent assets */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-semibold text-foreground">
              Recent Assets
            </h2>
            <p className="text-xs text-muted-foreground">
              Latest additions to the inventory
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToAssets}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
          >
            View all
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {assetsLoading ? (
          <div className="p-5 space-y-3">
            {["a", "b", "c", "d", "e"].map((k) => (
              <div key={k} className="flex gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : recentAssets.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-12 text-center"
            data-ocid="dashboard.empty_state"
          >
            <Package className="w-8 h-8 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-muted-foreground">
              No assets yet
            </p>
            <p className="text-xs text-muted-foreground/60">
              Assets will appear here once added
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pl-5">
                  Name
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Category
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Status
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Cost
                </TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Added
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentAssets.map((asset, idx) => (
                <TableRow
                  key={asset.id.toString()}
                  data-ocid={`asset.row.item.${idx + 1}`}
                  className="cursor-pointer hover:bg-muted/40 transition-colors"
                  onClick={() => onNavigateToAsset(asset.id)}
                >
                  <TableCell className="pl-5">
                    <p className="font-medium text-sm text-foreground">
                      {asset.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {asset.serialNumber}
                    </p>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {categoryLabel(asset.category)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={asset.status} />
                  </TableCell>
                  <TableCell className="text-sm text-foreground font-medium">
                    {formatCurrency(asset.cost)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatTimestamp(asset.purchaseDate)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
