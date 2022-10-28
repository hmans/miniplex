export class PredicateCache<T extends Function = Function> {
  private readonly cache = new Map<string, T>()

  get(key: string, predicate: T) {
    let value = this.cache.get(key)

    if (value === undefined) {
      this.cache.set(key, predicate)
      value = predicate
    }

    return value
  }
}
