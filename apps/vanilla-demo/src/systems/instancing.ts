import { Bucket, World } from "miniplex"
import { BufferGeometry, InstancedMesh, Material, Matrix4 } from "three"
import { Entity } from "./engine"

/*
- [ ] Implement the actual imesh as an entity?
- [ ] Keep a list of entities per imesh to iterate over every frame
*/

export function createInstancingSystem(world: World<Entity>) {
  const entities = world.with("mesh", "transform").with("instanced")
  const engines = world.with("engine")

  const imeshes = new Map<BufferGeometry, Map<Material, THREE.InstancedMesh>>()
  const imeshEntities = new Map<InstancedMesh, typeof entities>()

  entities.onEntityAdded.add((entity) => {
    /* see if there is an instancedmesh for the specified geometry and material */
    const { geometry, material } = entity.mesh
    let imesh = imeshes.get(geometry)?.get(material)

    /* is not, create the instanced mesh and add it to the scene */
    if (!imesh) {
      imesh = new InstancedMesh(geometry, material, 10000)

      if (!imeshes.has(geometry)) {
        imeshes.set(geometry, new Map())
      }

      const [{ engine }] = engines
      engine.scene.add(imesh)

      imeshes.get(geometry)!.set(material, imesh)
    }

    /* register this entity with the instancedmesh */
    if (!imeshEntities.has(imesh)) {
      imeshEntities.set(imesh, new Bucket())
    }

    imeshEntities.get(imesh)!.add(entity)
    imesh.setMatrixAt(0, new Matrix4())
  })

  return () => {
    for (const [imesh, entities] of imeshEntities) {
      let index = 0
      for (const entity of entities) {
        imesh.setMatrixAt(index++, entity.transform.matrix)
      }
      imesh.count = index
      imesh.instanceMatrix.needsUpdate = true
    }
  }
}
