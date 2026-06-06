'use client'

import { motion } from 'framer-motion'
import {
  Anchor, BookOpen, Coins, Compass, Feather, Gem, Hammer, KeyRound,
  Leaf, Music, Shield, Skull, Sparkles, Swords, RefreshCw,
} from 'lucide-react'
import { modifier } from '@/lib/generator'
import type { Character } from '@/lib/types'
import type { RerollField } from '@/lib/generator'
import { t, type Lang } from '@/lib/i18n'

// START INSTANT LANGUAGE SWITCH
// Returns the translated value for a text field.
// Falls back to the top-level field if translations are not yet populated
// (e.g. characters saved before this feature was added).
function tr(char: Character, lang: Lang, field: keyof NonNullable<Character['translations']>['da']): string {
  return char.translations?.[lang]?.[field] ?? (char[field as keyof Character] as string) ?? ''
}
// END INSTANT LANGUAGE SWITCH

const NOISE_DARK = `url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.09'/%3E%3C/svg%3E")`
const NOISE_PARCH = `url("data:image/svg+xml,%3Csvg viewBox='0 0 260 260' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.52' numOctaves='5' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.18'/%3E%3C/svg%3E")`
const FIBERS = `url("data:image/svg+xml,%3Csvg viewBox='0 0 500 260' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.018 0.72' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23f)' opacity='0.08'/%3E%3C/svg%3E")`

const PANEL_BG = [
  'radial-gradient(ellipse at 0% 0%, rgba(88,44,9,0.70) 0%, transparent 48%)',
  'radial-gradient(ellipse at 90% 4%, rgba(54,26,6,0.58) 0%, transparent 42%)',
  'radial-gradient(ellipse at 4% 96%, rgba(64,30,6,0.64) 0%, transparent 45%)',
  'radial-gradient(ellipse at 52% 52%, rgba(30,15,4,0.40) 0%, transparent 62%)',
  'linear-gradient(172deg, #271c0e 0%, #1c1309 36%, #110b05 74%, #0a0604 100%)',
].join(',')

const ABILITY_ROWS = [
  { abbr: 'STR', key: 'strength' as const },
  { abbr: 'DEX', key: 'dexterity' as const },
  { abbr: 'CON', key: 'constitution' as const },
  { abbr: 'INT', key: 'intelligence' as const },
  { abbr: 'WIS', key: 'wisdom' as const },
  { abbr: 'CHA', key: 'charisma' as const },
]

type IconType = React.ElementType
type IconProps = { size?: number; strokeWidth?: number; style?: React.CSSProperties }

// Custom illustrated sailing-ship medallion — matches the reference design
// for Sømand backgrounds. Built to drop into the same Icon slot as Lucide.
function ShipSvg({ size = 28, strokeWidth = 1.25, style }: IconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth={strokeWidth}
      strokeLinecap="round" strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg" style={style}
    >
      {/* Mast */}
      <line x1="12" y1="3.5" x2="12" y2="16" />
      {/* Top sail */}
      <path d="M12 5 L16.5 10 L12 11 Z" fill="currentColor" fillOpacity="0.9" />
      {/* Main sail */}
      <path d="M7.5 8 L7.5 14 L12 15 L12 7 Z" fill="currentColor" fillOpacity="0.65" />
      {/* Crossbar */}
      <line x1="8" y1="8" x2="16.5" y2="8" strokeWidth={Math.max(0.6, strokeWidth * 0.6)} />
      {/* Hull */}
      <path d="M4.5 16 Q5 19 7 20 L17 20 Q19 19 19.5 16 Z" fill="currentColor" />
      {/* Waves */}
      <path d="M3 21.4 Q6 19.9 9 21.4 T15 21.4 T21 21.4" />
      <path d="M2 22.6 Q5 21.4 8 22.6 T14 22.6 T20 22.6 T22 22.6" strokeWidth={Math.max(0.5, strokeWidth * 0.55)} opacity="0.7" />
    </svg>
  )
}

