import { IEntity } from ".."
import { ArchetypeQuery } from "../Archetype"
import normalizeComponentList from "./normalizeComponentList"

/**
 * Normalize an archetype by sorting the component names it references.
 */
const normalizeArchetype = <T extends IEntity>(
  archetype: Partial<ArchetypeQuery<T>>
): ArchetypeQuery<T> => ({
  all: archetype.all ? normalizeComponentList(archetype.all) : undefined,
  any: archetype.any ? normalizeComponentList(archetype.any) : undefined,
  none: archetype.none ? normalizeComponentList(archetype.none) : undefined
})

export default normalizeArchetype
