// ─── In-session URL cache (LRU, bounded) ────────────────────────────────────
// Map preserves insertion order, so re-inserting on access bumps the key
// to "most recently used". When the cap is reached, the oldest entry is evicted.
const _urlCache = new Map<string, string>()
const MAX_CACHE_ENTRIES = 50

export function getCachedImageUrl(key: string): string | undefined {
  const url = _urlCache.get(key)
  if (url !== undefined) {
    _urlCache.delete(key)
    _urlCache.set(key, url)
  }
  return url
}

export function cacheImageUrl(key: string, url: string): void {
  if (_urlCache.has(key)) {
    _urlCache.delete(key)
  } else if (_urlCache.size >= MAX_CACHE_ENTRIES) {
    const oldest = _urlCache.keys().next().value
    if (oldest !== undefined) _urlCache.delete(oldest)
  }
  _urlCache.set(key, url)
}

export function makeCacheKey(prompt: string, quality: 'fast' | 'high'): string {
  return `${prompt}:${quality}`
}

// START DND2024 SPECIES UPDATE
// ─── Race descriptions with MANDATORY physical features ───────────────────────
// Each entry enforces D&D 2024 PHB species appearance so AI generators
// cannot silently render the character as a generic human.
const RACE_EN: Record<string, string> = {
  'Menneske':
    'human adventurer, normal human proportions, human facial features',

  'Aasimar':
    'aasimar, celestial ancestry, MANDATORY: radiant glowing eyes, subtle divine luminescence on skin, ' +
    'faint halo or divine light aura, celestial heritage visible in face and bearing. ' +
    'DO NOT depict as: ordinary human, angel with full wings',

  'Dragonborn':
    'dragonborn, MANDATORY: reptilian humanoid, dragon scales covering entire body, ' +
    'draconic snout and face, no human nose, scaled neck and hands, dragon-like facial structure. ' +
    'DO NOT depict as: human, elf, or any non-reptilian humanoid',

  'Bjergdværg':
    'mountain dwarf, MANDATORY: short and broad powerful build, significantly shorter than human, ' +
    'massive muscular frame, elaborate braided beard, stone-grey eyes, heavy dwarven proportions. ' +
    'DO NOT depict as: human, elf, or tall humanoid',

  'Bakkedværg':
    'hill dwarf, MANDATORY: short and stout build, significantly shorter than human, ' +
    'impressive braided beard, ruddy cheeks, stocky dwarven proportions, solid compact frame. ' +
    'DO NOT depict as: human, elf, or tall humanoid',

  'Højalv':
    'high elf, MANDATORY: clearly visible pointed ears, tall and slender build, ' +
    'ethereal elegant beauty, sharp angular elven facial features, ageless appearance. ' +
    'DO NOT depict as: human or round-eared humanoid',

  'Skovsalv':
    'wood elf, MANDATORY: clearly visible pointed ears, lithe athletic build, ' +
    'amber or green eyes, forest-touched appearance, tanned skin, wild natural hair. ' +
    'DO NOT depict as: human or round-eared humanoid',

  'Mørkalv':
    'dark elf drow, MANDATORY: obsidian dark purple-black skin, stark white or silver hair, ' +
    'glowing red or pale violet eyes, clearly visible pointed ears, slender elven build. ' +
    'DO NOT depict as: human, pale-skinned elf, or any light-skinned humanoid',

  'Skovgnome':
    'forest gnome, MANDATORY: extremely small humanoid, only 3 feet tall, ' +
    'noticeably much smaller than any human in scene, gnome proportions, oversized curious eyes, ' +
    'earth-toned practical woodland clothing, small delicate hands. ' +
    'DO NOT depict as: human, dwarf, elf, or any full-sized humanoid',

  'Stengnome':
    'rock gnome, MANDATORY: extremely small humanoid, only 3 feet tall, ' +
    'noticeably much smaller than any human in scene, gnome proportions, wild hair, ' +
    'large round eyes, visible tinkering gadgets and tools. ' +
    'DO NOT depict as: human, dwarf, elf, or any full-sized humanoid',

  'Goliath':
    'goliath, MANDATORY: towering massive height, significantly larger and taller than any human, ' +
    'enormous muscular build, natural stone-grey skin with darker stone-like markings, ' +
    'giant ancestry visible in scale and proportions, powerful imposing frame. ' +
    'DO NOT depict as: human, half-orc, or normal-sized humanoid',

  'Halvling (Lyshjerte)':
    'lightfoot halfling, MANDATORY: only 3 feet tall, noticeably much smaller than humans, ' +
    'halfling proportions, curly hair, large hairy feet, small adventurer frame, cheerful face. ' +
    'DO NOT depict as: human, dwarf, elf, child, or any full-sized humanoid',

  'Halvling (Stouthjerte)':
    'stout halfling, MANDATORY: only 3 feet tall, noticeably much smaller than humans, ' +
    'short and stocky halfling proportions, curly hair, broad solid frame for a halfling, barefoot. ' +
    'DO NOT depict as: human, dwarf, elf, child, or any full-sized humanoid',

  'Ork':
    'orc, MANDATORY: grey-green skin, prominent lower tusks protruding from mouth, ' +
    'heavily muscled imposing build, broad flat nose, fierce orc facial features. ' +
    'DO NOT depict as: human, half-orc without tusks, or any humanoid without tusks',

  'Tiefling':
    'tiefling, MANDATORY: curved horns growing from forehead, infernal ancestry visible, ' +
    'patterned or tinted skin (purple, red or dark), long thin tail, slit pupils, ' +
    'fantasy humanoid with clear infernal features. ' +
    'DO NOT depict as: human, elf, or humanoid without horns',
}
// END DND2024 SPECIES UPDATE

