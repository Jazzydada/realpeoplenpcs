'use client'

import { modifier } from '@/lib/generator'

interface Props {
  label: string
  score: number
}

export default function AbilityScoreBlock({ label, score }: Props) {
  const mod = modifier(score)
  const isHigh = score >= 16
  const isLow = score <= 8

  return (
    <div className="flex flex-col items-center group">
      <div
        className="relative w-14 h-16 flex flex-col items-center justify-center"
        style={{
          background: 'linear-gradient(160deg, #1a0f07 0%, #0d0b07 100%)',
          border: `1px solid ${isHigh ? 'rgba(212,175,55,0.7)' : isLow ? 'rgba(139,0,0,0.5)' : 'rgba(212,175,55,0.3)'}`,
          boxShadow: isHigh
            ? '0 0 12px rgba(212,175,55,0.25), inset 0 1px 0 rgba(212,175,55,0.1)'
            : 'inset 0 1px 0 rgba(212,175,55,0.05)',
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
        }}
      >
        <span
          className="font-cinzel font-bold text-lg leading-none"
          style={{
            color: isHigh ? '#d4af37' : isLow ? '#8b3030' : '#c9a87c',
            textShadow: isHigh ? '0 0 8px rgba(212,175,55,0.6)' : 'none',
          }}
        >
          {score}
        </span>
        <span
          className="font-cinzel text-[9px] tracking-widest"
          style={{ color: 'rgba(201,168,76,0.6)' }}
        >
          {mod}
        </span>
      </div>
      <span
        className="font-cinzel text-[8px] tracking-[0.15em] uppercase mt-1"
        style={{ color: 'rgba(44,26,14,0.7)' }}
      >
        {label.slice(0, 3)}
      </span>
    </div>
  )
}
