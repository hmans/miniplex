export const bitmask = (groups: number | number[]): number =>
  [groups].flat().reduce((acc, layer) => acc | (1 << layer), 0)
