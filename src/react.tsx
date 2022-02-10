import { createContext, FC, useContext, useEffect, useState } from "react"
import { ComponentName, createECS, ECS, IEntity } from "./ecs"
import { useRerender } from "./util/useRerender"

export function makeECS<T extends IEntity>() {
  const context = createContext<ECS<T>>(null!)

  const ECSProvider: FC = ({ children }) => {
    const [ecs] = useState(() => createECS<T>())
    return <context.Provider value={ecs}>{children}</context.Provider>
  }

  function useECS() {
    return useContext(context)
  }

  function useArchetype(...names: ComponentName<T>[]) {
    const rerender = useRerender()
    const ecs = useECS()
    const archetype = ecs.archetype(...names)

    useEffect(() => {
      ecs.listeners.archetypeChanged.get(archetype)!.on(rerender)
      return () => ecs.listeners.archetypeChanged.get(archetype)!.off(rerender)
    }, [ecs])

    return ecs.get(archetype)
  }

  return { ECSProvider, useECS, useArchetype }
}