function getEmblemIcon(character: Character): IconType {
  const cls = character.characterClass
  const spc = character.species
  const bg = character.background
  if (bg === 'Sømand') return ShipSvg
  if (cls === 'Barde') return Music
  if (cls === 'Slyngel') return KeyRound
  if (cls === 'Præst' || cls === 'Paladin') return Shield
  if (cls === 'Troldmand' || cls === 'Warlock') return Sparkles
  if (cls === 'Jæger' || cls === 'Druide') return Leaf
  if (cls === 'Kriger' || cls === 'Munk') return Swords
  if (spc.includes('Dværg')) return Hammer
  if (spc === 'Kenku') return Feather
  if (spc === 'Goblin') return Skull
  if (spc.includes('Halvling')) return Gem
  return Compass
}

const TRAIT_ICON_DA: Record<string, IconType> = {
  PERSONLIGHEDSTRÆK: Compass,
  IDEAL:             Leaf,
  BÅND:              Anchor,
  FEJL:              Coins,
}
const TRAIT_ICON_EN: Record<string, IconType> = {
  'PERSONALITY TRAIT': Compass,
  IDEAL:               Leaf,
  BOND:                Anchor,
  FLAW:                Coins,
}
function traitIcon(label: string): IconType {
  return TRAIT_ICON_DA[label] ?? TRAIT_ICON_EN[label] ?? BookOpen
}

function scaleName(name: string) {
  if (name.length > 20) return 'clamp(0.72rem, 1.85vw, 1.02rem)'
  if (name.length > 15) return 'clamp(0.82rem, 2.05vw, 1.15rem)'
  return 'clamp(0.95rem, 2.35vw, 1.34rem)'
}

// Sub-title under the name: "Skovsalv · Præst" or "Halvling (Stouthjerte) · Warlock".
// Long combinations would wrap and look broken — shrink font + letter-spacing
// + decorative lines so it always fits one line in the narrow side panel.
function scaleSubtitle(species: string, characterClass: string) {
  const total = species.length + characterClass.length
  if (total > 30) return { fontSize: 'clamp(0.40rem, 0.86vw, 0.50rem)', letterSpacing: '0.06em', lineWidth: 8 }
  if (total > 22) return { fontSize: 'clamp(0.44rem, 0.96vw, 0.55rem)', letterSpacing: '0.09em', lineWidth: 12 }
  return                  { fontSize: 'clamp(0.48rem, 1.08vw, 0.62rem)', letterSpacing: '0.13em', lineWidth: 18 }
}

function Rule({ label }: { label?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '7px 0 6px' }}>
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(181,136,65,0.42))' }} />
      {label && <span className="font-cinzel" style={{ color: 'rgba(214,183,112,0.56)', letterSpacing: '0.24em', fontSize: '0.43rem', whiteSpace: 'nowrap' }}>{label}</span>}
      <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(181,136,65,0.42))' }} />
    </div>
  )
}

function RerollButton({ onClick, title = 'Reroll' }: { onClick?: () => void; title?: string }) {
  if (!onClick) return null
  return (
    <button
      type="button"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title={title}
      aria-label={title}
      style={{
        width: 20,
        height: 20,
        display: 'inline-grid',
        placeItems: 'center',
        border: '1px solid rgba(201,168,76,0.34)',
        borderRadius: '50%',
        background: 'radial-gradient(circle at 35% 25%, rgba(201,168,76,0.18), rgba(13,11,7,0.58) 62%)',
        color: 'rgba(214,183,112,0.88)',
        cursor: 'pointer',
        flexShrink: 0,
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.42), 0 1px 4px rgba(0,0,0,0.45)',
      }}
    >
      <RefreshCw size={11} strokeWidth={1.9} />
    </button>
  )
}

function InfoLine({ label, value, indent = false }: { label: string; value: string; indent?: boolean }) {
  return (
    <div style={{ display: 'flex', gap: 4, paddingLeft: indent ? 9 : 0, fontSize: 'clamp(0.63rem, 1.25vw, 0.75rem)', lineHeight: 1.5 }}>
      {label && <span className="font-cinzel" style={{ flexShrink: 0, color: '#d4b560', fontWeight: 700 }}>{label}:</span>}
      <span className="font-crimson" style={{ color: '#ede0c0' }}>{value}</span>
    </div>
  )
}

