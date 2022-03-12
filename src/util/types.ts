export type WithRequiredKeys<Type, Keys extends keyof Type> = {
  [Property in Keys]-?: Type[Property]
}
