const entityToId = new WeakMap<any, number>()

let nextId = 0

export const id = (object: any) => {
  const id = entityToId.get(object)
  if (id !== undefined) return id

  entityToId.set(object, nextId)
  return nextId++
}
