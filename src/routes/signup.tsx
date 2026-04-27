import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

function SignupPage() {
  const [type, setType] = useState<"center" | "provider">("center");
  return (
    <div className="min-h-screen bg-paper grid place-items-center px-4 py-10">
      <div className="w-full max-w-[420px]">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">A</div>
          <span className="text-[15px] font-semibold">Asanblé</span>
        </Link>
        <div className="rounded-xl border border-ink-150 bg-card p-6">
          <h1 className="text-[20px] font-semibold mb-1">Créer un compte</h1>
          <p className="text-[13px] text-ink-500 mb-5">Choisissez votre profil pour commencer.</p>

          <div className="grid grid-cols-2 gap-2 mb-5">
            <button
              onClick={() => setType("center")}
              className={`p-3 rounded-md border text-left transition-colors ${type === "center" ? "border-ink-900 bg-ink-50" : "border-ink-150 hover:border-ink-300"}`}
            >
              <div className="text-[13px] font-medium">Centre social</div>
              <div className="text-[11px] text-ink-500 mt-0.5">Référent famille</div>
            </button>
            <button
              onClick={() => setType("provider")}
              className={`p-3 rounded-md border text-left transition-colors ${type === "provider" ? "border-ink-900 bg-ink-50" : "border-ink-150 hover:border-ink-300"}`}
            >
              <div className="text-[13px] font-medium">Prestataire</div>
              <div className="text-[11px] text-ink-500 mt-0.5">Intervenant</div>
            </button>
          </div>

          <form className="space-y-3">
            <Field label={type === "center" ? "Nom du centre" : "Votre nom complet"}>
              <input className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            </Field>
            <Field label="Email">
              <input type="email" className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            </Field>
            <Field label="Mot de passe">
              <input type="password" className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            </Field>
            <button type="button" className="w-full h-10 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
              Créer mon compte
            </button>
          </form>
          <div className="mt-4 text-center text-[12px] text-ink-500">
            Déjà inscrit ? <Link to="/login" className="text-ink-900 hover:underline">Se connecter</Link>
          </div>
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
