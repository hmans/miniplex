export interface IEntity extends Record<string, any> {}

export type Predicate<D> = (v: any) => v is D

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}
