import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { workshopsStore, useStore, currentUserStore, centersStore } from "@/data/store";
import { RoleDot } from "@/lib/roleColors";

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
  const [workshopName, setWorkshopName] = useState<string>("");
  const [sessionNumber, setSessionNumber] = useState<string>("1");
  const [seanceNumber, setSeanceNumber] = useState<string>("1");
  const [notes, setNotes] = useState<string>("");
  // Index des slots cochés (par défaut tous)
  const [activeSlotIdx, setActiveSlotIdx] = useState<number[]>([]);

  const ws = workshops.find((w) => w.id === workshopId);

  useEffect(() => {
    if (ws) setActiveSlotIdx(ws.requiredRoles.map((_, i) => i));
  }, [workshopId]);

  function pickWorkshop(id: string) {
    setWorkshopId(id);
    const w = workshops.find((x) => x.id === id);
    if (w) setWorkshopName(w.name);
  }

  function toggleSlot(i: number) {
    setActiveSlotIdx((arr) => arr.includes(i) ? arr.filter((x) => x !== i) : [...arr, i].sort());
  }

  const fullName = ws ? `${workshopName} — Session ${sessionNumber} · Séance ${seanceNumber}` : "";

  function submit() {
    navigate({
      to: "/app/availability",
      search: { workshopId, slots: activeSlotIdx.join(",") } as never,
    });
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
                  onClick={() => pickWorkshop(w.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    workshopId === w.id ? "border-ink-900 bg-ink-50" : "border-ink-150 hover:border-ink-300"
                  }`}
                >
                  <div className="text-[14px] font-medium">{w.name}</div>
                  <div className="text-[12px] text-ink-500 mt-0.5">
                    {w.requiredRoles.map((s) => s.label).join(" · ")}
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
            <div>
              <label className="block text-[12px] text-ink-500 mb-2">Rôles nécessaires pour cette séance</label>
              <p className="text-[11px] text-ink-500 mb-2">
                Décochez les rôles non requis pour cette séance précise. Les rôles
                décochés seront tracés comme <em>"non requis"</em> et n'apparaîtront
                pas dans le filtre du calendrier suivant.
              </p>
              <ul className="space-y-1.5">
                {ws.requiredRoles.map((slot, i) => {
                  const active = activeSlotIdx.includes(i);
                  const isAlt = slot.acceptedRoles.length > 1;
                  return (
                    <li key={i}>
                      <label className={`flex items-start gap-2 p-2 rounded-md border cursor-pointer ${active ? "border-ink-900 bg-ink-50" : "border-ink-150 opacity-60"}`}>
                        <input
                          type="checkbox"
                          checked={active}
                          onChange={() => toggleSlot(i)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-medium text-ink-900">{slot.label} <span className="text-[11px] text-ink-500 font-normal">— 1 personne</span></div>
                          <div className="mt-1 flex flex-wrap items-center gap-1">
                            {isAlt && <span className="text-[10px] uppercase tracking-wider text-ink-400">l'un OU l'autre :</span>}
                            {slot.acceptedRoles.map((r) => (
                              <span key={r} className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-card border border-ink-200">
                                <RoleDot role={r} size={7} />{r}
                              </span>
                            ))}
                          </div>
                        </div>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <Field label="Nom de l'atelier">
                <input value={workshopName} onChange={(e) => setWorkshopName(e.target.value)}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
              </Field>
              <Field label="Numéro de la session">
                <input type="number" min={1} value={sessionNumber} onChange={(e) => setSessionNumber(e.target.value)}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
              </Field>
              <Field label="Numéro de la séance">
                <input type="number" min={1} max={ws.seancesCount ?? 99} value={seanceNumber} onChange={(e) => setSeanceNumber(e.target.value)}
                  className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
              </Field>
            </div>

            <div className="rounded-md bg-accent-soft/50 border border-accent/30 px-4 py-3">
              <div className="text-[11px] uppercase tracking-wider text-ink-400 mb-1">Nom précis de l'atelier</div>
              <div className="text-[14px] font-medium text-ink-900">{fullName}</div>
            </div>

            <Field label="Notes pour le prestataire (optionnel)">
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
                className="w-full rounded-md border border-ink-200 bg-card px-3 py-2 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300" />
            </Field>

            <div className="rounded-md bg-ink-50/60 border border-ink-150 px-4 py-3 text-[12px] text-ink-700">
              Étape suivante : choisir un créneau parmi les disponibilités des prestataires sur le calendrier.
              Le calendrier filtrera sur les rôles cochés ci-dessus ({activeSlotIdx.length}/{ws.requiredRoles.length}).
            </div>
          </>
        )}

        <div className="flex items-center justify-between border-t border-ink-150 pt-4">
          <button onClick={() => navigate({ to: "/app" })} className="h-9 px-3 rounded-md text-[13px] text-ink-500 hover:text-ink-900">Annuler</button>
          <button
            disabled={!workshopId || activeSlotIdx.length === 0}
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
