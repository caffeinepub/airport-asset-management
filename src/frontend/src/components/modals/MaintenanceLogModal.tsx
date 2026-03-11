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
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAddMaintenanceLog } from "../../hooks/useQueries";

interface MaintenanceLogModalProps {
  open: boolean;
  onClose: () => void;
  assetId: bigint;
  assetName: string;
}

const defaultForm = {
  maintenanceType: "",
  description: "",
  performedBy: "",
  nextDueDateText: "",
  cost: "",
};

export function MaintenanceLogModal({
  open,
  onClose,
  assetId,
  assetName,
}: MaintenanceLogModalProps) {
  const [form, setForm] = useState(defaultForm);
  const addLog = useAddMaintenanceLog();

  function setField<K extends keyof typeof defaultForm>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addLog.mutateAsync({
      assetId,
      maintenanceType: form.maintenanceType.trim(),
      description: form.description.trim(),
      performedBy: form.performedBy.trim(),
      nextDueDateText: form.nextDueDateText.trim() || null,
      cost: Number.parseFloat(form.cost) || 0,
    });
    setForm(defaultForm);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="maintenance.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Log Maintenance</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 mb-1">
          Asset:{" "}
          <span className="font-semibold text-foreground">{assetName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="maintenanceType">Maintenance Type *</Label>
            <Input
              id="maintenanceType"
              data-ocid="maintenance.input"
              value={form.maintenanceType}
              onChange={(e) => setField("maintenanceType", e.target.value)}
              placeholder="e.g. Preventive, Corrective, Inspection"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mDescription">Description *</Label>
            <Textarea
              id="mDescription"
              value={form.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="Describe what was done..."
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="performedBy">Performed By *</Label>
              <Input
                id="performedBy"
                value={form.performedBy}
                onChange={(e) => setField("performedBy", e.target.value)}
                placeholder="Technician name"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mCost">Cost (USD)</Label>
              <Input
                id="mCost"
                type="number"
                min="0"
                step="0.01"
                value={form.cost}
                onChange={(e) => setField("cost", e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nextDueDate">Next Due Date (optional)</Label>
            <Input
              id="nextDueDate"
              value={form.nextDueDateText}
              onChange={(e) => setField("nextDueDateText", e.target.value)}
              placeholder="e.g. March 2026 or 2026-03-01"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLog.isPending}
              data-ocid="maintenance.submit_button"
            >
              {addLog.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Save Log
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
