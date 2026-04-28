import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useStore, currentUserStore, accountsStore, centersStore } from "@/data/store";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/account")({
  component: AccountPage,
});

function AccountPage() {
  const user = useStore(currentUserStore);
  const centers = useStore(centersStore);
  const center = centers.find((c) => c.id === user.centerId);

  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [saved, setSaved] = useState<"profile" | "password" | null>(null);

  function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    const updated = { ...user, firstName, lastName, email };
    currentUserStore.set(updated);
    accountsStore.update((arr) => arr.map((a) => (a.id === user.id ? updated : a)));
    setSaved("profile");
    setTimeout(() => setSaved(null), 2000);
  }

  function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (pwd.length < 8 || pwd !== pwd2) return;
    setPwd(""); setPwd2("");
    setSaved("password");
    setTimeout(() => setSaved(null), 2000);
  }

  const roleLabel = user.role === "referent" ? "Référent famille" : user.role === "provider" ? "Prestataire" : "Admin";
  const back = user.role === "referent" ? "/app" : user.role === "provider" ? "/pro" : "/admin";

  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="border-b border-ink-150 bg-card">
        <div className="max-w-[760px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">A</div>
            <span className="text-[14px] font-semibold">Asanblé</span>
          </Link>
          <Link to={back} className="text-[13px] text-ink-500 hover:text-ink-900">← Retour</Link>
        </div>
      </header>

      <div className="max-w-[760px] mx-auto px-4 md:px-8 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Avatar name={`${firstName} ${lastName}`} size={64} />
          <div>
            <h1 className="text-[22px] font-semibold tracking-tight">Mon compte</h1>
            <p className="text-[13px] text-ink-500 mt-0.5">{roleLabel}{center ? ` · ${center.name}` : ""}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="rounded-xl border border-ink-150 bg-card p-6 mb-5">
          <h2 className="text-[15px] font-semibold mb-4">Informations</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom"><input value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input" /></Field>
            <Field label="Nom"><input value={lastName} onChange={(e) => setLastName(e.target.value)} className="input" /></Field>
            <Field label="Email" className="sm:col-span-2"><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" /></Field>
            {center && (
              <Field label="Centre social affilié" className="sm:col-span-2">
                <input value={center.name} disabled className="input bg-ink-50/60 text-ink-500" />
              </Field>
            )}
          </div>
          <div className="mt-5 flex items-center gap-3">
            <button className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">Enregistrer</button>
            {saved === "profile" && <span className="text-[12px] text-s-confirmed-ink">✓ Modifications enregistrées</span>}
          </div>
        </form>

        <form onSubmit={savePassword} className="rounded-xl border border-ink-150 bg-card p-6">
          <h2 className="text-[15px] font-semibold mb-4">Mot de passe</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Nouveau mot de passe"><input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} className="input" placeholder="8 caractères min." /></Field>
            <Field label="Confirmer"><input type="password" value={pwd2} onChange={(e) => setPwd2(e.target.value)} className="input" /></Field>
          </div>
          {pwd && pwd2 && pwd !== pwd2 && <p className="text-[12px] text-s-refused-ink mt-2">Les mots de passe ne correspondent pas.</p>}
          <div className="mt-5 flex items-center gap-3">
            <button disabled={pwd.length < 8 || pwd !== pwd2} className="h-9 px-4 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 disabled:opacity-40">Modifier le mot de passe</button>
            {saved === "password" && <span className="text-[12px] text-s-confirmed-ink">✓ Mot de passe modifié</span>}
          </div>
        </form>
      </div>

      <style>{`.input { width: 100%; height: 36px; border: 1px solid var(--ink-200); background: var(--card); border-radius: 6px; padding: 0 12px; font-size: 13px; outline: none; }
      .input:focus { box-shadow: 0 0 0 2px var(--ink-300); }`}</style>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-[12px] text-ink-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
