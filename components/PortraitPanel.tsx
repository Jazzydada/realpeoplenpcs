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
  lang?: 'da' | 'en'
}

const LOADING_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ']

function PortraitPanel({ character, imageUrl, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, lang = 'da' }: Props) {
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

  return (
    <div
      className="relative h-full w-full overflow-hidden group"
      style={{ background: '#080604', cursor: imgLoaded ? 'pointer' : 'default' }}
      onClick={imgLoaded ? onZoom : undefined}
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

      {/* ── Loading overlay (semi-transparent so placeholder shows through) */}
      <AnimatePresence>
        {showLoading && (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-5"
            style={{ background: 'rgba(4,3,2,0.75)', zIndex: 5 }}
          >
            <div className="relative w-28 h-28">
              {LOADING_RUNES.map((rune, i) => {
                const rad = ((i / LOADING_RUNES.length) * 360 * Math.PI) / 180
                return (
                  <motion.span key={i} animate={{ opacity: [0.15, 0.7, 0.15] }}
                    transition={{ duration: 2.2, delay: i * 0.16, repeat: Infinity }}
                    className="absolute font-cinzel"
                    style={{ left: `${50 + 40 * Math.cos(rad)}%`, top: `${50 + 40 * Math.sin(rad)}%`, transform: 'translate(-50%,-50%)', fontSize: '0.7rem', color: 'rgba(201,168,76,0.65)' }}
                  >{rune}</motion.span>
                )
              })}
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 9, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2 rounded-full" style={{ border: '1px solid rgba(201,168,76,0.22)' }} />
              <motion.div animate={{ rotate: -360 }} transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-6 rounded-full" style={{ border: '1px solid rgba(201,168,76,0.14)' }} />
            </div>
            <div className="text-center">
              <p className="font-cinzel tracking-widest" style={{ fontSize: '0.6rem', color: 'rgba(201,168,76,0.55)' }}>
                {elapsed < estimate ? statusText('loading') : statusText('queued')}
              </p>
              <div className="mt-3 h-px w-40 overflow-hidden" style={{ background: 'rgba(201,168,76,0.15)' }}>
                <div style={{ width: `${progress}%`, height: '100%', background: 'rgba(201,168,76,0.52)', transition: 'width 0.35s ease' }} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error state — placeholder remains visible, text overlays ──── */}
      {imgError && character && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center pb-4 pt-2"
          style={{ background: 'linear-gradient(to top, rgba(4,3,2,0.88) 0%, transparent 100%)', zIndex: 6 }}
        >
          <p className="font-crimson italic text-center" style={{ fontSize: '0.68rem', color: 'rgba(201,168,76,0.55)', maxWidth: '160px', lineHeight: 1.4 }}>
            {statusText('error')}
          </p>
        </div>
      )}

      {/* ── Zoom hint ─────────────────────────────────────────────────── */}
      {imgLoaded && (
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(201,168,76,0.25)', zIndex: 6 }}
        >
          <span className="font-cinzel" style={{ fontSize: '0.5rem', color: 'rgba(201,168,76,0.7)', letterSpacing: '0.12em' }}>
            ⊕ {lang === 'en' ? 'ENLARGE' : 'FORSTØR'}
          </span>
        </div>
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
