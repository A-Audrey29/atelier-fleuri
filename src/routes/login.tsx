import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-paper grid place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">A</div>
          <span className="text-[15px] font-semibold">Asanblé</span>
        </Link>
        <div className="rounded-xl border border-ink-150 bg-card p-6">
          <h1 className="text-[20px] font-semibold mb-1">Connexion</h1>
          <p className="text-[13px] text-ink-500 mb-5">Accédez à votre espace.</p>
          <form
            onSubmit={(e) => { e.preventDefault(); navigate({ to: "/app" }); }}
            className="space-y-3"
          >
            <Field label="Email">
              <input type="email" required defaultValue="mathilde@asanble.gp" className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            </Field>
            <Field label="Mot de passe">
              <input type="password" required defaultValue="demo1234" className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            </Field>
            <button type="submit" className="w-full h-10 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
              Se connecter
            </button>
          </form>
          <div className="mt-4 text-center text-[12px] text-ink-500">
            <Link to="/forgot-password" className="hover:text-ink-900">Mot de passe oublié ?</Link>
            <span className="mx-2">·</span>
            <Link to="/signup" className="hover:text-ink-900">Créer un compte</Link>
          </div>
        </div>
        <div className="mt-4 text-center text-[11px] text-ink-400">
          Démo : accédez aux 3 espaces depuis la page d'accueil.
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
