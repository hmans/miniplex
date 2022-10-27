export interface IEntity {
  [key: string]: any
}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}

export type Predicate<E, D extends E = E> =
  | ((entity: any) => entity is D)
  | ((entity: any) => boolean)
