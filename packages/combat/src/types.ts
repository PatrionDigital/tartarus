// Re-export component types from core
export type { Faction, Projectile } from "@tartarus/core";
import type { Graphics } from "pixi.js";

/**
 * Weapon configuration - defines how a weapon fires
 */
export interface WeaponConfig {
  /** Unique identifier */
  id: string;
  /** Display name */
  name: string;
  /** Base damage per projectile */
  damage: number;
  /** Cooldown between shots (ms) */
  cooldown: number;
  /** Projectile speed (pixels/second) */
  projectileSpeed: number;
  /** Projectile lifetime (ms) */
  projectileLifetime: number;
  /** Maximum targeting range in pixels (limits auto-aim distance) */
  range: number;
  /** Visual configuration */
  visual: {
    color: number;
    radius: number;
  };
  /** Number of projectiles per shot */
  projectilesPerShot: number;
  /** Spread angle in degrees (for multi-projectile weapons) */
  spreadAngle: number;
  /** Pierce count (0 = no pierce) */
  pierce: number;
}

/**
 * Enemy attack configuration - simpler than player weapons
 */
export interface EnemyAttackConfig {
  /** Damage dealt */
  damage: number;
  /** Cooldown between attacks (ms) */
  cooldown: number;
  /** Attack range (0 = contact only) */
  range: number;
  /** Projectile speed (if ranged) */
  projectileSpeed?: number;
  /** Projectile lifetime (if ranged) */
  projectileLifetime?: number;
  /** Visual configuration (if ranged) */
  visual?: {
    color: number;
    radius: number;
  };
}

/**
 * Create a projectile graphics object
 * Shared renderer for all projectile types
 */
export function createProjectileGraphics(_color: number, _radius: number): Graphics {
  throw new Error("Not implemented - use mock in tests");
}
