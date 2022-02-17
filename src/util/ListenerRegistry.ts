export class ListenerRegistry<T extends (...args: any[]) => any = (...args: any[]) => any> {
  private listeners = new Set<T>()

  on(listener: T) {
    this.listeners.add(listener)
  }

  off(listener: T) {
    this.listeners.delete(listener)
  }

  invoke(...args: Parameters<T>) {
    this.listeners.forEach((l) => l(...args))
  }
}
