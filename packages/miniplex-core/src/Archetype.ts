import { Bucket } from "@miniplex/bucket"
import { IEntity } from "./types"

export class Archetype<E extends IEntity> extends Bucket<E> {}
