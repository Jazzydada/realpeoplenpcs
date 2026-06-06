'use client'

import { memo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wand2, Image, Download, Bookmark, BookOpen, Loader2 } from 'lucide-react'
import { t, type Lang } from '@/lib/i18n'

interface Props {
  onGenerate: () => void
  onGeneratePortrait: () => void
  onRegenerateImage: () => void
  onExport: () => void
  onSave: () => void
  onShowSaved: () => void
  isGenerating: boolean
  isLoadingImage: boolean
  exportingPng: boolean
  hasCharacter: boolean
  hasPortrait: boolean
  savedCount: number
  quality: 'fast' | 'high'
  onQualityChange: (q: 'fast' | 'high') => void
  level: number
  onLevelChange: (level: number) => void
  imageStyle: string
  onImageStyleChange: (style: string) => void
  portraitType: string
  onPortraitTypeChange: (type: string) => void
  lang?: Lang
  onLangChange?: (l: Lang) => void
}

interface BtnProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  icon: React.ReactNode
  label: string
  primary?: boolean
  title?: string
}

function Btn({ onClick, disabled, loading, icon, label, primary, title }: BtnProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.035, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className="relative flex items-center gap-1.5 px-3 py-1.5 font-cinzel tracking-widest uppercase transition-colors"
      style={{
        fontSize: '0.6rem',
        background: primary
          ? 'linear-gradient(135deg, rgba(201,168,76,0.18), rgba(160,110,20,0.22))'
          : 'rgba(13,11,7,0.85)',
        border: `1px solid ${primary ? 'rgba(201,168,76,0.55)' : 'rgba(201,168,76,0.2)'}`,
        color: disabled
          ? 'rgba(201,168,76,0.25)'
          : primary
            ? '#d4af37'
            : 'rgba(201,168,76,0.6)',
        boxShadow: primary && !disabled
          ? '0 0 10px rgba(201,168,76,0.1), inset 0 1px 0 rgba(201,168,76,0.08)'
          : 'none',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        backdropFilter: 'blur(6px)',
        letterSpacing: '0.14em',
      }}
    >
      {loading ? <Loader2 size={11} className="animate-spin" /> : <span style={{ opacity: 0.85 }}>{icon}</span>}
      <span className="hidden sm:inline">{label}</span>
    </motion.button>
  )
}

function ControlBar({
  onGenerate, onGeneratePortrait, onRegenerateImage, onExport, onSave, onShowSaved,
  isGenerating, isLoadingImage, exportingPng, hasCharacter, hasPortrait, savedCount,
  onQualityChange, level, onLevelChange, onImageStyleChange, onPortraitTypeChange,
  lang = 'da', onLangChange,
}: Props) {
  // START: v11 locked image settings
  // Cinematic + 3/4 figure gave the best Perchance results in testing.
  // Keep the controls out of the toolbar so it stays usable, but still force
  // the values in state.
  useEffect(() => {
    onQualityChange('high')
    onImageStyleChange('Cinematic')
    onPortraitTypeChange('Three Quarter')
  }, [onQualityChange, onImageStyleChange, onPortraitTypeChange])
  // END: v11 locked image settings

  return (
    <div className="relative z-10 flex flex-wrap items-center justify-center gap-2 px-4 py-3 mb-4">
      <div className="absolute top-0 inset-x-12 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.18), transparent)' }} />

      {/* START ASYNC PORTRAIT GENERATION
          "Generér" is NEVER disabled — not during isGenerating, not during
          isLoadingImage. The internal guard in handleGenerate (if isGenerating return)
          prevents double-clicks. The button must always appear active so the user
          can generate a new NPC at any point during portrait loading.
          Only "Nyt portræt" is locked while a portrait is in flight. */}
      <Btn onClick={onGenerate} disabled={false} loading={false} icon={<Wand2 size={11} />} label={t(lang, 'generate')} primary title={t(lang, 'generate')} />

      {/* START PORTRAIT ON DEMAND SYSTEM
          Show "Lav portræt" when no portrait exists, "Nyt portræt" when one does.
          Both are disabled while a portrait is loading. */}
      {!hasPortrait ? (
        <Btn
          onClick={onGeneratePortrait}
          disabled={!hasCharacter || isLoadingImage}
          loading={isLoadingImage}
          icon={<Image size={11} />}
          label={lang === 'en' ? 'Generate Portrait' : 'Lav portræt'}
          title={lang === 'en' ? 'Generate portrait' : 'Lav portræt'}
          primary={false}
        />
      ) : (
        <Btn
          onClick={onRegenerateImage}
          disabled={!hasCharacter || isLoadingImage}
          loading={isLoadingImage}
          icon={<Image size={11} />}
          label={t(lang, 'newPortrait')}
          title={t(lang, 'newPortrait')}
        />
      )}
      {/* END PORTRAIT ON DEMAND SYSTEM */}

      <div
        className="flex items-center gap-2 px-3 py-1.5"
        style={{
          border: '1px solid rgba(201,168,76,0.2)',
          background: 'rgba(13,11,7,0.85)',
          backdropFilter: 'blur(6px)',
        }}
        title="Level påvirker HP, attack bonus, skade, CR og kampdata"
      >
        <span className="font-cinzel uppercase tracking-widest" style={{ fontSize: '0.58rem', color: '#d4af37', minWidth: 48 }}>{t(lang, 'levelLabel')} {level}</span>
        <input
          type="range"
          min={1}
          max={20}
          value={level}
          disabled={!hasCharacter}
          onChange={(e) => onLevelChange(Number(e.target.value))}
          style={{ width: 130, accentColor: '#d4af37', opacity: hasCharacter ? 0.9 : 0.3 }}
        />
      </div>

      <Btn onClick={onExport}      disabled={!hasCharacter || isLoadingImage} loading={exportingPng} icon={<Download size={11} />} label="PNG" title="PNG" />
      <Btn onClick={onSave}        disabled={!hasCharacter}                           icon={<Bookmark size={11} />} label={t(lang, 'save')} title={t(lang, 'save')} />
      <Btn onClick={onShowSaved}                                                   icon={<BookOpen size={11} />} label={savedCount > 0 ? `${t(lang, 'collection')} (${savedCount})` : t(lang, 'collection')} title={t(lang, 'collection')} />

      {/* Language toggle moved to header — between title and toolbar */}

      <div className="absolute bottom-0 inset-x-12 h-px"
        style={{ background: 'linear-gradient(to right, transparent, rgba(201,168,76,0.18), transparent)' }} />
    </div>
  )
}

export default memo(ControlBar)
