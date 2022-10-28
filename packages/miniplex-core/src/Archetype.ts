import { Bucket } from "@miniplex/bucket"
import { DerivableBucket } from "@miniplex/bucket/src"
import { IEntity } from "./types"

export class Archetype<E extends IEntity> extends DerivableBucket<E> {}
