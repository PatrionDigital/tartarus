export { createGameWorld } from "./World";
export type { GameWorld, Entity } from "./World";

// Components
export type {
  Position,
  Velocity,
  Health,
  Invincibility,
  Sprite,
  Faction,
  Projectile,
  EnemyTypeConfig,
  EnemyTypeConfigJSON,
  EnemyAI,
  Pickup,
  PickupType,
  XPGemTier,
} from "./components";
export { parseEnemyTypeConfig, validateEnemyTypeConfig } from "./components";

// Systems
export { movementSystem, PLAYER_SPEED } from "./systems/MovementSystem";
export { invincibilitySystem } from "./systems/InvincibilitySystem";
export { renderSystem } from "./systems/RenderSystem";
export type { CameraPosition } from "./systems/RenderSystem";
