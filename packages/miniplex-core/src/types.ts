export interface IEntity extends Record<string, any> {}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}

export type Predicate<E, D extends E> = (v: E) => v is D

export type QueryPredicate<E, D extends E> =
  | Predicate<E, D>
  | ((entity: E) => boolean)
