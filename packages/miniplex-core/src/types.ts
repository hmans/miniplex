export type WithComponents<E, P extends keyof E> = E & WithOnly<E, P>

export type WithOnly<E, P extends keyof E> = Required<Pick<E, P>>
