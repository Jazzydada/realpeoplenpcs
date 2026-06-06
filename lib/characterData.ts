// START DND2024 SPECIES UPDATE
// ─── Races (D&D 2024 Player's Handbook Core Species) ─────────────────────────
export const RACES = [
  'Menneske',
  'Aasimar',
  'Dragonborn',
  'Bjergdværg',
  'Bakkedværg',
  'Højalv',
  'Skovsalv',
  'Mørkalv',
  'Skovgnome',
  'Stengnome',
  'Goliath',
  'Halvling (Lyshjerte)',
  'Halvling (Stouthjerte)',
  'Ork',
  'Tiefling',
]

export const RACIAL_BONUSES: Record<string, string> = {
  'Menneske':             '+1 alle evner · Heltemod (Inspiration 1/dag)',
  'Aasimar':              '+2 Karisma · Helbredende hænder · Lysemission',
  'Dragonborn':            '+2 Styrke, +1 Karisma · Drageånde (2d6)',
  'Bjergdværg':           '+2 Konstitution, +1 Styrke · Dværgerstathed',
  'Bakkedværg':           '+2 Konstitution, +1 Visdom · Dværgerehardighed',
  'Højalv':               '+2 Smidighed, +1 Intelligens · Arkaisk magi (trylleformular)',
  'Skovsalv':             '+2 Smidighed, +1 Visdom · Hurtig til fods (35 ft)',
  'Mørkalv':              '+2 Smidighed, +1 Karisma · Medfødt mørkesynsmagi',
  'Skovgnome':            '+2 Intelligens, +1 Smidighed · Illusionsmagi',
  'Stengnome':            '+2 Intelligens, +1 Konstitution · Kunstnerisk tilbøjelighed',
  'Goliath':              '+2 Styrke, +1 Konstitution · Stenkraft · Bjergstigen',
  'Halvling (Lyshjerte)': '+2 Smidighed · Lykkebarn (genrul ét 1-tal)',
  'Halvling (Stouthjerte)':'+2 Smidighed, +1 Konstitution · Stout Modstandsdygtighed',
  'Ork':                  '+2 Styrke, +1 Konstitution · Udholdende · Kraftig bygning',
  'Tiefling':             '+2 Karisma, +1 Intelligens · Infernal Arv · Mørkesyn',
}
// END DND2024 SPECIES UPDATE

// ─── Classes ──────────────────────────────────────────────────────────────────
export const CLASSES = [
  'Slyngel', 'Barde', 'Kriger', 'Troldmand', 'Præst',
  'Jæger', 'Paladin', 'Warlock', 'Munk', 'Druide',
]

export const CLASS_INFO: Record<string, { hitDie: string; primaryAbility: string }> = {
  'Slyngel':     { hitDie: 'd8',  primaryAbility: 'Smidighed' },
  'Barde':       { hitDie: 'd8',  primaryAbility: 'Karisma' },
  'Kriger':      { hitDie: 'd10', primaryAbility: 'Styrke' },
  'Troldmand':   { hitDie: 'd6',  primaryAbility: 'Intelligens' },
  'Præst':       { hitDie: 'd8',  primaryAbility: 'Visdom' },
  'Jæger':       { hitDie: 'd10', primaryAbility: 'Smidighed' },
  'Paladin':     { hitDie: 'd10', primaryAbility: 'Styrke' },
  'Warlock': { hitDie: 'd8',  primaryAbility: 'Karisma' },
  'Munk':        { hitDie: 'd8',  primaryAbility: 'Smidighed' },
  'Druide':      { hitDie: 'd8',  primaryAbility: 'Visdom' },
}

export const CLASS_ACCENT_COLORS: Record<string, string> = {
  'Slyngel':     '#100d08',
  'Barde':       '#0e0b14',
  'Kriger':      '#0a0e16',
  'Troldmand':   '#0a0a18',
  'Præst':       '#110e08',
  'Jæger':       '#0a1008',
  'Paladin':     '#100c08',
  'Warlock': '#0d0814',
  'Munk':        '#0a0e12',
  'Druide':      '#0a1008',
}

// ─── Backgrounds ──────────────────────────────────────────────────────────────
export const BACKGROUNDS = [
  'Akolytt', 'Kriminel', 'Folkehelt', 'Adelsperson', 'Naturbarn',
  'Lærde', 'Soldat', 'Eneboer', 'Sømand', 'Underholder',
  'Håndværker', 'Charlatan', 'Gadebarn', 'Hjemsøgt',
  'Fremmed Rejsende', 'Ridder', 'Spion', 'Byens Dusørjæger',
]

// ─── Alignments ───────────────────────────────────────────────────────────────
export const ALIGNMENTS = [
  'Lovfuld God', 'Neutral God', 'Kaotisk God',
  'Lovfuld Neutral', 'Sand Neutral', 'Kaotisk Neutral',
  'Lovfuld Ond', 'Neutral Ond', 'Kaotisk Ond',
]

export const ART_STYLES = ['painterly', 'dark', 'heroic', 'gritty', 'ethereal'] as const

