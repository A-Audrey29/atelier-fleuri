import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, type NavItem } from "@/components/AppShell";
import { tickets } from "@/data/seed";
import { setCurrentUserByRole, useStore, currentUserStore } from "@/data/store";

export const Route = createFileRoute("/pro")({
  component: ProLayout,
});

function ProLayout() {
  const user = useStore(currentUserStore);
  useEffect(() => { if (user.role !== "provider") setCurrentUserByRole("provider"); }, [user.role]);
  const pending = tickets.filter((t) => t.status === "pending" && t.providerId === "p1").length;

  const items: NavItem[] = [
    { to: "/pro", label: "Demandes", icon: <Icon path="M4 4h16v6H4zM4 14h16v6H4z" />, badge: pending, exact: true },
    { to: "/pro/dispos", label: "Mes dispos", icon: <Icon path="M3 6h18M5 4v4M19 4v4M4 10h16v10H4z" /> },
    { to: "/pro/missions", label: "Missions", icon: <Icon path="M5 7h14M5 12h14M5 17h8" /> },
    { to: "/pro/documents", label: "Documents", icon: <Icon path="M7 3h7l5 5v13H7zM14 3v5h5" /> },
    { to: "/pro/profile", label: "Profil", icon: <Icon path="M16 11a4 4 0 1 0-8 0M3 20a7 7 0 0 1 14 0" /> },
  ];

  return (
    <AppShell brand="Asanblé" spaceLabel="Prestataire" userName={`${user.firstName} ${user.lastName}`} items={items}>
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
