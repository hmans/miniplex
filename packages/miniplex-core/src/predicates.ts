import { Predicate, With } from "./types"
import { Memoizer } from "./util/Memoizer"

export function isArchetype<E, P extends keyof E>(
  entity: E,
  ...components: P[]
): entity is With<E, P> {
  return hasComponents(entity, ...components)
}

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

/* not */

const notCache = new Memoizer<Function, Function>()

export const not = <E, D extends E>(predicate: Predicate<E, D>) =>
  notCache.get(predicate, (entity: E) => !predicate(entity)) as Predicate<E, E>
