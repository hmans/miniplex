import { Bucket } from "@miniplex/bucket"

export function checkPreRemoval<E>(bucket: Bucket<E>, entity: E, future: E) {
  if (!bucket.has(entity)) return

  for (const b of bucket.derivedBuckets.values()) {
    const has = b.has(entity)
    const wants = b.predicate(future)

    if (has && !wants) {
      b.remove(entity)
    } else if (!has && wants) {
      b.add(entity)
    } else if (has && wants) {
      checkPreRemoval(b, entity, future)
    }
  }
}
