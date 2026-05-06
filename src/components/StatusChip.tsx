import type { TicketStatus } from "@/data/types";
import { cn } from "@/lib/utils";

const labels: Record<TicketStatus, string> = {
  draft: "Brouillon",
  pending: "En attente",
  confirmed: "Confirmé",
  refused: "Refusé",
  empty: "À pourvoir",
  partial: "Partielle",
  blocked: "Bloqué",
  done: "Réalisée",
  override: "Débloqué",
  skipped: "Non requis",
};

const styles: Record<TicketStatus, string> = {
  draft: "bg-ink-50 border-ink-200 text-ink-500",
  pending: "bg-s-pending-bg border-s-pending-border text-s-pending-ink",
  confirmed: "bg-s-confirmed-bg border-s-confirmed-border text-s-confirmed-ink",
  refused: "bg-s-refused-bg border-s-refused-border text-s-refused-ink",
  empty: "bg-s-empty-bg border-s-empty-border text-s-empty-ink",
  partial: "bg-s-pending-bg border-s-pending-border text-s-pending-ink",
  blocked: "bg-s-refused-bg border-s-refused-border text-s-refused-ink",
  done: "bg-s-confirmed-bg border-s-confirmed-border text-s-confirmed-ink",
  override: "bg-s-override-bg border-s-override-border text-s-override-ink",
  skipped: "bg-ink-50 border-ink-200 text-ink-400 italic",
};

const dotColor: Record<TicketStatus, string> = {
  draft: "bg-ink-400",
  pending: "bg-s-pending-ink",
  confirmed: "bg-s-confirmed-ink",
  refused: "bg-s-refused-ink",
  empty: "bg-ink-400",
  partial: "bg-s-pending-ink",
  blocked: "bg-s-refused-ink",
  done: "bg-s-confirmed-ink",
  override: "bg-s-override-ink",
  skipped: "bg-ink-300",
};

export function StatusChip({
  status,
  size = "sm",
  className,
}: {
  status: TicketStatus;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-[13px]",
        styles[status],
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dotColor[status])} aria-hidden />
      {labels[status]}
    </span>
  );
}
