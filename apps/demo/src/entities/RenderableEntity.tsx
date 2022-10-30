import { Entity } from "../state"

export const RenderableEntity = (props: { entity: Pick<Entity, "render"> }) => (
  <>{props.entity.render}</>
)
