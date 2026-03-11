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
import { useState } from "react";
import { Outcome } from "../../backend";
import { useAddInspectionLog } from "../../hooks/useQueries";

interface InspectionLogModalProps {
  open: boolean;
  onClose: () => void;
  assetId: bigint;
  assetName: string;
}

const defaultForm = {
  inspectorName: "",
  outcome: Outcome.pass,
  notes: "",
};

export function InspectionLogModal({
  open,
  onClose,
  assetId,
  assetName,
}: InspectionLogModalProps) {
  const [form, setForm] = useState(defaultForm);
  const addLog = useAddInspectionLog();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addLog.mutateAsync({
      assetId,
      inspectorName: form.inspectorName.trim(),
      outcome: form.outcome,
      notes: form.notes.trim(),
    });
    setForm(defaultForm);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="inspection.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Log Inspection</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 mb-1">
          Asset:{" "}
          <span className="font-semibold text-foreground">{assetName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="inspectorName">Inspector Name *</Label>
            <Input
              id="inspectorName"
              data-ocid="inspection.input"
              value={form.inspectorName}
              onChange={(e) =>
                setForm((f) => ({ ...f, inspectorName: e.target.value }))
              }
              placeholder="Inspector's full name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Outcome *</Label>
            <Select
              value={form.outcome}
              onValueChange={(v) =>
                setForm((f) => ({ ...f, outcome: v as Outcome }))
              }
            >
              <SelectTrigger data-ocid="inspection.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Outcome.pass}>Pass</SelectItem>
                <SelectItem value={Outcome.fail}>Fail</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="iNotes">Notes</Label>
            <Textarea
              id="iNotes"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Inspection findings and observations..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLog.isPending}
              data-ocid="inspection.submit_button"
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
