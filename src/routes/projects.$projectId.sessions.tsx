import { createFileRoute, Link } from "@tanstack/react-router";
import { projectsStore, useStore } from "@/data/store";
import { sessions, getWorkshop, getCenter } from "@/data/seed";

export const Route = createFileRoute("/projects/$projectId/sessions")({
  component: ProjectSessions,
});

function ProjectSessions() {
  const { projectId } = Route.useParams();
  const project = useStore(projectsStore).find((p) => p.id === projectId)!;
  // Filtrage : sessions dont l'atelier ET le centre sont dans le projet
  const list = sessions.filter(
    (s) => project.workshopIds.includes(s.workshopId) && project.centerIds.includes(s.centerId)
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight">Sessions du projet</h1>
        <p className="text-[13px] text-ink-500 mt-1">{list.length} session{list.length > 1 ? "s" : ""} compatibles avec ce projet.</p>
      </header>
      {list.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-150 p-8 text-center text-[13px] text-ink-400">
          Aucune session ne correspond aux centres et ateliers rattachés.
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((s) => {
            const w = getWorkshop(s.workshopId);
            const c = getCenter(s.centerId);
            return (
              <li key={s.id}>
                <Link to="/app/sessions/$sessionId" params={{ sessionId: s.id }}
                  className="block rounded-lg border border-ink-150 bg-card p-4 hover:bg-ink-50">
                  <div className="text-[14px] font-semibold">{w.name} — {s.groupLabel}</div>
                  <div className="text-[12px] text-ink-500">{c.name} · {c.city} · Référent : {s.referentName}</div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
