'use client'

import { memo, useState } from 'react'
import type { Character } from '@/lib/types'

interface Props { character: Character | null }

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }
  return (
    <button
      onClick={copy}
      className="font-cinzel uppercase tracking-widest"
      style={{
        fontSize: '0.58rem', color: copied ? '#f2df9e' : '#d4af37',
        border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(13,11,7,0.84)',
        padding: '7px 10px', boxShadow: 'inset 0 0 12px rgba(0,0,0,0.45)'
      }}
    >
      {copied ? 'Kopieret' : label}
    </button>
  )
}

function PromptCopyPanel({ character }: Props) {
  const [open, setOpen] = useState(false)
  if (!character) return null
  return (
    <section
      className="w-full mt-5 p-4"
      style={{
        maxWidth: 760,
        background: 'linear-gradient(180deg, rgba(22,15,8,0.88), rgba(10,7,4,0.92))',
        border: '1px solid rgba(201,168,76,0.22)',
        boxShadow: '0 10px 36px rgba(0,0,0,0.45)'
      }}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <button onClick={() => setOpen(v => !v)} className="text-left" style={{ cursor: 'pointer' }}>
          <h2 className="font-cinzel uppercase tracking-widest" style={{ color: '#d4af37', fontSize: '0.72rem' }}>{open ? '▼' : '▶'} Billedprompts</h2>
          <p className="font-crimson italic" style={{ color: 'rgba(224,208,174,0.72)', fontSize: '0.78rem' }}>
            Engelske prompts til MidJourney og Perchance.
          </p>
        </button>
        <div className="flex gap-2 flex-wrap">
          <CopyButton text={character.midjourneyPrompt} label="Kopiér MJ" />
          <CopyButton text={character.perchancePrompt} label="Kopiér Perchance" />
          <CopyButton text={character.negativePrompt} label="Negativ" />
        </div>
      </div>
      {open && (
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <p className="font-crimson" style={{ color: 'rgba(224,208,174,0.82)', fontSize: '0.72rem', lineHeight: 1.34 }}>
            <span className="font-cinzel" style={{ color: 'rgba(214,183,112,0.68)', fontSize: '0.56rem', letterSpacing: '0.12em' }}>MIDJOURNEY</span><br />
            {character.midjourneyPrompt}
          </p>
          <p className="font-crimson" style={{ color: 'rgba(224,208,174,0.82)', fontSize: '0.72rem', lineHeight: 1.34 }}>
            <span className="font-cinzel" style={{ color: 'rgba(214,183,112,0.68)', fontSize: '0.56rem', letterSpacing: '0.12em' }}>PERCHANCE</span><br />
            {character.perchancePrompt}
          </p>
          <p className="font-crimson" style={{ color: 'rgba(224,208,174,0.82)', fontSize: '0.72rem', lineHeight: 1.34 }}>
            <span className="font-cinzel" style={{ color: 'rgba(214,183,112,0.68)', fontSize: '0.56rem', letterSpacing: '0.12em' }}>NEGATIVE</span><br />
            {character.negativePrompt}
          </p>
        </div>
      )}
    </section>
  )
}

export default memo(PromptCopyPanel)
