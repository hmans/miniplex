/**
 * A utility type that marks the specified properties as required.
 */
export type With<E, P extends keyof E> = E & WithOnly<E, P>

/**
 * A utility type that marks the specified properties as required,
 * and removes all other properties.
 */
export type WithOnly<E, P extends keyof E> = Required<Pick<E, P>>