// START SPECIES VISUAL SYSTEM
// ─── Strong early-token species descriptors ───────────────────────────────────
// These go at prompt position 3 — immediately after composition and class.
// Each entry has:
//   visual: strong positive descriptor (what the character MUST look like)
//   negative: what to explicitly exclude (appended to the negative prompt)
//
// Why early tokens matter: flux/flux-realism/sana weight the first 75-100 tokens
// most heavily. If species text arrives late (after class, equipment, scene),
// the model has already committed to a body type. Species must anchor early.

interface SpeciesDescriptor { visual: string; negative: string }

export const SPECIES_VISUAL_PRIORITY: Record<string, SpeciesDescriptor> = {

  'Menneske': {
    visual:
      'NORMAL HUMAN. ' +
      'Regular adult human body proportions. Average human height. Human facial features. ' +
      'Human skin, human ears, no tusks, no horns, no tail, no scales, no unusual features. ' +
      'Completely ordinary human adventurer body.',
    negative:
      'elf ears, pointed ears, tusks, horns, tail, scales, reptilian features, oversized build, ' +
      'giant proportions, halfling size, dwarf proportions',
  },

  'Højalv': {
    visual:
      'HIGH ELF. ELVEN. ' +
      'Tall slender elegant humanoid. Long clearly visible pointed ears. ' +
      'Sharp angular elven facial features. Ageless graceful appearance. Pale luminous skin. ' +
      'Lithe build, taller than human, ethereal beauty. Unmistakably elven face.',
    negative:
      'round ears, human ears, human face, dwarf proportions, short body, ' +
      'tusks, horns, tail, scales, reptilian features',
  },

  'Skovsalv': {
    visual:
      'WOOD ELF. ELVEN. ' +
      'Athletic lithe humanoid. Long clearly visible pointed ears. ' +
      'Amber or green eyes. Tanned weathered skin. Wild natural hair with leaves or braids. ' +
      'Forest-touched agile build. Sharp elven facial features. Unmistakably elven face.',
    negative:
      'round ears, human ears, human face, dwarf proportions, short body, ' +
      'tusks, horns, tail, scales, pale skin',
  },

  'Mørkalv': {
    visual:
      'DARK ELF. DROW. ' +
      'Slender humanoid with OBSIDIAN dark purple-black skin. Stark white or silver hair. ' +
      'Glowing red or pale violet eyes. Long clearly visible pointed ears. ' +
      'Elven facial features, dark complexion. Unmistakably dark-skinned elven appearance.',
    negative:
      'pale skin, light skin, round ears, human face, human skin, ' +
      'tusks, horns, tail, scales, brown skin, tan skin',
  },

  'Bjergdværg': {
    visual:
      'MOUNTAIN DWARF. DWARF. ' +
      'SHORT BROAD ADULT HUMANOID. Only 4.5 feet tall, significantly shorter than any human. ' +
      'Extremely stocky powerful build. Wide barrel chest. Thick muscular arms and legs. ' +
      'Massive braided beard. Stone-grey eyes. Heavy dwarven proportions. ' +
      'Adult face with dwarf features. NOT tall. NOT human-sized. NOT child.',
    negative:
      'tall body, human height, human proportions, elf ears, slim build, ' +
      'tusks, horns, tail, scales, child face, oversized shoulders relative to height',
  },

  'Bakkedværg': {
    visual:
      'HILL DWARF. DWARF. ' +
      'SHORT STOUT ADULT HUMANOID. Only 4 feet tall, significantly shorter than any human. ' +
      'Compact stocky frame. Ruddy cheeks. Impressive braided beard. Warm friendly face. ' +
      'Broad solid dwarven proportions. Short thick limbs. ' +
      'Adult face. NOT tall. NOT human-sized. NOT child.',
    negative:
      'tall body, human height, human proportions, elf ears, slim build, ' +
      'tusks, horns, tail, scales, child face',
  },

  'Halvling (Lyshjerte)': {
    visual:
      'LIGHTFOOT HALFLING. HALFLING. ' +
      'VERY SHORT ADULT HUMANOID. Only 3 feet tall, clearly much smaller than a human. ' +
      'Small compact adult body. Short arms and legs. Halfling proportions. ' +
      'Curly hair. Cheerful adult face. Large slightly hairy feet. ' +
      'Small but clearly adult figure. Proportionally small everything. ' +
      'NOT a child. NOT a dwarf. NOT human-sized. NOT giant. NOT tall. NOT broad.',
    negative:
      'tall body, human height, human proportions, giant build, broad hulking body, ' +
      'oversized shoulders, child face, dwarf beard, elf ears, tusks, horns, tail, scales, ' +
      'large body, full-sized humanoid, orc, goblin, kobold',
  },

  'Halvling (Stouthjerte)': {
    visual:
      'STOUT HALFLING. HALFLING. ' +
      'VERY SHORT ADULT HUMANOID. Only 3 feet tall, clearly much smaller than a human. ' +
      'Small compact stocky adult body. Broad for a halfling. Short thick limbs. ' +
      'Curly hair. Adult face. Large slightly hairy feet. Halfling proportions. ' +
      'NOT a child. NOT a dwarf. NOT human-sized. NOT giant. NOT broad orc-like body.',
    negative:
      'tall body, human height, human proportions, giant build, broad hulking body, ' +
      'oversized shoulders, child face, dwarf beard, elf ears, tusks, horns, tail, scales, ' +
      'large body, full-sized humanoid, orc, goblin',
  },

  'Skovgnome': {
    visual:
      'FOREST GNOME. GNOME. ' +
      'TINY ADULT HUMANOID. Only 3 feet tall, even smaller than a halfling. ' +
      'Very small body. Gnome proportions. Large clever expressive eyes. ' +
      'Warm earth-toned woodland clothing. Small delicate hands. ' +
      'Gentle clever adult face. Clearly tiny, clearly adult. ' +
      'NOT a child. NOT a halfling. NOT human-sized.',
    negative:
      'tall body, human height, human proportions, large body, child face, ' +
      'dwarf beard, elf ears, tusks, horns, tail, scales, full-sized humanoid',
  },

  'Stengnome': {
    visual:
      'ROCK GNOME. GNOME. ' +
      'TINY ADULT HUMANOID. Only 3 feet tall. Small gnome proportions. ' +
      'Wild hair. Large round clever eyes. Visible tinkering gadgets and tools. ' +
      'Small clever adult face. Clearly tiny and adult. ' +
      'NOT a child. NOT a halfling. NOT human-sized.',
    negative:
      'tall body, human height, human proportions, large body, child face, ' +
      'dwarf beard, elf ears, tusks, horns, tail, scales, full-sized humanoid',
  },

  'Goliath': {
    visual:
      'GOLIATH. GIANT-BLOODED. ' +
      'TOWERING ENORMOUS HUMANOID. Extremely tall, at least 8 feet, visibly much larger than any human. ' +
      'Massive muscle-bound frame. Stone-grey skin with darker natural stone-pattern markings. ' +
      'Giant ancestry visible in scale. Powerfully imposing enormous figure. ' +
      'Bald or shaved head. Tribal stone markings on skin.',
    negative:
      'normal height, human-sized, average build, slim body, elf ears, ' +
      'tusks, horns, tail, scales, short body, small frame',
  },

  'Ork': {
    visual:
      'ORC. FULL ORC. ' +
      'MUSCULAR GREEN-SKINNED HUMANOID. Grey-green or dark green skin. ' +
      'Large prominent lower tusks clearly protruding from mouth. Heavy jaw. ' +
      'Heavily muscled imposing broad build. Broad flat nose. Fierce orc face. ' +
      'Unmistakably orcish appearance. Tusks must be clearly visible.',
    negative:
      'human face, human skin, pink skin, no tusks, small build, elf ears, ' +
      'horns, tail, scales, half-orc without tusks',
  },

  'Tiefling': {
    visual:
      'TIEFLING. INFERNAL ANCESTRY. ' +
      'Humanoid with CURVED HORNS growing from forehead — must be clearly visible. ' +
      'Patterned or tinted skin — purple, deep red or dusky dark. ' +
      'Long thin tail. Slit pupils or solid colored eyes. Clearly infernal features. ' +
      'Fantasy humanoid, clearly tiefling, NOT human, NOT elf.',
    negative:
      'human face, round ears only, no horns, no tail, normal skin, ' +
      'demon wings, angel wings, elf ears, tusks, scales, reptilian face',
  },

  'Aasimar': {
    visual:
      'AASIMAR. CELESTIAL ANCESTRY. ' +
      'Human-like humanoid with subtle divine radiance. ' +
      'Softly glowing radiant eyes — silver, gold or pale blue. ' +
      'Faint golden or silver luminescence on skin. Graceful serene face. ' +
      'Faint halo-like light. Celestial beauty. Not overtly angelic — no large wings visible. ' +
      'Subtle divine glow, NOT overwhelming, NOT armor-covered radiance.',
    negative:
      'demon horns, tiefling horns, tiefling tail, tusks, scales, reptilian, ' +
      'infernal features, full angel wings, elf ears, orc features, dark skin tones',
  },

  'Dragonborn': {
    visual:
      'DRAGONBORN. DRAGON-BLOODED. ' +
      'REPTILIAN HUMANOID. Dragon scales covering entire body and face. ' +
      'Draconic snout and muzzle — NO human nose, NO human face. ' +
      'Scaled neck, scaled hands and arms. Dragon-like facial structure with ridges. ' +
      'Powerful reptilian build. Clearly dragon-ancestry humanoid. ' +
      'NOT human. NOT elf. NOT orc. Full reptilian appearance.',
    negative:
      'human face, human nose, human skin, elf ears, tusks, horns on forehead, ' +
      'tail, mammalian face, smooth skin, no scales',
  },
}

