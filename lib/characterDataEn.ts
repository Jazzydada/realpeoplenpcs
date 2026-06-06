// English character data pools — mirrors the structure of characterData.ts

export const RACES_EN = [
  'Human',
  'Aasimar',
  'Dragonborn',
  'Mountain Dwarf',
  'Hill Dwarf',
  'High Elf',
  'Wood Elf',
  'Dark Elf',
  'Forest Gnome',
  'Rock Gnome',
  'Goliath',
  'Lightfoot Halfling',
  'Stout Halfling',
  'Orc',
  'Tiefling',
]

// Map from Danish internal key → English display name
export const RACE_DA_TO_EN: Record<string, string> = {
  'Menneske':              'Human',
  'Aasimar':               'Aasimar',
  'Dragonborn':             'Dragonborn',
  'Bjergdværg':            'Mountain Dwarf',
  'Bakkedværg':            'Hill Dwarf',
  'Højalv':                'High Elf',
  'Skovsalv':              'Wood Elf',
  'Mørkalv':               'Dark Elf',
  'Skovgnome':             'Forest Gnome',
  'Stengnome':             'Rock Gnome',
  'Goliath':               'Goliath',
  'Halvling (Lyshjerte)':  'Lightfoot Halfling',
  'Halvling (Stouthjerte)':'Stout Halfling',
  'Ork':                   'Orc',
  'Tiefling':              'Tiefling',
}

export const CLASSES_EN = [
  'Rogue', 'Bard', 'Fighter', 'Wizard', 'Cleric',
  'Ranger', 'Paladin', 'Warlock', 'Monk', 'Druid',
]

// Map from Danish class key → English display name
export const CLASS_DA_TO_EN: Record<string, string> = {
  'Slyngel':   'Rogue',
  'Barde':     'Bard',
  'Kriger':    'Fighter',
  'Troldmand': 'Wizard',
  'Præst':     'Cleric',
  'Jæger':     'Ranger',
  'Paladin':   'Paladin',
  'Warlock':   'Warlock',
  'Munk':      'Monk',
  'Druide':    'Druid',
}

export const BACKGROUNDS_EN = [
  'Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Outlander',
  'Sage', 'Soldier', 'Hermit', 'Sailor', 'Entertainer',
  'Guild Artisan', 'Charlatan', 'Urchin', 'Haunted One',
  'Far Traveler', 'Knight', 'Spy', 'City Bounty Hunter',
]

export const BACKGROUND_DA_TO_EN: Record<string, string> = {
  'Akolytt':            'Acolyte',
  'Kriminel':           'Criminal',
  'Folkehelt':          'Folk Hero',
  'Adelsperson':        'Noble',
  'Naturbarn':          'Outlander',
  'Lærde':              'Sage',
  'Soldat':             'Soldier',
  'Eneboer':            'Hermit',
  'Sømand':             'Sailor',
  'Underholder':        'Entertainer',
  'Håndværker':         'Guild Artisan',
  'Charlatan':          'Charlatan',
  'Gadebarn':           'Urchin',
  'Hjemsøgt':           'Haunted One',
  'Fremmed Rejsende':   'Far Traveler',
  'Ridder':             'Knight',
  'Spion':              'Spy',
  'Byens Dusørjæger':   'City Bounty Hunter',
}

export const ALIGNMENTS_EN = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
]

export const ALIGNMENT_DA_TO_EN: Record<string, string> = {
  'Lovfuld God':     'Lawful Good',
  'Neutral God':     'Neutral Good',
  'Kaotisk God':     'Chaotic Good',
  'Lovfuld Neutral': 'Lawful Neutral',
  'Sand Neutral':    'True Neutral',
  'Kaotisk Neutral': 'Chaotic Neutral',
  'Lovfuld Ond':     'Lawful Evil',
  'Neutral Ond':     'Neutral Evil',
  'Kaotisk Ond':     'Chaotic Evil',
}

