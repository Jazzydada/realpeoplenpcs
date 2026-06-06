'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  opacityDelta: number
  color: string
}

const COLORS = [
  'rgba(212,175,55,',
  'rgba(255,140,0,',
  'rgba(255,69,0,',
  'rgba(180,100,20,',
]

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const spawn = (): Particle => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 10,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -(Math.random() * 0.8 + 0.3),
      size: Math.random() * 2.5 + 0.5,
      opacity: 0,
      opacityDelta: Math.random() * 0.008 + 0.003,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })

    for (let i = 0; i < 60; i++) {
      const p = spawn()
      p.y = Math.random() * canvas.height
      p.opacity = Math.random() * 0.4
      particles.push(p)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        p.opacity += p.opacityDelta

        if (p.opacity > 0.5) p.opacityDelta = -Math.abs(p.opacityDelta)

        if (p.y < -10 || p.opacity <= 0) {
          particles[i] = spawn()
          return
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `${p.color}${p.opacity})`
        ctx.shadowBlur = 6
        ctx.shadowColor = `${p.color}0.8)`
        ctx.fill()
      })

      if (particles.length < 80 && Math.random() < 0.05) {
        particles.push(spawn())
      }

      animId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.6 }}
    />
  )
}
