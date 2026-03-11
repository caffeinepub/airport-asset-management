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
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useAssignAsset } from "../../hooks/useQueries";

interface AssignAssetModalProps {
  open: boolean;
  onClose: () => void;
  assetId: bigint;
  assetName: string;
}

export function AssignAssetModal({
  open,
  onClose,
  assetId,
  assetName,
}: AssignAssetModalProps) {
  const [assignedTo, setAssignedTo] = useState("");
  const [assignedBy, setAssignedBy] = useState("");
  const assignAsset = useAssignAsset();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await assignAsset.mutateAsync({ assetId, assignedTo, assignedBy });
    setAssignedTo("");
    setAssignedBy("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="assign.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Assign Asset</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-2 mb-1">
          Assigning:{" "}
          <span className="font-semibold text-foreground">{assetName}</span>
        </p>
        <form onSubmit={handleSubmit} className="space-y-4 py-1">
          <div className="space-y-1.5">
            <Label htmlFor="assignedTo">Assign To *</Label>
            <Input
              id="assignedTo"
              data-ocid="assign.input"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="Person or department name"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="assignedBy">Assigned By *</Label>
            <Input
              id="assignedBy"
              value={assignedBy}
              onChange={(e) => setAssignedBy(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-ocid="assign.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={assignAsset.isPending}
              data-ocid="assign.submit_button"
            >
              {assignAsset.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Assign Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
