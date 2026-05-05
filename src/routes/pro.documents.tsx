import { createFileRoute } from "@tanstack/react-router";
import { DocumentsPanel } from "@/components/DocumentsPanel";
import { useStore, currentUserStore } from "@/data/store";

export const Route = createFileRoute("/pro/documents")({
  component: ProDocuments,
});

function ProDocuments() {
  const user = useStore(currentUserStore);
  const providerId = user.providerId ?? "p1";

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-[860px] mx-auto">
      <header className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Mes documents</h1>
        <p className="text-[13px] text-ink-500 mt-1">
          Documents administratifs, attestations, contrats. L'admin peut aussi en déposer pour vous.
        </p>
      </header>
      <DocumentsPanel providerId={providerId} asRole="self" />
    </div>
  );
}
