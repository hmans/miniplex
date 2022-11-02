import { World } from "miniplex"
import createReactAPI from "miniplex/react"
import { ReactNode } from "react"
import { Object3D, Vector3 } from "three"
import { PhysicsData } from "./systems/PhysicsSystem"

export const PhysicsLayers = {
  Player: 1,
  Asteroid: 2,
  Bullet: 3
}

export type Entity = {
  isPlayer?: true
  isAsteroid?: true
  isBullet?: true
  isCamera?: true

  transform?: Object3D
  destroy?: true

  /* When set, this entity will be subjected to spatial hashing system. */
  spatialHashing?: true

  lifetime?: {
    age: number
    maxAge?: number
  }

  health?: number

  /* When set, a system will fill this array with the entity's neighbors, using
  the spatial hashing data. */
  neighbors?: Entity[]

  /* Simulate physics. */
  physics?: PhysicsData

  render?: ReactNode
}

export const lifetime = (maxAge?: number) => ({
  lifetime: { age: 0, maxAge }
})

const world = new World<Entity>()

export const ECS = createReactAPI(world)
