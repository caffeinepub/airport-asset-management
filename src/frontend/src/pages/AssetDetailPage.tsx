import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Building,
  CalendarDays,
  ClipboardCheck,
  DollarSign,
  Edit,
  FileText,
  Hash,
  MapPin,
  RotateCcw,
  Tag,
  Trash2,
  UserPlus,
  Wrench,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Data__3, InternalRole } from "../backend";
import { OutcomeBadge, StatusBadge } from "../components/StatusBadge";
import { AssetFormModal } from "../components/modals/AssetFormModal";
import { AssignAssetModal } from "../components/modals/AssignAssetModal";
import { DeleteAssetModal } from "../components/modals/DeleteAssetModal";
import { InspectionLogModal } from "../components/modals/InspectionLogModal";
import { MaintenanceLogModal } from "../components/modals/MaintenanceLogModal";
import { ReturnAssetModal } from "../components/modals/ReturnAssetModal";
import {
  useAssignmentHistory,
  useGetAsset,
  useInspectionLogs,
  useMaintenanceLogs,
} from "../hooks/useQueries";
import {
  canWrite,
  categoryLabel,
  formatCurrency,
  formatTimestamp,
  formatTimestampFull,
} from "../utils/formatters";

interface AssetDetailPageProps {
  assetId: bigint;
  userRole?: InternalRole;
  onBack: () => void;
}

