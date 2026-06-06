import {
  RACES, CLASSES, BACKGROUNDS, ALIGNMENTS,
  NAMES, NAMES_MALE, NAMES_FEMALE,
  PERSONALITY_TRAITS, IDEALS, BONDS, FLAWS,
  APPEARANCE_DETAILS, APPEARANCE_DETAILS_MALE, APPEARANCE_DETAILS_FEMALE,
  INVENTORY_ITEMS, COMPANIONS, ADVENTURE_HOOKS,
  CLASS_ACCENT_COLORS, CLASS_INFO, RACIAL_BONUSES,
} from './characterData'
import {
  FIRST_IMPRESSIONS, MOTIVATIONS, SECRETS, MANNERISMS,
  RELATION_TARGETS, RELATION_VERBS, SCENE_HOOKS, PORTRAIT_PROMPT_NOTES,
  HOW_TO_PLAY,
} from './npcData'
import {
  PERSONALITY_TRAITS_EN, IDEALS_EN, BONDS_EN, FLAWS_EN,
  BACKGROUNDS_EN, ALIGNMENTS_EN,
  ADVENTURE_HOOKS_EN, COMPANIONS_EN, INVENTORY_ITEMS_EN,
  RACE_DA_TO_EN, CLASS_DA_TO_EN, BACKGROUND_DA_TO_EN, ALIGNMENT_DA_TO_EN,
} from './characterDataEn'
import {
  FIRST_IMPRESSIONS_EN, MOTIVATIONS_EN, SECRETS_EN, MANNERISMS_EN,
  RELATION_TARGETS_EN, RELATION_VERBS_EN, SCENE_HOOKS_EN,
  HOW_TO_PLAY_EN,
} from './npcDataEn'
import { generateImagePrompt, CLASS_VISUAL_PRIORITY, CLASS_VISUAL_PRIORITY_EN, SPECIES_VISUAL_PRIORITY, SPECIES_VISUAL_PRIORITY_EN, FACE_QUALITY_NEGATIVE, GENDER_VISUAL } from './imagePrompt'
import type { AttackBlock, Character, AbilityScores, CombatStats, CharacterTranslations } from './types'
import type { Lang } from './i18n'

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

/** Defensive guard: replace any string that contains raw template syntax, "undefined", or "NaN" */
function safeStr(value: string, fallback: string): string {
  if (!value || value.includes('${') || value.includes('undefined') || value === 'NaN') return fallback
  return value
}

// START I18N REROLL FIX
// Character objects store display values, but most generator tables are keyed by
// the original Danish values. These helpers convert display values back to the
// internal keys before rerolling local fields.
function invertMap(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(Object.entries(map).map(([da, en]) => [en, da]))
}

const RACE_EN_TO_DA = invertMap(RACE_DA_TO_EN)
const CLASS_EN_TO_DA = invertMap(CLASS_DA_TO_EN)
const BACKGROUND_EN_TO_DA = invertMap(BACKGROUND_DA_TO_EN)
const ALIGNMENT_EN_TO_DA = invertMap(ALIGNMENT_DA_TO_EN)

function internalRace(value: string): string { return RACE_EN_TO_DA[value] ?? value }
export function internalClass(value: string): string { return CLASS_EN_TO_DA[value] ?? value }
function internalBackground(value: string): string { return BACKGROUND_EN_TO_DA[value] ?? value }
function internalAlignment(value: string): string { return ALIGNMENT_EN_TO_DA[value] ?? value }
// END I18N REROLL FIX

// ─── Weighted race selection ───────────────────────────────────────────────────
// Reflects real-world D&D population distribution: Mennesker dominerer,
// Alver og Dværge er velkendte, sjældne racer som Goliath og Dragonborn
// dukker kun op lejlighedsvis.
const RACE_WEIGHTS: Record<string, number> = {
  'Menneske':              20,  // dominerende — langt den mest almindelige race
  'Højalv':                10,  // velkendt og udbredt
  'Skovsalv':              10,  // velkendt og udbredt
  'Bjergdværg':             8,  // hyppig
  'Bakkedværg':             8,  // hyppig
  'Halvling (Lyshjerte)':   7,  // ret almindelig
  'Halvling (Stouthjerte)': 7,  // ret almindelig
  'Skovgnome':              5,  // sjælden men ikke ualmindelig
  'Stengnome':              5,  // sjælden men ikke ualmindelig
  'Ork':                    5,  // sjælden
  'Tiefling':               4,  // sjælden, møder fordomme
  'Mørkalv':                3,  // meget sjælden — lever primært under jorden
  'Aasimar':                3,  // meget sjælden — guddommelig arv
  'Dragonborn':              2,  // sjælden og iøjnefaldende
  'Goliath':                2,  // sjælden — lever i isolation
}

function pickRace(): string {
  const total = Object.values(RACE_WEIGHTS).reduce((a, b) => a + b, 0)
  let roll = Math.random() * total
  for (const [race, weight] of Object.entries(RACE_WEIGHTS)) {
    roll -= weight
    if (roll <= 0) return race
  }
  return 'Menneske' // fallback
}

function roll(sides: number): number {
  return Math.floor(Math.random() * sides) + 1
}

function rollAbilityScore(): number {
  const rolls = [roll(6), roll(6), roll(6), roll(6)]
  rolls.sort((a, b) => a - b)
  rolls.shift()
  return rolls.reduce((a, b) => a + b, 0)
}

function modNumber(score: number): number {
  return Math.floor((score - 10) / 2)
}