// Personality traits keyed by Danish class name (internal key)
export const PERSONALITY_TRAITS_EN: Record<string, string[]> = {
  'Slyngel': [
    'I always have a backup plan when things go wrong.',
    'I remain calm no matter the situation — it is a habit I have cultivated.',
    'The first thing I do in any new room is locate the exits.',
    'I am relentlessly optimistic, no matter the odds.',
  ],
  'Barde': [
    'I fall in love easily and am always chasing a new heart.',
    'My mood shifts as quickly as the key of a song.',
    'I have a joke for every occasion — even the inappropriate ones.',
    'Flattery is my preferred tool for getting what I want.',
  ],
  'Kriger': [
    'I have lost too many friends and am slow to trust new ones.',
    'I have a war story for every situation.',
    'I can stare down a hell hound without flinching.',
    'I am always polite and respectful, even to my enemies.',
  ],
  'Troldmand': [
    'I use long words to appear more learned than I am.',
    'There is nothing I love more than a good unsolved mystery.',
    'I am accustomed to helping those who are not as clever as I am.',
    'I am willing to hear all sides of an argument — then I explain why I am right.',
  ],
  'Præst': [
    'I see omens in every event and every action.',
    'I quote sacred texts and proverbs in almost every situation.',
    'I am tolerant of other faiths and deities.',
    'I have spent so long in the temple that ordinary people feel foreign to me.',
  ],
  'Jæger': [
    'I watch over my friends as a mother watches her young.',
    'I have a lesson for every situation, drawn from nature.',
    'I am slow to trust those from other peoples and tribes.',
    'I am far more at ease in the wilderness than in civilisation.',
  ],
  'Paladin': [
    'I judge people by their actions, not their words.',
    'When someone is in need, I am always ready to lend a hand.',
    'When I commit to something, I follow through no matter the cost.',
    'I have a strong sense of justice and always seek the fairest solution.',
  ],
  'Warlock': [
    'I never speak of the one who granted me my power.',
    'I read and memorise poetry in quiet moments.',
    'I am a hopeless romantic searching for the one.',
    'I collect trinkets — fiddling with them obsessively — and sometimes break them.',
  ],
  'Munk': [
    'I can find common ground between even the bitterest of enemies.',
    'I find beauty in everything — art, nature, even ugliness.',
    'I meditate for two hours at dawn and dusk, no matter what.',
    'I am slow to anger, but righteously furious when it comes.',
  ],
  'Druide': [
    'I feel more at home with animals than with people.',
    'The natural world is more real to me than gods or kings.',
    'I am horrified by the destruction I have seen nature suffer.',
    'I have no respect for the wealthy and well-bred.',
  ],
}

export const IDEALS_EN: Record<string, string[]> = {
  'Slyngel': [
    'Freedom — chains are made to be broken, as are those who forge them. (Chaotic)',
    'Greed — I will do whatever it takes to become rich. (Evil)',
    'People — I am loyal to my friends, not to any ideal. (Neutral)',
    'Justice — no one is above the law. (Lawful)',
  ],
  'Barde': [
    'Creativity — the world needs new ideas and bold actions. (Chaotic)',
    'Honesty — art should come from within and reflect the true soul. (Neutral)',
    'Beauty — when I perform, I make the world better than it was. (Good)',
    'Destiny — nothing and no one can keep me from my calling. (Neutral)',
  ],
  'Kriger': [
    "The Greater Good — it is each person's duty to lay down their life for others. (Good)",
    'Might — the strongest are meant to rule. (Lawful)',
    'Independence — blindly following orders is a form of tyranny. (Chaotic)',
    'Word of Honour — I never break my word, whatever the cost. (Lawful)',
  ],
  'Troldmand': [
    'Knowledge — the path to power and self-improvement is through study. (Neutral)',
    'Logic — emotions must not cloud rational thought. (Lawful)',
    'Discovery — no price is too high for new knowledge. (Neutral)',
    'Power — knowledge is the road to dominance. (Evil)',
  ],
  'Præst': [
    'Tradition — the ancient rites and customs preserve the order of the world. (Lawful)',
    'Charity — I always help those in need, whatever the cost. (Good)',
    'Change — we must help the gods reshape the world. (Chaotic)',
    "Power — I hope to rise to the top of my faith's hierarchy. (Lawful)",
  ],
  'Jæger': [
    'Nature — the world was here before us and will outlast us. (Neutral)',
    'Self-Reliance — I rely only on myself. Others slow me down. (Chaotic)',
    'Honour — to dishonour myself is to dishonour my clan. (Lawful)',
    'Justice — the law applies to everyone, including the powerful. (Lawful)',
  ],
  'Paladin': [
    'Responsibility — I do what I must and bear the consequences. (Lawful)',
    'Respect — people deserve to be treated with dignity. (Good)',
    'Honour — never a lie, never a broken oath. (Lawful)',
    'Redemption — there is a spark of good in everyone. (Good)',
  ],
  'Warlock': [
    'Knowledge — I seek forbidden lore and arcane secrets. (Neutral)',
    'Power — the end justifies the means. (Evil)',
    'Freedom — no pact is forever. All contracts can be broken. (Chaotic)',
    'Transgression — nothing satisfies me more than breaking a taboo. (Chaotic)',
  ],
  'Munk': [
    "Community — it is everyone's duty to strengthen the bonds that hold us together. (Lawful)",
    'Balance — I seek equilibrium between body, mind, and soul. (Neutral)',
    'Self-Knowledge — know thyself, and there is nothing left to know. (Neutral)',
    'Compassion — strength is only noble when used to protect. (Good)',
  ],
  'Druide': [
    'Nature — the natural world matters more than all the constructs of civilisation. (Neutral)',
    'Balance — nature must be kept in balance — at any cost. (Neutral)',
    'Caution — nature is not your friend. Tread lightly. (Neutral)',
    'Freedom — no one rules over me. (Chaotic)',
  ],
}

