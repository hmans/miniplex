import { WithComponents } from "miniplex"
import { Entity } from "../state"

export const RenderableEntity = ({
  entity
}: {
  entity: WithComponents<Entity, "render">
}) => <>{entity.render}</>
