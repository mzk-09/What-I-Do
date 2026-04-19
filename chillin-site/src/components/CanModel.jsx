import { Float } from '@react-three/drei'
import { useMemo } from 'react'
import * as THREE from 'three'

function CanBody({ colors, finish, active }) {
  const [c1, c2] = colors

  const materialProps = useMemo(() => {
    const roughnessMap = {
      glossy: 0.12,
      metallic: 0.2,
      satin: 0.28,
      matte: 0.42,
    }

    return {
      color: c1,
      metalness: finish === 'matte' ? 0.5 : 0.85,
      roughness: roughnessMap[finish] ?? 0.24,
      clearcoat: 1,
      clearcoatRoughness: finish === 'glossy' ? 0.08 : 0.16,
      sheen: 1,
      sheenColor: new THREE.Color(c2),
      sheenRoughness: 0.28,
      emissive: new THREE.Color(c2).multiplyScalar(active ? 0.09 : 0.03),
    }
  }, [c1, c2, finish, active])

  return <meshPhysicalMaterial {...materialProps} />
}

function Droplets() {
  const droplets = useMemo(() => {
    const points = []
    const seeded = (seed) => {
      const x = Math.sin(seed * 91.345) * 43758.5453
      return x - Math.floor(x)
    }

    for (let i = 0; i < 42; i += 1) {
      const a = seeded(i + 1)
      const b = seeded(i + 100)
      const c = seeded(i + 200)
      const d = seeded(i + 300)

      points.push({
        id: `drop-${i}`,
        angle: a * Math.PI * 2,
        y: (b - 0.5) * 1.6,
        r: 0.5 + c * 0.03,
        size: 0.015 + d * 0.018,
      })
    }
    return points
  }, [])

  return droplets.map((drop) => (
    <mesh
      key={drop.id}
      position={[
        Math.cos(drop.angle) * drop.r,
        drop.y,
        Math.sin(drop.angle) * drop.r,
      ]}
    >
      <sphereGeometry args={[drop.size, 10, 10]} />
      <meshPhysicalMaterial
        transmission={0.95}
        roughness={0.05}
        thickness={0.25}
        clearcoat={1}
        opacity={0.85}
        transparent
        color="#dff7ff"
      />
    </mesh>
  ))
}

export default function CanModel({ flavor, active = false, compact = false }) {
  const canHeight = compact ? 1.25 : 1.6

  return (
    <Float speed={1.4} rotationIntensity={0.24} floatIntensity={0.22}>
      <group>
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[0.52, 0.52, canHeight, 64, 1, false]} />
          <CanBody colors={flavor.colors} finish={flavor.finish} active={active} />
        </mesh>

        <mesh position={[0, canHeight / 2, 0]} rotation={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.525, 0.525, 0.06, 64]} />
          <meshStandardMaterial color="#d6dce4" metalness={0.9} roughness={0.26} />
        </mesh>

        <mesh position={[0, -canHeight / 2, 0]} castShadow>
          <cylinderGeometry args={[0.51, 0.51, 0.04, 64]} />
          <meshStandardMaterial color="#9da9b8" metalness={0.8} roughness={0.35} />
        </mesh>

        <Droplets />
      </group>
    </Float>
  )
}
