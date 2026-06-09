/**
 * Tartarus tile-map schema — shared by the editor (authoring) and the runtime
 * renderer. Single source of truth.
 */

export interface TileMap {
  name: string;
  width: number; // tiles
  height: number; // tiles
  tileSize: number; // pixels
  layers: TileLayer[];
  spriteSheet: SpriteSheetConfig;
  properties: TilePropertyMap; // sparse — only tiles with special props
}

export interface SpriteSheetConfig {
  src: string; // filename / path / data-url
  tileWidth: number;
  tileHeight: number;
  columns: number;
  rows: number;
}

export interface TileLayer {
  id: number; // 0–15
  name: string;
  visible: boolean;
  locked: boolean;
  collisionMask: number; // u16 bitmask
  data: number[]; // flat array, width*height, -1 = empty, else tile index
}

export const DEFAULT_LAYER_NAMES: Record<number, string> = {
  0: "Ground",
  1: "Walls",
  2: "Objects",
  3: "Decoration",
};

export type CollisionType = "none" | "solid" | "trigger" | "platform";

export const COLLISION_TYPES: CollisionType[] = [
  "none",
  "solid",
  "trigger",
  "platform",
];

export const SPECIAL_FLAGS = [
  "player_spawn",
  "enemy_spawn",
  "poi",
  "door",
  "checkpoint",
] as const;

export type SpecialFlag = (typeof SPECIAL_FLAGS)[number];

export interface TileProperty {
  collision: CollisionType;
  flags: string[];
  metadata: Record<string, string>;
}

/** Properties keyed by "layerId:x:y" */
export type TilePropertyMap = Record<string, TileProperty>;

/** Coordinate of a tile on the grid */
export interface TileCoord {
  x: number;
  y: number;
}
