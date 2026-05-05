import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SideDrawer } from "@/components/SideDrawer";
import { projectsStore, workshopsStore, centersStore, useStore } from "@/data/store";
import type { Project, Center, Workshop } from "@/data/types";

export const Route = createFileRoute("/admin/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  const projects = useStore(projectsStore);
  const workshops = useStore(workshopsStore);
  const centers = useStore(centersStore);
  const [open, setOpen] = useState(false);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Projets</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            {projects.length} projet{projects.length > 1 ? "s" : ""} · clique sur une carte pour entrer dans son espace dédié.
          </p>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700"
        >
          + Nouveau projet
        </button>
      </header>

      <ul className="space-y-2">
        {projects.map((p) => {
          const ws = p.workshopIds.map((id) => workshops.find((w) => w.id === id)?.name).filter(Boolean);
          return (
            <li key={p.id} className="rounded-lg border border-ink-150 bg-card hover:border-ink-300 transition-colors">
              <div className="flex items-start gap-3 p-4">
                <Link
                  to="/projects/$projectId"
                  params={{ projectId: p.id }}
                  className="flex-1 min-w-0"
                >
                  <div className="text-[14px] font-semibold">
                    {p.name}{p.description ? ` — ${p.description}` : ""}
                  </div>
                  <div className="text-[12px] text-ink-500 mt-1">
                    {p.centerIds.length} centre{p.centerIds.length > 1 ? "s" : ""}
                    {p.budget ? ` · Budget ${p.budget.toLocaleString("fr-FR")} €` : ""}
                    {p.startDate && p.endDate ? ` · Période ${fmt(p.startDate)} → ${fmt(p.endDate)}` : ""}
                    {p.funder ? ` · Financeur ${p.funder}` : ""}
                  </div>
                  {ws.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {ws.map((n) => (
                        <span key={n} className="text-[11px] px-2 py-0.5 rounded-full bg-ink-50 text-ink-700">{n}</span>
                      ))}
                    </div>
                  )}
                </Link>
                <Link
                  to="/projects/$projectId/settings"
                  params={{ projectId: p.id }}
                  className="shrink-0 h-8 px-2.5 rounded-md border border-ink-200 text-[12px] text-ink-700 hover:bg-ink-50 inline-flex items-center gap-1"
                  aria-label={`Modifier ${p.name}`}
                >
                  ✎ Modifier
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      <NewProjectDrawer
        open={open}
        onClose={() => setOpen(false)}
        centers={centers}
        workshops={workshops}
      />
    </div>
  );
}

function fmt(d: string) {
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function NewProjectDrawer({
  open, onClose, centers, workshops,
}: {
  open: boolean; onClose: () => void;
  centers: Center[];
  workshops: Workshop[];
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [funder, setFunder] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [centerIds, setCenterIds] = useState<string[]>([]);
  const [workshopIds, setWorkshopIds] = useState<string[]>([]);

  function reset() {
    setName(""); setDescription(""); setFunder(""); setBudget("");
    setStartDate(""); setEndDate(""); setCenterIds([]); setWorkshopIds([]);
  }

  function toggle(arr: string[], setArr: (v: string[]) => void, id: string) {
    setArr(arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);
  }

  function submit() {
    if (!name.trim()) return;
    const p: Project = {
      id: `pr${Date.now()}`,
      name: name.trim(),
      description: description.trim() || undefined,
      funder: funder.trim() || undefined,
      budget: budget ? Number(budget) : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      centerIds,
      workshopIds,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    projectsStore.update((s) => [...s, p]);
    reset();
    onClose();
  }

  const canSubmit = name.trim().length > 0;

  return (
    <SideDrawer
      open={open}
      onClose={() => { reset(); onClose(); }}
      title="Nouveau projet"
      subtitle="Créer un projet"
      width={420}
      footer={
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { reset(); onClose(); }} className="h-9 px-3 rounded-md text-[13px] text-ink-700 hover:bg-ink-50">
            Annuler
          </button>
          <button
            disabled={!canSubmit}
            onClick={submit}
            className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium disabled:opacity-50 hover:bg-ink-700"
          >
            Créer le projet
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Nom du projet">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ex. REAAP 2026"
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
          />
        </Field>

        <Field label="Description courte">
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="ex. Réseau Écoute Appui Accompagnement Parents"
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
          />
        </Field>

        <Field label="Financeur">
          <input
            value={funder}
            onChange={(e) => setFunder(e.target.value)}
            placeholder="ex. CAF Guadeloupe, ARS, DRAC…"
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
          />
        </Field>

        <Field label="Budget (€)">
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="ex. 30000"
            className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Début">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
            />
          </Field>
          <Field label="Fin">
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-9 w-full rounded-md border border-ink-150 bg-paper px-2 text-[13px]"
            />
          </Field>
        </div>

        <Field label={`Centres concernés (${centerIds.length})`}>
          <div className="max-h-[160px] overflow-y-auto rounded-md border border-ink-150 p-2 space-y-1">
            {centers.map((c) => (
              <label key={c.id} className="flex items-center gap-2 text-[13px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={centerIds.includes(c.id)}
                  onChange={() => toggle(centerIds, setCenterIds, c.id)}
                />
                <span>{c.name}</span>
              </label>
            ))}
          </div>
        </Field>

        <Field label={`Ateliers du projet (${workshopIds.length})`}>
          <div className="flex flex-wrap gap-1.5">
            {workshops.map((w) => {
              const on = workshopIds.includes(w.id);
              return (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => toggle(workshopIds, setWorkshopIds, w.id)}
                  className={
                    "px-2 h-7 rounded-full text-[12px] border transition-colors " +
                    (on
                      ? "bg-ink-900 text-paper border-ink-900"
                      : "bg-paper text-ink-700 border-ink-150 hover:bg-ink-50")
                  }
                >
                  {w.name}
                </button>
              );
            })}
          </div>
        </Field>
      </div>
    </SideDrawer>
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
