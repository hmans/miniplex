/** Helper type that marks a specified list of properties as required. */
export type WithRequiredKeys<Type, Keys extends keyof Type> = {
  [Property in Keys]-?: Type[Property]
}