export const BONDS_EN: Record<string, string[]> = {
  'Slyngel': [
    'Something important was taken from me, and I intend to steal it back.',
    'I will become the greatest thief who ever lived.',
    'My ill-gotten gains go to support my family.',
    'An artefact binds me to my destiny.',
  ],
  'Barde': [
    'I will be famous — whatever it takes.',
    'I idolise a hero from the old stories and measure my deeds against theirs.',
    'I owe my mentor everything for making me who I am.',
    'My art is a monument to those I have loved and lost.',
  ],
  'Kriger': [
    'I fight for those who cannot fight for themselves.',
    'Those who fight beside me are worth dying for.',
    'I lost my unit to a terrible magic. I will destroy any such threat I find.',
    'My hometown is my foundation — I fight for it.',
  ],
  'Troldmand': [
    'I am in love with a scholar who shares my interests but lives far away.',
    'I work to preserve a great library or monastery.',
    "My life's work is a series of tomes on a particular field of knowledge.",
    'I have spent my whole life searching for the answer to one specific question.',
  ],
  'Præst': [
    'I would die to recover a holy relic that was stolen from me.',
    'I owe my life to the priest who took me in when my parents died.',
    'Everything I do is for the common people.',
    'I will one day avenge the injustice that drove me from my order.',
  ],
  'Jæger': [
    'My family, clan, or tribe is the most important thing in my life.',
    'An injury to the unspoiled wilderness is an injury to me.',
    'I protect those who cannot protect themselves.',
    'The forest I guard is sacred to me.',
  ],
  'Paladin': [
    'I will face any trial to uphold my oath.',
    'I protect those who cannot protect themselves.',
    'My honour is my life.',
    'I owe everything to my mentor — a renowned paladin who has since fallen from grace.',
  ],
  'Warlock': [
    "I am the last of my patron's chosen and must fulfil the destiny alone.",
    'I made a bargain I now regret, and I seek a way to break it.',
    'My patron saved my life. The debt is infinite.',
    'I seek the secrets of the cosmos — whatever the cost.',
  ],
  'Munk': [
    'I will do anything to protect the monastery I grew up in.',
    'I still seek the enlightenment I strove for in my monastic life.',
    'My isolation gave me insight into a great evil that only I can destroy.',
    'The teacher who shaped me still lives — and deserves my gratitude.',
  ],
  'Druide': [
    'I am haunted by terrible visions of an approaching calamity and will do anything to prevent it.',
    'I protect the forest near my home at any cost.',
    'The ancient spirits who speak through me guide my every step.',
    'My home grove was destroyed, and I will find and punish those responsible.',
  ],
}

