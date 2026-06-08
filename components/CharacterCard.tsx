'use client'

import { forwardRef, memo } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw } from 'lucide-react'
import CharacterSheet from './CharacterSheet'
import PortraitPanel from './PortraitPanel'
import type { Character } from '@/lib/types'
import type { RerollField } from '@/lib/generator'
import { t, type Lang } from '@/lib/i18n'
import { translateAppearanceToEn, translateWeaponToEn, internalClass } from '@/lib/generator'

// Translation helper (mirrors CharacterSheet's tr)
function tr(char: Character, lang: Lang, field: keyof NonNullable<Character['translations']>['da']): string {
  const raw = char.translations?.[lang]?.[field] ?? (char[field as keyof Character] as string) ?? ''
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

// START INSTANT LANGUAGE SWITCH — appearance
// Always translate via the live APPEARANCE_EN lookup for EN.
// The stored translations.en.appearance may equal the Danish string
// if the key wasn't in the lookup table at generation time, so we
// re-run the lookup every render — it's just a dictionary lookup, very cheap.
function trAppearance(char: Character, lang: Lang): string {
  const da = char.translations?.da?.appearance ?? char.appearance ?? ''
  const raw = lang === 'da' ? da : translateAppearanceToEn(da)
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
// END INSTANT LANGUAGE SWITCH

// D&D 5e/2024 saving throw proficiencies per class (internal Danish class keys)
const CLASS_SAVE_PROFICIENCIES: Record<string, string[]> = {
  'Barbar':    ['STR', 'CON'],
  'Barde':     ['DEX', 'CHA'],
  'Præst':     ['WIS', 'CHA'],
  'Druide':    ['INT', 'WIS'],
  'Kriger':    ['STR', 'CON'],
  'Munk':      ['STR', 'DEX'],
  'Paladin':   ['WIS', 'CHA'],
  'Jæger':     ['STR', 'DEX'],
  'Slyngel':   ['DEX', 'INT'],
  'Troldmand': ['INT', 'WIS'],
  'Troldkarl': ['CON', 'CHA'],
  'Warlock':   ['WIS', 'CHA'],
}

// ─── SVG/CSS constants ───────────────────────────────────────────────────────
const GLOBAL_GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23g)' opacity='0.07'/%3E%3C/svg%3E")`

const RAGGED_EDGE = `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' viewBox='0 0 54 1000' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.055 0.32' numOctaves='4' seed='8'/%3E%3CfeDisplacementMap in='SourceGraphic' scale='12'/%3E%3C/filter%3E%3Cpath filter='url(%23n)' fill='%230c0904' d='M0 0 C20 18 13 38 28 61 C40 82 11 97 30 124 C45 145 17 166 31 191 C47 219 15 238 27 269 C39 299 12 326 30 358 C43 384 18 416 29 449 C42 486 13 510 31 548 C45 584 17 612 29 645 C40 681 10 707 30 742 C45 772 17 802 31 836 C45 873 12 904 29 938 C39 963 21 982 38 1000 L0 1000 Z'/%3E%3C/svg%3E")`

const SHADOW = [
  '0 0 0 1px rgba(201,168,76,0.28)',
  '0 18px 70px rgba(0,0,0,0.95)',
  '0 0 110px rgba(0,0,0,0.72)',
].join(',')

const VIGNETTE = [
  'radial-gradient(ellipse at 10% 5%, rgba(96,52,12,0.08) 0%, transparent 38%)',
  'radial-gradient(ellipse at 92% 94%, rgba(0,0,0,0.12) 0%, transparent 36%)',
  'radial-gradient(ellipse at 50% 50%, transparent 34%, rgba(0,0,0,0.17) 76%, rgba(0,0,0,0.44) 100%)',
].join(',')

// ─── Reusable overlay primitives (no per-render style-object churn) ─────────
const grainStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  backgroundImage: GLOBAL_GRAIN, backgroundSize: '512px 512px',
  mixBlendMode: 'overlay', opacity: 0.58,
}
const vignetteStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none', background: VIGNETTE,
}
const borderStyle: React.CSSProperties = {
  position: 'absolute', inset: 0, pointerEvents: 'none',
  border: '1px solid rgba(201,168,76,0.24)',
  boxShadow: 'inset 0 0 80px rgba(0,0,0,0.22)',
}

