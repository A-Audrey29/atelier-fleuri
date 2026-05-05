import { createFileRoute } from "@tanstack/react-router";
import { projectsStore, centersStore, useStore } from "@/data/store";

export const Route = createFileRoute("/projects/$projectId/centers")({
  component: ProjectCenters,
});

function ProjectCenters() {
  const { projectId } = Route.useParams();
  const project = useStore(projectsStore).find((p) => p.id === projectId)!;
  const centers = useStore(centersStore);
  const cs = project.centerIds.map((id) => centers.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5">
        <h1 className="text-[24px] font-semibold tracking-tight">Centres rattachés</h1>
        <p className="text-[13px] text-ink-500 mt-1">{cs.length} centre{cs.length > 1 ? "s" : ""} dans ce projet.</p>
      </header>
      <ul className="grid sm:grid-cols-2 gap-3">
        {cs.map((c) => (
          <li key={c!.id} className="rounded-lg border border-ink-150 bg-card p-4">
            <div className="text-[14px] font-semibold">{c!.name}</div>
            <div className="text-[12px] text-ink-500">{c!.address}</div>
            <div className="text-[12px] text-ink-500 mt-1">Référent · {c!.contactName}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
