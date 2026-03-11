import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Principal } from "@icp-sdk/core/principal";
import { Info, Loader2, Shield, Users } from "lucide-react";
import { useState } from "react";
import { InternalRole } from "../backend";
import { useManageUserRoles } from "../hooks/useQueries";
import { roleLabel } from "../utils/formatters";

const roleDescriptions: Record<InternalRole, string> = {
  [InternalRole.systemAdmin]:
    "Full access: manage assets, assignments, maintenance, inspections, and user permissions",
  [InternalRole.financeManager]:
    "Write access: create, edit, and manage all asset records and logs",
  [InternalRole.airportManager]:
    "Read-only: view all assets, assignments, and logs",
  [InternalRole.procurementOfficer]:
    "Read-only: view procurement-related asset data",
};

export function UserManagementPage() {
  const [principal, setPrincipal] = useState("");
  const [role, setRole] = useState<InternalRole>(InternalRole.airportManager);
  const [principalError, setPrincipalError] = useState("");
  const manageRoles = useManageUserRoles();

  function validatePrincipal(value: string): boolean {
    try {
      Principal.fromText(value.trim());
      return true;
    } catch {
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPrincipalError("");

    if (!validatePrincipal(principal)) {
      setPrincipalError("Please enter a valid Internet Identity principal");
      return;
    }

    const userId = Principal.fromText(principal.trim());
    await manageRoles.mutateAsync({ userId, role });
    setPrincipal("");
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-foreground">
          User Management
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Assign roles to users by their Internet Identity principal
        </p>
      </div>

      {/* Info box */}
      <Alert className="bg-primary/5 border-primary/20">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm text-foreground/70">
          To grant a user access, enter their Internet Computer principal ID and
          select the appropriate role. Users can find their principal ID after
          logging in. Only System Admins can manage user roles.
        </AlertDescription>
      </Alert>

      {/* Role descriptions */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Role Permissions
          </h2>
        </div>
        <div className="space-y-3">
          {Object.values(InternalRole).map((r) => (
            <div
              key={r}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/40"
            >
              <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {roleLabel(r)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {roleDescriptions[r]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-card border border-border rounded-xl p-5 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-primary" />
          <h2 className="font-display font-semibold text-foreground">
            Assign Role
          </h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="principalId">User Principal ID *</Label>
            <Input
              id="principalId"
              data-ocid="settings.input"
              value={principal}
              onChange={(e) => {
                setPrincipal(e.target.value);
                setPrincipalError("");
              }}
              placeholder="e.g. 2vxsx-fae or xxxxx-xxxxx-xxxxx-xxxxx-cai"
              className="font-mono text-sm"
              required
            />
            {principalError && (
              <p
                className="text-xs text-destructive mt-1"
                data-ocid="settings.error_state"
              >
                {principalError}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as InternalRole)}
            >
              <SelectTrigger data-ocid="settings.select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(InternalRole).map((r) => (
                  <SelectItem key={r} value={r}>
                    {roleLabel(r)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={manageRoles.isPending || !principal.trim()}
            data-ocid="settings.submit_button"
          >
            {manageRoles.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Assign Role"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