function GrainOverlay({ zIndex }: { zIndex: number }) {
  return <div data-export-hide="true" style={{ ...grainStyle, zIndex }} />
}
function VignetteOverlay({ zIndex }: { zIndex: number }) {
  return <div data-export-hide="true" style={{ ...vignetteStyle, zIndex }} />
}
function CardBorder({ zIndex }: { zIndex: number }) {
  return <div style={{ ...borderStyle, zIndex }} />
}

const appearanceLabelStyle: React.CSSProperties = { color: 'rgba(201,168,76,0.45)' }
const appearanceTextStyle: React.CSSProperties = {
  fontSize: 'clamp(0.58rem, 1.1vw, 0.70rem)',
  color: 'rgba(218,195,145,0.85)',
  letterSpacing: '0.04em',
  lineHeight: 1.4,
}
function AppearanceReroll({ onClick }: { onClick?: () => void }) {
  if (!onClick) return null
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick() }} title="Rul udseende om" style={{ marginLeft: 6, width: 18, height: 18, display: 'inline-grid', placeItems: 'center', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '50%', background: 'rgba(13,11,7,0.50)', color: 'rgba(214,183,112,0.82)', verticalAlign: 'middle' }}>
      <RefreshCw size={10} strokeWidth={1.8} />
    </button>
  )
}
function AppearanceLine({ text, onReroll, lang = 'da' }: { text: string; onReroll?: () => void; lang?: Lang }) {
  return (
    <p className="font-cinzel text-center leading-snug" style={appearanceTextStyle}>
      <span style={appearanceLabelStyle}>{t(lang, 'appearance')}: </span>
      {text}
      <AppearanceReroll onClick={onReroll} />
    </p>
  )
}



const cleanTextStyle: React.CSSProperties = {
  color: '#efe6cf',
  fontSize: 'clamp(0.86rem, 1.55vw, 1.02rem)',
  lineHeight: 1.42,
}

function SmallReroll({ onClick, title = 'Reroll' }: { onClick?: () => void; title?: string }) {
  if (!onClick) return null
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onClick() }} title={title} style={{
      width: 22, height: 22, display: 'inline-grid', placeItems: 'center', borderRadius: '50%',
      border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(10,7,3,0.55)', color: '#d8b867', cursor: 'pointer', flexShrink: 0,
    }}>
      <RefreshCw size={12} strokeWidth={1.9} />
    </button>
  )
}

// ─── Colour palette — grouped by GM information type ─────────────────────────
// Group colours match reference image: each logical group shares one colour.
const T = (bg: string, border: string, title: string, divider: string, text: React.CSSProperties) =>
  ({ bg, border, title, divider, text })

