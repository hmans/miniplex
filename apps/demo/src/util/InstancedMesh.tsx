import { useConst } from "@hmans/use-const"
import { GroupProps, InstancedMeshProps, useFrame } from "@react-three/fiber"
import { Bucket } from "miniplex"
import React, {
  createContext,
  forwardRef,
  useContext,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef
} from "react"
import * as THREE from "three"

const context = createContext<Bucket<THREE.Object3D>>(null!)

const zeroMatrix = new THREE.Matrix4().scale(new THREE.Vector3(0, 0, 0))

export const InstancedMesh = (props: InstancedMeshProps) => {
  const imesh = useRef<THREE.InstancedMesh>(null!)
  const instances = useConst(() => new Bucket<THREE.Object3D>())

  useFrame(() => {
    for (let i = 0; i < imesh.current.count; i++) {
      const instance = instances.entities[i]

      if (instance) {
        imesh.current.setMatrixAt(i, instances.entities[i].matrixWorld)
      } else {
        imesh.current.setMatrixAt(i, zeroMatrix)
      }
    }

    imesh.current.instanceMatrix.needsUpdate = true
  })

  return (
    <context.Provider value={instances}>
      <instancedMesh
        args={[undefined, undefined, 10000]}
        {...props}
        ref={imesh}
      />
    </context.Provider>
  )
}

export const Instance = forwardRef<THREE.Group, GroupProps>((props, ref) => {
  const imesh = useContext(context)
  const objectRef = useRef<THREE.Group>(null!)

  useLayoutEffect(() => {
    const object = objectRef.current

    imesh.add(object)

    return () => {
      imesh.remove(object)
    }
  }, [imesh])

  useImperativeHandle(ref, () => objectRef.current)

  return (
    <group {...props} ref={objectRef}>
      <mesh>
        <boxGeometry />
        <meshBasicMaterial color="red" />
      </mesh>
    </group>
  )
})