// English-name aliases for EN-lang characters
export const SPECIES_VISUAL_PRIORITY_EN: Record<string, SpeciesDescriptor> = {
  'Human':               SPECIES_VISUAL_PRIORITY['Menneske'],
  'High Elf':            SPECIES_VISUAL_PRIORITY['Højalv'],
  'Wood Elf':            SPECIES_VISUAL_PRIORITY['Skovsalv'],
  'Dark Elf':            SPECIES_VISUAL_PRIORITY['Mørkalv'],
  'Mountain Dwarf':      SPECIES_VISUAL_PRIORITY['Bjergdværg'],
  'Hill Dwarf':          SPECIES_VISUAL_PRIORITY['Bakkedværg'],
  'Lightfoot Halfling':  SPECIES_VISUAL_PRIORITY['Halvling (Lyshjerte)'],
  'Stout Halfling':      SPECIES_VISUAL_PRIORITY['Halvling (Stouthjerte)'],
  'Forest Gnome':        SPECIES_VISUAL_PRIORITY['Skovgnome'],
  'Rock Gnome':          SPECIES_VISUAL_PRIORITY['Stengnome'],
  'Goliath':             SPECIES_VISUAL_PRIORITY['Goliath'],
  'Orc':                 SPECIES_VISUAL_PRIORITY['Ork'],
  'Tiefling':            SPECIES_VISUAL_PRIORITY['Tiefling'],
  'Aasimar':             SPECIES_VISUAL_PRIORITY['Aasimar'],
  'Dragonborn':          SPECIES_VISUAL_PRIORITY['Dragonborn'],
}
// END SPECIES VISUAL SYSTEM

