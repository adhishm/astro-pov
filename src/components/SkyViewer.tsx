import React, { useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

export type Star = {
  id: number
  name?: string
  ra_deg: number
  dec_deg: number
  dist_pc: number
  mag: number
  bv?: number
}

function raDecToCartesian(raDeg: number, decDeg: number, distPc: number) {
  const ra = THREE.MathUtils.degToRad(raDeg)
  const dec = THREE.MathUtils.degToRad(decDeg)
  const x = distPc * Math.cos(dec) * Math.cos(ra)
  const y = distPc * Math.cos(dec) * Math.sin(ra)
  const z = distPc * Math.sin(dec)
  return [x, y, z]
}

function StarsPoints({ stars }: { stars: Star[] }) {
  const buffer = useMemo(() => {
    const positions = new Float32Array(stars.length * 3)
    const colors = new Float32Array(stars.length * 3)
    const sizes = new Float32Array(stars.length)

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      const [x,y,z] = raDecToCartesian(s.ra_deg, s.dec_deg, Math.max(0.0001, s.dist_pc))
      positions[i*3+0] = x
      positions[i*3+1] = y
      positions[i*3+2] = z
      // color approximation: bluish for negative B-V, redder for large B-V
      const bv = s.bv ?? 0.5
      const t = Math.max(0, Math.min(1, (1.0 - (bv/1.5))))
      const r = 1.0 - t*0.5
      const g = 1.0 - t*0.2
      const b = 1.0
      colors[i*3+0] = r
      colors[i*3+1] = g
      colors[i*3+2] = b
      sizes[i] = Math.max(1.0, 6.0 - s.mag)
    }

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1))
    return geometry
  }, [stars])

  return (
    <points geometry={buffer}>
      <pointsMaterial vertexColors size={0.5} sizeAttenuation={true} depthWrite={false} />
    </points>
  )
}

export default function SkyViewer({ stars, observerOption }: { stars: Star[], observerOption: string }) {
  // For MVP, observerOption 'origin' keeps the camera at origin; 'alpha_centauri' shifts stars relative to that observer
  const transformedStars = useMemo(() => {
    if (observerOption === 'alpha_centauri') {
      // find alpha centauri in stars by name or fallback position
      const star = stars.find(s => s.name && s.name.toLowerCase().includes('alpha'))
      if (!star) return stars
      const [ox, oy, oz] = raDecToCartesian(star.ra_deg, star.dec_deg, Math.max(0.0001, star.dist_pc))
      return stars.map(s => ({ ...s, ra_deg: s.ra_deg, dec_deg: s.dec_deg, dist_pc: (() => {
        const [x,y,z] = raDecToCartesian(s.ra_deg, s.dec_deg, Math.max(0.0001, s.dist_pc))
        const dx = x - ox
        const dy = y - oy
        const dz = z - oz
        return Math.sqrt(dx*dx + dy*dy + dz*dz)
      })() }))
    }
    return stars
  }, [stars, observerOption])

  return (
    <Canvas camera={{position:[0,0,50], fov:60}}>
      <color attach="background" args={[0,0,0]} />
      <ambientLight intensity={0.5} />
      <StarsPoints stars={transformedStars} />
      <OrbitControls />
    </Canvas>
  )
}
