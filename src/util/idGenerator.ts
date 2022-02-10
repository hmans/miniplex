export function idGenerator(startId = 0) {
  let nextId = startId
  return function () {
    return nextId++
  }
}
