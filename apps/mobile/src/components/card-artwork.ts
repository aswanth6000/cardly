/**
 * Card artwork system.
 *
 * Cardly cards use a curated luxury physical card palette system.
 * Each card receives a distinct, vibrant colorway using deterministic hashing
 * across card ID, nickname, and digits, ensuring every card in the wallet is
 * visually unique with rich contrast and authentic credit card aesthetics.
 */

import type { CardPalette } from '@cardly/ui';
import {
  CARD_PALETTES,
  PALETTE_AMETHYST,
  PALETTE_CRIMSON,
  PALETTE_CYAN_DEPTHS,
  PALETTE_ELECTRIC_COBALT,
  PALETTE_FOREST_SAGE,
  PALETTE_MATTE_CARBON,
  PALETTE_MIDNIGHT_TEAL,
  PALETTE_OBSIDIAN,
  PALETTE_PEACOCK_TEAL,
  PALETTE_PLUM_ROSE,
  PALETTE_ROYAL_EMERALD,
  PALETTE_ROYAL_SAPPHIRE,
  PALETTE_SOLAR_AMBER,
  PALETTE_TITANIUM,
} from '@cardly/ui';

export type { CardPalette };
export interface CardArtwork extends CardPalette {}

/**
 * Deterministic FNV-1a-inspired hash for assigning distinct palettes.
 */
function simpleHash(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = (hash * 16777619) >>> 0;
  }
  return hash;
}

export function getCardArtwork(
  issuer?: string,
  network?: string,
  cardId?: string,
  nickname?: string,
  last4?: string,
): CardPalette {
  // Deterministic variety: every card gets its own distinct colorway
  const seed = `${cardId ?? ''}:${nickname ?? ''}:${last4 ?? ''}:${issuer ?? ''}`;
  const trimmed = seed.replace(/[:\s]/g, '');

  if (trimmed.length > 0) {
    const idx = Math.abs(simpleHash(seed)) % CARD_PALETTES.length;
    return CARD_PALETTES[idx];
  }

  // Network signature fallbacks with high contrast
  const net = (network ?? '').toLowerCase();
  if (net.includes('visa')) return PALETTE_ROYAL_SAPPHIRE;
  if (net.includes('master')) return PALETTE_OBSIDIAN;
  if (net.includes('amex')) return PALETTE_TITANIUM;
  if (net.includes('rupay')) return PALETTE_ROYAL_EMERALD;
  if (net.includes('discover')) return PALETTE_SOLAR_AMBER;

  return PALETTE_OBSIDIAN;
}