export function AssetDetailPage({
  assetId,
  userRole,
  onBack,
}: AssetDetailPageProps) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [returnModal, setReturnModal] = useState<{
    open: boolean;
    assignment: Data__3 | null;
  }>({ open: false, assignment: null });
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [inspectionModalOpen, setInspectionModalOpen] = useState(false);

  const isWriter = canWrite(userRole);

  const { data: asset, isLoading: assetLoading } = useGetAsset(assetId);
  const { data: assignments, isLoading: assignmentsLoading } =
    useAssignmentHistory(assetId);
  const { data: maintenanceLogs, isLoading: maintenanceLoading } =
    useMaintenanceLogs(assetId);
  const { data: inspectionLogs, isLoading: inspectionLoading } =
    useInspectionLogs(assetId);

  if (assetLoading) {
    return (
      <div className="space-y-5" data-ocid="asset_detail.page">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div
        className="flex flex-col items-center justify-center py-20 text-center"
        data-ocid="asset_detail.page"
      >
        <p className="text-muted-foreground">Asset not found</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Go back
        </Button>
      </div>
    );
  }

  const infoFields = [
    {
      icon: Hash,
      label: "Serial Number",
      value: <span className="font-mono text-sm">{asset.serialNumber}</span>,
    },
    {
      icon: Tag,
      label: "Category",
      value: categoryLabel(asset.category),
    },
    {
      icon: MapPin,
      label: "Location",
      value: asset.location,
    },
    {
      icon: Building,
      label: "Supplier",
      value: asset.supplier,
    },
    {
      icon: DollarSign,
      label: "Cost",
      value: formatCurrency(asset.cost),
    },
    {
      icon: CalendarDays,
      label: "Purchase Date",
      value: formatTimestamp(asset.purchaseDate),
    },
    ...(asset.assignedTo
      ? [
          {
            icon: UserPlus,
            label: "Assigned To",
            value: asset.assignedTo,
          },
        ]
      : []),
    ...(asset.notes
      ? [
          {
            icon: FileText,
            label: "Notes",
            value: asset.notes,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-5" data-ocid="asset_detail.page">
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Assets
      </button>

      {/* Header card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-card border border-border rounded-xl p-5 shadow-xs"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">
                {asset.name}
              </h1>
              <StatusBadge status={asset.status} />
            </div>
            <p className="text-sm text-muted-foreground">
              {categoryLabel(asset.category)} · Added{" "}
              {formatTimestamp(asset.purchaseDate)}
            </p>
          </div>
          {isWriter && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditModalOpen(true)}
                data-ocid="asset.edit_button"
              >
                <Edit className="w-3.5 h-3.5 mr-1.5" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteModalOpen(true)}
                className="text-destructive border-destructive/30 hover:bg-destructive hover:text-destructive-foreground"
                data-ocid="asset.delete_button"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Info grid */}
        <div className="mt-5 pt-5 border-t border-border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {infoFields.map((field) => {
            const Icon = field.icon;
            return (
              <div key={field.label} className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {field.label}
                  </span>
                </div>
                <div className="text-sm text-foreground font-medium">
                  {field.value}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="assignments" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="assignments" data-ocid="asset_detail.tab">
            Assignments
          </TabsTrigger>
          <TabsTrigger value="maintenance" data-ocid="asset_detail.tab">
            Maintenance
          </TabsTrigger>
          <TabsTrigger value="inspections" data-ocid="asset_detail.tab">
            Inspections
          </TabsTrigger>
        </TabsList>

        {/* Assignments Tab */}
        <TabsContent value="assignments" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-foreground">
              Assignment History
            </h3>
            {isWriter && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setAssignModalOpen(true)}
                data-ocid="assign.open_modal_button"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Assign Asset
              </Button>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            {assignmentsLoading ? (
              <div className="p-5 space-y-3">
                {(["a", "b", "c"] as const).map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !assignments || assignments.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-center"
                data-ocid="asset_detail.empty_state"
              >
                <UserPlus className="w-7 h-7 text-muted-foreground/25 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No assignment history
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    {[
                      "Assigned To",
                      "Assigned By",
                      "Assigned At",
                      "Returned At",
                      "",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((a, idx) => (
                    <TableRow
                      key={a.id.toString()}
                      data-ocid={`asset_detail.row.item.${idx + 1}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <TableCell className="pl-5 font-medium text-sm">
                        {a.assignedTo}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.assignedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestampFull(a.assignedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.returnedAt ? (
                          formatTimestampFull(a.returnedAt)
                        ) : (
                          <span className="status-active inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium">
                            Active
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {isWriter && !a.returnedAt && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() =>
                              setReturnModal({ open: true, assignment: a })
                            }
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Return
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-foreground">
              Maintenance Logs
            </h3>
            {isWriter && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMaintenanceModalOpen(true)}
                data-ocid="maintenance.open_modal_button"
              >
                <Wrench className="w-3.5 h-3.5 mr-1.5" />
                Log Maintenance
              </Button>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            {maintenanceLoading ? (
              <div className="p-5 space-y-3">
                {(["a", "b", "c"] as const).map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !maintenanceLogs || maintenanceLogs.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-center"
                data-ocid="maintenance.empty_state"
              >
                <Wrench className="w-7 h-7 text-muted-foreground/25 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No maintenance records
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    {[
                      "Type",
                      "Description",
                      "Performed By",
                      "Date",
                      "Cost",
                      "Next Due",
                    ].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {maintenanceLogs.map((log, idx) => (
                    <TableRow
                      key={log.id.toString()}
                      data-ocid={`maintenance.row.item.${idx + 1}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <TableCell className="pl-5">
                        <span className="text-xs font-medium bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                          {log.maintenanceType}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                        {log.description}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {log.performedBy}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestamp(log.performedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {formatCurrency(log.cost)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.nextDueDateText ?? (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>

        {/* Inspections Tab */}
        <TabsContent value="inspections" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-semibold text-sm text-foreground">
              Inspection Logs
            </h3>
            {isWriter && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setInspectionModalOpen(true)}
                data-ocid="inspection.open_modal_button"
              >
                <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                Log Inspection
              </Button>
            )}
          </div>
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs">
            {inspectionLoading ? (
              <div className="p-5 space-y-3">
                {(["a", "b", "c"] as const).map((k) => (
                  <Skeleton key={k} className="h-10 w-full" />
                ))}
              </div>
            ) : !inspectionLogs || inspectionLogs.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-10 text-center"
                data-ocid="inspection.empty_state"
              >
                <ClipboardCheck className="w-7 h-7 text-muted-foreground/25 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No inspection records
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    {["Inspector", "Outcome", "Date", "Notes"].map((h) => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-muted-foreground uppercase tracking-wide first:pl-5"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inspectionLogs.map((log, idx) => (
                    <TableRow
                      key={log.id.toString()}
                      data-ocid={`inspection.row.item.${idx + 1}`}
                      className="border-b border-border/50 last:border-0"
                    >
                      <TableCell className="pl-5 font-medium text-sm">
                        {log.inspectorName}
                      </TableCell>
                      <TableCell>
                        <OutcomeBadge outcome={log.outcome} />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatTimestampFull(log.inspectedAt)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-64 truncate">
                        {log.notes || (
                          <span className="text-muted-foreground/40">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <AssetFormModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editAsset={asset}
      />
      <DeleteAssetModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        assetId={assetId}
        assetName={asset.name}
        onDeleted={onBack}
      />
      <AssignAssetModal
        open={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        assetId={assetId}
        assetName={asset.name}
      />
      {returnModal.assignment && (
        <ReturnAssetModal
          open={returnModal.open}
          onClose={() => setReturnModal({ open: false, assignment: null })}
          assignmentId={returnModal.assignment.id}
          assetId={assetId}
          assignedTo={returnModal.assignment.assignedTo}
        />
      )}
      <MaintenanceLogModal
        open={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        assetId={assetId}
        assetName={asset.name}
      />
      <InspectionLogModal
        open={inspectionModalOpen}
        onClose={() => setInspectionModalOpen(false)}
        assetId={assetId}
        assetName={asset.name}
      />
    </div>
  );
}
