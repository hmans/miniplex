/**
 * Normalize a list of component names, removing blank/undefined component names and sorting the resulting list.
 */
export function normalizeComponentList(names: any[]) {
  return names.filter((n) => typeof n === "string" && n !== "").sort()
}
