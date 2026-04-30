import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, workshopsStore, roleColorsStore, DEFAULT_ROLE_COLORS } from "@/data/store";
import type { RoleName } from "@/data/types";
import { SideDrawer } from "@/components/SideDrawer";
import { ALL_ROLES_LIST, RoleDot } from "@/lib/roleColors";

export const Route = createFileRoute("/admin/workshops")({
  component: WorkshopsPage,
});

const ALL_ROLES: RoleName[] = [
  "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

function WorkshopsPage() {
  const workshops = useStore(workshopsStore);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [seancesCount, setSeancesCount] = useState<number>(4);
  const [durationMin, setDurationMin] = useState<number>(90);
  const [roles, setRoles] = useState<RoleName[]>([]);

  function reset() {
    setName(""); setSeancesCount(4); setDurationMin(90); setRoles([]);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    workshopsStore.update((arr) => [
      ...arr,
      { id: `w${arr.length + 1}_${Date.now()}`, name, seancesCount, durationMin, requiredRoles: roles },
    ]);
    setOpen(false);
    reset();
  }

  function toggleRole(r: RoleName) {
    setRoles((rs) => rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[1000px] mx-auto">
      <header className="mb-5 flex justify-between items-end">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">Ateliers</h1>
          <p className="text-[13px] text-ink-500 mt-1">{workshops.length} ateliers actifs.</p>
        </div>
        <button onClick={() => setOpen(true)} className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
          + Nouvel atelier
        </button>
      </header>

      <ul className="grid sm:grid-cols-2 gap-2">
        {workshops.map((w) => (
          <li key={w.id} className="rounded-lg border border-ink-150 bg-card p-4">
            <div className="text-[14px] font-semibold">{w.name}</div>
            <div className="text-[12px] text-ink-500 mt-1">
              {w.seancesCount ?? "—"} séance{(w.seancesCount ?? 0) > 1 ? "s" : ""} · {w.durationMin ?? "—"} min
            </div>
            <div className="text-[12px] text-ink-500 mt-2 flex flex-wrap gap-1">
              {w.requiredRoles.map((r) => (
                <span key={r} className="bg-ink-50 border border-ink-150 rounded-full px-2 py-0.5">{r}</span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <RoleColorsPanel />

      <SideDrawer
        open={open}
        onClose={() => setOpen(false)}
        subtitle="Catalogue"
        title="Nouvel atelier"
        footer={
          <div className="flex gap-2">
            <button onClick={submit} disabled={!name} className="flex-1 h-9 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40">
              Créer l'atelier
            </button>
            <button onClick={() => { setOpen(false); reset(); }} className="h-9 px-3 rounded-md border border-ink-200 text-[13px] text-ink-500 hover:bg-ink-50">
              Annuler
            </button>
          </div>
        }
      >
        <form onSubmit={submit} className="space-y-4 text-[13px]">
          <Field label="Nom de l'atelier">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Gestion des émotions"
              className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre de séances">
              <input type="number" min={1} max={50} value={seancesCount} onChange={(e) => setSeancesCount(+e.target.value)} className="input" />
            </Field>
            <Field label="Durée (min)">
              <input type="number" min={15} step={15} value={durationMin} onChange={(e) => setDurationMin(+e.target.value)} className="input" />
            </Field>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-ink-400 mb-2">Rôles requis</span>
            <div className="flex flex-wrap gap-1.5">
              {ALL_ROLES.map((r) => {
                const active = roles.includes(r);
                return (
                  <button type="button" key={r} onClick={() => toggleRole(r)}
                    className={`text-[12px] rounded-full px-2.5 py-1 border ${active ? "bg-ink-900 text-paper border-ink-900" : "bg-card text-ink-700 border-ink-200 hover:border-ink-400"}`}>
                    {r}
                  </button>
                );
              })}
            </div>
          </div>
        </form>
        <style>{`.input { width: 100%; height: 36px; border: 1px solid var(--ink-200); background: var(--card); border-radius: 6px; padding: 0 12px; font-size: 13px; outline: none; }`}</style>
      </SideDrawer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-wider text-ink-400 mb-1">{label}</span>
      {children}
    </label>
  );
}

function RoleColorsPanel() {
  const colors = useStore(roleColorsStore);
  function setColor(role: RoleName, value: string) {
    roleColorsStore.update((m) => ({ ...m, [role]: value }));
  }
  function reset() {
    roleColorsStore.set({ ...DEFAULT_ROLE_COLORS });
  }
  return (
    <section className="mt-8">
      <header className="mb-3 flex items-end justify-between">
        <div>
          <h2 className="text-[16px] font-semibold tracking-tight">Couleurs des rôles</h2>
          <p className="text-[12px] text-ink-500 mt-0.5">
            Pastilles utilisées dans le calendrier des disponibilités prestataires.
          </p>
        </div>
        <button onClick={reset} className="h-8 px-3 rounded-md border border-ink-200 text-[12px] text-ink-700 hover:bg-ink-50">
          Réinitialiser
        </button>
      </header>
      <ul className="grid sm:grid-cols-2 gap-1.5 rounded-lg border border-ink-150 bg-card p-3">
        {ALL_ROLES_LIST.map((r) => (
          <li key={r} className="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-ink-50">
            <RoleDot role={r} size={12} />
            <span className="text-[13px] flex-1">{r}</span>
            <input
              type="color"
              value={colors[r]}
              onChange={(e) => setColor(r, e.target.value)}
              className="h-7 w-12 rounded border border-ink-200 bg-transparent cursor-pointer"
              aria-label={`Couleur ${r}`}
            />
            <code className="text-[11px] text-ink-500 w-[68px] text-right">{colors[r]}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
