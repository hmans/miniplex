export type System = (dt: number) => void

export class Runner {
  private systems: System[] = []

  addSystem(system: System) {
    this.systems.push(system)
  }

  update(dt: number) {
    for (const system of this.systems) {
      system(dt)
    }
  }
}
