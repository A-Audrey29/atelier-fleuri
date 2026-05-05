import { useRef } from "react";
import { providerDocumentsStore, useStore, currentUserStore } from "@/data/store";
import type { ProviderDocument } from "@/data/types";

interface Props {
  providerId: string;
  /** "self" → uploads sont marqués comme "provider" et seules les siennes sont supprimables.
   *  "admin" → uploads marqués "admin", peut supprimer les siens (admin) uniquement. */
  asRole: "self" | "admin";
}

export function DocumentsPanel({ providerId, asRole }: Props) {
  const docs = useStore(providerDocumentsStore).filter((d) => d.providerId === providerId);
  const user = useStore(currentUserStore);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const doc: ProviderDocument = {
          id: `doc${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          providerId,
          name: file.name,
          sizeBytes: file.size,
          mimeType: file.type || "application/octet-stream",
          dataUrl: typeof reader.result === "string" ? reader.result : "",
          uploadedBy: user.id,
          uploadedByName: `${user.firstName} ${user.lastName}`,
          uploadedByRole: asRole === "admin" ? "admin" : "provider",
          uploadedAt: new Date().toISOString(),
        };
        providerDocumentsStore.update((arr) => [doc, ...arr]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function download(d: ProviderDocument) {
    if (!d.dataUrl) {
      alert("Document de démo (sans contenu).");
      return;
    }
    const a = document.createElement("a");
    a.href = d.dataUrl;
    a.download = d.name;
    a.click();
  }

  function remove(d: ProviderDocument) {
    if (d.uploadedBy !== user.id) return;
    if (!confirm(`Supprimer "${d.name}" ?`)) return;
    providerDocumentsStore.update((arr) => arr.filter((x) => x.id !== d.id));
  }

  return (
    <section className="rounded-xl border border-ink-150 bg-card">
      <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-ink-150">
        <div>
          <h2 className="text-[14px] font-semibold">Documents</h2>
          <p className="text-[12px] text-ink-500 mt-0.5">
            {docs.length} fichier{docs.length > 1 ? "s" : ""} · vous ne pouvez supprimer que ceux que vous avez déposés.
          </p>
        </div>
        <label className="h-9 px-3 rounded-md bg-ink-900 text-paper text-[13px] font-medium hover:bg-ink-700 inline-flex items-center cursor-pointer">
          + Téléverser
          <input ref={fileRef} type="file" multiple className="hidden" onChange={onPick} />
        </label>
      </header>

      {docs.length === 0 ? (
        <div className="p-8 text-center text-[13px] text-ink-400">
          Aucun document pour l'instant.
        </div>
      ) : (
        <ul className="divide-y divide-ink-150">
          {docs.map((d) => {
            const mine = d.uploadedBy === user.id;
            return (
              <li key={d.id} className="px-5 py-3 flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-ink-50 grid place-items-center text-ink-500 shrink-0">📄</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{d.name}</div>
                  <div className="text-[11px] text-ink-500 mt-0.5">
                    {fmtSize(d.sizeBytes)} · déposé par {d.uploadedByName}
                    <span className={"ml-1 px-1.5 py-0.5 rounded text-[10px] " + (d.uploadedByRole === "admin" ? "bg-ink-100 text-ink-700" : "bg-s-confirmed-bg text-s-confirmed-ink")}>
                      {d.uploadedByRole === "admin" ? "Admin" : "Prestataire"}
                    </span>
                    {" · "}{fmtDate(d.uploadedAt)}
                  </div>
                </div>
                <button
                  onClick={() => download(d)}
                  className="h-8 px-2.5 rounded-md border border-ink-200 text-[12px] text-ink-700 hover:bg-ink-50"
                >
                  Télécharger
                </button>
                <button
                  onClick={() => remove(d)}
                  disabled={!mine}
                  title={mine ? "Supprimer" : "Seul le déposant peut supprimer"}
                  className="h-8 px-2.5 rounded-md border border-ink-200 text-[12px] text-s-refused-ink hover:bg-s-refused-bg disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  Supprimer
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function fmtSize(b: number) {
  if (b < 1024) return `${b} o`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} Ko`;
  return `${(b / 1024 / 1024).toFixed(1)} Mo`;
}
function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}
