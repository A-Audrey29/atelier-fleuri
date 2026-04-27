import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell, type NavItem } from "@/components/AppShell";
import { tickets } from "@/data/seed";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const responsesPending = tickets.filter((t) => t.status === "refused").length;

  const items: NavItem[] = [
    { to: "/app", label: "Mes tickets", icon: <Icon path="M4 6h16M4 12h16M4 18h10" />, badge: responsesPending, exact: true },
    { to: "/app/calendar", label: "Calendrier", icon: <Icon path="M3 6h18M5 4v4M19 4v4M4 10h16v10H4z" /> },
    { to: "/app/providers", label: "Prestataires", icon: <Icon path="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 14 0" /> },
    { to: "/app/sessions/new", label: "Nouvelle session", icon: <Icon path="M12 5v14M5 12h14" /> },
  ];

  return (
    <AppShell brand="Asanblé" spaceLabel="Référent" userName="Mathilde Marival" items={items}>
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
