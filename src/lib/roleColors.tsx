import type { RoleName } from "@/data/types";

export const ROLE_COLORS: Record<RoleName, { dot: string; ink: string }> = {
  "Psychologue":                     { dot: "#1f3a5f", ink: "#0f1d30" },
  "Éducateur":                       { dot: "#2f5d3a", ink: "#16301d" },
  "Coach sportif":                   { dot: "#a64b1f", ink: "#5e2a10" },
  "Animateur":                       { dot: "#b78a2a", ink: "#5e4612" },
  "Éducateur sportif":               { dot: "#7a1f3a", ink: "#3d0f1d" },
  "Éducateur sportif pleine nature": { dot: "#5d6b1f", ink: "#2f3610" },
  "Artiste":                         { dot: "#5a2a6e", ink: "#2d1537" },
  "Enseignant":                      { dot: "#3a4a55", ink: "#1d252b" },
  "Intervenant numérique":           { dot: "#c4632f", ink: "#5e2f15" },
};

export const ALL_ROLES_LIST: RoleName[] = [
  "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

export function RoleDot({ role, size = 8, outline = false }: { role: RoleName; size?: number; outline?: boolean }) {
  const c = ROLE_COLORS[role];
  return (
    <span
      aria-hidden
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: outline ? "transparent" : c.dot,
        border: outline ? `1.5px solid ${c.dot}` : "none",
      }}
    />
  );
}
