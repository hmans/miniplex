import { World } from "miniplex"
import createReactAPI from "miniplex/react"
import { ReactNode } from "react"
import { Object3D } from "three"
import { PhysicsData } from "./systems/PhysicsSystem"

/*
Some constants we will be using for defining collisions masks for
the physics system.
*/
export const PhysicsLayers = {
  Player: 1,
  Asteroid: 2,
  Bullet: 3
}

/*
A couple of update priority constants we will pass to react-three-fiber's
useFrame function. This gives us more control over the order in which
things run, without having to perform any bookkeeping ourselves.
*/
export const UpdatePriority = {
  Early: -100,
  Normal: 0,
  Late: 100,
  Render: 200
} as const

/*
The main entity type. In Miniplex, you typically declare a world whose entities
all are of a specific type. This type can have some properties marked as required,
but will usually have most, if not all, of them optional.
*/
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