const CARD_THEMES = {
  // ── Structural ──────────────────────────────────────────────────────────────
  accent:     T('linear-gradient(160deg,#d4ba7c 0%,#b98540 55%,#a87835 100%)',      'rgba(60,35,8,0.70)',    '#251002', 'rgba(45,18,4,0.30)',    { color: '#1e0e04', fontSize: 'clamp(0.76rem,1.32vw,0.9rem)', lineHeight: 1.35, fontWeight: 600 } as React.CSSProperties),

  // ── Group: Race / Class / Alignment / Level  →  Blue-Cyan ──────────────────
  stat:       T('linear-gradient(160deg,rgba(3,18,30,0.97) 0%,rgba(2,10,18,0.97) 100%)', 'rgba(28,148,175,0.48)', '#22b8d0', 'rgba(28,148,175,0.20)', { color: '#aae4f0', fontSize: 'clamp(0.72rem,1.08vw,0.86rem)', lineHeight: 1.3, fontWeight: 700, wordBreak: 'break-word' } as React.CSSProperties),

  // ── Group: First Impression  →  Teal / Cyan ────────────────────────────────
  impression: T('linear-gradient(160deg,rgba(3,25,28,0.97) 0%,rgba(2,14,16,0.97) 100%)', 'rgba(25,170,182,0.48)', '#18c8d8', 'rgba(25,170,182,0.20)', { color: '#b0eef4', fontStyle: 'italic', fontSize: 'clamp(0.9rem,1.56vw,1.04rem)', lineHeight: 1.46 } as React.CSSProperties),

  // ── Group: Appearance  →  Green ────────────────────────────────────────────
  appearance: T('linear-gradient(160deg,rgba(3,20,5,0.97) 0%,rgba(2,12,3,0.97) 100%)',   'rgba(35,158,55,0.48)',  '#28c040', 'rgba(35,158,55,0.20)',  { color: '#aaeab8', fontSize: 'clamp(0.78rem,1.22vw,0.9rem)', lineHeight: 1.38 } as React.CSSProperties),

  // ── Group: Personality / Ideal / Bond / Flaw  →  Purple / Violet ───────────
  traits:     T('linear-gradient(160deg,rgba(22,5,42,0.97) 0%,rgba(12,3,24,0.97) 100%)', 'rgba(115,48,195,0.52)', '#9248e0', 'rgba(115,48,195,0.24)', { color: '#d8ccf8', fontSize: 'clamp(0.86rem,1.50vw,0.98rem)', lineHeight: 1.44 } as React.CSSProperties),

  // ── Group: Motivation / Secret / Mannerism / Relation  →  Deep Blue ────────
  story:      T('linear-gradient(160deg,rgba(3,10,30,0.97) 0%,rgba(2,6,20,0.97) 100%)',  'rgba(38,78,185,0.52)',  '#4068d8', 'rgba(38,78,185,0.24)',  { color: '#c0d0f4', fontSize: 'clamp(0.86rem,1.50vw,0.98rem)', lineHeight: 1.44 } as React.CSSProperties),

  // ── Group: Scene Hook / How To Play  →  Dark Red / Burgundy ───────────────
  footer:     T('linear-gradient(160deg,rgba(30,3,6,0.97) 0%,rgba(16,2,4,0.97) 100%)',   'rgba(148,18,32,0.55)',  '#b81828', 'rgba(148,18,32,0.26)',  { color: '#f0c4c8', fontSize: 'clamp(0.86rem,1.50vw,0.98rem)', lineHeight: 1.44 } as React.CSSProperties),
}

type CardVariant = keyof typeof CARD_THEMES