// START DND2024 SPECIES UPDATE
// ─── Names (D&D 2024 PHB Species) ─────────────────────────────────────────────
// START GENDER CONSISTENCY SYSTEM
// Names split into male/female pools per race.
// Shared last names are the same for both genders.
export const NAMES_MALE: Record<string, { first: string[]; last: string[] }> = {
  'Menneske':             { first: ['Aldric', 'Caelan', 'Dorian', 'Edric', 'Garrett', 'Roland', 'Henrik', 'Theron', 'Bram', 'Marcus', 'Aldus', 'Corvin', 'Darian', 'Emeric', 'Faolan'], last: ['Ashford', 'Blackwood', 'Crane', 'Dawnridge', 'Evermore', 'Fairfax', 'Greystone', 'Holloway', 'Ironwood', 'Kingsley', 'Locke', 'Marsh'] },
  'Aasimar':              { first: ['Caelum', 'Theron', 'Ardael', 'Vael', 'Cassiel', 'Auriel', 'Solaren', 'Elyon', 'Radael', 'Lithonel'], last: ['Dawnborn', 'Lightweaver', 'Holyblood', 'Starmantle', 'Radiantborn', 'Celestine'] },
  'Dragonborn':            { first: ['Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv', 'Medrash', 'Nadarr', 'Rhogar', 'Tarhun', 'Torinn'], last: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Fenkenkabradon', 'Kimbatuul', 'Norixius', 'Ophinshtalajiir'] },
  'Bjergdværg':           { first: ['Aldus', 'Bofri', 'Darrak', 'Eberk', 'Fargrim', 'Harbek', 'Kildrak', 'Tordek', 'Veit', 'Rurik', 'Bromdar', 'Odran', 'Thordin'], last: ['Anvil', 'Deepdelve', 'Grimhammer', 'Mountainborn', 'Stonewall', 'Thunderpeak', 'Ironfist', 'Rockseam', 'Stonebrow', 'Deepforge'] },
  'Bakkedværg':           { first: ['Baldrak', 'Gimbal', 'Kordor', 'Orsik', 'Thoradin', 'Baern', 'Darren', 'Flint', 'Grubben', 'Nurdrak'], last: ['Battlehammer', 'Boulderfoot', 'Cragborn', 'Deepaxe', 'Fireforge', 'Ironmantle', 'Loderr', 'Torunn'] },
  'Højalv':               { first: ['Caladrel', 'Fenrith', 'Halatir', 'Kaelis', 'Paeris', 'Arandur', 'Eradan', 'Gaelindor', 'Ilphas', 'Laerindel', 'Tharivol', 'Valandil'], last: ['Brightmantle', 'Dawnwhisper', 'Evenstar', 'Frostweave', 'Goldenleaf', 'Sunsong', 'Moonwhisper', 'Starweave', 'Silverthread'] },
  'Skovsalv':             { first: ['Donneth', 'Enialis', 'Galinndan', 'Hadarai', 'Rolen', 'Ivellios', 'Mindartis', 'Paelias', 'Quarion', 'Adran', 'Erdan', 'Gennal', 'Laucian'], last: ['Amakiir', 'Galanodel', 'Holimion', 'Liadon', 'Nailo', 'Siannodel', 'Sylvari', 'Xiloscient'] },
  'Mørkalv':              { first: ['Abraxas', 'Zaknafein', 'Ryld', 'Drizzt', 'Jarlaxle', 'Pharaun', 'Nalfein', 'Gromph', 'Valas', 'Xullrae'], last: ["Do'Urden", 'Baenre', 'Mizzrym', 'Oblodra', 'Tormtor', "Despana"] },
  'Skovgnome':            { first: ['Adan', 'Cedar', 'Fern', 'Linden', 'Moss', 'Oak', 'Rowan', 'Thistle', 'Alby', 'Birch', 'Elmy', 'Hazel', 'Sorrel'], last: ['Acornhat', 'Bramblethorn', 'Cobblepath', 'Dewcatcher', 'Leafwhisper', 'Muddybrook', 'Pinecone', 'Thornberry'] },
  'Stengnome':            { first: ['Alston', 'Alvyn', 'Boddynock', 'Dimble', 'Erky', 'Fonkin', 'Gerbo', 'Gimble', 'Jebeddo', 'Namfoodle', 'Orryn', 'Roondar'], last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Ningel', 'Raulnor', 'Turen'] },
  'Goliath':              { first: ['Aukan', 'Eglath', 'Gauthak', 'Ilikan', 'Keothi', 'Lo-Kag', 'Manneo', 'Maveith', 'Paavu', 'Uthal', 'Gae-Al', 'Kuori'], last: ['Anakalathai', 'Elanithino', 'Gathakanathi', 'Kalagiano', 'Thuliaga', 'Thunukalathi', 'Vaimei-Laga'] },
  'Halvling (Lyshjerte)': { first: ['Pip', 'Milo', 'Tobias', 'Finnan', 'Jasper', 'Osborn', 'Saradas', 'Andwise', 'Beau', 'Drogo', 'Cade', 'Largo', 'Merric', 'Olo', 'Wilby'], last: ['Thornwood', 'Goodbarrel', 'Tealeaf', 'Burrfoot', 'Underbough', 'Brightwater', 'Brushgather', 'Dustyfoot', 'Greenbanks'] },
  'Halvling (Stouthjerte)':{ first: ['Folco', 'Bram', 'Oswin', 'Clem', 'Hamfast', 'Adalard', 'Eldon', 'Garret', 'Lyle', 'Merric', 'Odo', 'Peregrin', 'Samwise', 'Tobold'], last: ['Thornwood', 'Thistlewick', 'Fernhallow', 'Copperpot', 'Goodbarrel', 'Burrfoot', 'Brandybuck', 'Hearthstone', 'Sandybanks'] },
  'Ork':                  { first: ['Argh', 'Brash', 'Dorn', 'Feng', 'Gell', 'Henk', 'Krusk', 'Mhurren', 'Ront', 'Thokk', 'Braak', 'Gaasc', 'Keth', 'Mogr', 'Vark'], last: ['Bloodaxe', 'Bonecrusher', 'Grimskull', 'Ironblood', 'Skullsmasher', 'Deathmarch', 'Gorestomp', 'Hellbrand', 'Ironjaw'] },
  'Tiefling':             { first: ['Akmenos', 'Amnizu', 'Damakos', 'Iados', 'Kairon', 'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai', 'Carrion', 'Pox', 'Wrath'], last: ['Ashborn', 'Cinderveil', 'Darkmantle', 'Embersoul', 'Shadowblood', 'Voidborn', 'Hellscar', 'Infernus', 'Nightshade', 'Soulburn'] },
}

export const NAMES_FEMALE: Record<string, { first: string[]; last: string[] }> = {
  'Menneske':             { first: ['Mira', 'Seraphina', 'Lyra', 'Vivienne', 'Isolde', 'Cassandra', 'Morgana', 'Elara', 'Evelyn', 'Rowena', 'Celeste', 'Adela', 'Brynn', 'Dara', 'Fiona', 'Gwendolyn'], last: ['Ashford', 'Blackwood', 'Crane', 'Dawnridge', 'Evermore', 'Fairfax', 'Greystone', 'Holloway', 'Ironwood', 'Kingsley', 'Locke', 'Marsh'] },
  'Aasimar':              { first: ['Seraph', 'Zephyrine', 'Luminara', 'Celeste', 'Solène', 'Nephara', 'Eliara', 'Aurielle', 'Caelia', 'Lumineth', 'Seraphel', 'Vaela'], last: ['Dawnborn', 'Lightweaver', 'Holyblood', 'Starmantle', 'Radiantborn', 'Celestine'] },
  'Dragonborn':            { first: ['Akra', 'Biri', 'Mishann', 'Sora', 'Kava', 'Perra', 'Raiann', 'Nala', 'Forah', 'Tamara'], last: ['Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Fenkenkabradon', 'Kimbatuul', 'Norixius', 'Ophinshtalajiir'] },
  'Bjergdværg':           { first: ['Brunhild', 'Gunnloda', 'Mardred', 'Ilde', 'Vistra', 'Dagny', 'Helga', 'Ingrid', 'Sigrid', 'Thyra', 'Astrid', 'Bergit', 'Gudrun'], last: ['Anvil', 'Deepdelve', 'Grimhammer', 'Mountainborn', 'Stonewall', 'Thunderpeak', 'Ironfist', 'Rockseam', 'Stonebrow', 'Deepforge'] },
  'Bakkedværg':           { first: ['Dorinda', 'Hilda', 'Marblida', 'Kathra', 'Artin', 'Anbera', 'Riswynn', 'Torbera', 'Sannl', 'Dotta', 'Gundra', 'Lokki', 'Marta'], last: ['Battlehammer', 'Boulderfoot', 'Cragborn', 'Deepaxe', 'Fireforge', 'Ironmantle', 'Loderr', 'Torunn'] },
  'Højalv':               { first: ['Aelindra', 'Eriadne', 'Gilraen', 'Issilra', 'Liriel', 'Miravel', 'Nyrindel', 'Sylvara', 'Thalindra', 'Vaelindra', 'Zylvara', 'Ariel', 'Caladwen', 'Elenwe', 'Galadriel', 'Irime'], last: ['Brightmantle', 'Dawnwhisper', 'Evenstar', 'Frostweave', 'Goldenleaf', 'Sunsong', 'Moonwhisper', 'Starweave', 'Silverthread'] },
  'Skovsalv':             { first: ['Adrie', 'Birel', 'Caelynn', 'Leshanna', 'Sariel', 'Shava', 'Theirastra', 'Valanthe', 'Zanasha', 'Arannis', 'Naivara', 'Quelenna', 'Rillavar'], last: ['Amakiir', 'Galanodel', 'Holimion', 'Liadon', 'Nailo', 'Siannodel', 'Sylvari', 'Xiloscient'] },
  'Mørkalv':              { first: ['Viconia', 'Liriel', 'Quenthel', 'Triel', 'Phyrra', 'Malice', 'Sylora', 'Vierna', 'Zeerith', 'Akordia', 'Ilivarra', 'Nedylene', 'Seldszar'], last: ["Do'Urden", 'Baenre', 'Mizzrym', 'Oblodra', 'Tormtor', "Despana"] },
  'Skovgnome':            { first: ['Bella', 'Dewdrop', 'Ember', 'Holly', 'Ivy', 'Juniper', 'Petal', 'Wren', 'Ash', 'Clover', 'Daisy', 'Flora', 'Gilly', 'Heather', 'Lily'], last: ['Acornhat', 'Bramblethorn', 'Cobblepath', 'Dewcatcher', 'Leafwhisper', 'Muddybrook', 'Pinecone', 'Thornberry'] },
  'Stengnome':            { first: ['Breena', 'Carlin', 'Ella', 'Lilli', 'Lorilla', 'Mardnab', 'Nissa', 'Roywyn', 'Shamil', 'Tana', 'Ulla', 'Zook'], last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Ningel', 'Raulnor', 'Turen'] },
  'Goliath':              { first: ['Nalla', 'Orilo', 'Pethani', 'Thalai', 'Kuori', 'Eglath', 'Gae-Al', 'Manala', 'Pava', 'Thalae', 'Vola'], last: ['Anakalathai', 'Elanithino', 'Gathakanathi', 'Kalagiano', 'Thuliaga', 'Thunukalathi', 'Vaimei-Laga'] },
  'Halvling (Lyshjerte)': { first: ['Rosie', 'Bella', 'Cora', 'Lily', 'Wren', 'Celandine', 'Ami', 'Callie', 'Cheri', 'Gilda', 'Kethra', 'Lavinia', 'Mabel', 'Nora', 'Pearl'], last: ['Thornwood', 'Goodbarrel', 'Tealeaf', 'Burrfoot', 'Underbough', 'Brightwater', 'Brushgather', 'Dustyfoot', 'Greenbanks'] },
  'Halvling (Stouthjerte)':{ first: ['Daisy', 'Petunia', 'Marigold', 'Nedda', 'Paela', 'Shaena', 'Bree', 'Cella', 'Drina', 'Eida', 'Fia', 'Gilda', 'Isla', 'Lila'], last: ['Thornwood', 'Thistlewick', 'Fernhallow', 'Copperpot', 'Goodbarrel', 'Burrfoot', 'Brandybuck', 'Hearthstone', 'Sandybanks'] },
  'Ork':                  { first: ['Cagak', 'Ekk', 'Hagra', 'Kansif', 'Myev', 'Neega', 'Ovak', 'Shara', 'Varka', 'Yeva', 'Drara', 'Gresh', 'Murga'], last: ['Bloodaxe', 'Bonecrusher', 'Grimskull', 'Ironblood', 'Skullsmasher', 'Deathmarch', 'Gorestomp', 'Hellbrand', 'Ironjaw'] },
  'Tiefling':             { first: ['Asylum', 'Pyrra', 'Zaria', 'Liraz', 'Despair', 'Fear', 'Torment', 'Vex', 'Anakis', 'Bryseis', 'Criella', 'Ea', 'Flavianna', 'Kallista', 'Lerissa', 'Makara'], last: ['Ashborn', 'Cinderveil', 'Darkmantle', 'Embersoul', 'Shadowblood', 'Voidborn', 'Hellscar', 'Infernus', 'Nightshade', 'Soulburn'] },
}

// Keep the original NAMES export for backward compatibility with saved characters
export const NAMES: Record<string, { first: string[]; last: string[] }> = Object.fromEntries(
  Object.keys(NAMES_MALE).map(race => [race, {
    first: [...NAMES_MALE[race].first, ...(NAMES_FEMALE[race]?.first ?? [])],
    last:  NAMES_MALE[race].last,
  }])
)
// END GENDER CONSISTENCY SYSTEM

// END DND2024 SPECIES UPDATE

// ─── Gender-specific appearance details ────────────────────────────────────────
// START GENDER CONSISTENCY SYSTEM — appearance pools
export const APPEARANCE_DETAILS_MALE: Record<string, string[]> = {
  'Menneske': [
    'Et stort ar løber diagonalt over det venstre kindben',
    'Næsen er gebrokkent og sidder lidt skævt',
    'Kort mørkt skæg med et hvidt stribe fra et gammelt sår',
    'Dybt liggende mørke øjne med rynker fra år i solen',
    'Et gammelt bidemærke på halsen fra et dyr',
    'Brede ar på begge håndrygge fra en brandslukning',
    'Massive ar på ryggen fra en kamp med et væsen',
    'Et gyldent tandimplantat der glimter ved hver tale',
    'Tre tatoverede runer på den indre håndled',
    'Et snit over overlæben der aldrig heler helt',
    'Mangler lillefingeren på højre hånd',
    'Hæsning i stemmen fra en gammel halsskade',
  ],
  'default_male': [
    'Et stort ar løber diagonalt over det venstre kindben',
    'Næsen er gebrokkent og sidder lidt skævt',
    'Mangler lillefingeren på højre hånd',
    'Tre tatoverede runer på den indre håndled',
    'Et gammelt bidemærke på halsen fra et dyr',
    'Brede ar på begge håndrygge fra en brandslukning',
    'Et gyldent tandimplantat der glimter ved hver tale',
  ],
}

export const APPEARANCE_DETAILS_FEMALE: Record<string, string[]> = {
  'Menneske': [
    'Et ar over venstre øjenbryn der krummer svagt',
    'Flettet sølvhår med et enkelt mørkt strå imellem',
    'Skarpe grønne øjne med lange mørke øjenvipper',
    'En lille tatoveret halvmåne bag det venstre øre',
    'Mangler ringfingeren på venstre hånd',
    'Hvidgrå stribe i håret siden barndommen',
    'Øjnene skifter farve i stærkt lys',
    'Lyse arkaiske runer lyser svagt langs kravebenet',
    'Et lille ankertegn tatoveret bag det venstre øre',
    'Bark-brune tatoveringer i spiralmønstre langs armene',
    'Fregner langs skuldrene i et usædvanligt mønster',
    'En blodplet-rød plet bag det højre øre',
  ],
  'default_female': [
    'Et ar over venstre øjenbryn der krummer svagt',
    'Flettet sølvhår med et enkelt mørkt strå imellem',
    'Skarpe grønne øjne med lange mørke øjenvipper',
    'En lille tatoveret halvmåne bag det venstre øre',
    'Hvidgrå stribe i håret siden barndommen',
    'Øjnene skifter farve i stærkt lys',
    'Lyse arkaiske runer lyser svagt langs kravebenet',
  ],
}
// END GENDER CONSISTENCY SYSTEM

// ─── Personality Traits (Dansk) ───────────────────────────────────────────────
export const PERSONALITY_TRAITS: Record<string, string[]> = {
  'Slyngel': [
    'Jeg har altid en nødplan klar, når tingene går galt.',
    'Jeg er altid rolig, uanset situationen — det er en vane.',
    'Det første jeg gør i et nyt rum er at notere nødudgangene.',
    'Jeg er overdrevent optimistisk, uanset odds.',
    'Jeg lyver om næsten alt, selv når der ingen grund er.',
  ],
  'Barde': [
    'Jeg forelsker mig hurtigt og jager altid et nyt hjerte.',
    'Jeg skifter humør ligeså hurtigt som jeg skifter toneart.',
    'Jeg har en vittighed til enhver lejlighed, selv de upassende.',
    'Smiger er mit foretrukne middel til at få hvad jeg ønsker.',
    'Ingen forbliver vred på mig længe — jeg har en gave for det.',
  ],
  'Kriger': [
    'Jeg har mistet for mange venner og er langsom til at stole på nye.',
    'Jeg har en krigshistorie til enhver situation.',
    'Jeg kan stirre en djævelehund ned uden at blinke.',
    'Jeg er altid høflig og respektfuld, selv over for fjender.',
    'Jeg handler ikke på mavefornemmelse — jeg venter og observerer.',
  ],
  'Troldmand': [
    'Jeg bruger lange ord for at fremstå mere lærd, end jeg er.',
    'Der er intet bedre end et godt mysterium at rulle op i.',
    'Jeg er vant til at hjælpe dem, der ikke er lige så kloge som mig.',
    'Jeg er villig til at lytte til alle sider af et argument — derefter har jeg ret.',
    'Ingen kan lære mig noget, jeg ikke allerede ved. Næsten.',
  ],
  'Præst': [
    'Jeg ser varsler i enhver hændelse og enhver handling.',
    'Jeg citerer hellige tekster og ordsprog i næsten enhver situation.',
    'Jeg er tolerant over for andre trosretninger og guddomme.',
    'Jeg har tilbragt så lang tid i templet, at folk er fremmede for mig.',
    'Jeg nærer mørke tanker, som min træning hjælper mig med at undertrykke.',
  ],
  'Jæger': [
    'Jeg vogter over mine venner som en mor over unger.',
    'Jeg har en lektie til enhver situation, hentet fra naturen.',
    'Jeg er langsom til at stole på dem fra andre folk og stammer.',
    'Jeg er meget mere i mit es ude i det vilde end i civilisationen.',
    'Jeg stoler på instinkter frem for ord.',
  ],
  'Paladin': [
    'Jeg dømmer folk på deres handlinger, ikke på deres ord.',
    'Når nogen er i nød, er jeg altid klar til at strække en hånd.',
    'Når jeg sætter mig for noget, følger jeg igennem, uanset prisen.',
    'Jeg har en stærk sans for retfærdighed og søger altid den mest rimelige løsning.',
    'Jeg er selvsikker og forsøger at indgyde den selvsikkerhed i andre.',
  ],
  'Warlock': [
    'Jeg taler aldrig om den, der giver mig min magt.',
    'Jeg læser og memorerer poesi i stille stunder.',
    'Jeg er en uhjælpelig romantiker på jagt efter den ene.',
    'Jeg samler på ting — absorberet og finglerer ved dem — og brækker dem undertiden.',
    'Alle hemmeligheder er enten til at udnytte eller til at gemme. Aldrig til at glemme.',
  ],
  'Munk': [
    'Jeg kan finde fælles grund selv mellem de bitreste fjender.',
    'Jeg finder skønhed i alt — kunst, natur, selv det grimme.',
    'Jeg mediterer i to timer ved daggry og solnedgang, uanset hvad.',
    'Jeg er langsom til at vrede, men retfærdigt rasende når det sker.',
    'Kroppen er sindet instrument. Jeg plejer begge med omhu.',
  ],
  'Druide': [
    'Jeg føler mig mere hjemme med dyr end med mennesker.',
    'Den naturlige verden er mere sand for mig end guder eller konger.',
    'Jeg er forfærdet over den ødelæggelse, jeg har set naturen lide.',
    'Jeg har ingen respekt for de velhavende og velopdragede.',
    'Jeg stoler på instinkter frem for bøger.',
  ],
}

// ─── Ideals (Dansk) ───────────────────────────────────────────────────────────
export const IDEALS: Record<string, string[]> = {
  'Slyngel': [
    'Frihed — lænker er skabt til at brydes, ligesom dem der smir dem. (Kaotisk)',
    'Grådighed — jeg vil gøre hvad det end kræver for at blive rig. (Ond)',
    'Folk — jeg er loyal over for mine venner, ikke over for idealer. (Neutral)',
    'Retfærdighed — ingen er hævet over loven. (Lovfuld)',
  ],
  'Barde': [
    'Kreativitet — verden har brug for nye idéer og dristige handlinger. (Kaotisk)',
    'Ærlighed — kunst bør komme indefra og afspejle den virkelige sjæl. (Neutral)',
    'Skønhed — når jeg optræder, gør jeg verden bedre end den var. (God)',
    'Skæbne — intet og ingen kan holde mig fra mit kald. (Neutral)',
  ],
  'Kriger': [
    'Det fælles bedste — vores lod er at lægge vores liv til forsvar for andre. (God)',
    'Magt — de stærkeste er skabt til at herske. (Lovfuld)',
    'Uafhængighed — blindt at følge ordrer er en form for tyranni. (Kaotisk)',
    'Æresord — jeg bryder aldrig mit ord, hvad end det koster. (Lovfuld)',
  ],
  'Troldmand': [
    'Viden — vejen til magt og selvforbedring er gennem kundskab. (Neutral)',
    'Logik — følelser må ikke skygge for rationel tænkning. (Lovfuld)',
    'Opdagelse — ingen pris er for høj for ny viden. (Neutral)',
    'Magt — kundskab er vejen til dominans. (Ond)',
  ],
  'Præst': [
    'Tradition — de gamle skikke og ritualer bevarer verdensordenen. (Lovfuld)',
    'Godgørenhed — jeg hjælper altid dem i nød, uanset prisen. (God)',
    'Forandring — vi skal hjælpe gudernes vilje med at forme verden. (Kaotisk)',
    'Magt — jeg håber at stige til toppen af min tros hierarki. (Lovfuld)',
  ],
  'Jæger': [
    'Natur — verden var her før os og bliver her efter. (Neutral)',
    'Selvtilstrækkelighed — jeg stoler på mig selv. Andre tynger mig ned. (Kaotisk)',
    'Ære — vanærer jeg mig, vanærer jeg min stamme. (Lovfuld)',
    'Retfærdighed — loven gælder alle, også de mægtige. (Lovfuld)',
  ],
  'Paladin': [
    'Ansvar — jeg gør hvad jeg skal og bærer konsekvenserne. (Lovfuld)',
    'Respekt — folk fortjener at blive behandlet med værdighed. (God)',
    'Ære — aldrig løgn, aldrig brud på mit ord. (Lovfuld)',
    'Frelse — der er en gnist af det gode i enhver. (God)',
  ],
  'Warlock': [
    'Viden — jeg søger forbudt lærdom og arkaiske hemmeligheder. (Neutral)',
    'Magt — målet helliger midlet. (Ond)',
    'Frihed — ingen aftale er evig. Alle kontrakter kan brydes. (Kaotisk)',
    'Grænseoverskridelse — intet tilfredsstiller mig mere end at bryde et tabu. (Kaotisk)',
  ],
  'Munk': [
    'Fællesskab — det er alles pligt at styrke de bånd, der holder os sammen. (Lovfuld)',
    'Balance — jeg søger ligevægt mellem krop, sind og sjæl. (Neutral)',
    'Selvkundskab — kender du dig selv, er der intet tilbage at kende. (Neutral)',
    'Omsorg — styrke er kun ædel, når den bruges til at beskytte. (God)',
  ],
  'Druide': [
    'Natur — den naturlige verden er vigtigere end civilisationens konstruktioner. (Neutral)',
    'Balance — naturen skal holdes i balance — for enhver pris. (Neutral)',
    'Forsigtighed — naturen er ikke din ven. Træd let. (Neutral)',
    'Frihed — ingen bestemmer over mig. (Kaotisk)',
  ],
}

// ─── Bonds (Dansk) ────────────────────────────────────────────────────────────
export const BONDS: Record<string, string[]> = {
  'Slyngel': [
    'Noget vigtigt blev taget fra mig, og jeg har tænkt mig at stjæle det tilbage.',
    'Jeg vil blive den største tyv, der nogensinde har levet.',
    'Mit ulovlige udbytte går til at forsørge min familie.',
    'Et artefakt forbinder mig til min skæbne.',
  ],
  'Barde': [
    'Jeg vil blive berømt — hvad det end kræver.',
    'Jeg idoliserer en helt fra de gamle fortællinger og måler mine gerninger mod dem.',
    'Jeg skylder min mentor alt for at have skabt det menneske, jeg er i dag.',
    'Min kunst er et monument over dem, jeg har elsket og mistet.',
  ],
  'Kriger': [
    'Jeg kæmper for dem, der ikke kan kæmpe for sig selv.',
    'Dem, der kæmper ved min side, er dem, det er værd at dø for.',
    'Jeg mistede min enhed til en frygtelig magi. Jeg vil ødelægge enhver trussel af den slags.',
    'Min hjemby er mit fundament — jeg kæmper for den.',
  ],
  'Troldmand': [
    'Jeg er forelsket i en lærd, der deler mine interesser, men bor langt væk.',
    'Jeg arbejder for at bevare et bibliotek eller kloster.',
    'Mit livs arbejde er en serie tome om et bestemt vidensfelt.',
    'Jeg har ledt hele mit liv efter svaret på ét bestemt spørgsmål.',
  ],
  'Præst': [
    'Jeg ville dø for at genfinde en hellig relikvie, der er stjålet fra mig.',
    'Jeg skylder livet til den præst, der tog mig til sig, da mine forældre døde.',
    'Alt hvad jeg gør er for det almene folk.',
    'Jeg vil en dag hævne den uretfærdighed, der forjog mig fra min orden.',
  ],
  'Jæger': [
    'Min familie, klan eller stamme er det vigtigste i mit liv.',
    'En skade på den uberørte vildmark er en skade på mig.',
    'Jeg beskytter dem, der ikke kan beskytte sig selv.',
    'Skogen, jeg vogter, er hellig for mig.',
  ],
  'Paladin': [
    'Jeg vil møde enhver prøvelse for at opretholde mit løfte.',
    'Jeg beskytter dem, der ikke kan beskytte sig selv.',
    'Min ære er mit liv.',
    'Jeg skylder alt til min mentor — en berømt paladin, der siden er faldet fra nåden.',
  ],
  'Warlock': [
    'Jeg er den sidste af min mesters udvalgte og må opfylde skæbnen alene.',
    'Jeg indgik en aftale, jeg nu fortryder, og søger en måde at bryde den på.',
    'Min patron reddede mit liv. Gælden er uendelig.',
    'Jeg søger kosmossets hemmeligheder — uanset prisen.',
  ],
  'Munk': [
    'Jeg vil gøre alt for at beskytte det kloster, jeg voksede op i.',
    'Jeg søger stadig den oplysning, jeg stræbte efter i mit klosterliv.',
    'Min isolation gav mig indsigt i et stort onde, som kun jeg kan ødelægge.',
    'Læreren, der formede mig, lever stadig — og fortjener min taknemmelighed.',
  ],
  'Druide': [
    'Jeg lider under frygtelige syner af en kommende katastrofe og vil gøre alt for at forhindre den.',
    'Jeg beskytter skoven nær mit hjem for enhver pris.',
    'De gamle ånder, der taler igennem mig, guider hvert skridt jeg tager.',
    'Min hjemlige lund blev ødelagt, og jeg vil finde og straffe dem, der stod bag.',
  ],
}

// ─── Flaws (Dansk) ────────────────────────────────────────────────────────────
export const FLAWS: Record<string, string[]> = {
  'Slyngel': [
    'Guld og rigdom frister mig mere end min ære tillader.',
    'Når jeg står over for valget mellem penge og venner, vælger jeg typisk pengene.',
    'Jeg vender ryggen til og løber, når tingene ser slemt ud.',
    'En uskyldig person sidder i fængsel for en forbrydelse, jeg begik. Det er okay.',
  ],
  'Barde': [
    'Jeg gør alt for at vinde berømmelse og anerkendelse.',
    'Jeg falder for ethvert smukt ansigt.',
    'En skandale forhindrer mig i at vende hjem.',
    'Jeg satiriserede engang en adelsmand, der stadig ønsker mit hoved.',
  ],
  'Kriger': [
    'Den monstruøse fjende vi mødte i kamp efterlader mig stadig dirrrende af frygt.',
    'Jeg har lidt respekt for nogen, der ikke er en afprøvet kriger.',
    'Jeg begik en frygtelig fejl i kamp, der kostede mange liv — og jeg vil gøre alt for at holde det skjult.',
    'Mit stolthed vil måske til sidst blive min undergang.',
  ],
  'Troldmand': [
    'Jeg taler uden at tænke og sårer ofte andres følelser.',
    'Jeg kan ikke holde en hemmelighed for at redde mit liv.',
    'Jeg vil gøre alt for at lægge hånd på noget sjældent eller betydningsfuldt.',
    'Oplåsning af et gammelt mysterium er prisen for en civilisation værd.',
  ],
  'Præst': [
    'Jeg er mistænksom over for fremmede og forventer det værste af dem.',
    'Jeg har en svaghed for byens laster, især stærk drik.',
    'Når jeg begynder at drikke, er det svært at stoppe.',
    'Jeg sætter for stor lid til dem, der besidder magt i templets hierarki.',
  ],
  'Jæger': [
    'Vold er mit svar på næsten enhver udfordring.',
    'Forvent ikke at jeg redder dem, der ikke kan redde sig selv.',
    'Jeg er hurtig til at antage det værste om folk.',
    'Jeg er alt for betaget af øl, vin og andre berusende midler.',
  ],
  'Paladin': [
    'Jeg er mistænksom over for fremmede og forventer det værste af dem.',
    'Når jeg har sat mig et mål, bliver jeg besat af det på bekostning af alt andet.',
    'I mit stille sind tror jeg, at tingene ville gå bedre, hvis jeg tog alle beslutningerne.',
    'Mit had til mine fjender er blindt og uden fornuft.',
  ],
  'Warlock': [
    'Hvis der er en plan, vil jeg glemme den.',
    'Jeg er paranoid — jeg forventer forræderi fra enhver.',
    'Jeg samler en souvenir fra hvert lig, jeg efterlader.',
    'Der er ingen forkert måde at erhverve sig magt på.',
  ],
  'Munk': [
    'Jeg er dogmatisk i mine tanker og min filosofi.',
    'Jeg lader min trang til at vinde argumenter overskygge venskab og harmoni.',
    'Jeg er aldrig tilfreds med hvad jeg har — jeg vil altid have mere.',
    'Jeg er stiv i mine tanker og tilpasser mig dårligt.',
  ],
  'Druide': [
    'Jeg er langsom til at stole på dem fra andre racer, stammer og samfund.',
    'Jeg er fuldstændig uopmærksom på etiket og sociale forventninger.',
    'Jeg respekterer ingen autoritet udover min egen lund.',
    'Jeg er for tilgivende — selv over for dem, der skader mig.',
  ],
}

// START DND2024 SPECIES UPDATE
// ─── Appearance quirks (Dansk, specifikke mærker) ─────────────────────────────
export const APPEARANCE_DETAILS: Record<string, string[]> = {
  'Menneske': [
    'Et stort ar løber diagonalt over det venstre kindben',
    'Det højre øje er bærnstensfarvet, det venstre kulsort',
    'Tre tatoverede runer på den indre håndled',
    'Mangler lillefingeren på højre hånd',
    'Hvidgrå stribe i håret siden barndommen',
  ],
  'Halvling (Lyshjerte)': [
    'Næsen er gebrokkent og sidder lidt skævt',
    'Brede ar på begge håndrygge fra en brandslukning',
    'Et lille ankertegn tatoveret bag det venstre øre',
    'Alvor i øjnene der ikke matcher den unge alder',
  ],
  'Halvling (Stouthjerte)': [
    'Mangler ringfingeren på venstre hånd',
    'Levende ar fra en bidt af en slange på anklen',
    'Et snit over overlæben der aldrig heler helt',
    'Tatovering af et sejlskib på den højre skulder',
  ],
  'Aasimar': [
    'Et svagt guldskær lyser op i øjnene ved stærk følelse',
    'Små stumper af lyse fjer er synlige langs kravebenet',
    'Et cirkulært helligt ar på håndfladen som aldrig forsvinder',
    'Huden skinner svagt i mørke som månelys på vand',
    'Stemmen bærer en svag genklang, som om to taler på én gang',
  ],
  'Højalv': [
    'Lyse arkaiske runer lyser svagt langs kravebenet',
    'Pupillerne er vertikale som en kats',
    'Det venstre øre er beskadiget og sidder lavere',
    'Håret gror aldrig under knæene uanset hvor lang tid der går',
  ],
  'Skovsalv': [
    'Bark-brune tatoveringer i spiralmønstre langs armene',
    'Fingrene er altid farvede af saft og mørk jord',
    'Et gammelt bidemærke på halsen fra et dyr',
    'Iris er usædvanlig stor og lysegrøn',
  ],
  'Mørkalv': [
    'Et lysegråt hår vokser midt i det ellers hvide hår',
    'Stumpt afskåret venstre øre',
    'Kridtblege arr i form af et stjernetegn på ryggen',
    'Øjnene lyser svagt rødt i mørke',
  ],
  'Bjergdværg': [
    'Skægget er brændt af på den venstre side og gror atter ujævnt',
    'Tre knækkede fingre på venstre hånd der aldrig helede rigtigt',
    'Et armbånd af smeltet jern, der aldrig kan tages af',
    'En flad næse brækket mindst tre gange',
  ],
  'Bakkedværg': [
    'Massive ar på ryggen fra en kamp med en grif',
    'Brilleglassene er altid revnede, men han skifter dem aldrig',
    'Et gyldent tandimplantat der glimter ved hver tale',
    'Mangler et stykke af det højre øre',
  ],
  'Stengnome': [
    'Briller med tre linser — en roterer konstant',
    'Fingerspidserne er altid misfarvet af kemikalier',
    'Et burnmærke i form af et tandhjul på det venstre håndled',
    'Lugter altid af olie og svovl, uanset badet eller ej',
  ],
  'Skovgnome': [
    'Tynde rødlige ar fra tornebuske på begge kinder',
    'Et ekorn-kradsmærke på panden der aldrig forsvandt',
    'Håret er flettet med kviste og bær der aldrig visner',
    'Fingrene er misfarvet grønne til albuen',
  ],
  'Tiefling': [
    'Hornene er asymmetriske — et er spiralformet, et er ret',
    'Huden har et blåligt skær i koldt lys',
    'Halen er altid indpakket i slidt læder',
    'Et ar fra et helligt mærke brænder rødt ved varme',
  ],
  'Dragonborn': [
    'En skæl mangler på det venstre kindben og blotter mørkere hud',
    'Kløerne er afstumpede fra år med arbejde i sten',
    'Ét øje er blakket fra en gammel kamp',
    'Rygskællerne bærer et gammelt stammemønster',
  ],
  'Goliath': [
    'Naturlige stengrå mønstre i huden langs kindbenene',
    'En flænge i det ene øre fra en kamp med et bjergdyr',
    'Tatoverede klantegn dækker begge skuldre og løber ned ad armene',
    'Øjnene er lyse som is med et indre guldskær',
    'En bred rille i panden fra et gammelt stenbrud-uheld',
  ],
  'Ork': [
    'En af stødtænderne er brækket halvt af',
    'Et rundt ar fra et pileskud midt i håndfladen',
    'En hage-tatovering i stammekode',
    'Mangler to tæer på den venstre fod',
  ],
}
// END DND2024 SPECIES UPDATE

// ─── Inventory items (Dansk) ──────────────────────────────────────────────────
export const INVENTORY_ITEMS = [
  'en dolk skåret af en drakontand',
  'en tryllebog bundet i sort læder og forseglet med sølv',
  'en lut strænget med sølvtråde',
  'et helligt symbol der aldrig taber glansen',
  'en flaske lagret dværgwhisky',
  'et sæt belastede terninger',
  'et udforskerkort med ét sted ridset ud',
  'et hætteglas med basiliskblod',
  'et sæt tyveværktøj svøbt i oliet klæde',
  'et krigshorn skåret af knogle',
  'et silkebind der siges at give sandt syn',
  'en pose tørrede helbredelsesurter',
  'et poleret obsidianspejl',
  'en ring der hvisker navne på de døde',
  'en samling pressede vilde blomster fra en brændt landsby',
  'et skrumpet hoved der ind imellem blinker',
  'et kompas der altid peger mod guld',
  'en slidt dagbog fuld af kryptisk tekst',
  'en hanske taget fra en falden paladin',
  'et sæt fortrylle spillekort til spådom',
]

// ─── Companions (Dansk) ───────────────────────────────────────────────────────
export const COMPANIONS: (string | null)[] = [
  null, null, null,
  'en enøjet ravn der taler i rim',
  'en lille stenglem ikke større end en næve',
  'en kamparret fritte ved navn Trods',
  'en blind ugle med sølvøjne',
  'et lille drakounger med forbrændte skæl',
  'en hårløs kat med kløvet hale',
  'en frø der kvækker advarsler',
  'en mekanisk mus der kortlægger udforsket terræn',
  'en fededrake på størrelse med en sommerfugl',
  'et lækat trænet til at lommestjæle',
  'en krage der kan efterligne enhver stemme den hører',
]

// ─── Adventure hooks (Dansk) ──────────────────────────────────────────────────
export const ADVENTURE_HOOKS = [
  'Et adelsbrev ankom til det forkerte værtshus — med dit navn og et forseglet kongeligt påbud.',
  'Du vågnede en morgen med et mærke på håndfladen: et symbol du aldrig har set, men alligevel genkender.',
  'Tre separate købmænd har tilbudt dig det samme forbandede artefakt, hver hævder de aldrig har mødt de andre.',
  'Nogen brændte dit barndomshjem ned. Det eneste der stod tilbage var en dør til ingensteds.',
  'Du har vist den samme drøm om en dungeon du aldrig er gået ind i — men du ved hvor hvert fælde er.',
  'En døende fremmed pressede en nøgle i din hånd og hviskede: "Lad dem ikke få det tredje hvælving."',
  'Hvert spejl i de seneste tre byer viser dit spejlbillede én sekund bagud.',
  'Du skylder en tyvegilde en gæld. De har netop krævet den indfriet.',
  'En gud talte til dig i en drøm. Det var ikke din gud.',
  'Du overlevede et bagholdsangreb der kostede resten af dit parti livet. Nogen var advaret — og det var ikke dig.',
  'En gammel profeti indeholder tre navne. Dit er det andet.',
  'Skabningen du var betalt for at dræbe tigger om sit liv og hævder at kende din sande herkomst.',
]
