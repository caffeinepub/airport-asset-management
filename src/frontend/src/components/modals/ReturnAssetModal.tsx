import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";
import { useReturnAsset } from "../../hooks/useQueries";

interface ReturnAssetModalProps {
  open: boolean;
  onClose: () => void;
  assignmentId: bigint;
  assetId: bigint;
  assignedTo: string;
}

export function ReturnAssetModal({
  open,
  onClose,
  assignmentId,
  assetId,
  assignedTo,
}: ReturnAssetModalProps) {
  const returnAsset = useReturnAsset();

  async function handleConfirm() {
    await returnAsset.mutateAsync({ assignmentId, assetId });
    onClose();
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent data-ocid="assign.dialog">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Return Asset
          </AlertDialogTitle>
          <AlertDialogDescription>
            Confirm return of asset currently assigned to{" "}
            <span className="font-semibold text-foreground">{assignedTo}</span>.
            This will mark the assignment as returned.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} data-ocid="assign.cancel_button">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={returnAsset.isPending}
            data-ocid="assign.confirm_button"
          >
            {returnAsset.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Confirm Return
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
