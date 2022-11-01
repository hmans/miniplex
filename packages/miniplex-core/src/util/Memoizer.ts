export class Memoizer<K, T> {
  private readonly cache = new Map<K, T>()

  get(key: K, predicate: T) {
    let value = this.cache.get(key)

    if (value === undefined) {
      this.cache.set(key, predicate)
      value = predicate
    }

    return value
  }
}
