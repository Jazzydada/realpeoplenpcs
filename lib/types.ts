export interface AbilityScores {
  strength: number
  dexterity: number
  constitution: number
  intelligence: number
  wisdom: number
  charisma: number
}

export interface AttackBlock {
  name: string
  toHit: string
  damage: string
  notes: string
}

export interface CombatStats {
  armorClass: number
  hitPoints: number
  initiative: string
  speed: string
  passivePerception: number
  challenge: string
  melee: AttackBlock
  ranged: AttackBlock
  specialAbilities: string[]
  specialAbilitiesEn: string[]
}

// START INSTANT LANGUAGE SWITCH
// All translatable text fields are stored in both DA and EN at generation time.
// Switching language only changes which set is displayed — no re-generation needed.
export interface CharacterTranslations {
  da: {
    species: string
    characterClass: string
    background: string
    alignment: string
    personalityTrait: string
    ideal: string
    bond: string
    flaw: string
    firstImpression: string
    motivation: string
    secret: string
    mannerism: string
    relationship: string
    sceneHook: string
    gmSummary: string
    inventoryItem: string
    appearance: string
    howToPlay: string
  }
  en: {
    species: string
    characterClass: string
    background: string
    alignment: string
    personalityTrait: string
    ideal: string
    bond: string
    flaw: string
    firstImpression: string
    motivation: string
    secret: string
    mannerism: string
    relationship: string
    sceneHook: string
    gmSummary: string
    inventoryItem: string
    appearance: string
    howToPlay: string
  }
}
// END INSTANT LANGUAGE SWITCH

export interface Character {
  id: string
  name: string
  species: string
  characterClass: string
  background: string
  alignment: string
  level: number
  abilityScores: AbilityScores
  combatStats: CombatStats
  personalityTrait: string
  ideal: string
  bond: string
  flaw: string
  firstImpression: string
  motivation: string
  secret: string
  mannerism: string
  relationship: string
  sceneHook: string
  gmSummary: string
  howToPlay: string
  midjourneyPrompt: string
  perchancePrompt: string
  negativePrompt: string
  appearance: string
  inventoryItem: string
  companion: string | null
  imagePrompt: string
  imageUrl?: string
  artStyle: string
  // START GENDER CONSISTENCY SYSTEM
  gender: 'male' | 'female'
  // END GENDER CONSISTENCY SYSTEM
  // START INSTANT LANGUAGE SWITCH
  translations?: CharacterTranslations
  // END INSTANT LANGUAGE SWITCH
  adventureHooks: string[]
  createdAt: string
  accentColor: string
  racialBonus: string
  hitDie: string
  primaryAbility: string
}

export type ArtStyle = 'painterly' | 'dark' | 'heroic' | 'gritty' | 'ethereal'
