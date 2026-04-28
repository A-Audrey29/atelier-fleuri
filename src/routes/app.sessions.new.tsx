import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { workshopsStore, useStore, currentUserStore, centersStore } from "@/data/store";

export const Route = createFileRoute("/app/sessions/new")({
  component: NewSeance,
});

function NewSeance() {
  const navigate = useNavigate();
  const workshops = useStore(workshopsStore);
  const user = useStore(currentUserStore);
  const centers = useStore(centersStore);
  const center = centers.find((c) => c.id === user.centerId);

  const [workshopId, setWorkshopId] = useState<string>("");
  const [groupLabel, setGroupLabel] = useState<string>("Groupe 1");
  const [audience, setAudience] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const ws = workshops.find((w) => w.id === workshopId);

  function submit() {
    // Mock: création locale → redirige vers le calendrier de dispos pour booker
    navigate({ to: "/app/availability" });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[760px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Nouvelle séance d'atelier</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Centre social : <span className="text-ink-900 font-medium">{center?.name ?? "—"}</span>
        </p>
      </header>

      <div className="rounded-xl border border-ink-150 bg-card p-6 space-y-5">
        <div>
          <label className="block text-[12px] text-ink-500 mb-2">Atelier</label>
          <ul className="grid gap-2">
            {workshops.map((w) => (
              <li key={w.id}>
                <button
                  onClick={() => setWorkshopId(w.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    workshopId === w.id ? "border-ink-900 bg-ink-50" : "border-ink-150 hover:border-ink-300"
                  }`}
                >
                  <div className="text-[14px] font-medium">{w.name}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">
                    {w.requiredRoles.join(" · ")}
                    {w.seancesCount ? ` · ${w.seancesCount} séances` : ""}
                    {w.durationMin ? ` · ${w.durationMin} min` : ""}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>

        {ws && (
          <>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Nom du groupe">
                <input value={groupLabel} onChange={(e) => setGroupLabel(e.target.value)}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
              </Field>
              <Field label="Public visé">
                <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="ex. 8 adolescents 13-16 ans"
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
              </Field>
            </div>
            <Field label="Notes pour le prestataire (optionnel)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full rounded-md border border-ink-200 bg-card px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
            </Field>

            <div className="rounded-md bg-ink-50/60 border border-ink-150 px-4 py-3 text-[12px] text-ink-700">
              Étape suivante : choisir un créneau parmi les disponibilités des prestataires sur le calendrier.
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-ink-150 pt-4">
          <button onClick={() => navigate({ to: "/app" })} className="h-9 px-3 rounded-md text-[13px] text-ink-500 hover:text-ink-900">Annuler</button>
          <button
            disabled={!workshopId}
            onClick={submit}
            className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40"
          >
            Voir les disponibilités →
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[12px] text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
