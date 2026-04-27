import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { workshops, centers } from "@/data/seed";

export const Route = createFileRoute("/app/sessions/new")({
  component: NewSessionWizard,
});

function NewSessionWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [workshopId, setWorkshopId] = useState<string>("");
  const [centerId, setCenterId] = useState<string>("");
  const [groupLabel, setGroupLabel] = useState<string>("Groupe 1");
  const [seances, setSeances] = useState<Array<{ date: string; time: string }>>([{ date: "", time: "14:00" }]);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[760px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Nouvelle session d'atelier</h1>
        <p className="text-[13px] text-ink-500 mt-1">Étape {step} / 4</p>
      </header>

      <div className="flex gap-1 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-ink-900" : "bg-ink-150"}`} />
        ))}
      </div>

      <div className="rounded-xl border border-ink-150 bg-card p-6">
        {step === 1 && (
          <Step title="Choisir un atelier">
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
                    <div className="text-[12px] text-ink-500 mt-0.5">{w.requiredRoles.join(" · ")}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Step>
        )}

        {step === 2 && (
          <Step title="Choisir un centre social">
            <ul className="grid gap-2">
              {centers.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCenterId(c.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      centerId === c.id ? "border-ink-900 bg-ink-50" : "border-ink-150 hover:border-ink-300"
                    }`}
                  >
                    <div className="text-[14px] font-medium">{c.name}</div>
                    <div className="text-[12px] text-ink-500 mt-0.5">{c.city}</div>
                  </button>
                </li>
              ))}
            </ul>
          </Step>
        )}

        {step === 3 && (
          <Step title="Planifier les séances">
            <div className="mb-4">
              <label className="block text-[12px] text-ink-500 mb-1">Nom du groupe</label>
              <input
                value={groupLabel}
                onChange={(e) => setGroupLabel(e.target.value)}
                className="w-full h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300"
              />
            </div>
            <div className="space-y-2">
              {seances.map((s, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink-50 border border-ink-150 text-[12px] font-semibold">{idx + 1}</span>
                  <input type="date" value={s.date} onChange={(e) => {
                    const c = [...seances]; c[idx].date = e.target.value; setSeances(c);
                  }} className="flex-1 h-9 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                  <input type="time" value={s.time} onChange={(e) => {
                    const c = [...seances]; c[idx].time = e.target.value; setSeances(c);
                  }} className="h-9 w-24 rounded-md border border-ink-200 bg-card px-3 text-[13px]" />
                  {seances.length > 1 && (
                    <button onClick={() => setSeances(seances.filter((_, i) => i !== idx))} className="h-7 w-7 grid place-items-center text-ink-400 hover:text-ink-900">⊘</button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setSeances([...seances, { date: "", time: "14:00" }])}
                className="text-[12px] text-accent-ink hover:underline"
              >
                + Ajouter une séance
              </button>
            </div>
          </Step>
        )}

        {step === 4 && (
          <Step title="Récapitulatif">
            <dl className="text-[13px] space-y-2.5">
              <Row label="Atelier" value={workshops.find(w => w.id === workshopId)?.name ?? "—"} />
              <Row label="Centre" value={centers.find(c => c.id === centerId)?.name ?? "—"} />
              <Row label="Groupe" value={groupLabel} />
              <Row label="Séances" value={`${seances.length} séance${seances.length > 1 ? "s" : ""}`} />
            </dl>
          </Step>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-ink-150 pt-4">
          <button
            disabled={step === 1}
            onClick={() => setStep(step - 1)}
            className="h-9 px-3 rounded-md text-[13px] text-ink-500 hover:text-ink-900 disabled:opacity-40"
          >
            ‹ Précédent
          </button>
          {step < 4 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={(step === 1 && !workshopId) || (step === 2 && !centerId)}
              className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={() => navigate({ to: "/app" })}
              className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700"
            >
              Créer la session
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-[16px] font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-ink-150 pb-2 last:border-b-0">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900 text-right">{value}</dd>
    </div>
  );
}
