export function commandQueue<T extends Function = Function>() {
  const queue = new Array<T>()

  function add(command: T) {
    queue.push(command)
  }

  function flush() {
    queue.forEach((fun) => fun())
    queue.length = 0
  }

  function clear() {
    queue.length = 0
  }

  return { add, flush, clear }
}
