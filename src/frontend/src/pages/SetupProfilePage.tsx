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
import { Loader2, Plane } from "lucide-react";
import { useState } from "react";
import { InternalRole, type UserProfile } from "../backend";
import { useSaveCallerProfile } from "../hooks/useQueries";
import { roleLabel } from "../utils/formatters";

const roleDescriptions: Record<InternalRole, string> = {
  [InternalRole.systemAdmin]:
    "Full access: manage assets, assignments, and user permissions",
  [InternalRole.financeManager]:
    "Can create, edit, and manage all asset records",
  [InternalRole.airportManager]: "View-only access to all asset data",
  [InternalRole.procurementOfficer]:
    "View-only access to procurement and asset data",
};

export function SetupProfilePage() {
  const [name, setName] = useState("");
  const [role, setRole] = useState<InternalRole>(InternalRole.airportManager);
  const saveProfile = useSaveCallerProfile();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const profile: UserProfile = { name: name.trim(), role };
    await saveProfile.mutateAsync(profile);
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary mb-5">
            <Plane className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome to AeroTrack
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your profile to get started with airport asset management
          </p>
        </div>

        {/* Form */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="displayName">Your Name *</Label>
              <Input
                id="displayName"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label>Your Role *</Label>
              <Select
                value={role}
                onValueChange={(v) => setRole(v as InternalRole)}
              >
                <SelectTrigger>
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
              <p className="text-xs text-muted-foreground mt-1">
                {roleDescriptions[role]}
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={saveProfile.isPending || !name.trim()}
            >
              {saveProfile.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue to Dashboard"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
