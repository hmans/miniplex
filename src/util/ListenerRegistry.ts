export class ListenerRegistry<T extends Function = Function> {
  private listeners = new Set<T>()

  on(listener: T) {
    this.listeners.add(listener)
  }

  off(listener: T) {
    this.listeners.delete(listener)
  }

  invoke() {
    this.listeners.forEach((l) => l())
  }
}
