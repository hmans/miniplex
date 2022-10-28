export class PredicateCache<Key, T extends Function = Function> {
  private readonly cache = new Map<Key, T>()

  get(key: Key, predicate: T) {
    let value = this.cache.get(key)

    if (value === undefined) {
      this.cache.set(key, predicate)
      value = predicate
    }

    return value
  }
}
