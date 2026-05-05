import { createFileRoute, Link } from "@tanstack/react-router";
import { projectsStore, workshopsStore, centersStore, useStore } from "@/data/store";

export const Route = createFileRoute("/projects/$projectId/")({
  component: ProjectOverview,
});

function ProjectOverview() {
  const { projectId } = Route.useParams();
  const project = useStore(projectsStore).find((p) => p.id === projectId)!;
  const workshops = useStore(workshopsStore);
  const centers = useStore(centersStore);
  const ws = project.workshopIds.map((id) => workshops.find((w) => w.id === id)).filter(Boolean);
  const cs = project.centerIds.map((id) => centers.find((c) => c.id === id)).filter(Boolean);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-6 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{project.name}</h1>
          {project.description && <p className="text-[13px] text-ink-500 mt-1">{project.description}</p>}
        </div>
        <Link
          to="/projects/$projectId/settings"
          params={{ projectId }}
          className="h-9 px-3 rounded-md border border-ink-200 text-[13px] font-medium hover:bg-ink-50 inline-flex items-center"
        >
          Modifier le projet
        </Link>
      </header>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Stat label="Centres" value={project.centerIds.length} />
        <Stat label="Ateliers" value={project.workshopIds.length} />
        <Stat label="Budget" value={project.budget ? `${project.budget.toLocaleString("fr-FR")} €` : "—"} />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card title="Informations">
          <Field label="Financeur" value={project.funder || "—"} />
          <Field label="Période" value={project.startDate && project.endDate ? `${fmt(project.startDate)} → ${fmt(project.endDate)}` : "—"} />
          <Field label="Créé le" value={fmt(project.createdAt)} />
        </Card>
        <Card title="Centres rattachés">
          {cs.length === 0 ? <Empty>Aucun centre.</Empty> : (
            <ul className="space-y-1">
              {cs.map((c) => <li key={c!.id} className="text-[13px]">{c!.name} <span className="text-ink-400">· {c!.city}</span></li>)}
            </ul>
          )}
        </Card>
        <Card title="Ateliers">
          {ws.length === 0 ? <Empty>Aucun atelier.</Empty> : (
            <div className="flex flex-wrap gap-1.5">
              {ws.map((w) => <span key={w!.id} className="text-[12px] px-2 py-0.5 rounded-full bg-ink-50 border border-ink-150">{w!.name}</span>)}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-ink-150 bg-card p-4">
      <div className="text-[11px] uppercase tracking-wider text-ink-400">{label}</div>
      <div className="text-[22px] font-semibold mt-1">{value}</div>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-ink-150 bg-card p-5">
      <h2 className="text-[14px] font-semibold mb-3">{title}</h2>
      {children}
    </section>
  );
}
function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-ink-150 pb-2 last:border-b-0 text-[13px]">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-[12px] text-ink-400">{children}</div>;
}
function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