function FramedInfo({ character, lang = 'da' }: { character: Character; lang?: Lang }) {
  return (
    <div
      style={{
        position: 'relative',
        marginTop: 7,
        padding: '8px 8px 8px',
        border: '1px solid rgba(151,107,50,0.52)',
        background: 'rgba(9,6,3,0.55)',
        boxShadow: 'inset 0 0 18px rgba(0,0,0,0.72), 0 1px 7px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ position: 'absolute', inset: 3, border: '1px solid rgba(151,107,50,0.13)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE_DARK, opacity: 0.65, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <InfoLine label={t(lang, 'race')} value={tr(character, lang, 'species')} />
        <InfoLine label={t(lang, 'class')} value={tr(character, lang, 'characterClass')} />
        <InfoLine label={t(lang, 'level')} value={`${character.level}`} />
        <InfoLine label={t(lang, 'alignment')} value={tr(character, lang, 'alignment')} />
      </div>
    </div>
  )
}


function StatMiniRow({ character }: { character: Character }) {
  const scores = character.abilityScores
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 3, marginTop: 7 }}>
      {ABILITY_ROWS.map(({ abbr, key }) => (
        <div key={abbr} style={{ textAlign: 'center', background: 'rgba(30,14,3,0.18)', border: '1px solid rgba(55,25,6,0.18)', padding: '2px 1px' }}>
          <div className="font-cinzel" style={{ color: 'rgba(45,19,4,0.72)', fontSize: '0.46rem', fontWeight: 800 }}>{abbr}</div>
          <div className="font-crimson" style={{ color: '#1f0e05', fontSize: '0.64rem', lineHeight: 1 }}>{modifier(scores[key])}</div>
        </div>
      ))}
    </div>
  )
}

function CombatBox({ character, lang = 'da' }: { character: Character; lang?: Lang }) {
  const c = character.combatStats
  return (
    <div
      style={{
        position: 'relative',
        overflow: 'visible',
        marginTop: 8,
        marginBottom: 10,
        padding: '7px 9px 8px',
        border: '1px solid rgba(56,32,9,0.75)',
        background: [
          'radial-gradient(ellipse at 20% 22%, rgba(108,64,18,0.31) 0%, transparent 36%)',
          'radial-gradient(ellipse at 72% 72%, rgba(85,45,10,0.24) 0%, transparent 34%)',
          'radial-gradient(ellipse at 48% 8%, rgba(255,214,135,0.18) 0%, transparent 40%)',
          'linear-gradient(145deg, #d2b07b 0%, #c19355 30%, #dfbe83 54%, #b88345 100%)',
        ].join(','),
        boxShadow: 'inset 0 0 22px rgba(50,20,2,0.34), 0 4px 10px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `${NOISE_PARCH}, ${FIBERS}`, backgroundSize: '260px 260px, 500px 260px', mixBlendMode: 'multiply', opacity: 0.45, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(72,40,10,0.16)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '2px 0 4px', position: 'relative', zIndex: 1 }}>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(48,22,6,0.40))' }} />
        <span className="font-cinzel" style={{ color: 'rgba(30,12,2,0.82)', letterSpacing: '0.20em', fontSize: '0.50rem', whiteSpace: 'nowrap' }}>{t(lang, 'combatData')}</span>
        <span style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(48,22,6,0.40))' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1, color: '#1f0e05' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4, marginBottom: 5 }}>
          <strong className="font-cinzel" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>AC {c.armorClass}</strong>
          <strong className="font-cinzel" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>HP {c.hitPoints}</strong>
          <strong className="font-cinzel" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>Init {c.initiative}</strong>
          <span className="font-crimson" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>Speed {c.speed}</span>
          <span className="font-crimson" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>PP {c.passivePerception}</span>
          <span className="font-crimson" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)' }}>CR {c.challenge}</span>
        </div>
        <div className="font-crimson" style={{ fontSize: 'clamp(0.62rem,1.25vw,0.72rem)', lineHeight: 1.35 }}>
          <div><b>Melee:</b> {c.melee.name} {c.melee.toHit} · {c.melee.damage}</div>
          <div><b>Range:</b> {c.ranged.name} {c.ranged.toHit} · {c.ranged.damage} · {c.ranged.notes}</div>
        </div>
        <div className="font-crimson" style={{ fontSize: 'clamp(0.60rem,1.18vw,0.68rem)', lineHeight: 1.30, marginTop: 4 }}>
          {c.specialAbilities.slice(0, 2).map((a) => <div key={a}>✦ {a}</div>)}
        </div>
        <StatMiniRow character={character} />
      </div>
    </div>
  )
}

