import { WithRequiredKeys } from "miniplex"
import { Entity } from "../state"

export const RenderableEntity = ({
  entity
}: {
  entity: WithRequiredKeys<Entity, "render">
}) => <>{entity.render}</>
