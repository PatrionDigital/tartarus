// Re-export pickup component types from core components
export type { PickupType, XPGemTier, Pickup } from "../ecs/components";
import type { XPGemTier } from "../ecs/components";

/**
 * Pickup visual configuration
 */
export interface PickupVisualConfig {
  /** Color of the pickup */
  color: number;
  /** Radius in pixels */
  radius: number;
}

/**
 * XP gem tier configurations
 */
export const XP_GEM_TIERS: Record<XPGemTier, { xpValue: number; visual: PickupVisualConfig }> = {
  small: {
    xpValue: 1,
    visual: { color: 0x00ff00, radius: 5 },
  },
  medium: {
    xpValue: 5,
    visual: { color: 0x00ff88, radius: 8 },
  },
  large: {
    xpValue: 20,
    visual: { color: 0x00ffff, radius: 12 },
  },
};

/**
 * Pickup system configuration
 */
export interface PickupConfig {
  /** Distance at which pickups are attracted to player */
  magnetRange: number;
  /** Speed at which attracted pickups move toward player */
  attractionSpeed: number;
  /** Distance at which pickups are collected */
  collectionRange: number;
  /** How long pickups last before despawning (ms) */
  lifetime: number;
}

/**
 * Default pickup configuration
 */
export const DEFAULT_PICKUP_CONFIG: PickupConfig = {
  magnetRange: 100,
  attractionSpeed: 300,
  collectionRange: 25,
  lifetime: 30000,
};

/**
 * Determine XP gem tier based on XP value
 */
export function getXPGemTier(xpValue: number): XPGemTier {
  if (xpValue >= 20) return "large";
  if (xpValue >= 5) return "medium";
  return "small";
}
