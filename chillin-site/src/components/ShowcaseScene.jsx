import { Environment, OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CanModel from './CanModel'

function FlavorCan({ flavor, index, activeFlavor, onSelect }) {
  const angle = (index / 5) * Math.PI * 2
  const radius = 2.2
  const isActive = activeFlavor.id === flavor.id

  return (
    <group
      position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
      rotation={[0, -angle, 0]}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(flavor)
      }}
    >
      <CanModel flavor={flavor} active={isActive} compact />
      <mesh position={[0, -1.05, 0]}>
        <circleGeometry args={[0.74, 32]} />
        <meshBasicMaterial color={isActive ? flavor.colors[0] : '#1c2030'} opacity={0.35} transparent />
      </mesh>
    </group>
  )
}

export default function ShowcaseScene({ flavors, activeFlavor, onSelect }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 1.2, 6], fov: 46 }}>
      <color attach="background" args={['#05060d']} />
      <ambientLight intensity={0.65} />
      <directionalLight position={[5, 6, 5]} intensity={1.8} />
      <pointLight position={[-5, -2, 2]} intensity={1.2} color={activeFlavor.colors[1]} />

      <Suspense fallback={null}>
        {flavors.map((flavor, index) => (
          <FlavorCan
            key={flavor.id}
            flavor={flavor}
            index={index}
            activeFlavor={activeFlavor}
            onSelect={onSelect}
          />
        ))}
        <Environment preset="city" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minDistance={3.8}
        maxDistance={8}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.35}
      />
    </Canvas>
  )
}
