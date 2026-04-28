import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, type NavItem } from "@/components/AppShell";
import { tickets } from "@/data/seed";
import { setCurrentUserByRole, useStore, currentUserStore } from "@/data/store";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const user = useStore(currentUserStore);
  useEffect(() => { if (user.role !== "referent") setCurrentUserByRole("referent"); }, [user.role]);

  const responsesPending = tickets.filter((t) => t.status === "refused").length;

  const items: NavItem[] = [
    { to: "/app", label: "Mes tickets", icon: <Icon path="M4 6h16M4 12h16M4 18h10" />, badge: responsesPending, exact: true },
    { to: "/app/availability", label: "Disponibilités", icon: <Icon path="M3 6h18M5 4v4M19 4v4M4 10h16v10H4z" /> },
    { to: "/app/calendar", label: "Mes séances", icon: <Icon path="M3 12h18M3 6h18M3 18h18" /> },
    { to: "/app/providers", label: "Prestataires", icon: <Icon path="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 14 0" /> },
    { to: "/app/sessions/new", label: "Nouvelle séance", icon: <Icon path="M12 5v14M5 12h14" /> },
  ];

  const userName = `${user.firstName} ${user.lastName}`;
  return (
    <AppShell brand="Asanblé" spaceLabel="Référent" userName={userName} items={items}>
      <Outlet />
    </AppShell>
  );
}

function Icon({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d={path} />
    </svg>
  );
}
