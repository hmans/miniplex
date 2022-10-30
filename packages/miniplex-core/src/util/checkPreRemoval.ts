import { Bucket } from "@miniplex/bucket"

export function checkPreRemoval<E>(bucket: Bucket<E>, entity: E, future: E) {
  if (!bucket.has(entity)) return

  for (const [predicate, b] of bucket.derivedBuckets) {
    const inBucket = b.has(entity)
    const willBeInBucket = predicate(future)

    if (inBucket && !willBeInBucket) {
      b.remove(entity)
    } else if (!inBucket && willBeInBucket) {
      b.add(entity)
    } else if (inBucket && willBeInBucket) {
      checkPreRemoval(b, entity, future)
    }
  }
}
