'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Character } from '@/lib/types'
import { generateCharacter, rerollCombat, rerollCoreTraits, rerollName, rerollNpcTraits, rerollSingleField, setCharacterLevel, type RerollField } from '@/lib/generator'
import {
  generateImagePrompt,
  getCachedImageUrl,
  cacheImageUrl,
  makeCacheKey,
  type PromptInput,
} from '@/lib/imagePrompt'
import { saveCharacter, deleteCharacter, loadSavedCharacters } from '@/lib/storage'
import { t, type Lang } from '@/lib/i18n'
import ParticleBackground from './ParticleBackground'
import ControlBar from './ControlBar'
import CharacterCard from './CharacterCard'
import SavedCharactersPanel from './SavedCharactersPanel'
import PortraitZoomModal from './PortraitZoomModal'
import PromptCopyPanel from './PromptCopyPanel'


function RerollPanel({
  hasCharacter,
  onName,
  onCoreTraits,
  onNpcTraits,
  onCombat,
  lang = 'da',
}: {
  hasCharacter: boolean
  onName: () => void
  onCoreTraits: () => void
  onNpcTraits: () => void
  onCombat: () => void
  lang?: Lang
}) {
  const btns = [
    [t(lang, 'rollName'),   onName],
    [t(lang, 'rollTraits'), onCoreTraits],
    [t(lang, 'rollNpc'),    onNpcTraits],
    [t(lang, 'rollCombat'), onCombat],
  ] as const

  if (!hasCharacter) return null

  return (
    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
      <span className="font-cinzel uppercase tracking-widest" style={{ fontSize: '0.55rem', color: 'rgba(201,168,76,0.35)' }}>{t(lang, 'rollLabel')}</span>
      {btns.map(([label, onClick]) => (
        <button
          key={label}
          onClick={onClick}
          className="font-cinzel uppercase tracking-widest px-2.5 py-1 transition-colors"
          style={{
            fontSize: '0.55rem',
            color: 'rgba(201,168,76,0.68)',
            border: '1px solid rgba(201,168,76,0.22)',
            background: 'rgba(13,11,7,0.72)',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

async function blobUrlToDataUrl(url: string): Promise<string> {
  if (!url.startsWith('blob:')) return url
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Build the PromptInput from a generated Character
function toPromptInput(char: Character): PromptInput {
  // START: richer portrait prompt grounding
  // The visible portrait must follow the generated NPC details, not just race/class.
  // We therefore feed appearance, first impression, mannerism, secret-prop hints and
  // signature item into the image prompt every time.
  const appearanceNotes = [
    char.appearance,
    `must visibly include: ${char.appearance}`,
    `first impression: ${char.firstImpression}`,
    `mannerism/body language: ${char.mannerism}`,
    `signature object or equipment: ${char.inventoryItem}`,
  ].join('. ')

  return {
    name:           char.name,
    species:        char.species,
    characterClass: char.characterClass,
    background:     char.background,
    alignment:      char.alignment,
    appearance:     appearanceNotes,
    inventoryItem:  char.inventoryItem,
    artStyle:       char.artStyle,
    gender:         char.gender, // START GENDER CONSISTENCY SYSTEM
  }
  // END: richer portrait prompt grounding
}

type GeneratedPortrait = { url: string; provider: string; fallbackReason?: string }

// ─── All image generation goes through the server route ──────────────────────
// fal.ai requires an API key that must stay server-side.
// The server falls back to Pollinations automatically if fal.ai is unavailable.
async function fetchGeneratedImage(prompt: string, negativePrompt: string, quality: 'fast' | 'high', signal?: AbortSignal): Promise<GeneratedPortrait> {
  const res = await fetch('/api/portrait', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, negativePrompt, quality }),
    signal,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as Record<string, unknown>
    throw new Error((body.error as string) ?? `HTTP ${res.status}`)
  }
  return await res.json() as GeneratedPortrait
}

// ─── START: html2canvas capture helpers ──────────────────────────────────────
//
// Root causes of the three export defects:
//
// 1. DARKNESS — CharacterCard wraps grain and vignette in <div> elements that
//    use `mix-blend-mode: overlay`. html2canvas has only partial blend-mode
//    support: it composites those layers as plain opaque overlays instead of
//    blending them, which makes the entire export significantly darker.
//    Fix: in `onclone`, hide every element whose computed mix-blend-mode is
//    not 'normal' by forcing opacity:0.
//
// 2. SQUEEZING — html2canvas internally reads offsetWidth/offsetHeight, which
//    does not account for the CSS `aspect-ratio` property or active CSS
//    transforms (Framer Motion leaves a matrix() on the element even after
//    animation). The card wrapper also renders a hidden mobile layout alongside
//    the visible desktop layout; the hidden element can distort the measured
//    bounding box. Fix: (a) target only the *visible* layout child, not the
//    outer wrapper, and (b) pass explicit width/height from getBoundingClientRect
//    so html2canvas always captures exactly what the browser rendered.
//
// 3. PORTRAIT PROPORTIONS — The export must capture the same DOM the user sees.
//    Earlier versions replaced <img> elements with background-image divs during
//    export. That caused stretched/deformed portraits in the downloaded PNG.
//    Fix: capture the real <img> nodes directly and do not reconstruct images.

/** Returns the visible layout child of the CharacterCard wrapper.
 *  The wrapper renders both mobile (md:hidden) and desktop (hidden md:block)
 *  layouts simultaneously; CSS hides the inactive one. We must capture only
 *  the visible child so that dimensions and proportions are correct. */
function getVisibleCardLayout(wrapper: HTMLElement): HTMLElement {
  for (const child of Array.from(wrapper.children) as HTMLElement[]) {
    if (window.getComputedStyle(child).display !== 'none') return child
  }
  return wrapper
}

/** Captures an element to a canvas using html-to-image (SVG foreignObject).
 *  Unlike html2canvas, html-to-image delegates text layout to the browser's
 *  own SVG renderer — so fonts, line-height, flexbox and CSS `inset` all
 *  match the live preview exactly.
 *
 *  We still need to hide mix-blend-mode overlays before capture because SVG
 *  foreignObject does not support CSS blend modes across layers. Everything
 *  else (object-fit, inset, custom fonts) is handled natively.
 *
 *  @param el     The element to capture (the visible card layout div).
 *  @param scale  Pixel density multiplier: 2 = 2× retina, 3 = 3× ultra-HD. */
async function captureCardCanvas(el: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  // Ensure custom fonts (Cinzel, Crimson Text) are fully loaded before capture.
  await document.fonts.ready

  // ── Hide mix-blend-mode overlays and data-export-hide elements ────────────
  // SVG foreignObject does not composite CSS blend modes across layers.
  // Hiding them before capture avoids dark/washed-out overlays in the export.
  type Stash = { node: HTMLElement; blendMode: string; opacity: string; filter: string }
  const stash: Stash[] = []

  el.querySelectorAll<HTMLElement>('*').forEach(node => {
    let blend = ''
    try { blend = window.getComputedStyle(node).mixBlendMode } catch { /* skip SVG pseudo-elements */ }
    const exportHide       = node.dataset.exportHide === 'true'
    const hasNonNormalBlend = Boolean(blend && blend !== 'normal')

    if (exportHide || hasNonNormalBlend) {
      stash.push({
        node,
        blendMode: node.style.mixBlendMode,
        opacity:   node.style.opacity,
        filter:    node.style.filter,
      })
      node.style.mixBlendMode = 'normal'
      node.style.opacity      = '0'
      node.style.filter       = 'none'
    }
  })

  let canvas: HTMLCanvasElement
  try {
    const { toCanvas } = await import('html-to-image')
    canvas = await toCanvas(el, {
      pixelRatio:      scale,
      backgroundColor: '#0a0806',
      // skipFonts: false — embed @font-face rules so the SVG renderer uses
      // the correct typefaces even if it runs in an isolated context.
      skipFonts: false,
    })
  } finally {
    // Restore blend-mode / export-hide stash regardless of success or failure.
    stash.forEach(({ node, blendMode, opacity, filter }) => {
      node.style.mixBlendMode = blendMode
      node.style.opacity      = opacity
      node.style.filter       = filter
    })
  }

  // Brightness compensation — the SVG pass renders slightly darker than the
  // live browser preview because it omits the blend-mode grain layers.
  const corrected = document.createElement('canvas')
  corrected.width  = canvas.width
  corrected.height = canvas.height
  const ctx = corrected.getContext('2d')
  if (!ctx) return canvas
  ctx.filter = 'brightness(95%) contrast(104%) saturate(106%)'
  ctx.drawImage(canvas, 0, 0)
  return corrected
}
// ─── END: html2canvas capture helpers ────────────────────────────────────────

export default function CharacterGenerator() {
  const [character,      setCharacter]      = useState<Character | null>(null)
  const [imageUrl,       setImageUrl]       = useState<string | null>(null)
  const [isGenerating,   setIsGenerating]   = useState(false)
  const [isLoadingImage, setIsLoadingImage] = useState(false)
  const [imageStartedAt, setImageStartedAt] = useState<number | null>(null)
  const [imageError,     setImageError]     = useState<string | null>(null)
  const [exportMessage,  setExportMessage]  = useState<string | null>(null)
  const [showSaved,      setShowSaved]      = useState(false)
  const [showZoom,       setShowZoom]       = useState(false)
  const [exportingPng,   setExportingPng]   = useState(false)
  const [savedCharacters, setSavedCharacters] = useState<Character[]>(() => loadSavedCharacters())
  const [saveFlash,      setSaveFlash]      = useState(false)
  const [quality,        setQuality]        = useState<'fast' | 'high'>('fast')
  const [imageProvider,  setImageProvider]  = useState<string | null>(null)
  const [imageStyle,     setImageStyle]     = useState('Cinematic')
  const [portraitType,   setPortraitType]   = useState('Three Quarter')
  const [lang,           setLang]           = useState<Lang>('da')
  const [usePortraits,   setUsePortraits]   = useState(true)

  const cardRef      = useRef<HTMLDivElement>(null)
  const pendingCache = useRef<{ key: string; url: string } | null>(null)

  // Persist portrait mode preference
  useEffect(() => {
    if (localStorage.getItem('rpg-portrait-mode') === 'off') setUsePortraits(false)
  }, [])

  const handlePortraitsToggle = useCallback(() => {
    setUsePortraits(prev => {
      const next = !prev
      localStorage.setItem('rpg-portrait-mode', next ? 'on' : 'off')
      if (!next && portraitAbortRef.current) portraitAbortRef.current.abort()
      return next
    })
  }, [])

  // START I18N SYSTEM
  // Persist the Danish/English UI choice. Image prompts remain English; NPC text
  // and local rerolls follow the active language.
  useEffect(() => {
    const stored = window.localStorage.getItem('rpg-fantasy-generator-lang')
    if (stored === 'da' || stored === 'en') setLang(stored)
  }, [])

  const handleLangChange = useCallback((nextLang: Lang) => {
    // Language switch updates display only — no re-generation.
    // CharacterSheet reads from char.translations[nextLang] immediately.
    setLang(nextLang)
    window.localStorage.setItem('rpg-fantasy-generator-lang', nextLang)
  }, [])
  // END I18N SYSTEM

  // START ASYNC PORTRAIT GENERATION
  // Each portrait request gets its own AbortController. When a new character
  // is generated (or a new portrait is requested) we abort the previous fetch
  // so the server-side connection is released and state is not overwritten.
  const portraitAbortRef = useRef<AbortController | null>(null)

  // Unique generation counter — if a newer request completes before an older
  // one we discard the stale result instead of overwriting the current portrait.
  const portraitGenRef = useRef(0)
  // END ASYNC PORTRAIT GENERATION

  // Committed on successful image load from PortraitPanel
  const handleImageLoad = useCallback(() => {
    if (pendingCache.current) {
      cacheImageUrl(pendingCache.current.key, pendingCache.current.url)
      pendingCache.current = null
    }
    setIsLoadingImage(false)
    setImageStartedAt(null)
    setImageError(null)
  }, [])

  // START ASYNC PORTRAIT GENERATION
  // triggerImage is fire-and-forget: it does NOT block the caller.
  // It cancels any in-flight portrait request before starting a new one.
  const triggerImage = useCallback((char: Character, q: 'fast' | 'high', forceNew = false) => {
    // Cancel any previous in-flight request
    if (portraitAbortRef.current) {
      portraitAbortRef.current.abort()
    }
    const controller = new AbortController()
    portraitAbortRef.current = controller

    // Stamp this generation so stale responses are discarded
    portraitGenRef.current += 1
    const myGen = portraitGenRef.current

    setIsLoadingImage(true)
    setImageStartedAt(Date.now())
    setImageError(null)
    setImageProvider(null)
    setImageUrl(null)

    const basePrompt = char.perchancePrompt || char.imagePrompt
    // START IMAGE IMPROVEMENT + START FACE QUALITY SYSTEM + START NON-BLOCKING PORTRAIT SYSTEM
    // Reinforce the base prompt's composition instructions (which already start with 3/4 body).
    const posePrompt =
      'THREE-QUARTER BODY PORTRAIT, CHARACTER VISIBLE FROM HEAD TO KNEES, ' +
      'portrait quality face, extremely detailed eyes, sharp eyes, symmetrical eyes, ' +
      'highly detailed facial features, expressive realistic eyes, character concept art face, ' +
      'beautiful fantasy portrait, professional fantasy illustration, studio quality character portrait, ' +
      'focus on face and eyes, face is the focal point, award winning fantasy portrait, ' +
      'PORTRAIT-FOCUSED COMPOSITION, NO CLOSE-UP, NO HEADSHOT, NO BUST ONLY, NO FACE CROP, ' +
      'natural asymmetric pose, clear readable silhouette, ' +
      'ART STYLE: Cinematic, D&D 2024 sourcebook illustration'
    const prompt = `${basePrompt}, ${posePrompt}`
    const negative = [
      char.negativePrompt || '',
      // Composition negatives
      'close-up portrait, face only, headshot, bust only, cropped body, cropped at waist, ' +
      'missing torso, missing hands, portrait crop, zoomed face, head only, shoulders only',
      // Face quality negatives
      'ugly face, deformed face, mutated face, cross eyed, bad anatomy, ' +
      'distorted facial features, poor facial structure, awkward expression, ' +
      'blurry face, low quality face, malformed face, asymmetrical eyes, ' +
      'bad eyes, wrong eye alignment, dead eyes, lifeless expression, ' +
      'cropped forehead, cropped hands, distorted eyes, crossed eyes, misaligned eyes',
      // General
      'text, watermark, logo, blurry, extra limbs, bad anatomy, modern clothing, sci-fi, cyberpunk',
    ].filter(Boolean).join(', ')
    // END IMAGE IMPROVEMENT / END FACE QUALITY SYSTEM / END NON-BLOCKING PORTRAIT SYSTEM
    const cacheKey = makeCacheKey(`${prompt}:${negative}`, q)

    const cached = forceNew ? undefined : getCachedImageUrl(cacheKey)
    if (cached) {
      if (portraitGenRef.current !== myGen) return
      setImageUrl(cached)
      setImageProvider('cache')
      setIsLoadingImage(false)
      setImageStartedAt(null)
      return
    }

    // Run asynchronously — caller is NOT awaited
    ;(async () => {
      try {
        const result = await fetchGeneratedImage(prompt, negative, q, controller.signal)
        // Discard if a newer request has already completed or been cancelled
        if (controller.signal.aborted || portraitGenRef.current !== myGen) return
        pendingCache.current = { key: cacheKey, url: result.url }
        setImageUrl(result.url)
        setImageProvider(result.fallbackReason ? 'Pollinations fallback' : result.provider)
        if (result.fallbackReason) console.warn('[Perchance fallback]', result.fallbackReason)
        setIsLoadingImage(false)
        setImageStartedAt(null)
        setImageError(null)
      } catch (err: unknown) {
        if (controller.signal.aborted || portraitGenRef.current !== myGen) return
        const msg = err instanceof Error ? err.message : 'Billedgenerering fejlede'
        console.error('[Portrait generation]', msg)
        setImageError(msg)
        setIsLoadingImage(false)
        setImageStartedAt(null)
      }
    })()
  }, [imageStyle, portraitType])
  // END ASYNC PORTRAIT GENERATION

  // START PORTRAIT ON DEMAND SYSTEM
  // generateNewCharacter only generates text/data — portrait is NOT triggered automatically.
  // This prevents queue/rate-limit problems with multiple simultaneous users.
  const generateNewCharacter = useCallback((currentLang: Lang) => {
    if (isGenerating) return
    setIsGenerating(true)
    autoPortraitFired.current = false
    setTimeout(() => {
      const newChar = generateCharacter(currentLang)
      newChar.imagePrompt = generateImagePrompt(toPromptInput(newChar))
      setCharacter(newChar)
      setIsGenerating(false)
      // Portrait is NOT triggered automatically — user must click "Lav portræt"
      // Abort any in-flight portrait from a previous character
      if (portraitAbortRef.current) portraitAbortRef.current.abort()
      setImageUrl(null)
      setImageError(null)
      setIsLoadingImage(false)
      setImageStartedAt(null)
    }, 80)
  }, [isGenerating])

  const langRef = useRef<Lang>('da')
  useEffect(() => { langRef.current = lang }, [lang])

  const autoPortraitFired = useRef(false)
  const triggerImageRef = useRef(triggerImage)
  useEffect(() => { triggerImageRef.current = triggerImage }, [triggerImage])
  useEffect(() => {
    if (!character || autoPortraitFired.current || !usePortraits) return
    autoPortraitFired.current = true
    const id = setTimeout(() => triggerImageRef.current(character, quality, true), 50)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [character, usePortraits])

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      generateNewCharacter(langRef.current)
    })
    return () => cancelAnimationFrame(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGenerate = useCallback(() => {
    generateNewCharacter(lang)
  }, [generateNewCharacter, lang])

  // Explicit portrait generation — only called when user clicks "Lav portræt" / "Nyt portræt"
  const handleGeneratePortrait = useCallback(() => {
    if (!character || isLoadingImage || !usePortraits) return
    triggerImage(character, quality, true)
  }, [character, isLoadingImage, quality, triggerImage, usePortraits])

  // "Nyt portræt" = force-new portrait for current character
  const handleRegenerateImage = useCallback(() => {
    handleGeneratePortrait()
  }, [handleGeneratePortrait])
  // END PORTRAIT ON DEMAND SYSTEM

  const updateCharacterOnly = useCallback((updater: (char: Character) => Character) => {
    setCharacter((current) => current ? updater(current) : current)
  }, [])

  const handleRerollName = useCallback(() => updateCharacterOnly(rerollName), [updateCharacterOnly])
  const handleRerollCoreTraits = useCallback(() => updateCharacterOnly((char) => rerollCoreTraits(char, lang)), [updateCharacterOnly, lang])
  const handleRerollNpcTraits = useCallback(() => updateCharacterOnly((char) => rerollNpcTraits(char, lang)), [updateCharacterOnly, lang])
  const handleRerollCombat = useCallback(() => updateCharacterOnly(rerollCombat), [updateCharacterOnly])
  const handleRerollField = useCallback((field: RerollField) => updateCharacterOnly((char) => rerollSingleField(char, field, lang)), [updateCharacterOnly, lang])
  const handleLevelChange = useCallback((level: number) => updateCharacterOnly((char) => setCharacterLevel(char, level)), [updateCharacterOnly])

  const handleExportPng = useCallback(async () => {
    if (!cardRef.current || !character || exportingPng) return
    if (isLoadingImage) {
      setExportMessage('Vent til portrættet er færdigt før PNG eksport')
      setTimeout(() => setExportMessage(null), 2600)
      return
    }
    setExportingPng(true)
    try {
      // START: fixed PNG capture
      console.log('PNG export started')
      const target = getVisibleCardLayout(cardRef.current)
      const canvas = await captureCardCanvas(target, 2) // 2× retina; change to 3 for ultra-HD
      // END: fixed PNG capture
      const link = document.createElement('a')
      link.download = `${character.name.replace(/\s+/g, '-').toLowerCase()}-karakterkort.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
      console.log('PNG export completed')
      setExportMessage('PNG gemt')
      setTimeout(() => setExportMessage(null), 1800)
    } catch (err) {
      console.error('PNG eksport fejlede:', err)
      setExportMessage('PNG eksport fejlede — prøv igen')
      setTimeout(() => setExportMessage(null), 3200)
    } finally {
      setExportingPng(false)
    }
  }, [character, exportingPng, isLoadingImage])

  const handleSave = useCallback(async () => {
    if (!character) return
    let persistedImageUrl: string | undefined
    if (imageUrl) {
      try {
        persistedImageUrl = await blobUrlToDataUrl(imageUrl)
      } catch {
        persistedImageUrl = undefined
      }
    }
    const updated = saveCharacter({ ...character, imageUrl: persistedImageUrl })
    setSavedCharacters(updated)
    setSaveFlash(true)
    setTimeout(() => setSaveFlash(false), 1400)
  }, [character, imageUrl])

  const handleDelete = useCallback((id: string) => {
    setSavedCharacters(deleteCharacter(id))
  }, [])

  const handleLoad = useCallback((char: Character) => {
    setCharacter(char)
    setImageUrl(char.imageUrl ?? null)
    setIsLoadingImage(false)
    setShowSaved(false)
  }, [])

  // Stable identity callbacks for child memo to work correctly
  const handleShowSaved   = useCallback(() => setShowSaved(true),   [])
  const handleHideSaved   = useCallback(() => setShowSaved(false),  [])
  const handleShowZoom    = useCallback(() => setShowZoom(true),    [])
  const handleHideZoom    = useCallback(() => setShowZoom(false),   [])

  return (
    <div className="relative min-h-screen overflow-x-hidden" style={{ background: '#0d0b07' }}>
      <ParticleBackground />

      <div className="absolute top-0 inset-x-0 h-72 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at 50% -10%, rgba(201,168,76,0.07) 0%, transparent 65%)',
        zIndex: 1,
      }} />

      <div className="relative z-10 flex flex-col min-h-screen">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="pt-8 pb-1 text-center px-4">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px w-16 md:w-28" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.45))' }} />
              <span className="font-cinzel text-xs" style={{ color: 'rgba(201,168,76,0.45)', letterSpacing: '0.2em' }}>⚔ ✦ ⚔</span>
              <div className="h-px w-16 md:w-28" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.45))' }} />
            </div>

            {/* Two-line title: imprint name above product title */}
            <p className="font-cinzel uppercase" style={{
              fontSize: 'clamp(0.55rem, 1.6vw, 0.85rem)',
              color: 'rgba(201,168,76,0.55)',
              letterSpacing: '0.38em',
              marginBottom: '0.15em',
              textShadow: '0 0 20px rgba(201,168,76,0.15)',
            }}>
              Asaheims
            </p>
            <h1 className="font-cinzel-decorative font-bold uppercase" style={{
              fontSize: 'clamp(1.1rem, 4vw, 2rem)',
              color: '#d4af37',
              textShadow: '0 0 40px rgba(201,168,76,0.25), 0 2px 4px rgba(0,0,0,0.9)',
              letterSpacing: '0.18em',
              lineHeight: 1.1,
            }}>
              RPG Fantasy Generator
            </h1>

            <p className="font-crimson italic mt-1 tracking-wide" style={{ fontSize: '0.85rem', color: 'rgba(201,168,76,0.38)' }}>
              {t(lang, 'subtitle')}
            </p>

            <div className="flex items-center justify-center gap-4 mt-3">
              <div className="h-px w-20 md:w-36" style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.25))' }} />
              <span className="font-cinzel text-xs" style={{ color: 'rgba(201,168,76,0.25)' }}>✦</span>
              <div className="h-px w-20 md:w-36" style={{ background: 'linear-gradient(to left, transparent, rgba(201,168,76,0.25))' }} />
            </div>

            {/* Language buttons — between title and toolbar, same style as toolbar buttons */}
            <div className="flex items-center justify-center gap-2 mt-3">
              {(['da', 'en'] as const).map((l) => {
                const active = lang === l
                return (
                  <motion.button
                    key={l}
                    whileHover={{ scale: 1.04, y: -1 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleLangChange(l)}
                    className="font-cinzel uppercase tracking-widest px-4 py-1.5"
                    style={{
                      fontSize: '0.62rem',
                      letterSpacing: '0.2em',
                      background: active
                        ? 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(160,110,20,0.25))'
                        : 'rgba(13,11,7,0.85)',
                      border: `1px solid ${active ? 'rgba(201,168,76,0.65)' : 'rgba(201,168,76,0.22)'}`,
                      color: active ? '#d4af37' : 'rgba(201,168,76,0.45)',
                      boxShadow: active
                        ? '0 0 12px rgba(201,168,76,0.12), inset 0 1px 0 rgba(201,168,76,0.10)'
                        : 'none',
                      backdropFilter: 'blur(6px)',
                      cursor: 'pointer',
                      transition: 'color 0.15s, border-color 0.15s, background 0.15s',
                    }}
                  >
                    {l.toUpperCase()}
                  </motion.button>
                )
              })}
            </div>
          </motion.div>
        </header>

        {/* ── Save flash ─────────────────────────────────────────────────── */}
        <AnimatePresence>
          {(saveFlash || exportMessage) && (
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2"
              style={{ background: 'rgba(13,11,7,0.97)', border: '1px solid rgba(201,168,76,0.45)', boxShadow: '0 0 20px rgba(201,168,76,0.15)' }}
            >
              <span className="font-cinzel tracking-widest" style={{ fontSize: '0.65rem', color: '#d4af37' }}>
                {exportMessage ? `✦ ${exportMessage}` : '✦ Karakter gemt'}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Image error toast ──────────────────────────────────────────── */}
        <AnimatePresence>
          {imageError && (
            <motion.div
              initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
              className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 max-w-xs text-center"
              style={{ background: 'rgba(13,11,7,0.97)', border: '1px solid rgba(180,60,40,0.55)', boxShadow: '0 0 20px rgba(180,60,40,0.10)' }}
            >
              <span className="font-cinzel tracking-wide" style={{ fontSize: '0.6rem', color: 'rgba(220,120,100,0.9)' }}>
                Billede: {imageError}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Controls ─────────────────────────────────────────────────────── */}
        <ControlBar
          onGenerate={handleGenerate}
          onGeneratePortrait={handleGeneratePortrait}
          onRegenerateImage={handleRegenerateImage}
          onExport={handleExportPng}
          onSave={handleSave}
          onShowSaved={handleShowSaved}
          isGenerating={isGenerating}
          isLoadingImage={isLoadingImage}
          exportingPng={exportingPng}
          hasCharacter={!!character}
          hasPortrait={!!imageUrl}
          savedCount={savedCharacters.length}
          quality={quality}
          onQualityChange={setQuality}
          usePortraits={usePortraits}
          onPortraitsToggle={handlePortraitsToggle}
          level={character?.level ?? 1}
          onLevelChange={handleLevelChange}
          imageStyle={imageStyle}
          onImageStyleChange={setImageStyle}
          portraitType={portraitType}
          onPortraitTypeChange={setPortraitType}
          lang={lang}
          onLangChange={handleLangChange}
        />

        {/* ── Card ─────────────────────────────────────────────────────────── */}
        <main className="flex-1 flex items-start justify-center px-4 pb-10">
          <div className="w-full flex flex-col items-center">
            <CharacterCard
              ref={cardRef}
              character={character}
              imageUrl={imageUrl}
              isGenerating={isGenerating}
              isLoadingImage={isLoadingImage}
              imageStartedAt={imageStartedAt}
              quality={quality}
              onImageLoad={handleImageLoad}
              onZoom={handleShowZoom}
              onRerollName={handleRerollName}
              onRerollField={handleRerollField}
              lang={lang}
            />
            {character && imageProvider && (
              <div className="font-cinzel uppercase tracking-widest mt-2" style={{ fontSize: '0.52rem', color: 'rgba(201,168,76,0.35)' }}>
                Generated with: {imageProvider}
              </div>
            )}
            <PromptCopyPanel character={character} />
          </div>
        </main>

        {/* ── Footer ─────────────────────────────────────────────────────────── */}
        <footer className="py-4 text-center">
          <p className="font-cinzel uppercase tracking-widest" style={{ fontSize: '0.5rem', color: 'rgba(201,168,76,0.15)' }}>
            Portrætter genereret med Pollinations · flux model
          </p>
        </footer>
      </div>

      {/* ── Saved panel ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSaved && (
          <SavedCharactersPanel
            characters={savedCharacters}
            onLoad={handleLoad}
            onDelete={handleDelete}
            onClose={handleHideSaved}
          />
        )}
      </AnimatePresence>

      {/* ── Zoom modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showZoom && character && imageUrl && (
          <PortraitZoomModal character={character} imageUrl={imageUrl} onClose={handleHideZoom} />
        )}
      </AnimatePresence>
    </div>
  )
}
