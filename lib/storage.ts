import type { Character } from './types'

const STORAGE_KEY = 'fantasy-rpg-characters'
const MAX_SAVED = 20

export function loadSavedCharacters(): Character[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveCharacter(character: Character): Character[] {
  const existing = loadSavedCharacters()
  const updated = [
    { ...character },
    ...existing.filter(c => c.id !== character.id),
  ].slice(0, MAX_SAVED)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}

export function deleteCharacter(id: string): Character[] {
  const existing = loadSavedCharacters()
  const updated = existing.filter(c => c.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  return updated
}
