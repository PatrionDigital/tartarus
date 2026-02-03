/**
 * @tartarus/combat
 *
 * Combat systems: weapons, projectiles, collision detection
 */

// Types (re-exported from core + local)
export type { Faction, Projectile } from "./types";
export type { WeaponConfig, EnemyAttackConfig } from "./types";

// Projectile System
export {
  spawnProjectile,
  projectileMovementSystem,
  projectileLifetimeSystem,
} from "./ProjectileSystem";

// Collision System
export {
  projectileCollisionSystem,
  type ProjectileCollisionResult,
} from "./ProjectileCollisionSystem";

// Player Weapon System
export { PlayerWeaponSystem } from "./PlayerWeaponSystem";

// Enemy Attack System
export { enemyAttackSystem } from "./EnemyAttackSystem";
