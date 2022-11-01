export type Predicate<E, D extends E> =
  | ((v: E) => v is D)
  | ((entity: E) => boolean)

export type ArchetypeWithQuery<E, P extends keyof E> = {
  with: P[]
}

export type ArchetypeWithoutQuery<E, P extends keyof E = keyof E> = {
  without: P[]
}

export type ArchetypeQuery<E, P extends keyof E> = Partial<
  ArchetypeWithQuery<E, P> & ArchetypeWithoutQuery<E>
>

export interface IEntityIterator<E> {
  [Symbol.iterator](): {
    next: () => {
      value: E
      done: boolean
    }
  }
}

/**
 * A utility type that marks the specified properties as required.
 */
export type With<E, P extends keyof E> = E & Required<Pick<E, P>>

/**
 * A utility type that removes all optional properties.
 */
export type Strictly<T> = WithoutOptional<T>

/* Utility types */

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never
}

type WithoutOptional<T> = Pick<T, Exclude<keyof T, OptionalKeys<T>[keyof T]>>
