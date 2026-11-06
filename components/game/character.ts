/**
 * The player character — kept separate from the game logic so the artwork
 * can be swapped without touching anything else.
 *
 * ⚠ PLACEHOLDER ART. The owner intends this character to carry the likeness
 * of Rajinikanth. A real person's likeness may only be used with authorised,
 * licensed artwork — do not substitute photos, film posters or promotional
 * art found online. Until that artwork is supplied the game draws an
 * original, generic "sun-headed hero" (see drawPlaceholderCharacter) and
 * never names or claims to depict the actor.
 *
 * To integrate authorised artwork:
 *   1. Add a transparent PNG/WebP sprite to public/game/ — roughly 4:5
 *      (e.g. 400×500), character facing the viewer, hands raised to catch,
 *      no background. Optional second frame wearing the shades.
 *   2. Fill in `sprite` (and `spriteWithShades`) below.
 *   3. Update `name` and `credit` (the licence/credit line shown in the game).
 */
export interface CharacterAsset {
  name: string
  credit: string | null
  sprite: { src: string; width: number; height: number } | null
  spriteWithShades: { src: string; width: number; height: number } | null
}

export const CHARACTER: CharacterAsset = {
  name: 'The Superstar',
  credit: null,
  sprite: null,
  spriteWithShades: null,
}

export const usesPlaceholderArt = CHARACTER.sprite === null
