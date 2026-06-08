'use client'

import { useState, useCallback, useRef, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Character } from '@/lib/types'
import { getPortraitPlaceholder } from '@/lib/portraitPlaceholder'

interface Props {
  character: Character | null
  imageUrl: string | null
  isLoadingImage: boolean
  imageStartedAt: number | null
  quality: 'fast' | 'high'
  onImageLoad: () => void
  onZoom: () => void
  onRerollPortrait?: () => void
  lang?: 'da' | 'en'
}

const LOADING_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ']

function PortraitPanel({ character, imageUrl, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, onRerollPortrait, lang = 'da' }: Props) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgError,  setImgError]  = useState(false)
  const [retryKey,  setRetryKey]  = useState(0)
  const retryCount = useRef(0)
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!isLoadingImage || !imageStartedAt) { setElapsed(0); return }
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - imageStartedAt) / 1000)))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [isLoadingImage, imageStartedAt])

  const handleLoad = useCallback(() => { setImgLoaded(true); onImageLoad() }, [onImageLoad])
  const handleError = useCallback(() => {
    if (retryCount.current < 5) {
      retryCount.current += 1
      setTimeout(() => setRetryKey(k => k + 1), 3000)
    } else {
      setImgError(true); onImageLoad()
    }
  }, [onImageLoad])

  const showLoading = !!character && isLoadingImage && !imgError
  const estimate   = quality === 'high' ? 60 : 40
  const remaining  = Math.max(0, estimate - elapsed)
  const progress   = Math.min(100, Math.round((elapsed / estimate) * 100))

  // Race-specific placeholder — shown in ALL non-portrait states
  const placeholderSrc = getPortraitPlaceholder(character?.species)
  const raceName       = character?.species ?? ''
  const showPlaceholder = !!character && (!imageUrl || !imgLoaded)

  // Status text per language
  const statusText = (state: 'loading' | 'queued' | 'error') => {
    if (lang === 'en') {
      if (state === 'loading') return elapsed < 10 ? 'Summoning portrait…' : `About ${remaining}s remaining`
      if (state === 'queued')  return `Waiting for available image magic… ${elapsed}s`
      return 'Could not summon portrait. Try again.'
    }
    if (state === 'loading') return elapsed < 10 ? 'Fremkalder portræt…' : `ca. ${remaining}s tilbage`
    if (state === 'queued')  return `Venter på ledig billedmagi… ${elapsed}s`
    return 'Kunne ikke fremkalde portræt. Prøv igen.'
  }

  const canReroll = !!character && !isLoadingImage && !!onRerollPortrait

  return (
    <div
      className="relative h-full w-full overflow-hidden group"
      style={{ background: '#080604', cursor: canReroll ? 'pointer' : 'default' }}
      onClick={canReroll ? onRerollPortrait : undefined}
    >
      {/* ── Race-specific placeholder (always visible when no portrait) ─── */}
      {showPlaceholder && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={placeholderSrc}
          alt={`Portrait placeholder for ${raceName}`}
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover', objectPosition: 'center',
            opacity: imgLoaded ? 0 : 1,
            transition: 'opacity 0.4s ease',
          }}
        />
      )}

      {/* ── Hidden preloader ────────────────────────────────────────────── */}
      {imageUrl && character && (
        <img key={retryKey} src={imageUrl} alt="" crossOrigin="anonymous"
          onLoad={handleLoad} onError={handleError} aria-hidden
          style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
        />
      )}

      {/* ── Full-bleed portrait (fades in over placeholder) ─────────────── */}
      {character && imageUrl && (
        <div className="absolute inset-0 overflow-hidden" style={{
          opacity: imgLoaded ? 1 : 0,
          transition: imgLoaded ? 'opacity 0.9s ease-in' : 'none',
        }}>
          <div aria-hidden style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 50% 38%, rgba(22,14,5,1) 0%, rgba(8,6,3,1) 65%, rgba(4,3,2,1) 100%)',
          }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={character.name} crossOrigin="anonymous" style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'contain', objectPosition: 'center', display: 'block',
          }} />
        </div>
      )}

      {/* ── Loading overlay — very light so placeholder shows through clearly */}
      <AnimatePresence>
        {showLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0" style={{ zIndex: 5 }}
          >
            {/* Subtle top veil — placeholder stays readable */}
            <div className="absolute inset-0" style={{ background: 'rgba(4,3,2,0.28)' }} />
            {/* Rune wheel — small, top-center, non-obtrusive */}
            <div className="absolute left-1/2 top-6" style={{ transform: 'translateX(-50%)' }}>
              <div className="relative" style={{ width: 48, height: 48 }}>
                {LOADING_RUNES.slice(0, 8).map((rune, i) => {
                  const rad = ((i / 8) * 360 * Math.PI) / 180
                  return (
                    <motion.span key={i} animate={{ opacity: [0.10, 0.55, 0.10] }}
                      transition={{ duration: 2.4, delay: i * 0.20, repeat: Infinity }}
                      className="absolute font-cinzel"
                      style={{ left: `${50 + 40 * Math.cos(rad)}%`, top: `${50 + 40 * Math.sin(rad)}%`, transform: 'translate(-50%,-50%)', fontSize: '0.55rem', color: 'rgba(201,168,76,0.55)' }}
                    >{rune}</motion.span>
                  )
                })}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-1 rounded-full" style={{ border: '1px solid rgba(201,168,76,0.18)' }} />
              </div>
            </div>
            {/* Status text + progress bar — bottom of portrait */}
            <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-6"
              style={{ background: 'linear-gradient(to top, rgba(4,3,2,0.82) 0%, transparent 100%)' }}
            >
              <p className="font-cinzel tracking-widest text-center" style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.55)' }}>
                {elapsed < estimate ? statusText('loading') : statusText('queued')}
              </p>
              <div className="mt-2 h-px overflow-hidden mx-auto" style={{ background: 'rgba(201,168,76,0.14)', width: 120 }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'rgba(201,168,76,0.48)', transition: 'width 0.35s ease' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error state — placeholder remains visible, subtle text at bottom */}
      {imgError && character && (
        <div className="absolute inset-x-0 bottom-0 px-3 pb-3 pt-6"
          style={{ background: 'linear-gradient(to top, rgba(4,3,2,0.80) 0%, transparent 100%)', zIndex: 6 }}
        >
          <p className="font-crimson italic text-center" style={{ fontSize: '0.62rem', color: 'rgba(201,168,76,0.48)', lineHeight: 1.4 }}>
            {statusText('error')}
          </p>
        </div>
      )}

      {/* ── Hover hint: click = reroll ───────────────────────────────── */}
      {canReroll && (
        <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity px-3 pb-2 pt-6 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(4,3,2,0.72) 0%, transparent 100%)', zIndex: 6 }}
        >
          <p className="font-cinzel tracking-widest text-center" style={{ fontSize: '0.52rem', color: 'rgba(201,168,76,0.65)' }}>
            ↺ {lang === 'en' ? 'CLICK TO REROLL PORTRAIT' : 'KLIK FOR NYT PORTRÆT'}
          </p>
        </div>
      )}

      {/* ── Zoom button (top-right, stops propagation so click≠reroll) ── */}
      {imgLoaded && (
        <button
          type="button"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,0.25)', zIndex: 7, cursor: 'zoom-in' }}
          onClick={(e) => { e.stopPropagation(); onZoom() }}
        >
          <span className="font-cinzel" style={{ fontSize: '0.5rem', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.12em' }}>
            ⊕ {lang === 'en' ? 'ENLARGE' : 'FORSTØR'}
          </span>
        </button>
      )}

      {/* ── Cinematic vignette over generated portrait ─────────────────── */}
      <div className="absolute inset-0 pointer-events-none" style={{
        opacity: imgLoaded ? 1 : 0, transition: imgLoaded ? 'opacity 0.9s ease-in' : 'none',
        background: 'radial-gradient(ellipse at 70% 40%, transparent 38%, rgba(0,0,0,0.10) 100%)',
        zIndex: 4,
      }} />
    </div>
  )
}

export default memo(PortraitPanel)
