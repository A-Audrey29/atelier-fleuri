import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell, type NavItem } from "@/components/AppShell";
import { projectsStore, useStore, currentUserStore, setCurrentUserByRole } from "@/data/store";

export const Route = createFileRoute("/projects/$projectId")({
  component: ProjectLayout,
});

function ProjectLayout() {
  const { projectId } = Route.useParams();
  const projects = useStore(projectsStore);
  const project = projects.find((p) => p.id === projectId);
  const user = useStore(currentUserStore);
  const navigate = useNavigate();
  useEffect(() => { if (user.role !== "admin") setCurrentUserByRole("admin"); }, [user.role]);

  if (!project) {
    return (
      <div className="min-h-screen grid place-items-center text-[14px] text-ink-500">
        <div className="text-center">
          <p className="mb-3">Projet introuvable.</p>
          <Link to="/admin/projects" className="text-ink-900 underline">Retour aux projets</Link>
        </div>
      </div>
    );
  }

  const base = `/projects/${projectId}`;
  const items: NavItem[] = [
    { to: base, label: "Vue d'ensemble", icon: <Icon path="M3 12l9-9 9 9M5 10v10h14V10" />, exact: true },
    { to: `${base}/settings`, label: "Paramètres", icon: <Icon path="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8M19.4 15a7.97 7.97 0 0 0 .1-3l2-1.5-2-3.4-2.3.8a8 8 0 0 0-2.6-1.5L14 4h-4l-.6 2.4a8 8 0 0 0-2.6 1.5l-2.3-.8-2 3.4L4.5 12c-.1 1-.1 2 0 3l-2 1.5 2 3.4 2.3-.8a8 8 0 0 0 2.6 1.5L10 23h4l.6-2.4a8 8 0 0 0 2.6-1.5l2.3.8 2-3.4Z" /> },
    { to: `${base}/centers`, label: "Centres", icon: <Icon path="M3 21V9l9-6 9 6v12M9 21v-7h6v7" /> },
    { to: `${base}/workshops`, label: "Ateliers", icon: <Icon path="M4 5h16M4 12h16M4 19h10" /> },
    { to: `${base}/sessions`, label: "Sessions", icon: <Icon path="M3 6h18M5 4v4M19 4v4M4 10h16v10H4z" /> },
  ];

  const switcher = (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-ink-400 mb-1">Projet</div>
      <select
        value={projectId}
        onChange={(e) => navigate({ to: "/projects/$projectId", params: { projectId: e.target.value } })}
        className="w-full h-8 rounded-md border border-ink-150 bg-paper px-2 text-[12px] font-medium"
      >
        {projects.map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <Link
        to="/admin/projects"
        className="mt-2 inline-flex items-center gap-1 text-[11px] text-ink-500 hover:text-ink-900"
      >
        ← Tous les projets
      </Link>
    </div>
  );

  return (
    <AppShell
      brand={project.name}
      spaceLabel="Projet"
      userName={`${user.firstName} ${user.lastName}`}
      items={items}
      topSlot={switcher}
    >
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
