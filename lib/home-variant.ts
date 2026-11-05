export type HomeVariant = "classic" | "explorer";

export function normalizeHomeVariant(value: string | undefined): HomeVariant {
  return value === "explorer" ? "explorer" : "classic";
}
