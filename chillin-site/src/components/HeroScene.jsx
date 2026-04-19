import { Environment, OrbitControls, Sparkles } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Suspense } from 'react'
import CanModel from './CanModel'

export default function HeroScene({ flavor }) {
  return (
    <Canvas dpr={[1, 1.75]} camera={{ position: [0, 0.35, 3.4], fov: 38 }} shadows>
      <color attach="background" args={['#05070f']} />
      <ambientLight intensity={0.45} />
      <spotLight position={[4, 6, 4]} intensity={2.2} penumbra={0.7} castShadow />
      <pointLight position={[-3, -1, 3]} intensity={0.9} color={flavor.colors[1]} />

      <Suspense fallback={null}>
        <Sparkles
          count={140}
          scale={[8, 4, 6]}
          speed={0.22}
          size={1.8}
          color={flavor.colors[0]}
        />
        <CanModel flavor={flavor} active compact={false} />
        <Environment preset="night" />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        autoRotate
        autoRotateSpeed={1.8}
        maxPolarAngle={Math.PI * 0.68}
        minPolarAngle={Math.PI * 0.34}
      />
    </Canvas>
  )
}
