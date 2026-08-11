import React, { useMemo, useRef, useEffect, useState } from 'react'
import { Canvas } from '@react-three/fiber'
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
  position?: [number, number, number]
}

function raDecToCartesian(raDeg: number, decDeg: number, distPc: number) {
  const ra = THREE.MathUtils.degToRad(raDeg)
  const dec = THREE.MathUtils.degToRad(decDeg)
  const x = distPc * Math.cos(dec) * Math.cos(ra)
  const y = distPc * Math.cos(dec) * Math.sin(ra)
  const z = distPc * Math.sin(dec)
  return [x, y, z] as [number, number, number]
}

function starPosition(s: Star): [number, number, number] {
  return s.position ?? raDecToCartesian(s.ra_deg, s.dec_deg, Math.max(0.0001, s.dist_pc))
}

function StarsPoints({ stars }: { stars: Star[] }) {
  const buffer = useMemo(() => {
    const positions = new Float32Array(stars.length * 3)
    const colors = new Float32Array(stars.length * 3)
    const sizes = new Float32Array(stars.length)

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i]
      const [x,y,z] = starPosition(s)
      positions[i*3+0] = x
      positions[i*3+1] = y
      positions[i*3+2] = z
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
  const transformedStars = useMemo(() => {
    if (observerOption === 'alpha_centauri') {
      const observer = stars.find(s => s.name && s.name.toLowerCase().includes('alpha'))
      if (!observer) return stars

      const [ox, oy, oz] = raDecToCartesian(observer.ra_deg, observer.dec_deg, Math.max(0.0001, observer.dist_pc))

      return stars.map(s => {
        const [x, y, z] = raDecToCartesian(s.ra_deg, s.dec_deg, Math.max(0.0001, s.dist_pc))
        return {
          ...s,
          position: [x - ox, y - oy, z - oz] as [number, number, number]
        }
      })
    }

    return stars.map(s => ({
      ...s,
      position: raDecToCartesian(s.ra_deg, s.dec_deg, Math.max(0.0001, s.dist_pc))
    }))
  }, [stars, observerOption])

  const labeled = useMemo(() => {
    const result: { id:number, name:string, pos:[number,number,number] }[] = []
    for (let i = 0; i < transformedStars.length; i++) {
      const s = transformedStars[i]
      if (!s.name) continue
      if (s.mag > 2.0) continue
      result.push({ id: s.id, name: s.name, pos: starPosition(s) })
    }
    return result
  }, [transformedStars])

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [viewport, setViewport] = useState({ width: 1200, height: 800 })

  useEffect(() => {
    const update = () => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setViewport({ width: rect.width, height: rect.height })
    }

    update()
    const observer = new ResizeObserver(update)
    if (containerRef.current) observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  const overlayLabels = useMemo(() => {
    return labeled.map(label => {
      const [x, y, z] = label.pos
      const scale = 180 / Math.max(12, 58 + z)
      const left = viewport.width * 0.5 + x * scale
      const top = viewport.height * 0.5 - y * scale

      return {
        id: label.id,
        name: label.name,
        left: Math.max(10, Math.min(left, viewport.width - 80)),
        top: Math.max(10, Math.min(top, viewport.height - 20))
      }
    })
  }, [labeled, viewport])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Canvas style={{width:'100%', height:'100%'}} camera={{position:[0,0,50], fov:60}}>
        <color attach="background" args={[0,0,0]} />
        <ambientLight intensity={0.5} />
        <StarsPoints stars={transformedStars} />
        <OrbitControls />
      </Canvas>

      <div className="star-label-layer" aria-label="star labels">
        {overlayLabels.map(label => (
          <div
            key={label.id}
            className="star-label"
            style={{
              position: 'absolute',
              left: `${label.left}px`,
              top: `${label.top}px`,
              transform: 'translate(-10%, -50%)'
            }}
          >
            {label.name}
          </div>
        ))}
      </div>
    </div>
  )
}