function signed(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

// ─── Alignment axis helpers ───────────────────────────────────────────────────
function isEvil(alignment: string)    { return /ond|evil/i.test(alignment) }
function isGood(alignment: string)    { return /god|good/i.test(alignment) }
function isChaotic(alignment: string) { return /kaotisk|chaotic/i.test(alignment) }
function isLawful(alignment: string)  { return /lovlydig|lawful/i.test(alignment) }

// ─── Level-based wealth & power tier ─────────────────────────────────────────
// Returns visual/equipment descriptors that scale with character level AND
// alignment. Evil characters accumulate wealth and dark power; good characters
// accumulate companions, warmth and hard-won experience; neutral characters
// are a pragmatic blend of both.
function levelTierDescriptor(level: number, alignment = ''): { tier: string; gear: string; bearing: string; wealth: string } {
  const evil    = isEvil(alignment)
  const good    = isGood(alignment)
  const chaotic = isChaotic(alignment)
  const lawful  = isLawful(alignment)

  // Alignment flavour overlays — injected into the base tier below
  function gearFlavour(evilText: string, goodText: string, neutralText: string) {
    return evil ? evilText : good ? goodText : neutralText
  }
  function bearingFlavour(evilText: string, goodText: string, neutralText: string) {
    return evil ? evilText : good ? goodText : neutralText
  }
  function wealthFlavour(evilText: string, goodText: string, neutralText: string) {
    return evil ? evilText : good ? goodText : neutralText
  }

  if (level <= 2) return {
    tier: 'novice adventurer',
    gear: 'patched worn clothing, simple cheap equipment, dented or scratched weapons, mismatched armor pieces, travel-worn boots' +
          gearFlavour(', a stolen trinket or two', ', a small handmade gift from a friend', ''),
    bearing: bearingFlavour(
      'shifty and suspicious, watching for opportunity, calculating first expression',
      'earnest and hopeful, open friendly face, eager to help posture',
      'uncertain and unproven, hopeful but inexperienced look, modest humble posture',
    ),
    wealth: wealthFlavour(
      'poor but already scheming, hidden coin purse, small pilfered valuables',
      'poor but generous, has given away what little they had, warm smile worth more than gold',
      'poor, barely equipped, coin pouch nearly empty',
    ),
  }

  if (level <= 4) return {
    tier: 'apprentice adventurer',
    gear: 'basic decent equipment, functional armor with minor repairs, reliable weapons with some wear' +
          gearFlavour(', dark menacing details beginning to appear on gear', ', small charms and tokens from grateful strangers tied to belt', ''),
    bearing: bearingFlavour(
      'gaining a cold confidence, learning to intimidate, sharp calculating eyes',
      'gaining warm confidence, surrounded by the energy of friendship, approachable kind expression',
      'gaining confidence, capable but still learning, alert watchful expression',
    ),
    wealth: wealthFlavour(
      'modest means gathered through questionable methods, a few stolen gems',
      'modest means shared freely, tokens of gratitude from those they have helped',
      'modest means, can afford basics, some small earned rewards visible',
    ),
  }

  if (level <= 6) return {
    tier: 'journeyman adventurer',
    gear: gearFlavour(
      'dark quality equipment with ominous engravings, sinister personal weapon, trophies of defeated enemies displayed prominently',
      'quality crafted equipment gifted or earned through heroic deeds, warm personalized details, tokens of friendship woven into gear',
      'quality crafted equipment, well-maintained armor, personalized weapons, custom pouches and belt gear',
    ),
    bearing: bearingFlavour(
      'coldly self-assured, a dangerous aura of controlled menace, people step aside',
      'warmly self-assured, radiates earned trust and goodwill, people gravitate toward them',
      'capable and self-assured, experienced steady gaze, professional competent bearing',
    ),
    wealth: wealthFlavour(
      'comfortable wealth taken by force or cunning, dark coins and ill-gotten gems',
      'comfortable, wealth earned through deeds and shared with others, fine gear given by grateful allies',
      'comfortable, has earned coin through real adventure, quality materials visible',
    ),
  }

  if (level <= 9) return {
    tier: 'veteran adventurer',
    gear: gearFlavour(
      'fine dark armor bearing the marks of conquered enemies, masterwork weapon with a threatening reputation, trophies and dark relics',
      'fine armor with symbols of allies and victories in the name of good, masterwork weapon etched with oaths, flowers or tokens braided into gear',
      'fine quality armor with battle-earned scars and repairs, masterwork weapons with personal engravings, layered equipment',
    ),
    bearing: bearingFlavour(
      'cold commanding authority, feared and obeyed, an aura of dark power that silences rooms',
      'warm commanding presence, loved and followed willingly, radiates hard-won heroic confidence',
      'commanding and weathered, hard-won confidence, respected dangerous presence',
    ),
    wealth: wealthFlavour(
      'well-off through plunder and power, ostentatious dark wealth, enemies\' valuables displayed as trophies',
      'well-off through reward and gratitude, surrounded by the wealth of allies and those they have saved, meaningful gifts everywhere',
      'well-off, valuable gear, gems or fine details on equipment, earned trophies visible',
    ),
  }

  if (level <= 12) return {
    tier: 'renowned ' + (evil ? 'villain' : good ? 'hero' : 'champion'),
    gear: gearFlavour(
      'masterwork dark armor with fearsome engravings, cursed or stolen legendary weapon, skulls or dark symbols of subjugated enemies, expensive but threatening',
      'masterwork gleaming armor with symbols of victories and allies, legendary weapon blessed or gifted, flowers and memorial tokens of the fallen woven in, beautiful and meaningful',
      'masterwork armor with decorative engravings and fine metalwork, legendary quality weapons, rare materials, trophies from defeated foes',
    ),
    bearing: bearingFlavour(
      'powerful dark imposing presence, radiates threat and dominion, a dangerous authority that bends wills',
      'powerful radiant heroic presence, radiates earned love and legendary courage, warmth and steel in equal measure',
      'powerful imposing presence, battle-hardened authority, the bearing of someone truly dangerous',
    ),
    wealth: wealthFlavour(
      'wealthy through conquest and fear, opulent dark riches, stolen gems and gold pried from the defeated',
      'wealthy through heroism and alliance, opulent gifts from grateful kingdoms and saved cities, wears their story in every piece',
      'wealthy, opulent details on armor and clothing, precious gems inlaid, rare exotic materials',
    ),
  }

  if (level <= 16) return {
    tier: 'legendary ' + (evil ? 'warlord' : good ? 'champion' : 'legend'),
    gear: gearFlavour(
      'legendary cursed or corrupted armor radiating dark power, ancient weapon of infamy, dark artifacts of immense and terrible power, extravagant and terrifying',
      'legendary blessed armor glowing with divine or earned light, ancient weapon of heroic legend, artifacts of hope and healing, glorious and inspiring',
      'legendary enchanted armor glowing with power, ancient or clearly magical weapons, extraordinary rare materials, marks of incredible deeds',
    ),
    bearing: bearingFlavour(
      'overwhelming dark authoritative presence, reality itself seems to darken in their shadow, kingdoms have fallen at their word',
      'overwhelming radiant heroic presence, reality seems brighter in their presence, entire peoples have been saved at their hand' + (chaotic ? ', wild joyful untameable energy' : lawful ? ', disciplined and noble bearing, the weight of a legend who kept every oath' : ''),
      'overwhelming authoritative presence, mythic confidence, eyes that have seen and survived impossible things',
    ),
    wealth: wealthFlavour(
      'incomprehensibly rich through domination, priceless dark artifacts, entire kingdoms\' treasuries looted',
      'extraordinarily blessed, surrounded by priceless gifts from those who owe their lives, wealth means less than the bonds formed',
      'rich beyond most, priceless artifacts, gold and gem decorations, clearly wears items others only dream of',
    ),
  }

  return {
    tier: evil ? 'godlike tyrant' : good ? 'godlike guardian' : 'godlike legend',
    gear: gearFlavour(
      'divine-dark artifacts of world-ending power, armor and weapons born of pure malevolence, radiating corruption and overwhelming force, beyond mortal craft',
      'divine artifacts of world-saving power, armor and weapons born of pure heroism, radiating hope and overwhelming light, beyond mortal craft, surrounded by the memory of every soul ever saved',
      'divine or demonic artifacts of immense power, armor and weapons that seem impossible to craft, radiating magical energy, legendary beyond measure',
    ),
    bearing: bearingFlavour(
      'transcendent dark presence, gods themselves take notice, absolute dominion and terrifying certainty',
      'transcendent radiant presence, gods themselves take notice, absolute compassion and terrifying courage, beloved by all living things',
      'transcendent legendary presence, reality bends around them, absolute certainty and unshakeable power',
    ),
    wealth: wealthFlavour(
      'all wealth of the conquered world, kingdoms are possessions, artifacts that could buy gods',
      'wealth beyond measure but freely shared, has given away empires, richer in bonds and deeds than all the gold ever mined',
      'incomprehensible wealth, priceless beyond measure, artifacts that kingdoms would go to war over',
    ),
  }
}

function proficiencyForLevel(level: number): number {
  if (level >= 17) return 6
  if (level >= 13) return 5
  if (level >= 9) return 4
  if (level >= 5) return 3
  return 2
}

function parseHitDie(hitDie: string): number {
  const n = Number(hitDie.replace(/\D/g, ''))
  return Number.isFinite(n) && n > 0 ? n : 8
}

// START GENDER CONSISTENCY SYSTEM
function getNameForRace(race: string, gender?: 'male' | 'female'): string {
  const pools = gender === 'male'   ? NAMES_MALE
              : gender === 'female' ? NAMES_FEMALE
              : NAMES
  const pool = pools[race] ?? NAMES[race] ?? NAMES['Menneske']
  return `${pick(pool.first)} ${pick(pool.last)}`
}

function getAppearanceForGender(species: string, gender: 'male' | 'female'): string {
  const baseRace = species.replace(/ \(.*\)$/, '')
  const pool = gender === 'female'
    ? (APPEARANCE_DETAILS_FEMALE[species] ?? APPEARANCE_DETAILS_FEMALE[baseRace] ?? APPEARANCE_DETAILS_FEMALE['default_female'] ?? APPEARANCE_DETAILS_FEMALE['Menneske'])
    : (APPEARANCE_DETAILS_MALE[species]   ?? APPEARANCE_DETAILS_MALE[baseRace]   ?? APPEARANCE_DETAILS_MALE['default_male']   ?? APPEARANCE_DETAILS_MALE['Menneske'])
  // Fall back to the generic pool if gender-specific pool is missing
  if (!pool || pool.length === 0) {
    const fallback = APPEARANCE_DETAILS[species] ?? APPEARANCE_DETAILS[baseRace] ?? APPEARANCE_DETAILS['Menneske']
    return pick(fallback ?? ['distinctive appearance'])
  }
  return pick(pool)
}
// END GENDER CONSISTENCY SYSTEM

function getTraitForClass(map: Record<string, string[]>, cls: string): string {
  return pick(map[cls] ?? map['Kriger'])
}

function classPrimaryModifier(scores: AbilityScores, cls: string): number {
  if (['Troldmand'].includes(cls)) return modNumber(scores.intelligence)
  if (['Præst', 'Druide', 'Jæger', 'Munk'].includes(cls)) return modNumber(scores.wisdom)
  if (['Barde', 'Troldkarl', 'Paladin', 'Warlock'].includes(cls)) return modNumber(scores.charisma)
  if (['Slyngel'].includes(cls)) return Math.max(modNumber(scores.dexterity), modNumber(scores.charisma))
  if (['Kriger', 'Barbar'].includes(cls)) return Math.max(modNumber(scores.strength), modNumber(scores.dexterity))
  return Math.max(...Object.values(scores).map(modNumber))
}

function meleeWeaponForClass(cls: string): string {
  if (['Troldmand', 'Troldkarl'].includes(cls)) return 'Dolk'
  if (['Præst', 'Druide'].includes(cls)) return 'Stav'
  if (['Slyngel', 'Barde'].includes(cls)) return 'Rapier'
  if (['Jæger'].includes(cls)) return 'Kortsværd'
  if (['Paladin', 'Kriger'].includes(cls)) return 'Langsværd'
  if (['Barbar'].includes(cls)) return 'Økse'
  if (['Munk'].includes(cls)) return 'Ubevæbnet slag'
  if (['Warlock'].includes(cls)) return 'Forhekset klinge'
  return 'Kortsværd'
}

function rangedWeaponForClass(cls: string): string {
  if (['Troldmand', 'Troldkarl', 'Præst', 'Druide', 'Warlock'].includes(cls)) return 'Cantrip'
  if (['Slyngel', 'Barde', 'Jæger'].includes(cls)) return 'Kortbue'
  if (['Kriger', 'Paladin'].includes(cls)) return 'Armbrøst'
  if (['Barbar'].includes(cls)) return 'Kasteøkse'
  if (['Munk'].includes(cls)) return 'Kastedolk'
  return 'Kortbue'
}

function damageDieForWeapon(weapon: string): string {
  if (['Langsværd', 'Økse', 'Forhekset klinge'].includes(weapon)) return '1d8'
  if (['Rapier', 'Kortbue', 'Armbrøst'].includes(weapon)) return '1d8'
  if (['Kortsværd', 'Stav', 'Kasteøkse'].includes(weapon)) return '1d6'
  if (['Dolk', 'Kastedolk'].includes(weapon)) return '1d4'
  if (weapon === 'Ubevæbnet slag') return '1d4'
  return '1d8'
}

function buildAttack(name: string, abilityMod: number, prof: number, damageType: string, notes: string): AttackBlock {
  const toHit = signed(abilityMod + prof)
  const dmgMod = abilityMod === 0 ? '' : signed(abilityMod)
  return { name, toHit, damage: `${damageDieForWeapon(name)}${dmgMod} ${damageType}`, notes }
}

function specialAbilitiesForClass(cls: string): string[] {
  const generic = [
    'Hurtig beslutning: kan tage Disengage eller Dash som bonus action 1 gang pr. kamp.',
    'Skæbneglimt: 1/dag kan NPC\'en få advantage på ét vigtigt rul.',
    'Hård erfaring: har advantage på saves mod frygt, når nogen ser på.',
  ]
  const byClass: Record<string, string[]> = {
    Troldmand: ['Arcane Bolt: ranged spell attack; ved hit tager målet ekstra 1d6 force damage.', 'Magic Missile: tre pile rammer automatisk for 1d4+1 force damage hver.', 'Shield: reaktion; +5 AC mod ét angreb.', 'Misty Step: teleporterer 30 ft som bonus action.'],
    Troldkarl: ['Wild Spark: når NPC\'en tager skade, slår gnister tilbage for 1d6 fire damage, 1/dag.', 'Farlig karisma: advantage på ét Deception eller Persuasion-rul.', 'Scorching Ray: tre stråler; hvert hit giver 2d6 fire damage.'],
    Warlock: ['Forbandelse: bonus action; ét mål får -1d4 på næste attack roll.', 'Eldritch Step: teleporterer 30 ft til et sted NPC\'en kan se, 1/dag.', 'Armor of Agathys: 5 midlertidige HP; angribere tager 5 cold damage.'],
    Præst: ['Helende ord: én allieret inden for 60 ft får 1d8 HP tilbage, 1/dag.', 'Hellig vrede: melee-angreb giver +1d6 radiant damage, 1/dag.', 'Guiding Bolt: ranged spell attack; 4d6 radiant damage, næste angreb på målet har advantage.'],
    Druide: ['Vild form-glimt: får midlertidigt kløer eller barkhud; +2 AC i én runde.', 'Naturens hvisken: kan spørge dyr eller planter om én enkel ting.', 'Thunderwave: 2d8 thunder damage i kube; mål pushes 10 ft.'],
    Jæger: ['Hunter\'s Mark: +1d6 skade mod ét udpeget mål.', 'Terrænblik: ignorerer difficult terrain i natur eller ruiner.', 'Volley: angriber alle mål i et 10 ft radius med bue.'],
    Slyngel: ['Sneak Attack: +2d6 skade én gang pr. tur, hvis målet er distraheret.', 'Cunning Action: Hide, Dash eller Disengage som bonus action.', 'Uncanny Dodge: halverer skade fra ét angreb som reaktion.'],
    Barde: ['Bardisk inspiration: en allieret får +1d6 på næste rul.', 'Dissonant Whispers: 3d6 psychic damage; målet flygter i sin tur.', 'Healing Word: en allieret genvinder 1d4+CHA HP som bonus action.'],
    Kriger: ['Second Wind: genvinder 1d10+level HP som bonus action, 1/dag.', 'Action Surge: tager en ekstra action i sin tur, 1/dag.', 'Riposte: modangreb som reaktion efter en mislykket fjendtlig attack.'],
    Paladin: ['Divine Smite: +2d8 radiant damage på et melee hit, 1/dag.', 'Lay on Hands: genopretter op til 5×level HP med berøring.', 'Aura af beskyttelse: allierede tæt på får +CHA på saves.'],
    Barbar: ['Raseri: resistance mod bludgeoning, piercing og slashing i 1 minut.', 'Reckless Attack: advantage på melee attacks; fjender har advantage mod NPC.', 'Truende fremtoning: ét mål skal klare Wisdom save eller tøve.'],
    Munk: ['Flurry of Blows: laver to ekstra ubevæbnede angreb som bonus action.', 'Patient Defense: Dodge som bonus action; vanskeligere at ramme.', 'Stunning Strike: mål bruger Constitution save eller er stunned til næste tur.'],
  }
  const pool = byClass[cls] ?? generic
  const chosen = pick(pool)
  const extra  = pick(generic)
  return [chosen, ...(chosen !== extra ? [extra] : [])].slice(0, 2)
}

function specialAbilitiesForClassEn(cls: string): string[] {
  const generic = [
    'Quick Thinking: Disengage or Dash as a bonus action once per combat.',
    'Fate\'s Glimpse: once per day, gain advantage on one important roll.',
    'Hard Experience: advantage on fear saves when others are watching.',
  ]
  const byClass: Record<string, string[]> = {
    Troldmand: ['Arcane Bolt: ranged spell attack; hit deals extra 1d6 force damage.', 'Magic Missile: three darts hit automatically for 1d4+1 force damage each.', 'Shield: reaction; +5 AC against one attack.', 'Misty Step: teleport 30 ft as a bonus action.'],
    Troldkarl: ['Wild Spark: when hit, sparks lash back for 1d6 fire damage, 1/day.', 'Dangerous Charm: advantage on one Deception or Persuasion roll.', 'Scorching Ray: three rays; each hit deals 2d6 fire damage.'],
    Warlock: ['Hex: bonus action; one target gets −1d4 on their next attack roll.', 'Eldritch Step: teleport 30 ft to a visible location, 1/day.', 'Armor of Agathys: 5 temp HP; attackers take 5 cold damage.'],
    Præst: ['Healing Word: one ally within 60 ft regains 1d8 HP, 1/day.', 'Divine Wrath: melee attack deals +1d6 radiant damage, 1/day.', 'Guiding Bolt: ranged spell attack; 4d6 radiant damage, next attack on target has advantage.'],
    Druide: ['Wild Shape Surge: briefly gain claws or barkskin; +2 AC for one round.', 'Nature\'s Whisper: ask an animal or plant one simple question.', 'Thunderwave: 2d8 thunder damage in a cube; targets are pushed 10 ft.'],
    Jæger: ['Hunter\'s Mark: +1d6 damage against one designated target.', 'Terrain Sense: ignore difficult terrain in wilderness or ruins.', 'Volley: attack all targets in a 10 ft radius with a ranged weapon.'],
    Slyngel: ['Sneak Attack: +2d6 damage once per turn when the target is distracted.', 'Cunning Action: Hide, Dash, or Disengage as a bonus action.', 'Uncanny Dodge: halve damage from one attack as a reaction.'],
    Barde: ['Bardic Inspiration: one ally gets +1d6 on their next roll.', 'Dissonant Whispers: 3d6 psychic damage; target flees on their turn.', 'Healing Word: one ally regains 1d4+CHA HP as a bonus action.'],
    Kriger: ['Second Wind: regain 1d10+level HP as a bonus action, 1/day.', 'Action Surge: take one additional action on your turn, 1/day.', 'Riposte: counter-attack as a reaction after a missed enemy strike.'],
    Paladin: ['Divine Smite: +2d8 radiant damage on a melee hit, 1/day.', 'Lay on Hands: restore up to 5×level HP with a touch.', 'Aura of Protection: nearby allies add +CHA to saving throws.'],
    Barbar: ['Rage: resistance to bludgeoning, piercing and slashing for 1 minute.', 'Reckless Attack: advantage on melee attacks; enemies gain advantage back.', 'Frightening Presence: one target must succeed on a Wisdom save or hesitate.'],
    Munk: ['Flurry of Blows: make two extra unarmed strikes as a bonus action.', 'Patient Defense: Dodge as a bonus action; harder to hit.', 'Stunning Strike: target uses Constitution save or is stunned until next turn.'],
  }
  const pool = byClass[cls] ?? generic
  const chosen = pick(pool)
  const extra  = pick(generic)
  return [chosen, ...(chosen !== extra ? [extra] : [])].slice(0, 2)
}


// START: v8 English prompt helpers
const FIRST_IMPRESSION_EN: Record<string, string> = {
  'Smiler venligt, men øjnene scanner hele tiden rummet efter udgange.': 'friendly smile, eyes constantly scanning the room for exits',
  'Virker varm og imødekommende, indtil nogen nævner fortiden.': 'warm and welcoming until the past is mentioned',
  'Taler roligt, som om hvert ord allerede er blevet vejet på en guldvægt.': 'speaks calmly, as if every word has already been weighed like gold',
  'Har en næsten irriterende ro, selv når andre bliver ophidsede.': 'almost unnervingly calm even when others become agitated',
  'Ligner en person, der har set for meget, men stadig prøver at være ordentlig.': 'looks like someone who has seen too much but still tries to remain decent',
  'Er charmerende på overfladen, men holder altid én sandhed tilbage.': 'surface charm, always holding one truth back',
  'Bærer sig som en adelig, selv i slidt tøj og mudrede støvler.': 'noble bearing despite worn clothes and muddy boots',
  'Har et blik, der får små løgne til at føles farlige.': 'a stare that makes small lies feel dangerous',
  'Virker hjælpsom, men spørger lidt for præcist ind til fremmede.': 'helpful manner, asks strangers slightly too precise questions',
  'Giver indtryk af at være praktisk, træt og svær at imponere.': 'practical, tired, difficult to impress',
}

const MOTIVATION_EN: Record<string, string> = {
  'vil genvinde et tabt ry, før nogen opdager hvor dybt faldet egentlig var.': 'wants to regain a lost reputation before anyone discovers how far they truly fell',
  'leder efter en forsvundet slægtning, som officielt blev erklæret død.': 'searches for a missing relative who was officially declared dead',
  'prøver at betale en gæld til nogen, der ikke længere burde være i live.': 'tries to repay a debt to someone who should no longer be alive',
  'vil beskytte sin lille kreds af folk, selv hvis det kræver løgne.': 'wants to protect a small circle of people, even if it requires lies',
  'samler oplysninger, fordi viden er den eneste valuta, der altid virker.': 'collects information because knowledge is the only currency that always works',
  'søger et bestemt navn i gamle breve, tempelbøger og havnelister.': 'searches old letters, temple records and harbor lists for one specific name',
  'vil ud af byen før næste nymåne, men mangler hjælp til det sidste skridt.': 'wants to leave town before the next new moon, but needs help with the final step',
  'ønsker hævn, men forsøger stadig at bilde sig selv ind, at det handler om retfærdighed.': 'wants revenge while pretending it is about justice',
  'vil have eventyrerne til at løse et problem uden at forstå, hvem der egentlig får gavn af det.': 'wants the adventurers to solve a problem without understanding who benefits',
  'prøver at holde en skrøbelig fredsaftale i live, selv om begge sider hader hinanden.': 'tries to keep a fragile peace agreement alive while both sides hate each other',
}

const SECRET_EN: Record<string, string> = {
  'har solgt information til en rival for at redde en nær ven.': 'sold information to a rival to save a close friend',
  'bruger et falsk navn og frygter at møde nogen fra sit gamle liv.': 'uses a false name and fears meeting someone from an old life',
  'er den sidste person, der så den forsvundne præst i live.': 'was the last person to see the missing priest alive',
  'har en lille magisk genstand, som langsomt ændrer ejerens drømme.': 'carries a small magic item that slowly changes its owner\'s dreams',
  'skylder penge til en smuglerkaptajn, der snart kommer for at hente dem.': 'owes money to a smuggler captain who is coming to collect',
  'ved hvor liget er begravet, men ikke hvem der lagde det der.': 'knows where the body is buried, but not who put it there',
  'har engang været medlem af den organisation, de nu advarer imod.': 'was once a member of the organization they now warn against',
  'modtager breve uden afsender, som altid forudsiger én detalje korrekt.': 'receives unsigned letters that always predict one detail correctly',
  'lod en uskyldig tage skylden for noget, de selv var involveret i.': 'let an innocent person take the blame for something they were involved in',
  'er ikke så from, fattig, rig, loyal eller uskyldig, som de lader som om.': 'is not as pious, poor, rich, loyal or innocent as they pretend',
}

const MANNERISM_EN: Record<string, string> = {
  'drejer konstant en ring, når samtalen nærmer sig sandheden.': 'constantly twists a ring whenever the conversation nears the truth',
  'sænker stemmen, når de lyver, men taler højere når de er bange.': 'lowers their voice when lying but speaks louder when afraid',
  'retter på manchetten, selv når tøjet er alt for slidt til den slags.': 'adjusts a cuff even when the clothes are far too worn for such refinement',
  'tæller lydløst på fingrene, før de svarer på svære spørgsmål.': 'silently counts on their fingers before answering difficult questions',
  'ser aldrig direkte på den person, de egentlig taler til.': 'never looks directly at the person they are actually speaking to',
  'bruger folks fulde navn, når de vil have kontrol over samtalen.': 'uses people\'s full names when trying to control the conversation',
  'banker to gange på bordet, når de nævner noget overnaturligt.': 'knocks twice on the table whenever mentioning something supernatural',
  'smiler altid et sekund for sent.': 'always smiles one second too late',
  'samler småting op og lægger dem tilbage i perfekt orden.': 'picks up small objects and places them back in perfect order',
  'afslutter næsten hver sætning med et spørgsmål, selv når de giver ordrer.': 'ends almost every sentence as a question, even when giving orders',
}

const APPEARANCE_EN: Record<string, string> = {
  'Et stort ar løber diagonalt over det venstre kindben': 'a large scar runs diagonally across the left cheekbone',
  'Det højre øje er bærnstensfarvet, det venstre kulsort': 'right eye amber, left eye pitch black',
  'Tre tatoverede runer på den indre håndled': 'three tattooed runes on the inner wrist',
  'Mangler lillefingeren på højre hånd': 'missing the little finger on the right hand',
  'Hvidgrå stribe i håret siden barndommen': 'white-grey streak in the hair since childhood',
  'Næsen er gebrokkent og sidder lidt skævt': 'broken nose, slightly crooked',
  'Brede ar på begge håndrygge fra en brandslukning': 'broad scars across the backs of both hands from a fire',
  'Et lille ankertegn tatoveret bag det venstre øre': 'small anchor tattoo behind the left ear',
  'Alvor i øjnene der ikke matcher den unge alder': 'serious eyes that do not match the young age',
  'Mangler ringfingeren på venstre hånd': 'missing the ring finger on the left hand',
  'Levende ar fra en bidt af en slange på anklen': 'vivid snakebite scar on the ankle',
  'Et snit over overlæben der aldrig heler helt': 'a cut above the upper lip that never fully heals',
  'Tatovering af et sejlskib på den højre skulder': 'sailing ship tattoo on the right shoulder',
  'Øjnene skifter farve i stærkt lys': 'eyes change color in bright light',
  'En tatoveret orm slynger sig om det højre underarm': 'a worm tattoo coils around the right forearm',
  'Mangler to fortænder — dækker det med et smil': 'missing two front teeth, hidden behind a smile',
  'Hæsning i stemmen fra en gammel halsskade': 'raspy voice from an old throat injury, visible throat scar',
  'Lyse arkaiske runer lyser svagt langs kravebenet': 'pale archaic runes glow faintly along the collarbone',
  'Pupillerne er vertikale som en kats': 'vertical cat-like pupils',
  'Det venstre øre er beskadiget og sidder lavere': 'left ear damaged and sitting lower than the right',
  'Håret gror aldrig under knæene uanset hvor lang tid der går': 'very long hair that never grows below the knees',
  'Bark-brune tatoveringer i spiralmønstre langs armene': 'bark-brown spiral tattoos along the arms',
  'Fingrene er altid farvede af saft og mørk jord': 'fingers stained with sap and dark earth',
  'Et gammelt bidemærke på halsen fra et dyr': 'old animal bite mark on the neck',
  'Iris er usædvanlig stor og lysegrøn': 'unusually large pale green irises',
  'Et lysegråt hår vokser midt i det ellers hvide hår': 'single pale grey lock in otherwise white hair',
  'Stumpt afskåret venstre øre': 'bluntly severed left ear',
  'Kridtblege arr i form af et stjernetegn på ryggen': 'chalk-pale zodiac-shaped scars on the back',
  'Øjnene lyser svagt rødt i mørke': 'eyes glow faintly red in darkness',
  'Et spidst øre er synligt, det andet er menneskeligt': 'one pointed ear visible, the other human-shaped',
  'Omhu for altid at holde det venstre håndled tildækket': 'carefully keeps the left wrist covered',
  'Fregner langs skuldrene i et usædvanligt mønster': 'freckles across the shoulders in an unusual pattern',
  'En blodplet-rød plet bag det højre øre': 'blood-red birthmark behind the right ear',
  'Skægget er brændt af på den venstre side og gror atter ujævnt': 'beard burned away on the left side, regrowing unevenly',
  'Tre knækkede fingre på venstre hånd der aldrig helede rigtigt': 'three broken fingers on the left hand that never healed correctly',
  'Et armbånd af smeltet jern, der aldrig kan tages af': 'a bracelet of melted iron that can never be removed',
  'En flad næse brækket mindst tre gange': 'flat nose broken at least three times',
  'Massive ar på ryggen fra en kamp med en grif': 'massive scars on the back from fighting a griffon',
  'Brilleglassene er altid revnede, men han skifter dem aldrig': 'cracked spectacles that are never replaced',
  'Et gyldent tandimplantat der glimter ved hver tale': 'gold tooth implant glinting whenever speaking',
  'Mangler et stykke af det højre øre': 'missing a piece of the right ear',
  'Briller med tre linser — en roterer konstant': 'wearing distinctive brass triple-lensed spectacles; one lens constantly rotates',
  'Fingerspidserne er altid misfarvet af kemikalier': 'fingertips stained by chemicals',
  'Et burnmærke i form af et tandhjul på det venstre håndled': 'cogwheel-shaped burn mark on the left wrist',
  'Lugter altid af olie og svovl, uanset badet eller ej': 'oil-and-sulfur stained clothes and tools',
  'Tynde rødlige ar fra tornebuske på begge kinder': 'thin reddish thorn scars on both cheeks',
  'Et ekorn-kradsmærke på panden der aldrig forsvandt': 'squirrel scratch scar on the forehead',
  'Håret er flettet med kviste og bær der aldrig visner': 'hair braided with twigs and berries that never wither',
  'Fingrene er misfarvet grønne til albuen': 'fingers and forearms stained green up to the elbows',
  'Hornene er asymmetriske — et er spiralformet, et er ret': 'asymmetrical horns, one spiral and one straight',
  'Huden har et blåligt skær i koldt lys': 'skin has a bluish sheen in cold light',
  'Halen er altid indpakket i slidt læder': 'tail wrapped in worn leather',
  'Et ar fra et helligt mærke brænder rødt ved varme': 'holy brand scar glows red near heat',
  'En skæl mangler på det venstre kindben og blotter mørkere hud': 'missing scale on the left cheekbone revealing darker skin beneath',
  'Kløerne er afstumpede fra år med arbejde i sten': 'claws worn blunt from years of stone work',
  'Ét øje er blakket fra en gammel kamp': 'one eye clouded from an old battle',
  'Rygskællerne bærer et gammelt stammemønster': 'back scales carry an old tribal pattern',
  'En af stødtænderne er brækket halvt af': 'one tusk broken halfway off',
  'Et rundt ar fra et pileskud midt i håndfladen': 'round arrow scar in the palm',
  'En hage-tatovering i stammekode': 'tribal-code tattoo on the chin',
  'Mangler to tæer på den venstre fod': 'missing two toes on the left foot',
  // START DND2024 SPECIES UPDATE — Aasimar appearance EN
  'Et svagt guldskær lyser op i øjnene ved stærk følelse': 'faint golden glow in the eyes during strong emotion',
  'Små stumper af lyse fjer er synlige langs kravebenet': 'small pale feathers visible along the collarbone',
  'Et cirkulært helligt ar på håndfladen som aldrig forsvinder': 'circular holy brand scar on the palm that never fades',
  'Huden skinner svagt i mørke som månelys på vand': 'skin shimmers faintly in darkness like moonlight on water',
  'Stemmen bærer en svag genklang, som om to taler på én gang': 'voice carries a faint echo as if two people speak at once',
  // END DND2024 SPECIES UPDATE — Aasimar
  // START DND2024 SPECIES UPDATE — Goliath appearance EN
  'Naturlige stengrå mønstre i huden langs kindbenene': 'natural stone-grey patterns on the skin along the cheekbones',
  'En flænge i det ene øre fra en kamp med et bjergdyr': 'tear in one ear from a mountain beast fight',
  'Tatoverede klantegn dækker begge skuldre og løber ned ad armene': 'clan markings tattooed across both shoulders and down the arms',
  'Øjnene er lyse som is med et indre guldskær': 'pale ice-blue eyes with a golden inner glow',
  'En bred rille i panden fra et gammelt stenbrud-uheld': 'wide groove scar across the forehead from an old quarry accident',
  // END DND2024 SPECIES UPDATE — Goliath
}

const ITEM_EN: Record<string, string> = {
  'en dolk skåret af en drakontand': 'a dagger carved from a dragon tooth',
  'en tryllebog bundet i sort læder og forseglet med sølv': 'a spellbook bound in black leather and sealed with silver',
  'en lut strænget med sølvtråde': 'a lute strung with silver wire',
  'et helligt symbol der aldrig taber glansen': 'a holy symbol that never loses its shine',
  'en flaske lagret dværgwhisky': 'a bottle of aged dwarven whiskey',
  'et sæt belastede terninger': 'a set of loaded dice',
  'et udforskerkort med ét sted ridset ud': 'an explorer\'s map with one location scratched out',
  'et hætteglas med basiliskblod': 'a vial of basilisk blood',
  'et sæt tyveværktøj svøbt i oliet klæde': 'thieves\' tools wrapped in oiled cloth',
  'et krigshorn skåret af knogle': 'a war horn carved from bone',
  'et silkebind der siges at give sandt syn': 'a silk blindfold said to grant true sight',
  'en pose tørrede helbredelsesurter': 'a pouch of dried healing herbs',
  'et poleret obsidianspejl': 'a polished obsidian mirror',
  'en ring der hvisker navne på de døde': 'a ring that whispers names of the dead',
  'en samling pressede vilde blomster fra en brændt landsby': 'pressed wildflowers from a burned village',
  'et skrumpet hoved der ind imellem blinker': 'a shrunken head that occasionally blinks',
  'et kompas der altid peger mod guld': 'a compass that always points toward gold',
  'en slidt dagbog fuld af kryptisk tekst': 'a worn diary full of cryptic writing',
  'en hanske taget fra en falden paladin': 'a glove taken from a fallen paladin',
  'et sæt fortrylle spillekort til spådom': 'enchanted playing cards used for divination',
}

// Exported so CharacterCard can translate appearance strings on the fly
// as a fallback for characters generated before translations were stored.
export function translateAppearanceToEn(da: string): string {
  return APPEARANCE_EN[da] ?? da
}

// Weapon name translation (DA → EN) — used by CharacterCard when lang=EN
export const WEAPON_DA_TO_EN: Record<string, string> = {
  'Dolk':             'Dagger',
  'Stav':             'Staff',
  'Rapier':           'Rapier',
  'Kortsværd':        'Shortsword',
  'Langsværd':        'Longsword',
  'Økse':             'Axe',
  'Ubevæbnet slag':   'Unarmed Strike',
  'Forhekset klinge': 'Hexblade',
  'Cantrip':          'Cantrip',
  'Kortbue':          'Shortbow',
  'Armbrøst':         'Crossbow',
  'Kasteøkse':        'Handaxe',
  'Kastedolk':        'Throwing Dagger',
}

export function translateWeaponToEn(da: string): string {
  return WEAPON_DA_TO_EN[da] ?? da
}

function englishOr(raw: string, table: Record<string, string>): string {
  return table[raw] ?? raw
}

// START DND2024 SPECIES UPDATE
const SPECIES_EN: Record<string, string> = {
  'Menneske':               'human',
  'Aasimar':                'aasimar with celestial ancestry and radiant divine appearance',
  'Dragonborn':              'dragonborn reptilian humanoid with dragon scales and draconic face',
  'Bjergdværg':             'mountain dwarf, short and broad, braided beard',
  'Bakkedværg':             'hill dwarf, short and stout, braided beard',
  'Højalv':                 'high elf with pointed ears and ethereal beauty',
  'Skovsalv':               'wood elf with pointed ears and forest-touched appearance',
  'Mørkalv':                'dark elf drow with obsidian skin and white hair',
  'Skovgnome':              'forest gnome, very small 3-foot gnome body and proportions',
  'Stengnome':              'rock gnome, very small 3-foot gnome body, wild hair, gadgets',
  'Goliath':                'goliath, towering massive humanoid with stone-grey skin and giant proportions',
  'Halvling (Lyshjerte)':   'lightfoot halfling, 3 feet tall, noticeably smaller than humans',
  'Halvling (Stouthjerte)': 'stout halfling, 3 feet tall, short and stocky, noticeably smaller than humans',
  'Ork':                    'orc with prominent tusks, grey-green skin, heavily muscled',
  'Tiefling':               'tiefling with curved horns, infernal heritage, patterned skin',
}
// END DND2024 SPECIES UPDATE

const CLASS_VISUAL_EN: Record<string, string> = {
  'Slyngel': 'rogue, supple leather armor, daggers, stealthy stance',
  'Barde': 'bard, colorful travel clothes, musical instrument, charismatic posture',
  'Kriger': 'fighter, practical armor, weapons clearly visible, battle-ready stance',
  'Troldmand': 'wizard, arcane robes, spellbook or staff, magical focus',
  'Præst': 'cleric, holy symbol, sacred vestments or armor',
  'Jæger': 'ranger, bow, quiver, wilderness cloak, hunter equipment',
  'Paladin': 'paladin, plate armor, holy symbol, noble weapon',
  'Warlock': 'warlock, eldritch symbols, pact focus, unsettling magical details',
  'Munk': 'monk, martial artist, simple travel robes, unarmed fighter, monastic aesthetic',
  'Druide': 'druid, natural materials, wooden staff, leaf-and-bark details',
}

export function buildEnglishPrompts(character: Pick<Character, 'name' | 'species' | 'characterClass' | 'appearance' | 'inventoryItem' | 'firstImpression' | 'mannerism' | 'level' | 'alignment'> & { gender?: 'male' | 'female' }) {
  // START I18N PROMPT FIX
  // Display values can be Danish or English. Convert race/class/alignment back to
  // internal keys before applying visual prompt dictionaries, while prose fields
  // can pass through directly when already English.
  const speciesKey = internalRace(character.species)
  const classKey = internalClass(character.characterClass)
  const alignmentKey = internalAlignment(character.alignment ?? '')
  const speciesEn = englishOr(speciesKey, SPECIES_EN)
  const classEn = englishOr(classKey, CLASS_VISUAL_EN)
  const appearanceEn = englishOr(character.appearance, APPEARANCE_EN)
  const firstImpressionEn = englishOr(character.firstImpression, FIRST_IMPRESSION_EN)
  const mannerismEn = englishOr(character.mannerism, MANNERISM_EN)
  const itemEn = englishOr(character.inventoryItem, ITEM_EN)
  // END I18N PROMPT FIX

  // START DND2024 SPECIES UPDATE — mandatory race features in all prompts
  const raceFeatures = SPECIES_EN[speciesKey] ?? speciesEn

  // Level tier: higher level = richer/more powerful; alignment colours HOW that manifests
  const tier = levelTierDescriptor(character.level ?? 1, alignmentKey)

  const characterLine = `${character.name}, ${raceFeatures}, ${classEn}, level ${character.level ?? 1} ${tier.tier}`

  // START SPECIES VISUAL SYSTEM + START CLASS VISUAL SYSTEM + START FACE QUALITY SYSTEM
  // Priority order: 1. Composition  2. Species  3. Class  4. Style  5. Details
  // Species BEFORE class: a Halfling Monk must read as HALFLING first, monk second.
  const speciesData   = SPECIES_VISUAL_PRIORITY[speciesKey]
                     ?? SPECIES_VISUAL_PRIORITY_EN[speciesKey]
  const speciesVisual = speciesData?.visual ?? raceFeatures
  const speciesNeg    = speciesData?.negative ?? ''
  const classVisual   = CLASS_VISUAL_PRIORITY[classKey]
                     ?? CLASS_VISUAL_PRIORITY_EN[classKey]
                     ?? classEn

  // START GENDER CONSISTENCY SYSTEM
  const genderVisual = character.gender ? GENDER_VISUAL[character.gender] : ''
  // END GENDER CONSISTENCY SYSTEM

  const perchancePrompt = [
    // 1. Composition — 3/4 body, portrait-focused
    'THREE-QUARTER BODY PORTRAIT. CHARACTER VISIBLE FROM HEAD TO KNEES. ' +
    'PORTRAIT-FOCUSED COMPOSITION. VISIBLE TORSO. BELT AND EQUIPMENT VISIBLE. WEAPONS VISIBLE. ARMOR VISIBLE. ' +
    'NO CLOSE-UP. NO HEADSHOT. NO BUST ONLY. NO FACE CROP.',
    // 2. Face quality — SECOND, highest visual priority
    'portrait quality face. extremely detailed eyes. sharp eyes. symmetrical eyes. ' +
    'highly detailed facial features. expressive realistic eyes. character concept art face. ' +
    'beautiful fantasy portrait. professional fantasy illustration. studio quality character portrait. ' +
    'focus on face and eyes. face is the focal point. award winning fantasy portrait. ' +
    'strong facial structure. believable face. memorable character design. clear readable expression.',
    // 3. Gender — before species so it anchors gender before race/class create ambiguity
    genderVisual,
    // 4. Species — body type anchored
    speciesVisual,
    // 5. Class
    classVisual,
    // 5. Style anchor
    'Dungeons and Dragons 2024 sourcebook illustration. Professional fantasy RPG NPC illustration.',
    // 6. Character details
    `CHARACTER: ${character.name}, level ${character.level ?? 1} ${tier.tier}`,
    `APPEARANCE: ${appearanceEn}`,
    `EQUIPMENT: ${itemEn}, ${tier.gear}`,
    `WEALTH AND STATUS: ${tier.wealth}`,
    `BEARING AND PRESENCE: ${tier.bearing}`,
    `BODY LANGUAGE: ${mannerismEn}`,
    `FIRST IMPRESSION: ${firstImpressionEn}`,
    'visible weapons, visible armor, visible belt pouches, visible accessories',
    'natural asymmetric pose, clear readable silhouette',
    'STYLE: cinematic fantasy art, highly detailed professional RPG character portrait, dramatic cinematic lighting, painterly realism',
    'MOOD: story-rich, believable NPC, atmospheric background, sharp focus',
    speciesNeg ? `NOT: ${speciesNeg}` : '',
  ].filter(Boolean).join(', ')
  // END SPECIES VISUAL SYSTEM / END CLASS VISUAL SYSTEM / END FACE QUALITY SYSTEM

  const midjourneyPrompt = [
    `${character.name}, ${raceFeatures}, ${classEn}, level ${character.level ?? 1} ${tier.tier}`,
    `MANDATORY RACE: ${raceFeatures}`,
    `appearance: ${appearanceEn}`,
    `carrying ${itemEn}`,
    `equipment quality: ${tier.gear}`,
    `bearing: ${tier.bearing}`,
    'three-quarter body portrait, full costume visible, equipment visible, head to knees minimum',
    'cinematic fantasy art, D&D 2024 sourcebook illustration, highly detailed, painterly realism',
    'atmospheric background, dramatic cinematic lighting, sharp focus',
    '--ar 4:5 --style raw',
  ].join(', ')
  // END DND2024 SPECIES UPDATE

  return {
    midjourneyPrompt,
    perchancePrompt,
    // START SPECIES VISUAL SYSTEM + START FACE QUALITY SYSTEM
    negativePrompt: [
      'close-up portrait, face only, headshot, bust only, cropped body, cropped at waist, ' +
      'missing torso, missing hands, portrait crop, zoomed face, head only, shoulders only, ' +
      'missing weapons, missing equipment, missing belt, missing accessories, modern clothing, ' +
      'sunglasses unless explicitly described, sci-fi, cyberpunk, blurry, cropped hands, text, watermark, ' +
      'logo, extra limbs, duplicate face, bad anatomy, low quality, wrong species, human instead of specified race',
      speciesNeg,
      FACE_QUALITY_NEGATIVE,
    ].filter(Boolean).join(', '),
    // END SPECIES VISUAL SYSTEM / END FACE QUALITY SYSTEM
  }
}
// END: v8 English prompt helpers

export function generateCombatStats(characterClass: string, level: number, scores: AbilityScores): CombatStats {
  const classInfo = CLASS_INFO[characterClass] ?? { hitDie: 'd8', primaryAbility: 'Styrke' }
  const prof = proficiencyForLevel(level)
  // Guard against undefined/NaN ability scores — default to 10 (modifier = 0)
  const safeScore = (v: number | undefined): number => (Number.isFinite(v) ? (v as number) : 10)
  const dex = modNumber(safeScore(scores?.dexterity))
  const con = modNumber(safeScore(scores?.constitution))
  const wis = modNumber(safeScore(scores?.wisdom))
  const primary = classPrimaryModifier({ strength: safeScore(scores?.strength), dexterity: safeScore(scores?.dexterity), constitution: safeScore(scores?.constitution), intelligence: safeScore(scores?.intelligence), wisdom: safeScore(scores?.wisdom), charisma: safeScore(scores?.charisma) }, characterClass)
  const hitDie = parseHitDie(classInfo.hitDie)
  const baseHp = hitDie + con + Math.max(0, level - 1) * (Math.ceil(hitDie / 2) + 1 + con)
  const armorBonus = ['Kriger', 'Paladin'].includes(characterClass) ? 16 : ['Barbar', 'Jæger', 'Warlock'].includes(characterClass) ? 13 : 11
  const armorClass = Math.max(10, armorBonus + Math.min(dex, ['Kriger', 'Paladin'].includes(characterClass) ? 1 : 3))
  const meleeName = meleeWeaponForClass(characterClass)
  const rangedName = rangedWeaponForClass(characterClass)
  const meleeMod = ['Troldmand', 'Troldkarl'].includes(characterClass) ? dex : Math.max(modNumber(safeScore(scores?.strength)), dex, primary)
  const rangedMod = rangedName === 'Cantrip' ? primary : dex

  return {
    armorClass,
    hitPoints: Math.max(4, baseHp),
    initiative: signed(dex),
    speed: '30 ft',
    passivePerception: 10 + wis,
    challenge: level <= 2 ? '1/4–1/2' : level <= 4 ? '1' : level <= 6 ? '2' : '3+',
    melee: buildAttack(meleeName, meleeMod, prof, meleeName === 'Forhekset klinge' ? 'slashing/force' : 'piercing/slashing', 'melee'),
    ranged: buildAttack(rangedName, rangedMod, prof, rangedName === 'Cantrip' ? 'force/fire' : 'piercing', rangedName === 'Cantrip' ? 'range 60 ft' : 'range 80/320'),
    specialAbilities:   specialAbilitiesForClass(characterClass),
    specialAbilitiesEn: specialAbilitiesForClassEn(characterClass),
  }
}

// START INSTANT LANGUAGE SWITCH
// buildNpcLayer always generates BOTH DA and EN text simultaneously.
// The active 'lang' determines which set is written to the top-level fields
// (for backward compat with display code that reads char.motivation etc.).
// The full bilingual data is returned in 'npcTranslations' so CharacterSheet
// can switch languages without re-generating.
function buildNpcLayer(name: string, species: string, characterClass: string, background: string, appearance: string, level = 1, alignment = '', lang: Lang = 'da') {
  // Pick a random index from the DA pool, use the same index for EN pool
  // so both languages describe the same "slot" of trait.
  // For pools of different lengths, clamp to the shorter pool.
  function pickBoth<T>(daPool: T[], enPool: T[]): { da: T; en: T } {
    const maxIdx = Math.min(daPool.length, enPool.length) - 1
    const idx = Math.floor(Math.random() * (maxIdx + 1))
    return { da: daPool[idx], en: enPool[idx] }
  }

  const fiPair  = pickBoth(FIRST_IMPRESSIONS, FIRST_IMPRESSIONS_EN)
  const moPair  = pickBoth(MOTIVATIONS,       MOTIVATIONS_EN)
  const sePair  = pickBoth(SECRETS,           SECRETS_EN)
  const maPair  = pickBoth(MANNERISMS,        MANNERISMS_EN)
  const rvPair  = pickBoth(RELATION_VERBS,    RELATION_VERBS_EN)
  const rtPair  = pickBoth(RELATION_TARGETS,  RELATION_TARGETS_EN)
  const shPair  = pickBoth(SCENE_HOOKS,       SCENE_HOOKS_EN)
  const htpPair = pickBoth(HOW_TO_PLAY,       HOW_TO_PLAY_EN)

  // Top-level fields use the active lang (backward compat)
  const firstImpression = lang === 'en' ? fiPair.en : fiPair.da
  const motivation      = lang === 'en' ? moPair.en : moPair.da
  const secret          = lang === 'en' ? sePair.en : sePair.da
  const mannerism       = lang === 'en' ? maPair.en : maPair.da
  const relationship    = safeStr(lang === 'en' ? `${rvPair.en} ${rtPair.en}` : `${rvPair.da} ${rtPair.da}`, lang === 'en' ? 'has a complicated history with a local figure' : 'har en kompliceret fortid med en lokal person')
  const sceneHook       = lang === 'en' ? shPair.en : shPair.da
  const howToPlay       = lang === 'en' ? htpPair.en : htpPair.da

  const gmSummary = lang === 'en'
    ? `${name} is a ${species.toLowerCase()} ${characterClass.toLowerCase()}. ${fiPair.en} They ${moPair.en} Secret: ${sePair.en}`
    : `${name} er en ${species.toLowerCase()} ${characterClass.toLowerCase()}. ${fiPair.da} Personen ${moPair.da} Hemmelighed: ${sePair.da}`

  const prompts = buildEnglishPrompts({
    name, species, characterClass, appearance, inventoryItem: pick(INVENTORY_ITEMS), firstImpression: fiPair.da, mannerism: maPair.da, level, alignment,
  })

  // Bilingual NPC data for instant language switching
  const npcTranslations = {
    da: {
      firstImpression: fiPair.da,
      motivation:      moPair.da,
      secret:          sePair.da,
      mannerism:       maPair.da,
      relationship:    `${rvPair.da} ${rtPair.da}`,
      sceneHook:       shPair.da,
      howToPlay:       htpPair.da,
      gmSummary:       `${name} er en ${species.toLowerCase()} ${characterClass.toLowerCase()}. ${fiPair.da} Personen ${moPair.da} Hemmelighed: ${sePair.da}`,
    },
    en: {
      firstImpression: fiPair.en,
      motivation:      moPair.en,
      secret:          sePair.en,
      mannerism:       maPair.en,
      relationship:    `${rvPair.en} ${rtPair.en}`,
      sceneHook:       shPair.en,
      howToPlay:       htpPair.en,
      gmSummary:       `${name} is a ${species.toLowerCase()} ${characterClass.toLowerCase()}. ${fiPair.en} They ${moPair.en} Secret: ${sePair.en}`,
    },
  }

  return { firstImpression, motivation, secret, mannerism, relationship, sceneHook, howToPlay, gmSummary, npcTranslations, ...prompts }
}
// END INSTANT LANGUAGE SWITCH

export function rerollName(character: Character): Character {
  return refreshPrompts({ ...character, id: `${character.id}_name_${Date.now()}`, name: getNameForRace(internalRace(character.species), character.gender) })
}

export function rerollCoreTraits(character: Character, lang: Lang = 'da'): Character {
  // START INSTANT LANGUAGE SWITCH — reroll both languages simultaneously
  const cls = internalClass(character.characterClass)
  function pickBothTrait(daPool: Record<string, string[]>, enPool: Record<string, string[]>): { da: string; en: string } {
    const da = daPool[cls] ?? daPool['default'] ?? []
    const en = enPool[cls] ?? enPool['default'] ?? []
    const idx = Math.floor(Math.random() * Math.min(da.length, en.length))
    return { da: da[idx] ?? '', en: en[idx] ?? '' }
  }
  const pt = pickBothTrait(PERSONALITY_TRAITS, PERSONALITY_TRAITS_EN)
  const id = pickBothTrait(IDEALS,             IDEALS_EN)
  const bd = pickBothTrait(BONDS,              BONDS_EN)
  const fl = pickBothTrait(FLAWS,              FLAWS_EN)
  const prev = character.translations ?? { da: {} as never, en: {} as never }
  return {
    ...character,
    id: `${character.id}_traits_${Date.now()}`,
    personalityTrait: lang === 'en' ? pt.en : pt.da,
    ideal:            lang === 'en' ? id.en : id.da,
    bond:             lang === 'en' ? bd.en : bd.da,
    flaw:             lang === 'en' ? fl.en : fl.da,
    translations: {
      da: { ...prev.da, personalityTrait: pt.da, ideal: id.da, bond: bd.da, flaw: fl.da },
      en: { ...prev.en, personalityTrait: pt.en, ideal: id.en, bond: bd.en, flaw: fl.en },
    },
  }
  // END INSTANT LANGUAGE SWITCH
}

export function rerollNpcTraits(character: Character, lang: Lang = 'da'): Character {
  // START INSTANT LANGUAGE SWITCH — buildNpcLayer now returns npcTranslations
  const npcLayerBase = buildNpcLayer(
    character.name,
    internalRace(character.species),
    internalClass(character.characterClass),
    internalBackground(character.background),
    character.appearance,
    character.level,
    internalAlignment(character.alignment),
    lang,
  )
  const prompts = buildEnglishPrompts({ ...character, firstImpression: npcLayerBase.firstImpression, mannerism: npcLayerBase.mannerism })
  const prev = character.translations ?? { da: {} as never, en: {} as never }
  return {
    ...character,
    id: `${character.id}_npc_${Date.now()}`,
    ...npcLayerBase,
    ...prompts,
    translations: {
      da: { ...prev.da, ...npcLayerBase.npcTranslations.da },
      en: { ...prev.en, ...npcLayerBase.npcTranslations.en },
    },
  }
  // END INSTANT LANGUAGE SWITCH
}


export type RerollField = 'appearance' | 'personalityTrait' | 'ideal' | 'bond' | 'flaw' | 'motivation' | 'secret' | 'mannerism' | 'relationship' | 'sceneHook'

function refreshPrompts(character: Character): Character {
  const prompts = buildEnglishPrompts(character)
  return { ...character, ...prompts, imagePrompt: generateImagePrompt({
    name: character.name,
    species: character.species,
    characterClass: character.characterClass,
    background: character.background,
    alignment: character.alignment,
    appearance: prompts.perchancePrompt,
    inventoryItem: character.inventoryItem,
    artStyle: character.artStyle,
    gender: character.gender,
  }) }
}

export function rerollSingleField(character: Character, field: RerollField, lang: Lang = 'da'): Character {
  // START INSTANT LANGUAGE SWITCH — always reroll both DA and EN simultaneously
  const next: Character = { ...character, id: `${character.id}_${field}_${Date.now()}` }
  const prev = character.translations ?? { da: {} as never, en: {} as never }
  const newTr = { da: { ...prev.da }, en: { ...prev.en } }

  if (field === 'appearance') {
    const raceKey = internalRace(character.species)
    const baseRace = raceKey.replace(/ \(.*\)$/, '')
    const appearancePool = APPEARANCE_DETAILS[raceKey] ?? APPEARANCE_DETAILS[baseRace] ?? APPEARANCE_DETAILS['Menneske']
    const newAppearanceDa = pick(appearancePool)
    next.appearance = newAppearanceDa
    newTr.da.appearance = newAppearanceDa
    newTr.en.appearance = englishOr(newAppearanceDa, APPEARANCE_EN)
  }

  const cls = internalClass(character.characterClass)

  function pickBothTrait(daPool: Record<string, string[]>, enPool: Record<string, string[]>): { da: string; en: string } {
    const da = daPool[cls] ?? daPool['default'] ?? []
    const en = enPool[cls] ?? enPool['default'] ?? []
    const idx = Math.floor(Math.random() * Math.min(da.length, en.length))
    return { da: da[idx] ?? '', en: en[idx] ?? '' }
  }

  function pickBothFlat<T>(daPool: T[], enPool: T[]): { da: T; en: T } {
    const idx = Math.floor(Math.random() * Math.min(daPool.length, enPool.length))
    return { da: daPool[idx], en: enPool[idx] }
  }

  if (field === 'personalityTrait') {
    const p = pickBothTrait(PERSONALITY_TRAITS, PERSONALITY_TRAITS_EN)
    next.personalityTrait = lang === 'en' ? p.en : p.da
    newTr.da.personalityTrait = p.da; newTr.en.personalityTrait = p.en
  }
  if (field === 'ideal') {
    const p = pickBothTrait(IDEALS, IDEALS_EN)
    next.ideal = lang === 'en' ? p.en : p.da
    newTr.da.ideal = p.da; newTr.en.ideal = p.en
  }
  if (field === 'bond') {
    const p = pickBothTrait(BONDS, BONDS_EN)
    next.bond = lang === 'en' ? p.en : p.da
    newTr.da.bond = p.da; newTr.en.bond = p.en
  }
  if (field === 'flaw') {
    const p = pickBothTrait(FLAWS, FLAWS_EN)
    next.flaw = lang === 'en' ? p.en : p.da
    newTr.da.flaw = p.da; newTr.en.flaw = p.en
  }
  if (field === 'motivation') {
    const p = pickBothFlat(MOTIVATIONS, MOTIVATIONS_EN)
    next.motivation = lang === 'en' ? p.en : p.da
    newTr.da.motivation = p.da; newTr.en.motivation = p.en
  }
  if (field === 'secret') {
    const p = pickBothFlat(SECRETS, SECRETS_EN)
    next.secret = lang === 'en' ? p.en : p.da
    newTr.da.secret = p.da; newTr.en.secret = p.en
  }
  if (field === 'mannerism') {
    const p = pickBothFlat(MANNERISMS, MANNERISMS_EN)
    next.mannerism = lang === 'en' ? p.en : p.da
    newTr.da.mannerism = p.da; newTr.en.mannerism = p.en
  }
  if (field === 'relationship') {
    const rv = pickBothFlat(RELATION_VERBS,   RELATION_VERBS_EN)
    const rt = pickBothFlat(RELATION_TARGETS, RELATION_TARGETS_EN)
    next.relationship = lang === 'en' ? `${rv.en} ${rt.en}` : `${rv.da} ${rt.da}`
    newTr.da.relationship = `${rv.da} ${rt.da}`
    newTr.en.relationship = `${rv.en} ${rt.en}`
  }
  if (field === 'sceneHook') {
    const p = pickBothFlat(SCENE_HOOKS, SCENE_HOOKS_EN)
    next.sceneHook = lang === 'en' ? p.en : p.da
    newTr.da.sceneHook = p.da; newTr.en.sceneHook = p.en
  }

  next.translations = newTr as typeof character.translations
  return refreshPrompts(next)
  // END INSTANT LANGUAGE SWITCH
}

export function setCharacterLevel(character: Character, level: number): Character {
  const safeLevel = Math.max(1, Math.min(20, Math.round(level)))
  // Rebuild prompts with the new level so portrait tier descriptors update too
  const updatedChar = { ...character, level: safeLevel, combatStats: generateCombatStats(internalClass(character.characterClass), safeLevel, character.abilityScores) }
  return refreshPrompts({ ...updatedChar, id: `${character.id}_level_${safeLevel}_${Date.now()}` })
}

export function rerollCombat(character: Character): Character {
  const abilityScores: AbilityScores = {
    strength: rollAbilityScore(),
    dexterity: rollAbilityScore(),
    constitution: rollAbilityScore(),
    intelligence: rollAbilityScore(),
    wisdom: rollAbilityScore(),
    charisma: rollAbilityScore(),
  }
  return {
    ...character,
    id: `${character.id}_combat_${Date.now()}`,
    abilityScores,
    combatStats: generateCombatStats(internalClass(character.characterClass), character.level, abilityScores),
  }
}

export function generateCharacter(lang: Lang = 'da'): Character {
  // START GENDER CONSISTENCY SYSTEM
  // Gender is determined FIRST so name, appearance and portrait prompt all align.
  const gender: 'male' | 'female' = Math.random() < 0.5 ? 'male' : 'female'
  // END GENDER CONSISTENCY SYSTEM

  // Internal keys always stay Danish (for CLASS_INFO, CLASS_ACCENT_COLORS, NAMES, APPEARANCE_DETAILS, etc.)
  const speciesInternal = pickRace()           // always a Danish key
  const characterClassInternal = pick(CLASSES) // always a Danish key

  // Display values depend on language
  const species = lang === 'en' ? (RACE_DA_TO_EN[speciesInternal] ?? speciesInternal) : speciesInternal
  const characterClass = lang === 'en' ? (CLASS_DA_TO_EN[characterClassInternal] ?? characterClassInternal) : characterClassInternal

  const backgroundInternal = pick(BACKGROUNDS)
  const alignmentInternal  = pick(ALIGNMENTS)
  const background = lang === 'en' ? (BACKGROUND_DA_TO_EN[backgroundInternal] ?? backgroundInternal) : backgroundInternal
  const alignment  = lang === 'en' ? (ALIGNMENT_DA_TO_EN[alignmentInternal] ?? alignmentInternal)   : alignmentInternal

  const level = roll(6)

  const abilityScores: AbilityScores = {
    strength: rollAbilityScore(),
    dexterity: rollAbilityScore(),
    constitution: rollAbilityScore(),
    intelligence: rollAbilityScore(),
    wisdom: rollAbilityScore(),
    charisma: rollAbilityScore(),
  }

  // START GENDER CONSISTENCY SYSTEM — gender-specific name
  const name = getNameForRace(speciesInternal, gender)
  // END GENDER CONSISTENCY SYSTEM

  // START INSTANT LANGUAGE SWITCH — generate both DA and EN traits simultaneously
  // Pick the same index from both pools so the trait is semantically equivalent.
  function pickTraitBoth(daPool: Record<string, string[]>, enPool: Record<string, string[]>, cls: string): { da: string; en: string } {
    const da = daPool[cls] ?? daPool['default'] ?? []
    const en = enPool[cls] ?? enPool['default'] ?? []
    const maxIdx = Math.min(da.length, en.length) - 1
    if (maxIdx < 0) return { da: '', en: '' }
    const idx = Math.floor(Math.random() * (maxIdx + 1))
    return { da: da[idx], en: en[idx] }
  }

  const ptPair   = pickTraitBoth(PERSONALITY_TRAITS, PERSONALITY_TRAITS_EN, characterClassInternal)
  const idPair   = pickTraitBoth(IDEALS,             IDEALS_EN,             characterClassInternal)
  const bdPair   = pickTraitBoth(BONDS,              BONDS_EN,              characterClassInternal)
  const flPair   = pickTraitBoth(FLAWS,              FLAWS_EN,              characterClassInternal)

  const personalityTrait = lang === 'en' ? ptPair.en : ptPair.da
  const ideal            = lang === 'en' ? idPair.en : idPair.da
  const bond             = lang === 'en' ? bdPair.en : bdPair.da
  const flaw             = lang === 'en' ? flPair.en : flPair.da
  // END INSTANT LANGUAGE SWITCH

  // START INSTANT LANGUAGE SWITCH — pick inventory in both languages
  const invIdx = Math.floor(Math.random() * Math.min(INVENTORY_ITEMS.length, INVENTORY_ITEMS_EN.length))
  const inventoryItemDa = INVENTORY_ITEMS[invIdx]
  const inventoryItemEn = INVENTORY_ITEMS_EN[invIdx]
  const inventoryItem = lang === 'en' ? inventoryItemEn : inventoryItemDa
  // END INSTANT LANGUAGE SWITCH
  const companion     = lang === 'en' ? pick(COMPANIONS_EN)      : pick(COMPANIONS)

  // START DND2024 SPECIES UPDATE — art style permanently locked to Cinematic
  const artStyle = 'Cinematic'
  // END DND2024 SPECIES UPDATE

  const baseRace = speciesInternal.replace(/ \(.*\)$/, '')
  // START GENDER CONSISTENCY SYSTEM — gender-specific appearance
  const appearance = getAppearanceForGender(speciesInternal, gender)
  // END GENDER CONSISTENCY SYSTEM

  const hookPool = lang === 'en' ? ADVENTURE_HOOKS_EN : ADVENTURE_HOOKS
  const h1 = pick(hookPool)
  const remaining = hookPool.filter(h => h !== h1)
  const h2 = remaining.length > 0 ? pick(remaining) : pick(hookPool)
  const hooks = [h1, h2]

  const classInfo  = CLASS_INFO[characterClassInternal]  ?? { hitDie: 'd8', primaryAbility: 'Styrke' }
  const racialBonus = RACIAL_BONUSES[speciesInternal] ?? '+1 alle evner'

  // NPC layer always uses Danish internal keys for buildNpcLayer (which builds English image prompts)
  // but picks from the right language pools for text fields
  const npcLayerBase = buildNpcLayer(name, speciesInternal, characterClassInternal, backgroundInternal, appearance, level, alignmentInternal, lang)
  const promptLayer = buildEnglishPrompts({
    name, species: speciesInternal, characterClass: characterClassInternal, appearance,
    inventoryItem, firstImpression: npcLayerBase.firstImpression, mannerism: npcLayerBase.mannerism, level, alignment: alignmentInternal,
    gender,
  })
  const npcLayer = { ...npcLayerBase, ...promptLayer }
  const combatStats = generateCombatStats(characterClassInternal, level, abilityScores)

  const imagePrompt = generateImagePrompt({
    name, species: speciesInternal, characterClass: characterClassInternal,
    background: backgroundInternal, alignment: alignmentInternal,
    appearance: `${promptLayer.perchancePrompt}`, inventoryItem, artStyle,
    gender, // START GENDER CONSISTENCY SYSTEM
  })

  // START INSTANT LANGUAGE SWITCH — build full translations object
  const speciesDa = speciesInternal
  const speciesEn = RACE_DA_TO_EN[speciesInternal] ?? speciesInternal
  const classDa   = characterClassInternal
  const classEn   = CLASS_DA_TO_EN[characterClassInternal] ?? characterClassInternal
  const bgDa      = backgroundInternal
  const bgEn      = BACKGROUND_DA_TO_EN[backgroundInternal] ?? backgroundInternal
  const alDa      = alignmentInternal
  const alEn      = ALIGNMENT_DA_TO_EN[alignmentInternal] ?? alignmentInternal

  // Translate the appearance string (DA → EN via APPEARANCE_EN lookup)
  const appearanceEnDisplay = englishOr(appearance, APPEARANCE_EN)

  const translations = {
    da: {
      species: speciesDa, characterClass: classDa, background: bgDa, alignment: alDa,
      personalityTrait: ptPair.da, ideal: idPair.da, bond: bdPair.da, flaw: flPair.da,
      inventoryItem: inventoryItemDa,
      appearance,               // always stored in DA (internal)
      ...npcLayer.npcTranslations.da,
    } as CharacterTranslations['da'],
    en: {
      species: speciesEn, characterClass: classEn, background: bgEn, alignment: alEn,
      personalityTrait: ptPair.en, ideal: idPair.en, bond: bdPair.en, flaw: flPair.en,
      inventoryItem: inventoryItemEn,
      appearance: appearanceEnDisplay,   // EN translation of the DA appearance string
      ...npcLayer.npcTranslations.en,
    } as CharacterTranslations['en'],
  }
  // END INSTANT LANGUAGE SWITCH

  return {
    id: `char_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    name,
    species,
    characterClass,
    background,
    alignment,
    level,
    gender, // START GENDER CONSISTENCY SYSTEM
    abilityScores,
    combatStats,
    personalityTrait,
    ideal,
    bond,
    flaw,
    ...npcLayer,
    appearance,
    inventoryItem,
    companion,
    imagePrompt,
    artStyle,
    adventureHooks: hooks,
    createdAt: new Date().toISOString(),
    accentColor: CLASS_ACCENT_COLORS[characterClassInternal] ?? '#0d0b07',
    racialBonus,
    hitDie: classInfo.hitDie,
    primaryAbility: classInfo.primaryAbility,
    translations,
  }
}

export function modifier(score: number): string {
  return signed(modNumber(score))
}
