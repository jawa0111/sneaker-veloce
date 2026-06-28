import { useMemo } from 'react'
import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'

/**
 * Loads /public/shoe.glb and AUTO-FITS it: centers the model at the origin
 * and normalizes it so its largest dimension = 1 unit. That way any model
 * you drop in (whatever its original scale/offset) sits correctly on the
 * motion path — <ShoeRig/> in Scene.jsx then scales it up.
 */
// Bump ?v= whenever you replace /public/shoe.glb so the loader/browser
// cache can't serve a stale model.
const MODEL_URL = '/shoe.glb?v=5'

export function Sneaker(props) {
  const { scene } = useGLTF(MODEL_URL)

  const fitted = useMemo(() => {
    // Clone so re-mounts (e.g. StrictMode) never double-offset the shared
    // cached scene. Cheap now that the model is ~2MB.
    const model = scene.clone(true)
    const box = new THREE.Box3().setFromObject(model)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const maxDim = Math.max(size.x, size.y, size.z) || 1

    model.position.sub(center) // recenter to origin
    const wrapper = new THREE.Group()
    wrapper.add(model)
    wrapper.scale.setScalar(1 / maxDim) // normalize: largest side = 1
    return wrapper
  }, [scene])

  return <primitive object={fitted} {...props} />
}

useGLTF.preload(MODEL_URL)
