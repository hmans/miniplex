import { Predicate, WithRequiredKeys, IEntity } from "./types"

export const isArchetype = <E extends IEntity, P extends keyof E>(
  entity: E,
  ...properties: P[]
): entity is WithRequiredKeys<E, P> => {
  for (const key of properties) if (!(key in entity)) return false
  return true
}

const archetypeCache = new Map()

export const archetype = <E extends IEntity, P extends keyof E>(
  ...properties: P[]
): Predicate<E, WithRequiredKeys<E, P>> => {
  const normalizedProperties = properties.sort().filter((p) => !!p && p !== "")
  const key = JSON.stringify(normalizedProperties)

  if (archetypeCache.has(key)) return archetypeCache.get(key)

  const predicate = (entity: E): entity is WithRequiredKeys<E, P> =>
    isArchetype(entity, ...properties)

  archetypeCache.set(key, predicate)

  return predicate
}