const CLASS_EN: Record<string, string> = {
  'Slyngel':     'rogue in dark supple leather armor, twin daggers at belt, deep hood, nimble stance',
  'Barde':       'bard in colorful doublet with gold trim, lute on back, wide-brimmed feathered hat',
  'Kriger':      'fighter in battle-worn plate armor, hand on sword pommel, campaign-scarred, powerful stance',
  'Troldmand':   'wizard in deep blue robes etched with arcane sigils, ornate staff, spellbook at hip',
  'Præst':       'cleric in embossed holy armor with divine symbols, holy shield, radiant aura',
  'Jæger':       'ranger in forest-green leather armor, longbow across back, quiver at hip, weathered cloak',
  'Paladin':     'paladin in gleaming silver plate with golden holy engravings, greatsword, divine light',
  'Warlock':     'warlock in dark flowing robes with eldritch sigils, pact weapon raised, swirling void energy',
  'Munk':        'monk in simple flowing robes, bare feet, combat stance, ki energy glowing at fists',
  'Druide':      'druid in bark-and-leaf armor, gnarled wooden staff, nature magic spiraling around hands',
}

// START CLASS VISUAL SYSTEM
// Strong class-identity keywords placed EARLY in the prompt — before race details.
// Image models weight early tokens most heavily. Class identity must be established
// before the race can override it (a Goliath Wizard must look like a WIZARD first).
//
// Each entry uses 3 layers:
// 1. ROLE LINE   — single clear class noun that dominates generation ("WIZARD.")
// 2. VISUAL KEYS — the most recognisable class-specific props and clothing
// 3. MAGIC NOTE  — for spellcasters, explicit magical effect description
export const CLASS_VISUAL_PRIORITY: Record<string, string> = {
  'Slyngel': (
    'ROGUE. ASSASSIN. THIEF. ' +
    'Dark form-fitting leather armor with many hidden pockets. ' +
    'Twin daggers clearly visible at belt. ' +
    'Deep hooded cloak, hood partially raised. ' +
    'Wrapped bracers. Soft boots. Concealed equipment. ' +
    'Crouching or nimble weight-forward stance. Alert vigilant eyes.'
  ),
  'Barde': (
    'BARD. PERFORMER. STORYTELLER. ' +
    'Colorful doublet or dramatic traveling coat with gold trim. ' +
    'Musical instrument clearly visible — lute, flute or fiddle on back or in hand. ' +
    'Wide-brimmed feathered hat. Theatrical accessories. ' +
    'Expressive confident posture. Entertainer charm.'
  ),
  'Kriger': (
    'FIGHTER. WARRIOR. SOLDIER. ' +
    'Heavy battle-worn plate armor or chain mail with visible damage and repairs. ' +
    'Primary weapon held or at hip — sword, axe or halberd clearly visible. ' +
    'Shield strapped to back or arm. Campaign-scarred veteran look. ' +
    'Solid powerful combat stance. Military bearing.'
  ),
  'Troldmand': (
    'WIZARD. ARCANE SCHOLAR. SPELLCASTER. ' +
    'Flowing robes covered in arcane runes and sigils. ' +
    'Tall ornate magical staff held in one hand. ' +
    'Thick spellbook clearly visible — tucked at hip, chained, or held open. ' +
    'Arcane focus or crystal orb. Ink-stained fingers. ' +
    'Magical energy or glowing runes surrounding hands. ' +
    'Scholar robes, NOT warrior clothing, NOT armor.'
  ),
  'Præst': (
    'CLERIC. DIVINE PRIEST. HOLY WARRIOR. ' +
    'Ceremonial religious armor with embossed holy symbols. ' +
    'Large holy symbol medallion worn at chest — clearly visible and prominent. ' +
    'Divine light or radiant glow emanating from holy symbol or hands. ' +
    'Ceremonial robes or tabard over armor. ' +
    'Mace or war hammer at belt. Shield with religious iconography.'
  ),
  'Jæger': (
    'RANGER. WILDERNESS SCOUT. HUNTER. ' +
    'Weathered forest-green or brown leather armor, practical and worn. ' +
    'Longbow clearly visible across back, with full quiver of arrows. ' +
    'Survival gear — bedroll, rope, hunting knife, pouches at belt. ' +
    'Weathered traveler cloak, hood down. ' +
    'Alert wilderness stance. Nature and tracking tools.'
  ),
  'Paladin': (
    'PALADIN. HOLY KNIGHT. DIVINE CHAMPION. ' +
    'Gleaming polished plate armor with golden holy engravings and inlaid symbols. ' +
    'Large two-handed sword or longsword and shield with divine iconography. ' +
    'Radiant divine light or golden aura emanating from weapon or body. ' +
    'Holy symbol on chest or shield. Cape or tabard in noble colors. ' +
    'Noble commanding warrior stance.'
  ),
  'Warlock': (
    'WARLOCK. OCCULTIST. ELDRITCH PACT-MAKER. ' +
    'Dark dramatic robes covered in eldritch symbols and occult markings. ' +
    'Pact weapon raised or at ready — unusual magical weapon. ' +
    'Swirling void energy, eldritch flames or dark magical tendrils around hands. ' +
    'Sinister arcane focus or pact tome. ' +
    'Dark intense unsettling magical presence. NOT a fighter, NOT a ranger.'
  ),
  'Munk': (
    'MONK. MARTIAL ARTIST. UNARMED FIGHTER. ' +
    'Simple practical flowing travel robes, lightly armored or unarmored. ' +
    'Bare fists raised in combat-ready stance or elegant fighting pose. ' +
    'Ki energy — glowing light at knuckles, bare feet or along arms. ' +
    'Prayer beads. Wrapped hands and feet. Monastic aesthetic. ' +
    'No heavy armor. No large weapons. Pure martial arts discipline.'
  ),
  'Druide': (
    'DRUID. NATURE SHAMAN. WILD MAGE. ' +
    'Organic armor made from bark, leaves, woven vines and natural materials. ' +
    'Gnarled wooden staff or branch-topped staff held prominently. ' +
    'Nature magic swirling around hands — vines, leaves, natural energy. ' +
    'Animal motifs on clothing or jewelry. Natural earthy tones. ' +
    'Leaves or feathers woven into hair or clothing. ' +
    'Deep connection to nature visible in every detail.'
  ),
}

