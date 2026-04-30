import type { RoleName } from "@/data/types";
import { useStore, roleColorsStore, DEFAULT_ROLE_COLORS } from "@/data/store";

export const ALL_ROLES_LIST: RoleName[] = [
  "Psychologue", "Éducateur", "Coach sportif", "Animateur",
  "Éducateur sportif", "Éducateur sportif pleine nature",
  "Artiste", "Enseignant", "Intervenant numérique",
];

export function useRoleColor(role: RoleName): string {
  const map = useStore(roleColorsStore);
  return map[role] ?? DEFAULT_ROLE_COLORS[role];
}

export function getRoleColor(role: RoleName): string {
  return roleColorsStore.get()[role] ?? DEFAULT_ROLE_COLORS[role];
}

// Compat: export ROLE_COLORS as a getter-like object (snapshot)
export const ROLE_COLORS = new Proxy({} as Record<RoleName, { dot: string; ink: string }>, {
  get(_t, key: string) {
    const dot = getRoleColor(key as RoleName);
    return { dot, ink: dot };
  },
});

export function RoleDot({ role, size = 8, outline = false }: { role: RoleName; size?: number; outline?: boolean }) {
  const color = useRoleColor(role);
  return (
    <span
      aria-hidden
      className="inline-block rounded-full shrink-0"
      style={{
        width: size,
        height: size,
        backgroundColor: outline ? "transparent" : color,
        border: outline ? `1.5px solid ${color}` : "none",
      }}
    />
  );
}