function TraitRow({ label, text, onReroll }: { label: string; text: string; onReroll?: () => void }) {
  const Icon = traitIcon(label)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '27px 1fr', columnGap: 8, marginTop: 9, alignItems: 'start' }}>
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 3 }}>
        <Icon size={22} strokeWidth={1.55} style={{ color: '#d6b56d', opacity: 0.86, filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.7))' }} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
          <h3 className="font-cinzel" style={{ color: '#d7bd83', fontSize: 'clamp(0.62rem, 1.20vw, 0.72rem)', lineHeight: 1, letterSpacing: '0.08em', fontWeight: 700 }}>{label}</h3>
          <span style={{ flex: 1, height: 1, background: 'linear-gradient(to right, rgba(181,136,65,0.42), transparent)' }} />
          <RerollButton onClick={onReroll} />
        </div>
        <p className="font-crimson" style={{ color: '#e1d2b2', fontSize: 'clamp(0.68rem, 1.30vw, 0.78rem)', lineHeight: 1.42, margin: 0 }}>{text}</p>
      </div>
    </div>
  )
}

// A single framed container for all four character-trait rows.
// The double inner border + corner ornaments give the "tapestry placard" feel
// from the reference designs rather than bare unframed rows.
function TraitsPanel({ character, onRerollField, lang = 'da' }: { character: Character; onRerollField?: (field: RerollField) => void; lang?: Lang }) {
  const orn: React.CSSProperties = {
    position: 'absolute', fontSize: '0.44rem', color: 'rgba(171,127,55,0.58)',
    lineHeight: 1, pointerEvents: 'none',
  }
  return (
    <div style={{
      position: 'relative',
      marginTop: 7,
      border: '1px solid rgba(151,107,50,0.54)',
      background: 'rgba(7,4,2,0.48)',
      boxShadow: 'inset 0 0 22px rgba(0,0,0,0.70), 0 2px 8px rgba(0,0,0,0.50)',
      padding: '2px 9px 8px',
    }}>
      {/* Inner border — tapestry double-frame */}
      <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(151,107,50,0.18)', pointerEvents: 'none' }} />
      {/* Paper texture */}
      <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE_DARK, opacity: 0.68, pointerEvents: 'none' }} />
      {/* Corner ornaments */}
      <span style={{ ...orn, top: 1, left: 2 }}>✦</span>
      <span style={{ ...orn, top: 1, right: 2 }}>✦</span>
      <span style={{ ...orn, bottom: 1, left: 2 }}>✦</span>
      <span style={{ ...orn, bottom: 1, right: 2 }}>✦</span>
      <div style={{ position: 'relative', zIndex: 1 }}>
        <TraitRow label={t(lang, 'personalityTrait')} text={tr(character, lang, 'personalityTrait')} onReroll={() => onRerollField?.('personalityTrait')} />
        <TraitRow label={t(lang, 'ideal')} text={tr(character, lang, 'ideal')} onReroll={() => onRerollField?.('ideal')} />
        <TraitRow label={t(lang, 'bond')} text={tr(character, lang, 'bond')} onReroll={() => onRerollField?.('bond')} />
        <TraitRow label={t(lang, 'flaw')} text={tr(character, lang, 'flaw')} onReroll={() => onRerollField?.('flaw')} />
      </div>
    </div>
  )
}


