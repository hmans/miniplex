/**
 * A utility type that marks the specified properties as required.
 */
export type With<E, P extends keyof E> = E & Required<Pick<E, P>>

/**
 * A utility type that marks the specified properties as required,
 * and removes all other properties.
 */
export type WithOnly<E, P extends keyof E> = Strict<With<E, P>>

/**
 * A utility type that removes all optional properties.
 */
export type Strict<T> = WithoutOptional<T>

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}

type WithoutOptional<T> = Pick<T, Exclude<keyof T, OptionalKeys<T>[keyof T]>>
