import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppShell, type NavItem } from "@/components/AppShell";
import { tickets } from "@/data/seed";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const blocked = tickets.filter((t) => t.status === "refused" || t.status === "blocked").length;

  const items: NavItem[] = [
    { to: "/admin", label: "Triage", icon: <Icon path="M3 12l4-9 5 18 4-13 5 4" />, badge: blocked, exact: true },
    { to: "/admin/projects", label: "Dispositifs", icon: <Icon path="M3 7h18v12H3zM3 7l3-3h12l3 3" /> },
    { to: "/admin/workshops", label: "Ateliers", icon: <Icon path="M4 5h16M4 12h16M4 19h10" /> },
    { to: "/admin/providers", label: "Prestataires", icon: <Icon path="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 14 0" /> },
    { to: "/admin/centers", label: "Centres", icon: <Icon path="M3 21V9l9-6 9 6v12M9 21v-7h6v7" /> },
    { to: "/admin/export", label: "Export compta", icon: <Icon path="M12 3v12m0 0l-4-4m4 4l4-4M3 21h18" /> },
  ];

  return (
    <AppShell brand="Asanblé" spaceLabel="Admin" userName="Équipe Asanblé" items={items}>
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
