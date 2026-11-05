export type HouseVisualVariant = "v1" | "detailed";

export function normalizeHouseVisualVariant(value: string | undefined): HouseVisualVariant {
  return value === "detailed" ? "detailed" : "v1";
}
