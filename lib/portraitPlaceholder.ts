/**
 * Maps a character race (DA or EN) to the matching placeholder SVG.
 * The placeholder is shown whenever no generated portrait is available:
 * loading, queued, failed, or simply not yet generated.
 */
export function getPortraitPlaceholder(race: string | undefined | null): string {
  const r = (race ?? '').toLowerCase().trim()

  if (r.includes('dark elf') || r.includes('drow') || r.includes('mørkalv'))
    return '/placeholders/portrait-dark-elf.svg'

  if (r.includes('high elf') || r.includes('wood elf') || r.includes('elf') ||
      r.includes('højalv') || r.includes('skovsalv') || r.includes('alv'))
    return '/placeholders/portrait-elf.svg'

  if (r.includes('dwarf') || r.includes('dværg'))
    return '/placeholders/portrait-dwarf.svg'

  if (r.includes('halfling') || r.includes('halvling'))
    return '/placeholders/portrait-halfling.svg'

  if (r.includes('gnome') || r.includes('gnom'))
    return '/placeholders/portrait-gnome.svg'

  if (r.includes('orc') || r.includes('ork'))
    return '/placeholders/portrait-orc.svg'

  if (r.includes('tiefling'))
    return '/placeholders/portrait-tiefling.svg'

  if (r.includes('dragonborn') || r.includes('drakbåren') || r.includes('dragefødt'))
    return '/placeholders/portrait-dragonborn.svg'

  if (r.includes('aasimar') || r.includes('goliath'))
    return '/placeholders/portrait-human.svg'

  if (r.includes('human') || r.includes('menneske'))
    return '/placeholders/portrait-human.svg'

  return '/placeholders/portrait-generic.svg'
}
