import type { Container } from "pixi.js";
import type { Vehicle } from "yuka";

// ─── Base Components ────────────────────────────────────────────────

/**
 * Position component - where the entity is located
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Velocity component - movement speed and direction
 */
export interface Velocity {
  vx: number;
  vy: number;
}

/**
 * Health component - can take damage, can die
 */
export interface Health {
  current: number;
  max: number;
}

/**
 * Invincibility component - temporary damage immunity (i-frames)
 */
export interface Invincibility {
  remaining: number; // ms remaining
  duration: number; // total duration when triggered
}

/**
 * Sprite component - visual representation.
 *
 * Holds any PixiJS display object: Graphics, Sprite, or AnimatedSprite
 * (all extend Container). RenderSystem syncs its position each frame.
 */
export interface Sprite {
  graphics: Container;
}

// ─── Combat Components ──────────────────────────────────────────────

/**
 * Faction determines which entities a projectile can damage
 */
export type Faction = "player" | "enemy";

/**
 * Projectile component - shared between player and enemy projectiles
 */
export interface Projectile {
  /** Which side fired this projectile */
  faction: Faction;
  /** Damage dealt on hit */
  damage: number;
  /** Time remaining before despawn (ms) */
  lifetime: number;
  /** Max lifetime for percentage calculations */
  maxLifetime: number;
  /** Has this projectile already hit something? */
  consumed: boolean;
  /** Optional: pierce count (how many enemies it can hit) */
  pierceRemaining?: number;
}

// ─── Enemy Components ───────────────────────────────────────────────

/**
 * Enemy type configuration loaded from JSON
 * Defines all parameters for an enemy type
 */
export interface EnemyTypeConfig {
  /** Unique identifier for this enemy type */
  id: string;
  /** Display name */
  name: string;

  /** Visual properties */
  visual: {
    /** Hex color (e.g., 0xff4444) */
    color: number;
    /** Collision/render radius in pixels */
    radius: number;
  };

  /** Combat properties */
  combat: {
    /** Contact damage dealt to player */
    damage: number;
    /** Maximum health points */
    health: number;
    /** XP value dropped on death */
    xpValue: number;
  };

  /** Movement properties (Yuka Vehicle settings) */
  movement: {
    /** Maximum travel speed in pixels/sec */
    maxSpeed: number;
    /** Maximum steering force */
    maxForce: number;
    /** Mass affects acceleration */
    mass: number;
  };

  /** Flocking behavior weights */
  flocking: {
    /** How much they match neighbor velocity (0-2 typical) */
    alignment: number;
    /** How tightly they group together (0-2 typical) */
    cohesion: number;
    /** How much they spread apart (0-2 typical) */
    separation: number;
  };

  /** Vision/detection settings */
  vision: {
    /** Detection range in pixels */
    range: number;
    /** Field of view in degrees (360 = all around) */
    fieldOfView: number;
  };

  /** Behavior settings */
  behavior: {
    /** Weight for seek behavior when chasing player */
    seekWeight: number;
  };
}

/**
 * Raw JSON structure (colors as strings)
 * Used for parsing JSON files before conversion
 */
export interface EnemyTypeConfigJSON {
  id: string;
  name: string;
  visual: {
    color: string; // "0xff4444" format
    radius: number;
  };
  combat: {
    damage: number;
    health: number;
    xpValue: number;
  };
  movement: {
    maxSpeed: number;
    maxForce: number;
    mass: number;
  };
  flocking: {
    alignment: number;
    cohesion: number;
    separation: number;
  };
  vision: {
    range: number;
    fieldOfView: number;
  };
  behavior: {
    seekWeight: number;
  };
}

/**
 * Enemy AI component for ECS
 * Links our entity to Yuka's Vehicle for AI calculations
 */
export interface EnemyAI {
  /** Yuka Vehicle instance for steering behaviors */
  vehicle: Vehicle;
  /** Reference to the enemy type configuration */
  config: EnemyTypeConfig;
  /** Current AI behavior state */
  currentBehavior: "flocking" | "seeking";
  /** Effective damage after wave modifiers (used by collision system) */
  effectiveDamage?: number;
}

/**
 * Convert JSON config to runtime config
 * Handles string to number conversion for colors
 */
export function parseEnemyTypeConfig(json: EnemyTypeConfigJSON): EnemyTypeConfig {
  return {
    ...json,
    visual: {
      ...json.visual,
      color: parseInt(json.visual.color, 16),
    },
  };
}

/**
 * Validate enemy type config has all required fields
 */
export function validateEnemyTypeConfig(config: unknown): config is EnemyTypeConfigJSON {
  if (typeof config !== "object" || config === null) return false;

  const c = config as Record<string, unknown>;

  if (typeof c.id !== "string") return false;
  if (typeof c.name !== "string") return false;

  if (typeof c.visual !== "object" || c.visual === null) return false;
  if (typeof c.combat !== "object" || c.combat === null) return false;
  if (typeof c.movement !== "object" || c.movement === null) return false;
  if (typeof c.flocking !== "object" || c.flocking === null) return false;
  if (typeof c.vision !== "object" || c.vision === null) return false;
  if (typeof c.behavior !== "object" || c.behavior === null) return false;

  const visual = c.visual as Record<string, unknown>;
  const combat = c.combat as Record<string, unknown>;
  const movement = c.movement as Record<string, unknown>;
  const flocking = c.flocking as Record<string, unknown>;
  const vision = c.vision as Record<string, unknown>;
  const behavior = c.behavior as Record<string, unknown>;

  if (typeof visual.color !== "string") return false;
  if (typeof visual.radius !== "number") return false;
  if (typeof combat.damage !== "number") return false;
  if (typeof combat.health !== "number") return false;
  if (typeof combat.xpValue !== "number") return false;
  if (typeof movement.maxSpeed !== "number") return false;
  if (typeof movement.maxForce !== "number") return false;
  if (typeof movement.mass !== "number") return false;
  if (typeof flocking.alignment !== "number") return false;
  if (typeof flocking.cohesion !== "number") return false;
  if (typeof flocking.separation !== "number") return false;
  if (typeof vision.range !== "number") return false;
  if (typeof vision.fieldOfView !== "number") return false;
  if (typeof behavior.seekWeight !== "number") return false;

  return true;
}

// ─── Pickup Components ──────────────────────────────────────────────

/**
 * Pickup type identifiers
 */
export type PickupType = "xp_gem";

/**
 * XP gem size tiers (affects value and visual)
 */
export type XPGemTier = "small" | "medium" | "large";

/**
 * Pickup component - attached to entities that can be collected
 */
export interface Pickup {
  /** Type of pickup */
  type: PickupType;
  /** XP value when collected (for xp_gem type) */
  xpValue: number;
  /** Visual tier for XP gems */
  tier?: XPGemTier;
  /** Whether this pickup is being attracted to the player */
  isAttracted: boolean;
  /** Lifetime remaining in ms (pickups despawn after a while) */
  lifetime: number;
}
