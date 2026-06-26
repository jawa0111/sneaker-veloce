import { Suspense, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  Environment,
  ContactShadows,
  PerspectiveCamera,
  Float,
} from '@react-three/drei'
import { Sneaker } from './Sneaker.jsx'

const lerp = (a, b, t) => a + (b - a) * t

/**
 * The shoe flies to whichever "lane" the active section requests (always the
 * EMPTY side, opposite the cards). It zooms (z + scale), tilts up/down (rotX),
 * spins continuously (rotY) and reacts to the cursor — but never sits behind
 * a card, because each section hands it an open lane.
 */
function TravelingShoe({ target }) {
  const group = useRef()

  useFrame((state, delta) => {
    const g = group.current
    if (!g) return
    const t = target.current
    const k = 1 - Math.pow(0.0022, delta) // damped, weighty follow

    const px = state.pointer.x * 0.25
    const py = state.pointer.y * 0.2

    g.position.x = lerp(g.position.x, t.x + px, k)
    g.position.y = lerp(g.position.y, t.y + py, k)
    g.position.z = lerp(g.position.z, t.z, k)
    g.rotation.x = lerp(g.rotation.x, t.rotX, k)
    g.rotation.z = lerp(g.rotation.z, t.rotZ ?? 0, k)
    g.rotation.y -= delta * 0.35 // continuous turn (starts from the right side)
    g.scale.setScalar(lerp(g.scale.x, t.scale, k))
  })

  return (
    <group ref={group} scale={4}>
      <Float speed={1.4} rotationIntensity={0.25} floatIntensity={0.5}>
        <Sneaker />
      </Float>
    </group>
  )
}

export function Scene({ target, active = true }) {
  return (
    <Canvas
      // Pause rendering entirely when the shoe is hidden (lower sections) — no
      // GPU work while you scroll the bottom half of the page.
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.4]}
      shadows={false}
    >
      <PerspectiveCamera makeDefault position={[0, 0.4, 7]} fov={38} />

      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 6, 4]} intensity={2.4} />
      <pointLight position={[-4, 2, 3]} intensity={1.2} color="#d9a441" />

      <Suspense fallback={null}>
        <TravelingShoe target={target} />
        <ContactShadows
          position={[0, -1.8, 0]}
          opacity={0.4}
          scale={14}
          blur={2.4}
          far={4}
          resolution={256}
          color="#000000"
        />
        <Environment preset="studio" />
      </Suspense>
    </Canvas>
  )
}
