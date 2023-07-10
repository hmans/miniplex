import { With } from "./core"

/**
 * Checks if an entity has all the given components.
 *
 * @param entity The entity to check
 * @param components The components to check for
 * @returns True if all components are present
 */
export function hasComponents<E, C extends keyof E>(
  entity: E,
  ...components: C[]
): entity is With<E, C> {
  return components.every((c) => entity[c] !== undefined)
}

/**
 * Checks if an entity has any of the given components.
 *
 * @param entity The entity to check
 * @param components The components to check for
 * @returns True if any component is present
 */
export function hasAnyComponents<E>(entity: E, ...components: (keyof E)[]) {
  return components.some((c) => entity[c] !== undefined)
}

/**
 * Checks if an entity has none of the given components.
 *
 * @param entity The entity to check
 * @param components The components to check for
 * @returns True if no component is present
 */
export function hasNoComponents<E>(entity: E, ...components: (keyof E)[]) {
  return components.every((c) => entity[c] === undefined)
}
