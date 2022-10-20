export type Listener<P = any> = (payload: P) => void

export class EventEmitter {
  private listeners = new Map<string, Set<Listener>>()

  emit(type: string, payload: any) {
    const listeners = this.listeners.get(type)

    if (listeners) {
      for (const listener of listeners) {
        listener(payload)
      }
    }
  }

  add(type: string, listener: Listener) {
    const listeners = this.listeners.get(type) || new Set()
    listeners.add(listener)
    this.listeners.set(type, listeners)
    return () => this.remove(type, listener)
  }

  remove(type: string, listener: Listener) {
    const listeners = this.listeners.get(type)
    if (listeners) {
      listeners.delete(listener)
    }
  }
}
