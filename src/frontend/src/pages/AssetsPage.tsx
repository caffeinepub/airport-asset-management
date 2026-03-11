import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Filter, Package, Plus, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import { Category, type InternalRole, Status } from "../backend";
import { StatusBadge } from "../components/StatusBadge";
import { AssetFormModal } from "../components/modals/AssetFormModal";
import { useListAssets } from "../hooks/useQueries";
import {
  canWrite,
  categoryLabel,
  formatCurrency,
  formatTimestamp,
  statusLabel,
} from "../utils/formatters";

interface AssetsPageProps {
  userRole?: InternalRole;
  onNavigateToAsset: (id: bigint) => void;
}

const ALL_VALUE = "__all__";

export function AssetsPage({ userRole, onNavigateToAsset }: AssetsPageProps) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_VALUE);
  const [statusFilter, setStatusFilter] = useState<string>(ALL_VALUE);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const isWriter = canWrite(userRole);

  // We'll do client-side filtering for search, use backend for category/status
  const backendCategory =
    categoryFilter !== ALL_VALUE ? (categoryFilter as Category) : null;
  const backendStatus =
    statusFilter !== ALL_VALUE ? (statusFilter as Status) : null;

  const { data: assets, isLoading } = useListAssets(
    backendStatus,
    backendCategory,
  );

  const filtered = useMemo(() => {
    if (!assets) return [];
    if (!search.trim()) return assets;
    const q = search.toLowerCase();
    return assets.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.serialNumber.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        (a.assignedTo ?? "").toLowerCase().includes(q) ||
        a.supplier.toLowerCase().includes(q),
    );
  }, [assets, search]);

  return (
    <div className="space-y-5" data-ocid="assets.page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            Assets
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {assets ? `${assets.length} total assets` : "Loading..."}
          </p>
        </div>
        {isWriter && (
          <Button
            onClick={() => setAddModalOpen(true)}
            data-ocid="asset.add_button"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-ocid="asset.search_input"
            className="pl-9"
            placeholder="Search by name, serial, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40" data-ocid="asset.category.select">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Categories</SelectItem>
              {Object.values(Category).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {categoryLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-ocid="asset.status.select">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_VALUE}>All Statuses</SelectItem>
              {Object.values(Status).map((s) => (
                <SelectItem key={s} value={s}>
                  {statusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-card border border-border rounded-xl overflow-hidden shadow-xs"
        data-ocid="asset.table"
      >
        {isLoading ? (
          <div className="p-5 space-y-3">
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <div key={k} className="flex gap-4">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-16 text-center"
            data-ocid="asset.empty_state"
          >
            <Package className="w-10 h-10 text-muted-foreground/25 mb-3" />
            <p className="text-sm font-semibold text-muted-foreground mb-1">
              No assets found
            </p>
            <p className="text-xs text-muted-foreground/60">
              {search ||
              categoryFilter !== ALL_VALUE ||
              statusFilter !== ALL_VALUE
                ? "Try adjusting your search or filters"
                : "Add your first asset to get started"}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                {[
                  "Name",
                  "Category",
                  "Serial Number",
                  "Status",
                  "Location",
                  "Assigned To",
                  "Purchase Date",
                ].map((col) => (
                  <TableHead
                    key={col}
                    className="text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5"
                  >
                    {col}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((asset, idx) => (
                  <motion.tr
                    key={asset.id.toString()}
                    data-ocid={`asset.row.item.${idx + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="cursor-pointer hover:bg-muted/40 border-b border-border/50 last:border-0 transition-colors"
                    onClick={() => onNavigateToAsset(asset.id)}
                  >
                    <TableCell className="pl-5">
                      <p className="font-medium text-sm text-foreground">
                        {asset.name}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {categoryLabel(asset.category)}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground">
                        {asset.serialNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={asset.status} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-32 truncate">
                      {asset.location}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {asset.assignedTo ?? (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(asset.purchaseDate)}
                    </TableCell>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </TableBody>
          </Table>
        )}
      </div>

      <AssetFormModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </div>
  );
}
