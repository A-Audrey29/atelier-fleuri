import { createFileRoute, Link } from "@tanstack/react-router";
import { providers } from "@/data/seed";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { Avatar } from "@/components/Avatar";

export const Route = createFileRoute("/admin/providers/$providerId/documents")({
  component: AdminProviderDocs,
});

function AdminProviderDocs() {
  const { providerId } = Route.useParams();
  const provider = providers.find((p) => p.id === providerId);
  if (!provider) {
    return <div className="p-8 text-[14px] text-ink-500">Prestataire introuvable. <Link to="/admin/providers" className="underline">Retour</Link></div>;
  }
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[860px] mx-auto">
      <Link to="/admin/providers" className="text-[12px] text-ink-500 hover:text-ink-900">← Prestataires</Link>
      <header className="mt-3 mb-6 flex items-center gap-4">
        <Avatar name={provider.fullName} size={56} />
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">{provider.fullName}</h1>
          <p className="text-[13px] text-ink-500">{provider.roles.join(", ")} · {provider.city}</p>
        </div>
      </header>
      <DocumentsPanel providerId={provider.id} asRole="admin" />
    </div>
  );
}
