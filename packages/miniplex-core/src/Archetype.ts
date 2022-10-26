import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class Archetype<E extends IEntity> extends Bucket<E> {}
