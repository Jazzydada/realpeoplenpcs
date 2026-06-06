export type Lang = 'da' | 'en'

const LABELS: Record<string, Record<Lang, string>> = {
  // CharacterSheet — FramedInfo
  race:               { da: 'Race',               en: 'Race' },
  class:              { da: 'Klasse',              en: 'Class' },
  level:              { da: 'Level',               en: 'Level' },
  alignment:          { da: 'Alignment',           en: 'Alignment' },

  // CharacterSheet — CombatBox
  combatData:         { da: 'KAMPDATA',            en: 'COMBAT DATA' },

  // CharacterSheet — first impression
  firstImpression:    { da: 'FØRSTE INDTRYK',     en: 'FIRST IMPRESSION' },

  // CharacterSheet — Trait labels
  personalityTrait:   { da: 'PERSONLIGHEDSTRÆK',  en: 'PERSONALITY TRAIT' },
  ideal:              { da: 'IDEAL',               en: 'IDEAL' },
  bond:               { da: 'BÅND',               en: 'BOND' },
  flaw:               { da: 'FEJL',               en: 'FLAW' },

  // CharacterSheet — NpcPlayPanel labels
  motivation:         { da: 'VIL GERNE',           en: 'MOTIVATION' },
  secret:             { da: 'HEMMELIGHED',         en: 'SECRET' },
  mannerism:          { da: 'SÆRKENDE',            en: 'MANNERISM' },
  relation:           { da: 'RELATION',            en: 'RELATION' },
  sceneHook:          { da: 'SCENEHOOK',           en: 'SCENE HOOK' },
  howToPlay:          { da: 'SPIL SOM',            en: 'HOW TO PLAY' },

  // CharacterSheet — loading / empty state
  consulting:         { da: 'Konsulterer skæbnen…', en: 'Consulting the fates…' },
  generatePrompt:     { da: 'Genererer karakter…', en: 'Generating character…' },

  // CharacterSheet — appearance label
  appearance:         { da: 'Udseende',            en: 'Appearance' },

  // ControlBar — button labels
  generate:           { da: 'Regenerér',           en: 'Reroll' },
  newPortrait:        { da: 'Nyt portræt',         en: 'New portrait' },
  generatePortrait:   { da: 'Lav portræt',         en: 'Generate Portrait' },
  save:               { da: 'Gem',                 en: 'Save' },
  collection:         { da: 'Samling',             en: 'Collection' },

  // ControlBar — level label prefix
  levelLabel:         { da: 'Level',               en: 'Level' },

  // RerollPanel labels
  rollName:           { da: 'Navn',                en: 'Name' },
  rollTraits:         { da: 'Ideal/bånd/fejl',     en: 'Ideal/bond/flaw' },
  rollNpc:            { da: 'NPC-traits',          en: 'NPC traits' },
  rollCombat:         { da: 'Kampdata',            en: 'Combat' },
  rollLabel:          { da: 'Rul om:',             en: 'Reroll:' },

  // Header subtitle
  subtitle:           { da: 'NPC-generator med portræt, stats og spilbare hemmeligheder', en: 'NPC generator with portrait, stats and playable secrets' },

  // Reroll button titles
  rerollName:         { da: 'Rul navn om',         en: 'Reroll name' },
  rerollField:        { da: 'Rul feltet om',       en: 'Reroll field' },
  rerollAppearance:   { da: 'Rul udseende om',     en: 'Reroll appearance' },
}

export function t(lang: Lang, key: string): string {
  return LABELS[key]?.[lang] ?? key
}
