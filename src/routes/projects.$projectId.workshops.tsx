import { createFileRoute } from "@tanstack/react-router";
import { projectsStore, workshopsStore, useStore } from "@/data/store";

export const Route = createFileRoute("/projects/$projectId/workshops")({
  component: ProjectWorkshops,
});

function ProjectWorkshops() {
  const { projectId } = Route.useParams();
  const project = useStore(projectsStore).find((p) => p.id === projectId)!;
  const workshops = useStore(workshopsStore);
  const ws = project.workshopIds.map((id) => workshops.find((w) => w.id === id)).filter(Boolean);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight">Ateliers du projet</h1>
        <p className="text-[13px] text-ink-500 mt-1">{ws.length} atelier{ws.length > 1 ? "s" : ""} associé{ws.length > 1 ? "s" : ""}.</p>
      </header>
      <ul className="grid sm:grid-cols-2 gap-3">
        {ws.map((w) => (
          <li key={w!.id} className="rounded-lg border border-ink-150 bg-card p-4">
            <div className="text-[14px] font-semibold">{w!.name}</div>
            <div className="text-[12px] text-ink-500 mt-0.5">{w!.seancesCount ?? 0} séances · {w!.durationMin ?? 0} min</div>
            <div className="mt-2 flex flex-wrap gap-1">
              {w!.requiredRoles.map((r) => (
                <span key={r} className="text-[11px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-700">{r}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
