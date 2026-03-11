import { cn } from "@/lib/utils";
import { Outcome, type Status } from "../backend";
import {
  outcomeLabel,
  statusClassName,
  statusLabel,
} from "../utils/formatters";

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        statusClassName(status),
        className,
      )}
    >
      {statusLabel(status)}
    </span>
  );
}

interface OutcomeBadgeProps {
  outcome: Outcome;
  className?: string;
}

export function OutcomeBadge({ outcome, className }: OutcomeBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        outcome === Outcome.pass ? "status-active" : "status-retired",
        className,
      )}
    >
      {outcomeLabel(outcome)}
    </span>
  );
}