// Also export an English-keyed version for EN-lang characters
export const CLASS_VISUAL_PRIORITY_EN: Record<string, string> = {
  'Rogue':    CLASS_VISUAL_PRIORITY['Slyngel'],
  'Bard':     CLASS_VISUAL_PRIORITY['Barde'],
  'Fighter':  CLASS_VISUAL_PRIORITY['Kriger'],
  'Wizard':   CLASS_VISUAL_PRIORITY['Troldmand'],
  'Cleric':   CLASS_VISUAL_PRIORITY['Præst'],
  'Ranger':   CLASS_VISUAL_PRIORITY['Jæger'],
  'Paladin':  CLASS_VISUAL_PRIORITY['Paladin'],
  'Warlock':  CLASS_VISUAL_PRIORITY['Warlock'],
  'Monk':     CLASS_VISUAL_PRIORITY['Munk'],
  'Druid':    CLASS_VISUAL_PRIORITY['Druide'],
}
// END CLASS VISUAL SYSTEM

// START DND2024 SPECIES UPDATE
// Art style is permanently locked to Cinematic.
// The STYLE_EN map is kept for reference but only CINEMATIC_STYLE is used.
const CINEMATIC_STYLE =
  'cinematic fantasy art, Dungeons and Dragons 2024 sourcebook illustration, ' +
  'highly detailed professional RPG character portrait, dramatic cinematic lighting, ' +
  'painterly realism, masterwork fantasy illustration'

