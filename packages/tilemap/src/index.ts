/**
 * @tartarus/tilemap — tile-map schema + runtime renderer.
 */
export { TilemapRenderer, sliceTileset } from "./TilemapRenderer";
export type {
  TileMap,
  TileLayer,
  SpriteSheetConfig,
  TileProperty,
  TilePropertyMap,
  CollisionType,
  SpecialFlag,
  TileCoord,
} from "./types";
export { COLLISION_TYPES, SPECIAL_FLAGS, DEFAULT_LAYER_NAMES } from "./types";
