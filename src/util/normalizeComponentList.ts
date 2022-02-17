/**
 * Normalize a list of component names, removing blank/undefined component names and sorting the resulting list.
 */
const normalizeComponentList = (names: any[]) =>
  names?.filter((n) => typeof n === "string" && n !== "").sort()

export default normalizeComponentList
