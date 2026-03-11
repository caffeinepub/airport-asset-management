import { Category, InternalRole, Outcome, Status } from "../backend";

/** Convert nanosecond bigint timestamp to a readable date string */
export function formatTimestamp(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/** Convert nanosecond bigint timestamp to full datetime string */
export function formatTimestampFull(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Convert ISO date string to nanosecond bigint */
export function dateStringToNanoseconds(dateStr: string): bigint {
  const ms = new Date(dateStr).getTime();
  return BigInt(ms) * BigInt(1_000_000);
}

/** Format currency */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Convert bigint timestamp to YYYY-MM-DD input value */
export function timestampToInputDate(ns: bigint): string {
  const ms = Number(ns) / 1_000_000;
  const d = new Date(ms);
  return d.toISOString().split("T")[0];
}

/** Human-readable Category label */
export function categoryLabel(cat: Category): string {
  const map: Record<Category, string> = {
    [Category.vehicles]: "Vehicles",
    [Category.other]: "Other",
    [Category.furniture]: "Furniture",
    [Category.itEquipment]: "IT Equipment",
    [Category.machinery]: "Machinery",
    [Category.officeSupplies]: "Office Supplies",
  };
  return map[cat] ?? cat;
}

/** Human-readable Status label */
export function statusLabel(status: Status): string {
  const map: Record<Status, string> = {
    [Status.active]: "Active",
    [Status.inStorage]: "In Storage",
    [Status.underMaintenance]: "Under Maintenance",
    [Status.retired]: "Retired",
  };
  return map[status] ?? status;
}

/** CSS class name for status badge */
export function statusClassName(status: Status): string {
  const map: Record<Status, string> = {
    [Status.active]: "status-active",
    [Status.inStorage]: "status-storage",
    [Status.underMaintenance]: "status-maintenance",
    [Status.retired]: "status-retired",
  };
  return map[status] ?? "status-storage";
}

/** Human-readable InternalRole label */
export function roleLabel(role: InternalRole): string {
  const map: Record<InternalRole, string> = {
    [InternalRole.systemAdmin]: "System Admin",
    [InternalRole.airportManager]: "Airport Manager",
    [InternalRole.procurementOfficer]: "Procurement Officer",
    [InternalRole.financeManager]: "Finance Manager",
  };
  return map[role] ?? role;
}

/** Human-readable Outcome */
export function outcomeLabel(outcome: Outcome): string {
  return outcome === Outcome.pass ? "Pass" : "Fail";
}

/** Whether a role has write permissions */
export function canWrite(role: InternalRole | null | undefined): boolean {
  if (!role) return false;
  return (
    role === InternalRole.systemAdmin || role === InternalRole.financeManager
  );
}
