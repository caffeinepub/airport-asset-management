import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Category, type Data, type Specification, Status } from "../../backend";
import { useCreateAsset, useUpdateAsset } from "../../hooks/useQueries";
import {
  categoryLabel,
  dateStringToNanoseconds,
  statusLabel,
  timestampToInputDate,
} from "../../utils/formatters";

interface AssetFormModalProps {
  open: boolean;
  onClose: () => void;
  editAsset?: Data | null;
}

const defaultForm = {
  name: "",
  category: Category.itEquipment,
  serialNumber: "",
  purchaseDate: new Date().toISOString().split("T")[0],
  supplier: "",
  cost: "",
  status: Status.active,
  location: "",
  assignedTo: "",
  notes: "",
};

export function AssetFormModal({
  open,
  onClose,
  editAsset,
}: AssetFormModalProps) {
  const [form, setForm] = useState(defaultForm);
  const createAsset = useCreateAsset();
  const updateAsset = useUpdateAsset();

  const isEditing = !!editAsset;
  const isPending = createAsset.isPending || updateAsset.isPending;

  // biome-ignore lint/correctness/useExhaustiveDependencies: reset on open/editAsset changes
  useEffect(() => {
    if (editAsset) {
      setForm({
        name: editAsset.name,
        category: editAsset.category,
        serialNumber: editAsset.serialNumber,
        purchaseDate: timestampToInputDate(editAsset.purchaseDate),
        supplier: editAsset.supplier,
        cost: String(editAsset.cost),
        status: editAsset.status,
        location: editAsset.location,
        assignedTo: editAsset.assignedTo ?? "",
        notes: editAsset.notes,
      });
    } else {
      setForm(defaultForm);
    }
  }, [editAsset, open]);

  function setField<K extends keyof typeof defaultForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const spec: Specification = {
      name: form.name.trim(),
      category: form.category as Category,
      serialNumber: form.serialNumber.trim(),
      purchaseDate: dateStringToNanoseconds(form.purchaseDate),
      supplier: form.supplier.trim(),
      cost: Number.parseFloat(form.cost) || 0,
      status: form.status as Status,
      location: form.location.trim(),
      assignedTo: form.assignedTo.trim() || undefined,
      notes: form.notes.trim(),
    };

    if (isEditing && editAsset) {
      await updateAsset.mutateAsync({
        assetId: editAsset.id,
        updatedAsset: spec,
      });
    } else {
      await createAsset.mutateAsync(spec);
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        data-ocid="add_asset.dialog"
      >
        <DialogHeader>
          <DialogTitle className="font-display">
            {isEditing ? "Edit Asset" : "Add New Asset"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                data-ocid="add_asset.input"
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. HP LaserJet Pro 4001dn"
                required
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label>Category *</Label>
              <Select
                value={form.category}
                onValueChange={(v) => setField("category", v)}
              >
                <SelectTrigger data-ocid="add_asset.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Category).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {categoryLabel(cat)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <Label>Status *</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setField("status", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Status).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusLabel(s)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Serial Number */}
            <div className="space-y-1.5">
              <Label htmlFor="serial">Serial Number *</Label>
              <Input
                id="serial"
                value={form.serialNumber}
                onChange={(e) => setField("serialNumber", e.target.value)}
                placeholder="e.g. SN-2024-0042"
                required
                className="font-mono"
              />
            </div>

            {/* Purchase Date */}
            <div className="space-y-1.5">
              <Label htmlFor="purchaseDate">Purchase Date *</Label>
              <Input
                id="purchaseDate"
                type="date"
                value={form.purchaseDate}
                onChange={(e) => setField("purchaseDate", e.target.value)}
                required
              />
            </div>

            {/* Supplier */}
            <div className="space-y-1.5">
              <Label htmlFor="supplier">Supplier *</Label>
              <Input
                id="supplier"
                value={form.supplier}
                onChange={(e) => setField("supplier", e.target.value)}
                placeholder="e.g. Tech Office Supplies Ltd."
                required
              />
            </div>

            {/* Cost */}
            <div className="space-y-1.5">
              <Label htmlFor="cost">Cost (USD) *</Label>
              <Input
                id="cost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setField("cost", e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            {/* Location */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setField("location", e.target.value)}
                placeholder="e.g. Terminal 2 — IT Room B"
                required
              />
            </div>

            {/* Assigned To */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="assignedTo">Assigned To (optional)</Label>
              <Input
                id="assignedTo"
                value={form.assignedTo}
                onChange={(e) => setField("assignedTo", e.target.value)}
                placeholder="Name or department"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                data-ocid="add_asset.textarea"
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                placeholder="Additional notes about this asset..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="add_asset.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              data-ocid="add_asset.submit_button"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Create Asset"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