const STYLE_EN: Record<string, string> = {
  'painterly':  CINEMATIC_STYLE,
  'dark':       CINEMATIC_STYLE,
  'heroic':     CINEMATIC_STYLE,
  'gritty':     CINEMATIC_STYLE,
  'ethereal':   CINEMATIC_STYLE,
  'Cinematic':  CINEMATIC_STYLE,
}
// END DND2024 SPECIES UPDATE

const BACKGROUND_SCENE_EN: Record<string, string> = {
  'Akolytt':          'ancient stone temple with candles and incense smoke',
  'Kriminel':         'rain-soaked cobblestone alley at night, lantern glow',
  'Folkehelt':        'rolling countryside at dusk, warm golden light',
  'Adelsperson':      'opulent stone hall with tapestries and firelight',
  'Naturbarn':        'wild untamed mountain wilderness, stormy sky',
  'Lærde':            'massive ancient library with floating candles and drifting dust motes',
  'Soldat':           'ruined battlefield with smoke and glowing embers',
  'Eneboer':          'isolated mountain cave with moonlight streaming through a crack',
  'Sømand':           'storm-tossed ship deck with crashing waves and sea spray',
  'Underholder':      'dimly lit tavern stage with warm amber firelight',
  'Håndværker':       'workshop filled with masterwork tools and crafted goods',
  'Charlatan':        'crowded market square at twilight torchlight',
  'Gadebarn':         'dark rainy cobblestone street, distant gas lamp glow',
  'Hjemsøgt':         'shadowy graveyard with wisps of supernatural mist',
  'Fremmed Rejsende': 'exotic crossroads with foreign banners and desert dust',
  'Ridder':           'castle courtyard at dawn, banners flying in the wind',
  'Spion':            'shadowed rooftop overlooking a torchlit medieval city',
  'Byens Dusørjæger': 'smoke-filled back alley, pursuit scene',
}

export interface PromptInput {
  name: string
  species: string
  characterClass: string
  background: string
  alignment: string
  appearance: string
  inventoryItem: string
  artStyle: string
  // START GENDER CONSISTENCY SYSTEM
  gender?: 'male' | 'female'
  // END GENDER CONSISTENCY SYSTEM
}

// START IMAGE IMPROVEMENT
// ─── Composition: three-quarter body, portrait-focused ───────────────────────
// 3/4 body (head to knees) outperforms full-body for a GM tool because:
// - more pixels dedicated to face, eyes, race features, armor details
// - fewer anatomy errors (feet/legs are hardest for models to render)
// - better face quality and race recognition
// - cleaner compositions
const COMPOSITION_FIRST =
  'THREE-QUARTER BODY PORTRAIT. CHARACTER VISIBLE FROM HEAD TO KNEES. ' +
  'PORTRAIT-FOCUSED COMPOSITION. HIGH FACIAL DETAIL. EXPRESSIVE EYES. ' +
  'DETAILED FACE. CLEAR SPECIES FEATURES. VISIBLE HANDS. VISIBLE TORSO. ' +
  'BELT AND EQUIPMENT VISIBLE. WEAPONS VISIBLE. ARMOR VISIBLE. ' +
  'NO CLOSE-UP. NO HEADSHOT. NO BUST ONLY. NO FACE CROP. ' +
  'NO FULL BODY REQUIRED. HEAD TO KNEES IS IDEAL.'

