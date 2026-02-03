/**
 * @tartarus/ai
 *
 * Enemy AI: factory, Yuka steering, spawning, death systems
 */

// Types (re-exported from core)
export type { EnemyTypeConfig, EnemyTypeConfigJSON, EnemyAI } from "./types";
export { parseEnemyTypeConfig, validateEnemyTypeConfig } from "./types";

// Enemy Factory
export { createEnemy, destroyEnemy } from "./EnemyFactory";
export type { EnemyStatModifiers } from "./EnemyFactory";

// Enemy Type Registry
export { EnemyTypeRegistry } from "./EnemyTypeRegistry";

// AI System
export { enemyAISystem } from "./EnemyAISystem";

// Collision System (enemy → player contact damage)
export { collisionSystem } from "./CollisionSystem";
export type { CollisionResult } from "./CollisionSystem";

// Death System
export { enemyDeathSystem } from "./EnemyDeathSystem";
export type { DeathResult, EnemyDeath } from "./EnemyDeathSystem";

// Spawning System
export { SpawningSystem } from "./spawning/SpawningSystem";
export type { SpawningConfig } from "./spawning/SpawningSystem";
