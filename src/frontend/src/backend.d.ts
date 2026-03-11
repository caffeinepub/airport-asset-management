import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserProfile {
    name: string;
    role: InternalRole;
}
export type Time = bigint;
export interface Data {
    id: bigint;
    status: Status;
    assignedTo?: string;
    purchaseDate: Time;
    supplier: string;
    cost: number;
    name: string;
    serialNumber: string;
    notes: string;
    category: Category;
    location: string;
}
export interface Data__2 {
    id: bigint;
    assetId: bigint;
    inspectorName: string;
    inspectedAt: bigint;
    notes: string;
    outcome: Outcome;
}
export interface Data__1 {
    id: bigint;
    assetId: bigint;
    cost: number;
    nextDueDateText?: string;
    description: string;
    maintenanceType: string;
    performedAt: bigint;
    performedBy: string;
}
export interface Data__3 {
    id: bigint;
    assignedAt: bigint;
    assignedBy: string;
    assignedTo: string;
    assetId: bigint;
    returnedAt?: bigint;
}
export interface Data__4 {
    assigned: bigint;
    total: bigint;
    underMaintenance: bigint;
    recentlyAdded: bigint;
}
export interface Specification {
    status: Status;
    assignedTo?: string;
    purchaseDate: Time;
    supplier: string;
    cost: number;
    name: string;
    serialNumber: string;
    notes: string;
    category: Category;
    location: string;
}
export type AssetId = bigint;
export enum Category {
    vehicles = "vehicles",
    other = "other",
    furniture = "furniture",
    itEquipment = "itEquipment",
    machinery = "machinery",
    officeSupplies = "officeSupplies"
}
export enum InternalRole {
    systemAdmin = "systemAdmin",
    airportManager = "airportManager",
    procurementOfficer = "procurementOfficer",
    financeManager = "financeManager"
}
export enum Outcome {
    fail = "fail",
    pass = "pass"
}
export enum Status {
    active = "active",
    inStorage = "inStorage",
    underMaintenance = "underMaintenance",
    retired = "retired"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addInspectionLog(assetId: AssetId, inspectorName: string, outcome: Outcome, notes: string): Promise<boolean>;
    addMaintenanceLog(assetId: AssetId, maintenanceType: string, description: string, performedBy: string, nextDueDateText: string | null, cost: number): Promise<boolean>;
    assignAsset(assetId: AssetId, assignedTo: string, assignedBy: string): Promise<boolean>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createAsset(asset: Specification): Promise<AssetId>;
    deleteAsset(assetId: AssetId): Promise<boolean>;
    getAsset(assetId: AssetId): Promise<Data | null>;
    getAssetStats(): Promise<Data__4>;
    getAssignmentHistory(assetId: AssetId): Promise<Array<Data__3>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getInspectionLogs(assetId: AssetId): Promise<Array<Data__2>>;
    getMaintenanceLogs(assetId: AssetId): Promise<Array<Data__1>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listAssets(filterStatus: Status | null, filterCategory: Category | null): Promise<Array<Data>>;
    manageUserRoles(userId: Principal, role: InternalRole): Promise<boolean>;
    returnAsset(assignmentId: bigint): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateAsset(assetId: AssetId, updatedAsset: Specification): Promise<boolean>;
}