function NpcLine({ label, text, onReroll }: { label: string; text: string; onReroll?: () => void }) {
  return (
    <div style={{ marginTop: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div className="font-cinzel" style={{ color: 'rgba(214,183,112,0.55)', fontSize: 'clamp(0.58rem, 1.10vw, 0.66rem)', letterSpacing: '0.13em', lineHeight: 1.1 }}>{label}</div>
        <span style={{ flex: 1 }} />
        <RerollButton onClick={onReroll} />
      </div>
      <p className="font-crimson" style={{ color: '#e0d0ae', fontSize: 'clamp(0.67rem, 1.28vw, 0.76rem)', lineHeight: 1.40, margin: '1px 0 0' }}>{text}</p>
    </div>
  )
}

function NpcPlayPanel({ character, onRerollField, lang = 'da' }: { character: Character; onRerollField?: (field: RerollField) => void; lang?: Lang }) {
  return (
    <div style={{
      position: 'relative',
      marginTop: 8,
      border: '1px solid rgba(151,107,50,0.50)',
      background: 'rgba(7,4,2,0.42)',
      boxShadow: 'inset 0 0 18px rgba(0,0,0,0.62)',
      padding: '7px 9px 9px',
    }}>
      <div style={{ position: 'absolute', inset: 4, border: '1px solid rgba(151,107,50,0.14)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: NOISE_DARK, opacity: 0.58, pointerEvents: 'none' }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <NpcLine label={t(lang, 'motivation')} text={tr(character, lang, 'motivation')} onReroll={() => onRerollField?.('motivation')} />
        <NpcLine label={t(lang, 'secret')} text={tr(character, lang, 'secret')} onReroll={() => onRerollField?.('secret')} />
        <NpcLine label={t(lang, 'mannerism')} text={tr(character, lang, 'mannerism')} onReroll={() => onRerollField?.('mannerism')} />
        <NpcLine label={t(lang, 'relation')} text={tr(character, lang, 'relationship')} onReroll={() => onRerollField?.('relationship')} />
      </div>
    </div>
  )
}

function QuickHook({ character, onRerollField, lang = 'da' }: { character: Character; onRerollField?: (field: RerollField) => void; lang?: Lang }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Rule label={t(lang, 'sceneHook')} /><RerollButton onClick={() => onRerollField?.('sceneHook')} /></div>
      <p className="font-crimson italic" style={{ color: '#d7c28c', fontSize: 'clamp(0.66rem, 1.26vw, 0.75rem)', lineHeight: 1.38, margin: 0 }}>
        {tr(character, lang, 'sceneHook')}
      </p>
    </div>
  )
}

function Emblem({ character, pushToBottom = true }: { character: Character; pushToBottom?: boolean }) {
  const Icon = getEmblemIcon(character)
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: pushToBottom ? 'auto' : 16, paddingBottom: 12, paddingTop: 14 }}>
      <div style={{
        position: 'relative', width: 72, height: 72, borderRadius: '50%',
        display: 'grid', placeItems: 'center',
        background: [
          'radial-gradient(circle at 34% 28%, rgba(255,226,166,0.45) 0%, transparent 38%)',
          'radial-gradient(circle at 50% 56%, #d8b774 0%, #bd914d 42%, #7b4b1d 100%)',
        ].join(','),
        border: '2px solid rgba(46,22,5,0.82)',
        boxShadow: 'inset 0 2px 9px rgba(255,222,150,0.20), inset 0 -6px 18px rgba(0,0,0,0.55), 0 6px 24px rgba(0,0,0,0.95)',
      }}>
        {/* Decorative concentric rings — gives the engraved wax-seal feel */}
        <div style={{ position: 'absolute', inset: 6, borderRadius: '50%', border: '1px solid rgba(48,23,7,0.48)' }} />
        <div style={{ position: 'absolute', inset: 12, borderRadius: '50%', border: '1px solid rgba(48,23,7,0.28)' }} />
        <div style={{ position: 'absolute', inset: 18, borderRadius: '50%', border: '0.6px dashed rgba(48,23,7,0.22)' }} />
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', backgroundImage: NOISE_PARCH, mixBlendMode: 'multiply', opacity: 0.55 }} />
        <Icon size={30} strokeWidth={1.25} style={{ color: '#241003', filter: 'drop-shadow(0 1px 0 rgba(255,216,142,0.22))' }} />
      </div>
    </div>
  )
}