export const FLAWS_EN: Record<string, string[]> = {
  'Slyngel': [
    'Gold and wealth tempt me more than my honour allows.',
    'When faced with a choice between money and friends, I usually choose the money.',
    'I turn and run when things look bad.',
    'An innocent person sits in jail for a crime I committed. That is fine.',
  ],
  'Barde': [
    'I do anything to win fame and recognition.',
    'I fall for every pretty face.',
    'A scandal prevents me from ever going home.',
    'I once satirised a noble who still wants my head.',
  ],
  'Kriger': [
    'The monstrous enemy we faced in battle still leaves me trembling with fear.',
    'I have little respect for anyone who is not a proven warrior.',
    'I made a terrible mistake in battle that cost many lives — and I will do anything to keep it hidden.',
    'My pride may ultimately be my undoing.',
  ],
  'Troldmand': [
    "I speak without thinking and often hurt people's feelings.",
    'I cannot keep a secret to save my life.',
    'I will do anything to get my hands on something rare or significant.',
    'Unlocking an ancient mystery is worth the price of a civilisation.',
  ],
  'Præst': [
    'I am suspicious of strangers and expect the worst of them.',
    'I have a weakness for the vices of the city, especially strong drink.',
    'Once I start drinking, it is hard to stop.',
    'I place too much faith in those who hold power in the temple hierarchy.',
  ],
  'Jæger': [
    'Violence is my answer to almost every challenge.',
    'Do not expect me to save those who cannot save themselves.',
    'I am quick to assume the worst about people.',
    'I am far too fond of ale, wine, and other intoxicants.',
  ],
  'Paladin': [
    'I am suspicious of strangers and expect the worst of them.',
    'Once I set my mind to something, I become obsessed with it at the expense of everything else.',
    'Deep down I believe that if I made all the decisions, things would go better.',
    'My hatred of my enemies is blind and without reason.',
  ],
  'Warlock': [
    'If there is a plan, I will forget it.',
    'I am paranoid — I expect betrayal from everyone.',
    'I collect a souvenir from every corpse I leave behind.',
    'There is no wrong way to acquire power.',
  ],
  'Munk': [
    'I am dogmatic in my beliefs and philosophy.',
    'I let my need to win arguments override friendship and harmony.',
    'I am never satisfied with what I have — I always want more.',
    'I am rigid in my thinking and adapt poorly.',
  ],
  'Druide': [
    'I am slow to trust those of other races, tribes, and communities.',
    'I am completely oblivious to etiquette and social expectations.',
    'I respect no authority but my own grove.',
    'I am too forgiving — even to those who harm me.',
  ],
}

export const ADVENTURE_HOOKS_EN = [
  'A noble letter arrived at the wrong tavern — bearing your name and a sealed royal writ.',
  'You woke one morning with a mark on your palm: a symbol you have never seen, yet somehow recognise.',
  'Three separate merchants have offered you the same cursed artefact, each claiming never to have met the others.',
  'Someone burned your childhood home. The only thing left standing was a door leading nowhere.',
  'You have dreamed the same dream about a dungeon you have never entered — yet you know where every trap is.',
  'A dying stranger pressed a key into your hand and whispered: "Do not let them have the third vault."',
  'Every mirror in the last three towns shows your reflection exactly one second behind.',
  "You owe a thieves' guild a debt. They have just called it in.",
  'A god spoke to you in a dream. It was not your god.',
  'You survived an ambush that killed the rest of your party. Someone was warned — and it was not you.',
  'An old prophecy contains three names. Yours is the second.',
  'The creature you were paid to kill begs for its life and claims to know your true origins.',
]

export const COMPANIONS_EN: (string | null)[] = [
  null, null, null,
  'a one-eyed raven that speaks in rhyme',
  'a tiny stone golem no bigger than a fist',
  'a battle-scarred ferret named Spite',
  'a blind owl with silver eyes',
  'a small dragonling with singed scales',
  'a hairless cat with a split tail',
  'a frog that croaks warnings',
  'a mechanical mouse that maps explored terrain',
  'a faerie dragon the size of a butterfly',
  'a weasel trained to pickpocket',
  'a crow that can mimic any voice it has heard',
]

export const INVENTORY_ITEMS_EN = [
  'a dagger carved from a dragon tooth',
  'a spellbook bound in black leather and sealed with silver',
  'a lute strung with silver wire',
  'a holy symbol that never loses its shine',
  'a bottle of aged dwarven whiskey',
  'a set of loaded dice',
  'an explorer\'s map with one location scratched out',
  'a vial of basilisk blood',
  'thieves\' tools wrapped in oiled cloth',
  'a war horn carved from bone',
  'a silk blindfold said to grant true sight',
  'a pouch of dried healing herbs',
  'a polished obsidian mirror',
  'a ring that whispers names of the dead',
  'pressed wildflowers from a burned village',
  'a shrunken head that occasionally blinks',
  'a compass that always points toward gold',
  'a worn diary full of cryptic writing',
  'a glove taken from a fallen paladin',
  'enchanted playing cards used for divination',
]
