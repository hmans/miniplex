import { Bucket } from "@miniplex/bucket"
import { With, Without } from "./types"

export type QueryConfiguration<E> = {
  with: (keyof E)[]
  without: (keyof E)[]
  filter?: (entity: E) => boolean
}

export class Query<E> extends Bucket<E> {
  constructor(
    protected config: QueryConfiguration<E> = { with: [], without: [] }
  ) {
    super()
  }

  with<C extends keyof E>(...components: C[]): Query<With<E, C>> {
    return new Query({
      ...this.config,
      with: [...this.config.with, ...components]
    }) as any
  }

  without<C extends keyof E>(...components: C[]): Query<Without<E, C>> {
    return new Query({
      ...this.config,
      without: [...this.config.without, ...components]
    }) as any // TODO: resolve `any`
  }

  want(entity: E) {
    return (
      this.config.with.every((component) => entity[component] !== undefined) &&
      this.config.without.every((component) => entity[component] === undefined)
    )
  }

  evaluate(entity: any, future = entity) {
    const wanted = this.want(future)
    const has = this.has(entity)

    if (wanted && !has) {
      this.add(entity)
    } else if (!wanted && has) {
      this.remove(entity)
    }
  }
}
