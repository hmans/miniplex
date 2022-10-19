export function createQueue<F extends Function>() {
  const queue = new Array<F>()

  function add(fn: F) {
    queue.push(fn)
  }

  function clear() {
    queue.length = 0
  }

  function flush() {
    queue.forEach((fn) => fn())
    clear()
  }

  add.clear = clear
  add.flush = flush

  return add
}
