export interface IEntity extends Record<string, any> {}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}
