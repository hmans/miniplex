export interface IEntity {
  [key: string]: any
}

export type WithRequiredKeys<E, P extends keyof E> = E & { [K in P]-?: E[K] }

export type Predicate<E, D extends E> = (entity: E) => entity is D
