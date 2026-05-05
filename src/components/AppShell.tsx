import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { Avatar } from "./Avatar";
import type { ReactNode } from "react";

export interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
  badge?: number;
  exact?: boolean;
}

interface AppShellProps {
  brand: string;
  spaceLabel: ReactNode;
  userName: string;
  items: NavItem[];
  children: ReactNode;
  topSlot?: ReactNode;
}

function isActive(pathname: string, to: string, exact?: boolean) {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(to + "/");
}

export function AppShell({ brand, spaceLabel, userName, items, children, topSlot }: AppShellProps) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-ink-150 bg-sidebar md:flex">
        <Link to="/" className="flex items-center gap-2 px-5 py-5 border-b border-ink-150 hover:bg-ink-50/60 transition-colors group">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">
            A
          </div>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="text-[14px] font-semibold truncate">{brand}</span>
            <span className="text-[11px] text-ink-400 uppercase tracking-wider truncate">{spaceLabel}</span>
          </div>
        </Link>
        {topSlot && <div className="px-3 py-3 border-b border-ink-150">{topSlot}</div>}
        <nav className="flex-1 px-2 py-3">
          <ul className="space-y-0.5">
            {items.map((it) => {
              const active = isActive(pathname, it.to, it.exact);
              return (
                <li key={it.to}>
                  <Link
                    to={it.to}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-[14px] transition-colors",
                      active
                        ? "bg-ink-50 text-ink-900 font-medium"
                        : "text-ink-500 hover:text-ink-900 hover:bg-ink-50",
                    )}
                  >
                    <span className={cn("inline-flex h-4 w-4 items-center justify-center", active ? "text-ink-900" : "text-ink-400")}>
                      {it.icon}
                    </span>
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? (
                      <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-accent px-1.5 text-[11px] font-semibold text-white">
                        {it.badge}
                      </span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t border-ink-150 p-3 space-y-1">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-ink-500 hover:text-ink-900 hover:bg-ink-50"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <path d="M3 12l9-9 9 9M5 10v10h14V10" />
            </svg>
            <span>Changer d'espace</span>
          </Link>
          <Link
            to="/account"
            className="w-full flex items-center gap-2.5 rounded-md px-2 py-1.5 hover:bg-ink-50 transition-colors text-left"
          >
            <Avatar name={userName} size={28} />
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{userName}</div>
              <div className="text-[11px] text-ink-400 truncate">Mon compte</div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Mobile topbar */}
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-ink-150 bg-paper/95 backdrop-blur px-4 h-12 md:hidden">
        <Link to="/" className="flex items-center gap-2 -mx-1 px-1 py-1 rounded">
          <div className="h-6 w-6 rounded bg-ink-900 text-paper grid place-items-center text-[11px] font-semibold">A</div>
          <span className="text-[14px] font-semibold">{brand}</span>
          <span className="text-[11px] text-ink-400 uppercase tracking-wider ml-1">{spaceLabel}</span>
        </Link>
        <Link to="/account" aria-label="Mon compte">
          <Avatar name={userName} size={26} />
        </Link>
      </header>

      {/* Mobile tabbar */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid border-t border-ink-150 bg-paper md:hidden"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const active = isActive(pathname, it.to, it.exact);
          return (
            <Link
              key={it.to}
              to={it.to}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] relative",
                active ? "text-ink-900" : "text-ink-400",
              )}
            >
              <span className="h-5 w-5 grid place-items-center">{it.icon}</span>
              <span>{it.label}</span>
              {it.badge ? (
                <span className="absolute top-1 right-[28%] inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-white">
                  {it.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>

      <main className="md:ml-60 pt-12 md:pt-0 pb-16 md:pb-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