// Exported so API routes can inject into the negative prompt
export const NEGATIVE_COMPOSITION =
  'close-up portrait, face only, headshot, bust only, cropped body, cropped at waist, ' +
  'missing torso, missing hands, portrait crop, zoomed face, head only, shoulders only'
// END IMAGE IMPROVEMENT

// START GENDER CONSISTENCY SYSTEM
// Gender descriptors placed at prompt position 3 (after composition + face quality,
// before species). This anchors the model's gender decision before race and class
// can produce ambiguous results.
export const GENDER_VISUAL: Record<'male' | 'female', string> = {
  male:
    'male fantasy character. male facial structure. masculine face. ' +
    'male adventurer. male figure. clearly male.',
  female:
    'female fantasy character. female facial structure. feminine face. ' +
    'female adventurer. female figure. clearly female.',
}
// END GENDER CONSISTENCY SYSTEM

// START FACE QUALITY SYSTEM
// Face is the highest priority element — prompt position 2, immediately after
// composition. For a GM tool the character's face and eyes matter more than
// their armor, weapons or boots.
const FACE_QUALITY_POSITIVE =
  'portrait quality face. extremely detailed eyes. sharp eyes. symmetrical eyes. ' +
  'highly detailed facial features. expressive realistic eyes. ' +
  'character concept art face. beautiful fantasy portrait. ' +
  'professional fantasy illustration. studio quality character portrait. ' +
  'focus on face and eyes. face is the focal point. ' +
  'award winning fantasy portrait. ' +
  'strong facial structure. believable face. memorable character design. ' +
  'clear readable expression. cinematic portrait lighting on face'

export const FACE_QUALITY_NEGATIVE =
  'cross eyed, lazy eye, asymmetrical eyes, deformed eyes, misaligned pupils, ' +
  'blurry eyes, bad eyes, distorted face, mutated face, low quality face, ' +
  'poor facial anatomy, unfocused eyes, double pupils, extra eyes, ' +
  'ugly face, deformed face, malformed face, wrong eye alignment, ' +
  'dead eyes, lifeless expression, asymmetrical face, bad anatomy face'
// END FACE QUALITY SYSTEM

export function generateImagePrompt(input: PromptInput): string {
  // START IMAGE IMPROVEMENT + START SPECIES VISUAL SYSTEM + START CLASS VISUAL SYSTEM + START FACE QUALITY SYSTEM + START GENDER CONSISTENCY SYSTEM
  // Prompt order: 1.Composition → 2.Face quality → 3.Gender → 4.Species → 5.Class → 6.Style → 7.Details
  const { name, species, characterClass, background, appearance, inventoryItem, gender } = input
  const raceDesc      = RACE_EN[species]          ?? 'fantasy humanoid'
  const classDesc     = CLASS_EN[characterClass]  ?? 'adventurer with layered fantasy clothing'
  const speciesData   = SPECIES_VISUAL_PRIORITY[species] ?? SPECIES_VISUAL_PRIORITY_EN[species]
  const speciesVisual = speciesData?.visual ?? raceDesc
  const speciesNeg    = speciesData?.negative ?? ''
  const classVisual   = CLASS_VISUAL_PRIORITY[characterClass]
                     ?? CLASS_VISUAL_PRIORITY_EN[characterClass]
                     ?? classDesc
  const genderVisual  = gender ? GENDER_VISUAL[gender] : ''
  const sceneDesc     = BACKGROUND_SCENE_EN[background] ?? 'detailed cinematic fantasy environment'

  return [
    // 1. COMPOSITION
    COMPOSITION_FIRST,
    // 2. FACE QUALITY
    FACE_QUALITY_POSITIVE,
    // 3. GENDER — anchors before species/class can create ambiguity
    genderVisual,
    // 4. SPECIES
    speciesVisual,
    // 5. CLASS IDENTITY
    classVisual,
    // 6. STYLE anchor
    'Dungeons and Dragons 2024 sourcebook illustration. Professional fantasy RPG NPC illustration.',
    // 7. CHARACTER + SCENE + PERSONAL DETAILS
    `character name: ${name}`,
    `setting: ${sceneDesc}`,
    `MANDATORY VISUAL DETAILS: ${appearance}. Must be clearly visible, especially face accessories, scars, tattoos, unusual eyes, hair, hands and signature clothing.`,
    `MANDATORY SIGNATURE ITEM: ${inventoryItem}, clearly visible and held or worn by the character`,
    // 8. QUALITY
    'natural asymmetric pose, clear readable silhouette',
    'rich atmospheric environment, immersive fantasy background',
    'lived-in costume, layered garments, weathered leather, embroidered cloth, metal fittings, worn straps, pouches, scuffs and patina',
    'detailed hands, realistic anatomy, cinematic natural light, atmospheric depth',
    CINEMATIC_STYLE,
    'sharp focus, painterly realism, no text, no letters, no UI, no frame, no border, no watermark, no logo',
    // 9. SPECIES NEGATIVES
    speciesNeg ? `NOT: ${speciesNeg}` : '',
  ].filter(Boolean).join(', ')
  // END IMAGE IMPROVEMENT / END SPECIES VISUAL SYSTEM / END CLASS VISUAL SYSTEM / END FACE QUALITY SYSTEM / END GENDER CONSISTENCY SYSTEM
}

