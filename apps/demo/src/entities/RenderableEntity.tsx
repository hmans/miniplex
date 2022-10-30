import { Entity } from "../state"

export const RenderableEntity = ({
  entity
}: {
  entity: Pick<Entity, "render">
}) => <>{entity.render}</>
