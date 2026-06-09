/**
 * @tartarus/core
 *
 * Core engine: game loop, ECS, scenes, input, camera, rendering, leveling, pickups
 */

// Engine
export { GameEngine, GameEngineState } from "./GameEngine";
export type { UpdateCallback } from "./GameEngine";

// Scenes
export { Scene, SceneManager, SceneState } from "./SceneManager";
export type { TransitionOptions } from "./SceneManager";

// Input
export { InputSystem } from "./InputSystem";
export type { InputState, Vector2 } from "./InputSystem";

// Camera
export { Camera } from "./Camera";
export type { CameraOptions, Viewport } from "./Camera";

// ECS Core
export { createGameWorld } from "./ecs/World";
export type { GameWorld, Entity } from "./ecs/World";

// ECS Components
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
} from "./ecs/components";
export { parseEnemyTypeConfig, validateEnemyTypeConfig } from "./ecs/components";

// ECS Systems
export { movementSystem, PLAYER_SPEED } from "./ecs/systems/MovementSystem";
export { invincibilitySystem } from "./ecs/systems/InvincibilitySystem";
export { renderSystem } from "./ecs/systems/RenderSystem";
export type { CameraPosition } from "./ecs/systems/RenderSystem";

// Assets
export { AssetLoader } from "./assets/AssetLoader";

// Leveling
export {
  LevelingSystem,
  DEFAULT_LEVELING_CONFIG,
} from "./leveling/LevelingSystem";
export type { LevelingConfig, LevelUpResult } from "./leveling/LevelingSystem";
export {
  UPGRADE_POOL,
  generateUpgradeChoices,
  applyUpgrade,
} from "./leveling/UpgradeChoices";
export type { UpgradeType, Upgrade } from "./leveling/UpgradeChoices";

// Pickups
export type { PickupVisualConfig, PickupConfig } from "./pickups/types";
export { XP_GEM_TIERS, DEFAULT_PICKUP_CONFIG, getXPGemTier } from "./pickups/types";
export { createXPGem, destroyPickup } from "./pickups/PickupFactory";
export { pickupAttractionSystem } from "./pickups/PickupAttractionSystem";
export { pickupCollectionSystem } from "./pickups/PickupCollectionSystem";
export type { CollectionResult } from "./pickups/PickupCollectionSystem";

// Scenes
export { MenuScene } from "./scenes/MenuScene";
export { SkeletonGameScene } from "./scenes/SkeletonGameScene";
export type { GridConfig, PlayerConfig } from "./scenes/SkeletonGameScene";
export { ResultScene } from "./scenes/ResultScene";
export type { GameResults } from "./scenes/ResultScene";
