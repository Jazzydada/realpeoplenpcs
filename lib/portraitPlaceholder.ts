/**
 * Returns the placeholder portrait image path.
 * All races use the same high-quality placeholder image.
 */
export function getPortraitPlaceholder(_race: string | undefined | null): string {
  return '/placeholders/portrait-placeholder.png'
}
