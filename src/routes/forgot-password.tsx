import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/forgot-password")({
  component: () => (
    <div className="min-h-screen bg-paper grid place-items-center px-4">
      <div className="w-full max-w-[380px]">
        <Link to="/" className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">A</div>
          <span className="text-[15px] font-semibold">Asanblé</span>
        </Link>
        <div className="rounded-xl border border-ink-150 bg-card p-6">
          <h1 className="text-[20px] font-semibold mb-1">Mot de passe oublié</h1>
          <p className="text-[13px] text-ink-500 mb-5">Recevez un lien de réinitialisation par email.</p>
          <form className="space-y-3">
            <input type="email" placeholder="email@centre-social.fr" className="w-full h-10 rounded-md border border-ink-200 bg-paper px-3 text-[13px]" />
            <button type="button" className="w-full h-10 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700">
              Envoyer le lien
            </button>
          </form>
          <div className="mt-4 text-center text-[12px]">
            <Link to="/login" className="text-ink-500 hover:text-ink-900">‹ Retour à la connexion</Link>
          </div>
        </div>
      </div>
    </div>
  ),
});
