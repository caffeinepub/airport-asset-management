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
import { useDeleteAsset } from "../../hooks/useQueries";

interface DeleteAssetModalProps {
  open: boolean;
  onClose: () => void;
  assetId: bigint;
  assetName: string;
  onDeleted?: () => void;
}

export function DeleteAssetModal({
  open,
  onClose,
  assetId,
  assetName,
  onDeleted,
}: DeleteAssetModalProps) {
  const deleteAsset = useDeleteAsset();

  async function handleConfirm() {
    await deleteAsset.mutateAsync(assetId);
    onClose();
    onDeleted?.();
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display">
            Delete Asset
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">{assetName}</span>?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose} data-ocid="asset.cancel_button">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={deleteAsset.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            data-ocid="asset.confirm_button"
          >
            {deleteAsset.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Delete Asset
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
