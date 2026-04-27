import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export function Avatar({
  name,
  size = 32,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-ink-150 text-ink-700 font-medium select-none",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-label={name}
    >
      {initials(name)}
    </div>
  );
}
