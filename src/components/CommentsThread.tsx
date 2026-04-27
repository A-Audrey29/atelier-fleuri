import { useEffect, useState, useSyncExternalStore } from "react";
import {
  addComment, commentsForSeance, deleteComment, subscribeComments, updateComment,
  type CommentAuthorRole, type SeanceComment,
} from "@/data/comments";
import { Avatar } from "./Avatar";

interface Props {
  seanceId: string;
  currentRole: CommentAuthorRole;
  currentName: string;
  /** Empêche l'écriture (lecture seule). */
  readOnly?: boolean;
}

const ROLE_LABEL: Record<CommentAuthorRole, string> = {
  referent: "Référent",
  provider: "Prestataire",
  admin: "Admin",
};

function useComments(seanceId: string) {
  return useSyncExternalStore(
    (cb) => {
      const unsub = subscribeComments(cb);
      return () => unsub();
    },
    () => commentsForSeance(seanceId),
    () => commentsForSeance(seanceId),
  );
}

export function CommentsThread({ seanceId, currentRole, currentName, readOnly }: Props) {
  const list = useComments(seanceId);
  const [body, setBody] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  // safety: if the edited comment disappears, reset
  useEffect(() => {
    if (editingId && !list.find((c) => c.id === editingId)) {
      setEditingId(null);
      setEditBody("");
    }
  }, [list, editingId]);

  function submit() {
    const trimmed = body.trim();
    if (!trimmed) return;
    addComment({ seanceId, authorRole: currentRole, authorName: currentName, body: trimmed });
    setBody("");
  }

  function startEdit(c: SeanceComment) {
    setEditingId(c.id);
    setEditBody(c.body);
  }

  function saveEdit() {
    const trimmed = editBody.trim();
    if (!trimmed || !editingId) return;
    updateComment(editingId, trimmed);
    setEditingId(null);
    setEditBody("");
  }

  return (
    <section className="rounded-xl border border-ink-150 bg-card overflow-hidden">
      <header className="px-5 py-3 border-b border-ink-150 flex items-center justify-between">
        <h2 className="text-[14px] font-semibold">Commentaires</h2>
        <span className="text-[12px] text-ink-500">{list.length} message{list.length > 1 ? "s" : ""}</span>
      </header>

      <ul className="divide-y divide-ink-150">
        {list.length === 0 && (
          <li className="px-5 py-6 text-center text-[13px] text-ink-500">
            Aucun commentaire pour cette séance.
          </li>
        )}
        {list.map((c) => {
          const mine = c.authorRole === currentRole && c.authorName === currentName;
          const isEditing = editingId === c.id;
          return (
            <li key={c.id} className="px-5 py-4">
              <div className="flex items-start gap-3">
                <Avatar name={c.authorName} size={32} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[13px] font-medium">{c.authorName}</span>
                    <span className="text-[11px] uppercase tracking-wider text-ink-400">{ROLE_LABEL[c.authorRole]}</span>
                    <span className="text-[11px] text-ink-400">· {fmtDateTime(c.createdAt)}{c.editedAt ? " · modifié" : ""}</span>
                  </div>

                  {isEditing ? (
                    <div className="mt-2">
                      <textarea
                        value={editBody}
                        onChange={(e) => setEditBody(e.target.value)}
                        rows={3}
                        className="w-full rounded-md border border-ink-200 bg-card p-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300 resize-y"
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={saveEdit}
                          className="h-8 px-3 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-700"
                        >
                          Enregistrer
                        </button>
                        <button
                          onClick={() => { setEditingId(null); setEditBody(""); }}
                          className="h-8 px-3 rounded-md text-[12px] text-ink-500 hover:text-ink-900"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-1 text-[13px] text-ink-700 whitespace-pre-wrap leading-relaxed">{c.body}</p>
                  )}

                  {!isEditing && mine && !readOnly && (
                    <div className="mt-1.5 flex gap-3 text-[11px]">
                      <button onClick={() => startEdit(c)} className="text-accent-ink hover:underline">Modifier</button>
                      <button
                        onClick={() => {
                          if (confirm("Supprimer ce commentaire ?")) deleteComment(c.id);
                        }}
                        className="text-ink-400 hover:text-ink-900"
                      >
                        Supprimer
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      {!readOnly && (
        <div className="border-t border-ink-150 p-4 bg-ink-50/40">
          <label className="block text-[11px] uppercase tracking-wider text-ink-400 mb-1.5">
            Ajouter un commentaire
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Précisions logistiques, contexte du groupe, demandes spécifiques…"
            rows={3}
            className="w-full rounded-md border border-ink-200 bg-card p-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-ink-300 resize-y"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={submit}
              disabled={!body.trim()}
              className="h-8 px-4 rounded-md bg-ink-900 text-paper text-[12px] font-medium hover:bg-ink-700 disabled:opacity-40"
            >
              Publier
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function fmtDateTime(iso: string): string {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return iso;
  const [, y, mo, d, h, mi] = m;
  const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
  return `${parseInt(d, 10)} ${MOIS[parseInt(mo, 10) - 1]} ${y} · ${h}h${mi}`;
}
