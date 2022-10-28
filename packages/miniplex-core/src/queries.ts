import { Predicate } from "@miniplex/bucket"
import { IEntity, WithComponents } from "./types"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

export const normalizeQuery = <
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  query: ComponentQuery<E, All, Any, None>
) => ({
  all: query.all && normalizeComponents<E>(query.all),
  any: query.any && normalizeComponents<E>(query.any),
  none: query.none && normalizeComponents<E>(query.none)
})

export const serializeQuery = <E extends IEntity>(
  query: ComponentQuery<E, any, any, any>
) => JSON.stringify(query)

export type ComponentQuery<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
> = {
  all: All[]
  any: Any[]
  none: None[]
}

export function has<
  E extends IEntity,
  All extends keyof E,
  Any extends keyof E,
  None extends keyof E
>(
  query: ComponentQuery<E, All, Any, None>
): Predicate<E, WithComponents<E, All>> {
  /* TODO: memoize */

  const normalizedQuery = normalizeQuery(query)

  return (entity: E): entity is E => {
    const all =
      normalizedQuery.all.length === 0 ||
      normalizedQuery.all.every((c) => entity[c] !== undefined)

    const any =
      normalizedQuery.any.length === 0 ||
      normalizedQuery.any.some((c) => entity[c] !== undefined)

    const none =
      normalizedQuery.none.length === 0 ||
      normalizedQuery.none.every((c) => entity[c] !== undefined)

    return all && any && none
  }
}
