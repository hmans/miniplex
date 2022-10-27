export interface IEntity {
  [key: string]: any
}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}
