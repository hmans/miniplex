export interface IEntity extends Record<string, any> {}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}

export type PredicateFunction<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)
