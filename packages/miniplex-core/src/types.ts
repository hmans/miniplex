export interface IEntity {
  [key: string]: any
}

export type WithRequiredComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}

export type Query<E extends IEntity> = {
  all?: (keyof E)[]
  any?: (keyof E)[]
  none?: (keyof E)[]
}
