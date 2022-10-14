export interface IEntity {
  [key: string]: any
}

export type EntityWith<E, P extends keyof E> = E & { [K in P]-?: E[K] }

export type EntityPredicate<E, D extends E> = (entity: E) => entity is D
