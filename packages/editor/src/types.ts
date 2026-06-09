/**
 * @tartarus/editor — type definitions.
 *
 * The tile-map schema lives in @tartarus/tilemap (single source of truth) and
 * is re-exported here for backward compatibility. Editor-only UI types remain
 * defined locally.
 */

// ── Re-exported schema (single source of truth: @tartarus/tilemap) ──
export type {
  TileMap,
  TileLayer,
  SpriteSheetConfig,
  TileProperty,
  TilePropertyMap,
  CollisionType,
  SpecialFlag,
  TileCoord,
} from "@tartarus/tilemap";
export { COLLISION_TYPES, SPECIAL_FLAGS, DEFAULT_LAYER_NAMES } from "@tartarus/tilemap";

// ── Editor-only UI types ──

export type EditorTool = "paint" | "select" | "erase" | "fill";

export interface MapViewport {
  offsetX: number;
  offsetY: number;
  zoom: number;
}

/** Snapshot for undo/redo */
export interface HistoryEntry {
  layers: import("@tartarus/tilemap").TileLayer[];
  properties: import("@tartarus/tilemap").TilePropertyMap;
}
