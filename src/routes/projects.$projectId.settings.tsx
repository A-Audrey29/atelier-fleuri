import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { projectsStore, workshopsStore, centersStore, useStore } from "@/data/store";

export const Route = createFileRoute("/projects/$projectId/settings")({
  component: ProjectSettings,
});

function ProjectSettings() {
  const { projectId } = Route.useParams();
  const project = useStore(projectsStore).find((p) => p.id === projectId)!;
  const centers = useStore(centersStore);
  const workshops = useStore(workshopsStore);
  const navigate = useNavigate();

  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? "");
  const [funder, setFunder] = useState(project.funder ?? "");
  const [budget, setBudget] = useState(project.budget?.toString() ?? "");
  const [startDate, setStartDate] = useState(project.startDate ?? "");
  const [endDate, setEndDate] = useState(project.endDate ?? "");
  const [centerIds, setCenterIds] = useState<string[]>(project.centerIds);
  const [workshopIds, setWorkshopIds] = useState<string[]>(project.workshopIds);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setName(project.name); setDescription(project.description ?? "");
    setFunder(project.funder ?? ""); setBudget(project.budget?.toString() ?? "");
    setStartDate(project.startDate ?? ""); setEndDate(project.endDate ?? "");
    setCenterIds(project.centerIds); setWorkshopIds(project.workshopIds);
  }, [projectId]);

  function toggle(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function save() {
    if (!name.trim()) return;
    projectsStore.update((list) => list.map((p) => p.id === projectId ? {
      ...p,
      name: name.trim(),
      description: description.trim() || undefined,
      funder: funder.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      centerIds, workshopIds,
    } : p));
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  function remove() {
    if (!confirm(`Supprimer le projet "${project.name}" ?`)) return;
    projectsStore.update((list) => list.filter((p) => p.id !== projectId));
    navigate({ to: "/admin/projects" });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[760px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Paramètres du projet</h1>
        <p className="text-[13px] text-ink-500 mt-1">Modifie les informations, centres et ateliers rattachés.</p>
      </header>

      <div className="space-y-4 rounded-xl border border-ink-150 bg-card p-5">
        <Field label="Nom du projet">
          <input value={name} onChange={(e) => setName(e.target.value)}
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
        </Field>
        <Field label="Description">
          <input value={description} onChange={(e) => setDescription(e.target.value)}
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Financeur">
            <input value={funder} onChange={(e) => setFunder(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
          </Field>
          <Field label="Budget (€)">
            <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Début">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
          </Field>
          <Field label="Fin">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]" />
          </Field>
        </div>
        <Field label={`Centres concernés (${centerIds.length})`}>
          <div className="max-h-[180px] overflow-y-auto rounded-md border border-ink-150 p-2 space-y-1">
            {centers.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input type="checkbox" checked={centerIds.includes(c.id)} onChange={() => toggle(centerIds, setCenterIds, c.id)} />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </Field>
        <Field label={`Ateliers (${workshopIds.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {workshops.map((w) => {
              const on = workshopIds.includes(w.id);
              return (
                <button key={w.id} type="button" onClick={() => toggle(workshopIds, setWorkshopIds, w.id)}
                  className={"px-2 h-7 rounded-full text-[12px] border transition-colors " + (on ? "bg-ink-900 text-paper border-ink-900" : "bg-paper text-ink-700 border-ink-150 hover:bg-ink-50")}>
                  {w.name}
                </button>
              );
            })}
          </div>
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button onClick={remove} className="h-9 px-3 rounded-md border border-s-refused-border text-s-refused-ink text-[13px] hover:bg-s-refused-bg">
          Supprimer le projet
        </button>
        <div className="flex items-center gap-3">
          {saved && <span className="text-[12px] text-s-confirmed-ink">Enregistré ✓</span>}
          <button onClick={save} disabled={!name.trim()}
            className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-50">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-ink-500 mb-1">{label}</div>
      {children}
    </div>
  );
}
