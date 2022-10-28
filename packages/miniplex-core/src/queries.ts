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

/* NEW */

export const has =
  <E extends IEntity, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithComponents<E, C> =>
    components.every((c) => entity[c] !== undefined)

export const hasAll = has

export const hasSome =
  <E extends IEntity>(...components: (keyof E)[]) =>
  (entity: E) =>
    components.some((c) => entity[c] !== undefined)

export const hasNone =
  <E extends IEntity>(...components: (keyof E)[]) =>
  (entity: E) =>
    components.every((c) => entity[c] === undefined)

export const not =
  <E extends IEntity, D extends E>(predicate: Predicate<E, D>) =>
  (entity: E) =>
    !predicate(entity)
