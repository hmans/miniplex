export interface IEntity {
  [key: string]: any
}

export type WithComponents<E, P extends keyof E> = E & {
  [K in P]-?: E[K]
}

export interface Query<E extends IEntity, All extends keyof E = keyof E> {
  all?: All[]
  any?: (keyof E)[]
  none?: (keyof E)[]
}
