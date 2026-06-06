'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Character } from '@/lib/types'

interface Props {
  character: Character
  imageUrl: string
  onClose: () => void
}

export default function PortraitZoomModal({ character, imageUrl, onClose }: Props) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', fn)
    return () => window.removeEventListener('keydown', fn)
  }, [onClose])

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.94)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', damping: 22 }}
        className="relative max-w-xl w-full"
        onClick={e => e.stopPropagation()}
        style={{ border: '1px solid rgba(201,168,76,0.3)' }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt={character.name} className="w-full h-auto" style={{ maxHeight: '80vh', objectFit: 'contain' }} />
        <div className="p-3 text-center"
          style={{ background: '#0d0b07', borderTop: '1px solid rgba(201,168,76,0.15)' }}>
          <p className="font-cinzel font-bold" style={{ fontSize: '0.9rem', color: '#d4af37' }}>
            {character.name}
          </p>
          <p className="font-cinzel uppercase tracking-widest mt-0.5"
            style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.45)' }}>
            {character.species} · {character.characterClass} · {character.alignment}
          </p>
        </div>
        <button onClick={onClose}
          className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center font-cinzel text-xs"
          style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(201,168,76,0.25)', color: 'rgba(201,168,76,0.6)' }}>
          ✕
        </button>
      </motion.div>
    </motion.div>
  )
}
