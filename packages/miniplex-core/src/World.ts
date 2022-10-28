import { Bucket } from "./Bucket"
import { IEntity } from "./types"

export class World<E extends IEntity> extends Bucket<E> {}
