import { With } from "./core"

export function hasComponents<E, C extends keyof E>(
  entity: E,
  ...components: C[]
): entity is With<E, C> {
  return components.every((c) => entity[c] !== undefined)
}

export function hasAnyComponents<E>(entity: E, ...components: (keyof E)[]) {
  return components.some((c) => entity[c] !== undefined)
}

export function hasNoComponents<E>(entity: E, ...components: (keyof E)[]) {
  return components.every((c) => entity[c] === undefined)
}
