import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type {
  Category,
  Data,
  Data__1,
  Data__2,
  Data__3,
  Data__4,
  InternalRole,
  Outcome,
  Specification,
  Status,
  UserProfile,
} from "../backend";
import { useActor } from "./useActor";

// ─── Asset Queries ──────────────────────────────────────────────────────────

export function useAssetStats() {
  const { actor, isFetching } = useActor();
  return useQuery<Data__4>({
    queryKey: ["assetStats"],
    queryFn: async () => {
      if (!actor) throw new Error("No actor");
      return actor.getAssetStats();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useListAssets(
  filterStatus: Status | null = null,
  filterCategory: Category | null = null,
) {
  const { actor, isFetching } = useActor();
  return useQuery<Data[]>({
    queryKey: ["assets", filterStatus, filterCategory],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listAssets(filterStatus, filterCategory);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAsset(assetId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Data | null>({
    queryKey: ["asset", assetId?.toString()],
    queryFn: async () => {
      if (!actor || assetId === null) return null;
      return actor.getAsset(assetId);
    },
    enabled: !!actor && !isFetching && assetId !== null,
  });
}

export function useCreateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (asset: Specification) => {
      if (!actor) throw new Error("No actor");
      return actor.createAsset(asset);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
      toast.success("Asset created successfully");
    },
    onError: () => {
      toast.error("Failed to create asset");
    },
  });
}

export function useUpdateAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      updatedAsset,
    }: {
      assetId: bigint;
      updatedAsset: Specification;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.updateAsset(assetId, updatedAsset);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({
        queryKey: ["asset", variables.assetId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
      toast.success("Asset updated successfully");
    },
    onError: () => {
      toast.error("Failed to update asset");
    },
  });
}

export function useDeleteAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (assetId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteAsset(assetId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
      toast.success("Asset deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete asset");
    },
  });
}

// ─── Assignment ──────────────────────────────────────────────────────────────

export function useAssignmentHistory(assetId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Data__3[]>({
    queryKey: ["assignments", assetId?.toString()],
    queryFn: async () => {
      if (!actor || assetId === null) return [];
      return actor.getAssignmentHistory(assetId);
    },
    enabled: !!actor && !isFetching && assetId !== null,
  });
}

export function useAssignAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      assignedTo,
      assignedBy,
    }: {
      assetId: bigint;
      assignedTo: string;
      assignedBy: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.assignAsset(assetId, assignedTo, assignedBy);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", variables.assetId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["asset", variables.assetId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
      toast.success("Asset assigned successfully");
    },
    onError: () => {
      toast.error("Failed to assign asset");
    },
  });
}

export function useReturnAsset() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assignmentId,
    }: {
      assignmentId: bigint;
      assetId: bigint;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.returnAsset(assignmentId);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments", variables.assetId.toString()],
      });
      queryClient.invalidateQueries({
        queryKey: ["asset", variables.assetId.toString()],
      });
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetStats"] });
      toast.success("Asset returned successfully");
    },
    onError: () => {
      toast.error("Failed to return asset");
    },
  });
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export function useMaintenanceLogs(assetId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Data__1[]>({
    queryKey: ["maintenance", assetId?.toString()],
    queryFn: async () => {
      if (!actor || assetId === null) return [];
      return actor.getMaintenanceLogs(assetId);
    },
    enabled: !!actor && !isFetching && assetId !== null,
  });
}

export function useAddMaintenanceLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      maintenanceType,
      description,
      performedBy,
      nextDueDateText,
      cost,
    }: {
      assetId: bigint;
      maintenanceType: string;
      description: string;
      performedBy: string;
      nextDueDateText: string | null;
      cost: number;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addMaintenanceLog(
        assetId,
        maintenanceType,
        description,
        performedBy,
        nextDueDateText,
        cost,
      );
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["maintenance", variables.assetId.toString()],
      });
      toast.success("Maintenance log added");
    },
    onError: () => {
      toast.error("Failed to add maintenance log");
    },
  });
}

// ─── Inspection ──────────────────────────────────────────────────────────────

export function useInspectionLogs(assetId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Data__2[]>({
    queryKey: ["inspections", assetId?.toString()],
    queryFn: async () => {
      if (!actor || assetId === null) return [];
      return actor.getInspectionLogs(assetId);
    },
    enabled: !!actor && !isFetching && assetId !== null,
  });
}

export function useAddInspectionLog() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      assetId,
      inspectorName,
      outcome,
      notes,
    }: {
      assetId: bigint;
      inspectorName: string;
      outcome: Outcome;
      notes: string;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.addInspectionLog(assetId, inspectorName, outcome, notes);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["inspections", variables.assetId.toString()],
      });
      toast.success("Inspection log added");
    },
    onError: () => {
      toast.error("Failed to add inspection log");
    },
  });
}

// ─── Auth / User ──────────────────────────────────────────────────────────────

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      queryClient.invalidateQueries({ queryKey: ["callerRole"] });
      queryClient.invalidateQueries({ queryKey: ["isAdmin"] });
    },
  });
}

export function useCallerRole() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerRole"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useIsAdmin() {
  const { actor, isFetching } = useActor();
  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !isFetching,
    staleTime: 60_000,
  });
}

export function useManageUserRoles() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: Principal;
      role: InternalRole;
    }) => {
      if (!actor) throw new Error("No actor");
      return actor.manageUserRoles(userId, role);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["callerProfile"] });
      toast.success("User role updated successfully");
    },
    onError: () => {
      toast.error("Failed to update user role");
    },
  });
}