function InfoCard({ title, children, onReroll, variant = 'traits', icon }: { title: string; children: React.ReactNode; onReroll?: () => void; variant?: CardVariant; icon?: React.ReactNode }) {
  const theme = CARD_THEMES[variant]
  return (
    <section style={{
      position: 'relative',
      padding: variant === 'accent' ? '14px 14px' : '10px 12px',
      border: `1px solid ${theme.border}`,
      background: theme.bg,
      boxShadow: 'inset 0 0 22px rgba(0,0,0,0.45), 0 2px 10px rgba(0,0,0,0.28)',
      minWidth: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        {icon && <span style={{ color: theme.title, opacity: 0.75, lineHeight: 1, flexShrink: 0 }}>{icon}</span>}
        <h3 className="font-cinzel" style={{
          margin: 0, color: theme.title,
          fontSize: variant === 'accent' ? '0.68rem' : '0.65rem',
          letterSpacing: '0.14em', fontWeight: 800, textTransform: 'uppercase',
        }}>{title}</h3>
        <span style={{ flex: 1, height: '1px', background: theme.divider }} />
        <SmallReroll onClick={onReroll} />
      </div>
      <div className="font-crimson" style={theme.text}>
        {children}
      </div>
    </section>
  )
}

function DesktopRedesign({ character, imageUrl, isGenerating, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, onRerollPortrait, onRerollName, onRerollField, lang }: Props & { lang: Lang }) {
  const portraitProps = { character, imageUrl, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, onRerollPortrait, lang }

  if (isGenerating || !character) {
    return (
      <div className="hidden md:grid" style={{ aspectRatio: '4 / 5', placeItems: 'center', background: '#0a0806', boxShadow: SHADOW, border: '1px solid rgba(201,168,76,0.24)' }}>
        <div className="font-cinzel text-xs tracking-widest animate-pulse" style={{ color: 'rgba(201,168,76,0.48)' }}>{isGenerating ? t(lang, 'consulting') : t(lang, 'generatePrompt')}</div>
      </div>
    )
  }

  const c = character.combatStats
  const abilities = character.abilityScores
  const abilityRows: Array<[string, keyof typeof abilities]> = [['STR','strength'],['DEX','dexterity'],['CON','constitution'],['INT','intelligence'],['WIS','wisdom'],['CHA','charisma']]

  return (
    <div className="hidden md:grid" style={{
      position: 'relative',
      gridTemplateRows: 'auto 1fr auto',
      gap: 10,
      padding: 18,
      overflow: 'visible',
      background: [
        'radial-gradient(ellipse at 20% 0%, rgba(87,45,11,0.35), transparent 46%)',
        'linear-gradient(145deg, #22170b 0%, #120c06 52%, #080604 100%)',
      ].join(','),
      boxShadow: SHADOW,
      border: '1px solid rgba(201,168,76,0.27)',
    }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: GLOBAL_GRAIN, opacity: 0.19, pointerEvents: 'none' }} />

      <header style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'start', borderBottom: '1px solid rgba(201,168,76,0.22)', paddingBottom: 10 }}>
        <div>
          <h1 className="font-cinzel-decorative uppercase" style={{ margin: 0, color: '#f0dfb4', fontSize: 'clamp(1.3rem, 3.0vw, 1.85rem)', lineHeight: 1.0, letterSpacing: '0.04em', textShadow: '0 2px 18px rgba(0,0,0,0.90)' }}>{character.name}</h1>
          <p className="font-cinzel" style={{ margin: '7px 0 0', color: '#c8a050', fontSize: 'clamp(0.72rem,1.28vw,0.88rem)', letterSpacing: '0.08em' }}>
            {tr(character, lang, 'species')} &bull; {tr(character, lang, 'characterClass')} &bull; {tr(character, lang, 'alignment')} &bull; {t(lang, 'level')} {character.level}
          </p>
        </div>
        <SmallReroll onClick={onRerollName} title="Rul navn om" />
      </header>

      <main style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: '31% 1fr', gap: 12, alignItems: 'start' }}>
        <aside style={{ display: 'grid', gridTemplateRows: 'auto auto auto', gap: 10 }}>
          <div style={{ border: '1px solid rgba(201,168,76,0.28)', background: '#050403', padding: 7, boxShadow: 'inset 0 0 25px rgba(0,0,0,0.65)' }}>
            <div style={{ position: 'relative', aspectRatio: '3 / 4', overflow: 'hidden', background: '#080604' }}>
              <PortraitPanel key={imageUrl ?? 'empty'} {...portraitProps} />
            </div>
          </div>
          <InfoCard title={t(lang, 'appearance')} variant="appearance" onReroll={() => onRerollField('appearance')}>
            <span style={{ fontSize: 'clamp(0.78rem,1.25vw,0.9rem)', lineHeight: 1.35 }}>{trAppearance(character, lang)}</span>
          </InfoCard>
          <InfoCard title={t(lang, 'combatData')} variant="accent">
            {/* Row 1: STR DEX CON INT (4 cols) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 5 }}>
              {abilityRows.slice(0,4).map(([abbr, key]) => {
                const score = abilities[key]
                const mod = Math.floor((score - 10) / 2)
                return (
                  <div key={abbr} style={{ textAlign: 'center', borderRadius: 4, border: '1px solid rgba(42,20,4,0.35)', background: 'rgba(0,0,0,0.16)', padding: '4px 1px' }}>
                    <div style={{ fontSize: '0.44rem', letterSpacing: '0.07em', color: 'rgba(42,20,4,0.68)', textTransform: 'uppercase', fontWeight: 700 }}>{abbr}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#251004', lineHeight: 1.0 }}>{score}</div>
                    <div style={{ fontSize: '0.48rem', color: mod >= 0 ? '#2a5020' : '#7a1818', fontWeight: 700, marginTop: 1 }}>{mod >= 0 ? '+' : ''}{mod}</div>
                  </div>
                )
              })}
            </div>
            {/* Row 2: WIS CHA AC INIT HP SPD (6 cols) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 5, marginBottom: 8 }}>
              {abilityRows.slice(4,6).map(([abbr, key]) => {
                const score = abilities[key]
                const mod = Math.floor((score - 10) / 2)
                return (
                  <div key={abbr} style={{ textAlign: 'center', borderRadius: 4, border: '1px solid rgba(42,20,4,0.35)', background: 'rgba(0,0,0,0.16)', padding: '4px 1px' }}>
                    <div style={{ fontSize: '0.44rem', letterSpacing: '0.07em', color: 'rgba(42,20,4,0.68)', textTransform: 'uppercase', fontWeight: 700 }}>{abbr}</div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#251004', lineHeight: 1.0 }}>{score}</div>
                    <div style={{ fontSize: '0.48rem', color: mod >= 0 ? '#2a5020' : '#7a1818', fontWeight: 700, marginTop: 1 }}>{mod >= 0 ? '+' : ''}{mod}</div>
                  </div>
                )
              })}
              {([
                { label: 'AC',   value: c.armorClass,       color: '#7dd4f8' },
                { label: 'INIT', value: (() => { const n = parseInt(String(c.initiative).replace(/[^-\d]/g,'')); return (n >= 0 ? '+' : '') + n })(), color: '#f0c040' },
                { label: 'HP',   value: c.hitPoints,        color: '#f07070' },
                { label: 'SPD',  value: c.speed,            color: 'rgba(42,20,4,0.80)' },
              ] as const).map(({ label, value, color }) => (
                <div key={label} style={{ textAlign: 'center', borderRadius: 4, border: '1px solid rgba(42,20,4,0.35)', background: 'rgba(0,0,0,0.16)', padding: '4px 1px' }}>
                  <div style={{ fontSize: '0.44rem', letterSpacing: '0.07em', color: 'rgba(42,20,4,0.68)', textTransform: 'uppercase', fontWeight: 700 }}>{label}</div>
                  <div style={{ fontSize: label === 'SPD' ? '0.64rem' : '0.92rem', fontWeight: 800, color, lineHeight: 1.1, marginTop: label === 'SPD' ? 3 : 0 }}>{value}</div>
                </div>
              ))}
            </div>
            {/* Saving Throws */}
            {(() => {
              const prof = character.level >= 17 ? 6 : character.level >= 13 ? 5 : character.level >= 9 ? 4 : character.level >= 5 ? 3 : 2
              const profSaves = CLASS_SAVE_PROFICIENCIES[internalClass(character.characterClass)] ?? []
              const saves = abilityRows.map(([abbr, key]) => {
                const mod = Math.floor((abilities[key] - 10) / 2)
                return { abbr, save: mod + (profSaves.includes(abbr) ? prof : 0) }
              })
              return (
                <div style={{ marginBottom: 8 }}>
                  <div className="font-cinzel" style={{ fontSize: '0.50rem', letterSpacing: '0.10em', color: 'rgba(42,20,4,0.65)', textTransform: 'uppercase', marginBottom: 4, fontWeight: 800 }}>
                    {lang === 'en' ? 'Saving Throws' : 'Kastekast'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 4 }}>
                    {saves.map(({ abbr, save }) => (
                      <div key={abbr} style={{ textAlign: 'center', borderRadius: 3, border: '1px solid rgba(42,20,4,0.28)', background: 'rgba(0,0,0,0.12)', padding: '3px 1px' }}>
                        <div style={{ fontSize: '0.42rem', color: 'rgba(42,20,4,0.60)', textTransform: 'uppercase', fontWeight: 700 }}>{abbr}</div>
                        <div style={{ fontSize: '0.70rem', fontWeight: 800, color: save >= 0 ? '#2a4c18' : '#7a1818' }}>{save >= 0 ? '+' : ''}{save}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}
            {/* Weapons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, borderTop: '1px solid rgba(42,20,4,0.30)', paddingTop: 8 }}>
              {[
                { isMelee: true,  name: lang === 'en' ? translateWeaponToEn(c.melee.name)  : c.melee.name,  toHit: c.melee.toHit,  damage: c.melee.damage,  type: lang === 'en' ? 'Melee Weapon'  : 'Nærkamp'  },
                { isMelee: false, name: lang === 'en' ? translateWeaponToEn(c.ranged.name) : c.ranged.name, toHit: c.ranged.toHit, damage: c.ranged.damage, type: lang === 'en' ? 'Ranged Weapon' : 'Distance' },
              ].map(({ isMelee, name, toHit, damage, type }) => (
                <div key={type} style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8 }}>
                  {/* Weapon icon */}
                  <div style={{ gridRow: '1/3', alignSelf: 'center', width: 20, height: 20, display: 'grid', placeItems: 'center', border: '1px solid rgba(42,20,4,0.40)', borderRadius: 3, background: 'rgba(0,0,0,0.18)' }}>
                    {isMelee
                      ? <svg viewBox="0 0 12 12" width="10" height="10" fill="none"><path d="M2 10L9 3M9 3H6M9 3V6" stroke="rgba(42,20,4,0.80)" strokeWidth="1.4" strokeLinecap="round"/><path d="M2 9.5L3 8.5" stroke="rgba(42,20,4,0.60)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      : <svg viewBox="0 0 12 12" width="10" height="10" fill="none"><path d="M2 6H9M7 4L9.5 6L7 8" stroke="rgba(42,20,4,0.80)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 4.5V7.5" stroke="rgba(42,20,4,0.60)" strokeWidth="1.5" strokeLinecap="round"/></svg>
                    }
                  </div>
                  <span style={{ fontWeight: 700, color: '#251004', fontSize: '0.80rem', lineHeight: 1.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</span>
                  <span style={{ fontSize: '0.50rem', textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(42,20,4,0.65)', fontWeight: 600, lineHeight: 1.3 }}>{type} &bull; {toHit} &bull; {damage}</span>
                </div>
              ))}
            </div>
            {/* Special ability */}
            {(() => {
              const pool = lang === 'en' ? c.specialAbilitiesEn : c.specialAbilities
              const ability = pool?.[0]
              if (!ability) return null
              const [abilityName, ...rest] = ability.split(':')
              return (
                <div style={{ borderTop: '1px solid rgba(42,20,4,0.25)', paddingTop: 6, marginTop: 6 }}>
                  <span className="font-cinzel" style={{ fontWeight: 800, color: '#251004', fontSize: '0.58rem', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: 2 }}>{abilityName}</span>
                  {rest.length > 0 && <span style={{ color: 'rgba(42,20,4,0.72)', fontSize: '0.60rem', lineHeight: 1.30, display: 'block' }}>{rest.join(':').trim()}</span>}
                </div>
              )
            })()}
          </InfoCard>
        </aside>

        {/* Right section: First Impression → Stat Row → Trait/Story columns */}
        <section style={{ display: 'grid', gridTemplateRows: 'auto auto 1fr', gap: 10 }}>
          <InfoCard title={t(lang, 'firstImpression')} variant="impression">
            {tr(character, lang, 'firstImpression')}
          </InfoCard>

          {/* Stat row — all four share the same Blue-Cyan colour; decorative icons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {([
              { key: 'race'      as const, val: tr(character, lang, 'species'),        icon: <svg viewBox="0 0 14 14" width="10" height="10" fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="0.9" opacity="0.7"/><path d="M7 4v3l2 1.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/><circle cx="7" cy="7" r="1.2" fill="currentColor" opacity="0.5"/></svg> },
              { key: 'class'     as const, val: tr(character, lang, 'characterClass'), icon: <svg viewBox="0 0 14 14" width="10" height="10" fill="none"><path d="M7 2L8.2 5.5H12L9.2 7.5L10.2 11L7 9L3.8 11L4.8 7.5L2 5.5H5.8Z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" opacity="0.7"/></svg> },
              { key: 'alignment' as const, val: tr(character, lang, 'alignment'),      icon: <svg viewBox="0 0 14 14" width="10" height="10" fill="none"><circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="0.8" opacity="0.6"/><path d="M7 3.5V7M7 7L9.5 9.5M7 7L4.5 9.5" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round"/></svg> },
              { key: 'level'     as const, val: String(character.level),               icon: <svg viewBox="0 0 14 14" width="10" height="10" fill="none"><path d="M7 2.5L8.5 5.5L12 6L9.5 8.5L10 12L7 10.5L4 12L4.5 8.5L2 6L5.5 5.5Z" stroke="currentColor" strokeWidth="0.9" strokeLinejoin="round" opacity="0.7"/></svg> },
            ]).map(({ key, val, icon }) => (
              <InfoCard key={key} title={t(lang, key === 'level' ? 'level' : key)} variant="stat" icon={icon}>
                <b style={{ fontSize: 'clamp(0.72rem,1.08vw,0.86rem)', wordBreak: 'break-word', hyphens: 'auto', display: 'block', marginTop: 2 }}>{val}</b>
              </InfoCard>
            ))}
          </div>

          {/* Trait / Story columns — equal height rows via shared grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 4px 1fr', gap: '0 8px' }}>
            {/* Left: Personality group — Purple */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              <InfoCard variant="traits" title={t(lang, 'personalityTrait')} onReroll={() => onRerollField('personalityTrait')}>{tr(character, lang, 'personalityTrait')}</InfoCard>
              <InfoCard variant="traits" title={t(lang, 'ideal')}            onReroll={() => onRerollField('ideal')}>{tr(character, lang, 'ideal')}</InfoCard>
              <InfoCard variant="traits" title={t(lang, 'bond')}             onReroll={() => onRerollField('bond')}>{tr(character, lang, 'bond')}</InfoCard>
              <InfoCard variant="traits" title={t(lang, 'flaw')}             onReroll={() => onRerollField('flaw')}>{tr(character, lang, 'flaw')}</InfoCard>
            </div>
            {/* Divider */}
            <div style={{ background: 'linear-gradient(to bottom, transparent 4%, rgba(90,50,180,0.22) 20%, rgba(38,70,180,0.22) 80%, transparent 96%)', borderRadius: 2 }} />
            {/* Right: Story group — Deep Blue */}
            <div style={{ display: 'grid', gridTemplateRows: 'repeat(4,minmax(0,1fr))', gap: 8 }}>
              <InfoCard variant="story" title={t(lang, 'motivation')} onReroll={() => onRerollField('motivation')}>{tr(character, lang, 'motivation')}</InfoCard>
              <InfoCard variant="story" title={t(lang, 'secret')}     onReroll={() => onRerollField('secret')}>{tr(character, lang, 'secret')}</InfoCard>
              <InfoCard variant="story" title={t(lang, 'mannerism')}  onReroll={() => onRerollField('mannerism')}>{tr(character, lang, 'mannerism')}</InfoCard>
              <InfoCard variant="story" title={t(lang, 'relation')}   onReroll={() => onRerollField('relationship')}>{tr(character, lang, 'relationship')}</InfoCard>
            </div>
          </div>
        </section>
      </main>

      {/* ── Full-width footer: Scene Hook + How To Play — both Dark Red ─── */}
      <div style={{ position: 'relative', zIndex: 1, display: 'grid', gridTemplateColumns: character.howToPlay ? '1fr 1fr' : '1fr', gap: 10, marginTop: 4 }}>
        <InfoCard variant="footer" title={t(lang, 'sceneHook')} onReroll={() => onRerollField('sceneHook')}>
          <strong>{tr(character, lang, 'sceneHook')}</strong>
        </InfoCard>
        {character.howToPlay && (
          <InfoCard variant="footer" title={t(lang, 'howToPlay')}>
            <em>{character.translations?.[lang]?.howToPlay ?? character.howToPlay}</em>
          </InfoCard>
        )}
      </div>

      <footer className="font-cinzel" style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(201,168,76,0.14)', marginTop: 4, paddingTop: 8, color: 'rgba(201,168,76,0.38)', letterSpacing: '0.18em', fontSize: '0.52rem', textAlign: 'center' }}>
        ASAHEIMS RPG FANTASY GENERATOR
      </footer>
    </div>
  )
}

interface Props {
  character: Character | null
  imageUrl: string | null
  isGenerating: boolean
  isLoadingImage: boolean
  imageStartedAt: number | null
  quality: 'fast' | 'high'
  onImageLoad: () => void
  onZoom: () => void
  onRerollPortrait?: () => void
  onRerollName: () => void
  onRerollField: (field: RerollField) => void
  lang?: Lang
}

// NOTE: Both layouts are rendered; CSS hides the inactive one at the breakpoint.
// Yes, this means PortraitPanel mounts twice and both fire the img preloader,
// but modern browsers coalesce in-flight requests for the same URL, and our
// proxy sets `Cache-Control: immutable` so the second hit is cache-only.
// The benefit is zero hydration mismatch and no flash-of-wrong-layout on
// first paint — a worthwhile trade for a character generator.
const CharacterCard = forwardRef<HTMLDivElement, Props>(function CharacterCard(
  { character, imageUrl, isGenerating, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, onRerollPortrait, onRerollName, onRerollField, lang = 'da' },
  ref,
) {
  const portraitProps = {
    character, imageUrl, isLoadingImage, imageStartedAt, quality, onImageLoad, onZoom, onRerollPortrait,
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      className="w-full"
      style={{ position: 'relative', maxWidth: 760 }}
    >

      {/* ── MOBILE layout (< md) ─────────────────────────────────────────── */}
      <div
        className="md:hidden"
        style={{ position: 'relative', background: '#0a0806', boxShadow: SHADOW, overflow: 'hidden' }}
      >
        {/* Mobile name header — CHARACTER NAME + Race · Class above portrait */}
        {character && !isGenerating && (
          <div style={{
            padding: '18px 20px 14px',
            textAlign: 'center',
            background: 'rgba(8,5,2,0.98)',
            borderBottom: '1px solid rgba(201,168,76,0.18)',
            position: 'relative',
          }}>
            {/* Reroll button top-right */}
            <div style={{ position: 'absolute', top: 14, right: 14 }}>
              <button
                onClick={onRerollName}
                title="Rul navn om"
                style={{ width: 22, height: 22, display: 'grid', placeItems: 'center', border: '1px solid rgba(201,168,76,0.28)', borderRadius: '50%', background: 'rgba(13,11,7,0.60)', color: 'rgba(214,183,112,0.82)', cursor: 'pointer' }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>
                </svg>
              </button>
            </div>
            {/* Name */}
            <h2 className="font-cinzel-decorative uppercase" style={{
              color: '#efe0bd',
              fontWeight: 900,
              fontSize: 'clamp(1.05rem, 5.5vw, 1.45rem)',
              letterSpacing: '0.045em',
              lineHeight: 1,
              wordBreak: 'break-word',
              margin: 0,
              textShadow: '0 1px 9px rgba(0,0,0,0.96)',
              paddingRight: 28,
            }}>
              {character.name}
            </h2>
            {/* Race · Class */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 }}>
              <span style={{ height: 1, width: 28, background: 'rgba(201,168,76,0.40)', flexShrink: 0 }} />
              <p className="font-cinzel" style={{
                color: 'rgba(211,181,113,0.62)',
                fontSize: 'clamp(0.52rem, 2.5vw, 0.65rem)',
                letterSpacing: '0.12em',
                margin: 0,
                whiteSpace: 'nowrap',
              }}>
                {tr(character, lang, 'species')} · {tr(character, lang, 'characterClass')}
              </p>
              <span style={{ height: 1, width: 28, background: 'rgba(201,168,76,0.40)', flexShrink: 0 }} />
            </div>
          </div>
        )}

        {/* Mobile portrait — shorter ratio so text is reachable without scrolling */}
        <div style={{ position: 'relative', aspectRatio: '4 / 3', maxHeight: 420, overflow: 'hidden' }}>
          <PortraitPanel key={imageUrl ?? 'empty'} {...portraitProps} />
          <GrainOverlay zIndex={22} />
          <VignetteOverlay zIndex={23} />
        </div>

        {character && !isGenerating && (
          <div style={{
            padding: '9px 20px 10px',
            background: 'rgba(8,5,2,0.95)',
            borderTop: '1px solid rgba(201,168,76,0.18)',
            borderBottom: '1px solid rgba(201,168,76,0.18)',
          }}>
            <AppearanceLine text={trAppearance(character, lang)} lang={lang} />
          </div>
        )}

        <CharacterSheet character={character} isGenerating={isGenerating} layout="stacked" onRerollName={onRerollName} onRerollField={onRerollField} lang={lang} />

        <CardBorder zIndex={30} />
      </div>

      <DesktopRedesign character={character} imageUrl={imageUrl} isGenerating={isGenerating} isLoadingImage={isLoadingImage} imageStartedAt={imageStartedAt} quality={quality} onImageLoad={onImageLoad} onZoom={onZoom} onRerollPortrait={onRerollPortrait} onRerollName={onRerollName} onRerollField={onRerollField} lang={lang} />

    </motion.div>
  )
})

export default memo(CharacterCard)
