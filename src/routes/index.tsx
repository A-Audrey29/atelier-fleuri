import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Asanblé — Booking d'ateliers pour centres sociaux en Guadeloupe" },
      { name: "description", content: "Le SaaS qui simplifie la coordination de séances d'ateliers entre référents famille, prestataires et équipes Asanblé." },
      { property: "og:title", content: "Asanblé — Booking d'ateliers" },
      { property: "og:description", content: "Coordonnez vos séances d'ateliers en Guadeloupe avec vos prestataires." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink-900">
      <header className="px-5 md:px-10 py-5 flex items-center justify-between border-b border-ink-150">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md bg-ink-900 text-paper grid place-items-center text-[13px] font-semibold">A</div>
          <span className="text-[15px] font-semibold">Asanblé</span>
        </div>
        <nav className="flex items-center gap-2">
          <Link to="/login" className="text-[13px] text-ink-500 hover:text-ink-900 px-3 py-1.5">Se connecter</Link>
          <Link to="/signup" className="text-[13px] bg-ink-900 text-paper hover:bg-ink-700 px-3.5 py-2 rounded-md font-medium">Créer un compte</Link>
        </nav>
      </header>

      <main className="px-5 md:px-10">
        <section className="max-w-[920px] mx-auto pt-16 md:pt-24 pb-16 text-center">
          <span className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-accent-ink bg-accent-soft border border-accent/30 px-2.5 py-1 rounded-full mb-6">
            Guadeloupe · Centres sociaux
          </span>
          <h1 className="text-[40px] md:text-[56px] font-semibold tracking-tight leading-[1.05]">
            Coordonnez vos ateliers,<br />
            <span className="text-ink-500">sans la paperasse.</span>
          </h1>
          <p className="text-[16px] text-ink-500 max-w-[560px] mx-auto mt-6 leading-relaxed">
            Asanblé orchestre les sessions d'ateliers multi-séances entre référents famille,
            prestataires intervenants et équipes coordinatrices. Plus de tableaux Excel,
            plus de coups de fil perdus.
          </p>
          <div className="flex justify-center gap-2 mt-8">
            <Link to="/signup" className="h-11 px-5 rounded-md bg-ink-900 text-paper text-[14px] font-medium hover:bg-ink-700 inline-flex items-center">
              Créer un compte
            </Link>
            <Link to="/app" className="h-11 px-5 rounded-md border border-ink-200 text-[14px] font-medium hover:bg-ink-50 inline-flex items-center">
              Voir la démo →
            </Link>
          </div>
        </section>

        <section className="max-w-[1100px] mx-auto pb-20 grid md:grid-cols-3 gap-3">
          <Card
            title="Référent famille"
            desc="Créez un ticket en un clic, suivez l'engagement de chaque prestataire, relancez si besoin."
            cta={<Link to="/app" className="text-accent-ink hover:underline text-[13px]">Espace référent ›</Link>}
          />
          <Card
            title="Prestataire"
            desc="Vos disponibilités, vos bookings confirmés et tous les détails terrain dans un seul écran."
            cta={<Link to="/pro" className="text-accent-ink hover:underline text-[13px]">Espace prestataire ›</Link>}
          />
          <Card
            title="Admin Asanblé"
            desc="Triage des blocages, supervision des dispositifs, exports comptables conformes."
            cta={<Link to="/admin" className="text-accent-ink hover:underline text-[13px]">Espace admin ›</Link>}
          />
        </section>
      </main>

      <footer className="border-t border-ink-150 px-5 md:px-10 py-6 text-[12px] text-ink-400 flex items-center justify-between">
        <span>© Asanblé — Pointe-à-Pitre</span>
        <span>fr-FR · GMT-4</span>
      </footer>
    </div>
  );
}

function Card({ title, desc, cta }: { title: string; desc: string; cta: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-ink-150 bg-card p-5 hover:border-ink-300 transition-colors">
      <div className="text-[14px] font-semibold mb-1.5">{title}</div>
      <p className="text-[13px] text-ink-500 leading-relaxed mb-3">{desc}</p>
      {cta}
    </div>
  );
}
