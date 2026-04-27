import { type ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";

interface SideDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: number;
}

export function SideDrawer({ open, onClose, title, subtitle, children, footer, width = 340 }: SideDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="drawer-overlay absolute inset-0 bg-ink-900/30"
        onClick={onClose}
        aria-hidden
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "drawer-panel absolute right-0 top-0 h-full bg-paper border-l border-ink-150 shadow-2xl flex flex-col",
        )}
        style={{ width }}
      >
        <header className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-ink-150">
          <div className="min-w-0 flex-1">
            {subtitle && <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">{subtitle}</div>}
            {title && <h2 className="text-[18px] font-semibold leading-snug">{title}</h2>}
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-ink-400 hover:text-ink-900 hover:bg-ink-50"
          >
            ✕
          </button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-ink-150 px-5 py-3">{footer}</div>}
      </aside>
    </div>
  );
}
