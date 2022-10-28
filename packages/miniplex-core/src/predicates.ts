import { WithComponents } from "./types"

export const has =
  <E, C extends keyof E>(...components: C[]) =>
  (entity: E): entity is WithComponents<E, C> =>
    components.every((component) => entity[component] !== undefined)