interface Props { character: Character | null; isGenerating: boolean; layout?: 'panel' | 'stacked'; onRerollName?: () => void; onRerollField?: (field: RerollField) => void; lang?: Lang }

export default function CharacterSheet({ character, isGenerating, layout = 'panel', onRerollName, onRerollField, lang = 'da' }: Props) {
  const isStacked = layout === 'stacked'
  if (isGenerating || !character) {
    return (
      <div
        className={isStacked ? 'w-full py-12 flex flex-col items-center justify-center gap-3' : 'h-full flex flex-col items-center justify-center gap-3'}
        style={{ background: PANEL_BG }}
      >
        <Compass size={34} style={{ color: 'rgba(201,168,76,0.18)' }} />
        <div className="font-cinzel text-xs tracking-widest animate-pulse" style={{ color: 'rgba(201,168,76,0.38)' }}>
          {isGenerating ? t(lang, 'consulting') : t(lang, 'generatePrompt')}
        </div>
      </div>
    )
  }

  return (
    <motion.div key={character.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.45 }} className={isStacked ? 'w-full' : 'h-full overflow-y-auto custom-scrollbar'} style={{ position: 'relative', background: PANEL_BG }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `${NOISE_DARK}, ${FIBERS}`, backgroundSize: '220px 220px, 500px 260px', opacity: 0.92, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: [
        'linear-gradient(to right, rgba(255,220,150,0.04), transparent 28%)',
        'radial-gradient(ellipse at 50% 0%, transparent 35%, rgba(0,0,0,0.28) 100%)',
        'radial-gradient(ellipse at 50% 100%, transparent 42%, rgba(0,0,0,0.42) 100%)',
      ].join(',') }} />

      <div style={{ position: 'relative', zIndex: 2, height: isStacked ? 'auto' : '100%', display: 'flex', flexDirection: 'column', padding: isStacked ? '20px 20px 16px' : '18px 16px 10px 16px' }}>
        <div style={{ textAlign: 'center', paddingTop: 2, position: 'relative' }}>
          <div style={{ padding: '0 24px' }}>
            <h1 className="font-cinzel-decorative uppercase" style={{ color: '#efe0bd', textShadow: '0 1px 9px rgba(0,0,0,0.96)', fontWeight: 900, fontSize: scaleName(character.name), letterSpacing: '0.045em', lineHeight: 0.96, wordBreak: 'break-word', margin: 0 }}>
              {character.name}
            </h1>
          </div>
          <div style={{ position: 'absolute', top: 0, right: 0 }}>
            <RerollButton onClick={onRerollName} title="Rul navn om" />
          </div>
          {(() => {
            const sub = scaleSubtitle(character.species, character.characterClass)
            return (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 7 }}>
                <span style={{ width: sub.lineWidth, height: 1, background: 'rgba(201,168,76,0.43)', flexShrink: 0 }} />
                <p className="font-cinzel" style={{ color: 'rgba(211,181,113,0.75)', letterSpacing: sub.letterSpacing, fontSize: sub.fontSize, margin: 0, whiteSpace: 'nowrap' }}>
                  {tr(character, lang, 'species')} · {tr(character, lang, 'characterClass')}
                </p>
                <span style={{ width: sub.lineWidth, height: 1, background: 'rgba(201,168,76,0.43)', flexShrink: 0 }} />
              </div>
            )
          })()}
        </div>

        <div className="font-crimson italic" style={{ marginTop: 9, color: '#d8c394', fontSize: 'clamp(0.67rem, 1.28vw, 0.76rem)', lineHeight: 1.38, textAlign: 'center' }}>
          {tr(character, lang, 'firstImpression')}
        </div>

        <FramedInfo character={character} lang={lang} />
        <CombatBox character={character} lang={lang} />

        <TraitsPanel character={character} onRerollField={onRerollField} lang={lang} />
        <NpcPlayPanel character={character} onRerollField={onRerollField} lang={lang} />
        <QuickHook character={character} onRerollField={onRerollField} lang={lang} />

        <Emblem character={character} pushToBottom={false} />
      </div>
    </motion.div>
  )
}
