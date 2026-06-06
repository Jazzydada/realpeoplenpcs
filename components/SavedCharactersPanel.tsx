'use client'

import { motion } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import type { Character } from '@/lib/types'

interface Props {
  characters: Character[]
  onLoad: (char: Character) => void
  onDelete: (id: string) => void
  onClose: () => void
}

export default function SavedCharactersPanel({ characters, onLoad, onDelete, onClose }: Props) {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-30"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 26, stiffness: 200 }}
        className="fixed right-0 top-0 bottom-0 z-40 flex flex-col w-full max-w-xs"
        style={{
          background: '#0d0b07',
          borderLeft: '1px solid rgba(201,168,76,0.25)',
          boxShadow: '-20px 0 60px rgba(0,0,0,0.8)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.15)' }}>
          <h3 className="font-cinzel tracking-widest uppercase"
            style={{ fontSize: '0.65rem', color: '#d4af37' }}>
            ✦ Gemte Karakterer
          </h3>
          <button onClick={onClose}
            className="w-6 h-6 flex items-center justify-center"
            style={{ border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.5)' }}>
            <X size={11} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {characters.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
              <span style={{ fontSize: '2rem', opacity: 0.15 }}>📜</span>
              <p className="font-cinzel text-center"
                style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.3)', letterSpacing: '0.1em' }}>
                Ingen gemte karakterer endnu
              </p>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-2">
              {characters.map(char => (
                <div
                  key={char.id}
                  className="group relative flex gap-3 p-2.5 cursor-pointer"
                  style={{ border: '1px solid rgba(201,168,76,0.12)', background: 'rgba(201,168,76,0.02)' }}
                  onClick={() => onLoad(char)}
                >
                  {/* Thumbnail */}
                  <div className="w-10 h-12 shrink-0 overflow-hidden"
                    style={{ background: char.accentColor, border: '1px solid rgba(201,168,76,0.15)' }}>
                    {char.imageUrl
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={char.imageUrl} alt={char.name} className="w-full h-full object-cover object-top" />
                      : <div className="w-full h-full flex items-center justify-center">
                          <span style={{ opacity: 0.2 }}>⚔</span>
                        </div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-bold truncate" style={{ fontSize: '0.7rem', color: '#d4af37' }}>
                      {char.name}
                    </p>
                    <p className="font-cinzel uppercase tracking-wider mt-0.5"
                      style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.45)' }}>
                      {char.species} · {char.characterClass}
                    </p>
                    <p className="font-cinzel mt-0.5"
                      style={{ fontSize: '0.52rem', color: 'rgba(201,168,76,0.28)' }}>
                      {char.alignment}
                    </p>
                  </div>

                  {/* Delete */}
                  <button
                    onClick={e => { e.stopPropagation(); onDelete(char.id) }}
                    className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 w-5 h-5 flex items-center justify-center transition-opacity"
                    style={{ color: 'rgba(139,0,0,0.7)', border: '1px solid rgba(139,0,0,0.25)' }}>
                    <Trash2 size={9} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 text-center" style={{ borderTop: '1px solid rgba(201,168,76,0.1)' }}>
          <p className="font-cinzel" style={{ fontSize: '0.52rem', color: 'rgba(201,168,76,0.2)', letterSpacing: '0.1em' }}>
            {characters.length} / 20 karakterer gemt
          </p>
        </div>
      </motion.div>
    </>
  )
}