export function generateOpenAIPrompt(input: PromptInput): string {
  // START GENDER CONSISTENCY SYSTEM + START IMAGE IMPROVEMENT
  const { name, species, characterClass, background, appearance, inventoryItem, gender } = input
  const raceDesc      = RACE_EN[species]          ?? 'fantasy humanoid'
  const speciesData   = SPECIES_VISUAL_PRIORITY[species] ?? SPECIES_VISUAL_PRIORITY_EN[species]
  const speciesVisual = speciesData?.visual ?? raceDesc
  const speciesNeg    = speciesData?.negative ?? ''
  const classVisual   = CLASS_VISUAL_PRIORITY[characterClass]
                     ?? CLASS_VISUAL_PRIORITY_EN[characterClass]
                     ?? (CLASS_EN[characterClass] ?? 'adventurer')
  const genderVisual  = gender ? GENDER_VISUAL[gender] : ''
  const sceneDesc     = BACKGROUND_SCENE_EN[background] ?? 'detailed cinematic fantasy environment'

  return (
    // 1. Composition
    `THREE-QUARTER BODY PORTRAIT. CHARACTER VISIBLE FROM HEAD TO KNEES. ` +
    `PORTRAIT-FOCUSED COMPOSITION. NO CLOSE-UP. NO HEADSHOT. NO BUST ONLY. NO FACE CROP. ` +
    // 2. Face quality
    `${FACE_QUALITY_POSITIVE} ` +
    // 3. Gender
    (genderVisual ? `${genderVisual} ` : '') +
    // 4. Species
    `${speciesVisual} ` +
    // 5. Class
    `${classVisual} ` +
    // 5. Style + character
    `Create a vertical 4:5 Dungeons and Dragons 2024 sourcebook illustration of ${name}. ` +
    `Setting: ${sceneDesc}. ` +
    `MANDATORY VISUAL DETAILS: ${appearance}. Clearly visible, especially face accessories, scars, tattoos, unusual eyes, hair, hands and signature clothing. ` +
    `MANDATORY SIGNATURE ITEM: ${inventoryItem}, clearly visible and held or worn by the character. ` +
    `Visible weapons, visible armor, visible belt pouches, visible accessories. ` +
    `Natural asymmetric pose. Clear readable silhouette. ` +
    `Style: ${CINEMATIC_STYLE}. ` +
    `Lived-in costume layers, weathered leather, embroidered cloth, metal fittings, pouches, scuffs and patina. ` +
    `Cinematic natural light, realistic materials, rich depth. ` +
    (speciesNeg ? `Do NOT depict as: ${speciesNeg}. ` : '') +
    `No text, no letters, no UI, no frame, no watermark, no modern objects.`
  )
  // END IMAGE IMPROVEMENT / END SPECIES VISUAL SYSTEM / END CLASS VISUAL SYSTEM / END FACE QUALITY SYSTEM
}

export function getPollinationsUrl(prompt: string, quality: 'fast' | 'high' = 'fast', forceNew = false, name?: string): string {
  const size = quality === 'high'
    ? { width: 1024, height: 1280 }
    : { width: 768,  height: 960 }
  const encoded = encodeURIComponent(prompt)
  const seed = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`
  const directUrl = `https://image.pollinations.ai/prompt/${encoded}?width=${size.width}&height=${size.height}&nologo=true&seed=${seed}&model=sana&enhance=false&safe=true&cache=${forceNew ? 'false' : 'true'}`
  const filename = name
    ? encodeURIComponent(name.replace(/\s+/g, '-').toLowerCase() + '.jpg')
    : 'portrait.jpg'
  return `/api/portrait?url=${encodeURIComponent(directUrl)}&filename=${filename}`
}
