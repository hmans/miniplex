import { IEntity, Query } from "./types"

export const normalizeComponents = <E extends IEntity>(
  components: (keyof E)[]
) => [...new Set(components.sort().filter((c) => !!c && c !== ""))]

export const normalizeQuery = <E extends IEntity>(query: Query<E>) => ({
  all: query.all && normalizeComponents(query.all),
  any: query.any && normalizeComponents(query.any),
  none: query.none && normalizeComponents(query.none)
})

export const serializeQuery = <E extends IEntity>(query: Query<E>) =>
  JSON.stringify(query)

class QueryBuilder<E extends IEntity> {
  query: Query<E> = {}

  all(...components: (keyof E)[]) {
    this.query.all = components
    return this
  }

  any(...components: (keyof E)[]) {
    this.query.any = components
    return this
  }

  none(...components: (keyof E)[]) {
    this.query.none = components
    return this
  }
}

export const all = <E extends IEntity>(...components: (keyof E)[]) =>
  new QueryBuilder<E>().all(...components)

export const any = <E extends IEntity>(...components: (keyof E)[]) =>
  new QueryBuilder<E>().any(...components)

export const none = <E extends IEntity>(...components: (keyof E)[]) =>
  new QueryBuilder<E>().none(...components)
