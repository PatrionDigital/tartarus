/**
 * @tartarus/editor
 *
 * Tile-based level editor for the Tartarus game engine.
 */

// Main composite editor
export { TileMapEditor } from "./components/TileMapEditor";

// Individual panels (for custom layouts)
export { TilePalette } from "./components/TilePalette";
export { LayerPanel } from "./components/LayerPanel";
export { PropertyPanel } from "./components/PropertyPanel";
export { Toolbar } from "./components/Toolbar";
export { MapCanvas } from "./components/MapCanvas";
export { NewMapDialog } from "./components/NewMapDialog";

// Store
export { useEditorStore } from "./stores/editorStore";
export type { EditorState } from "./stores/editorStore";

// Types (also useful at runtime for the engine)
export type {
  TileMap,
  TileLayer,
  TileProperty,
  TilePropertyMap,
  SpriteSheetConfig,
  CollisionType,
  SpecialFlag,
  EditorTool,
  MapViewport,
  TileCoord,
  HistoryEntry,
} from "./types";

export { COLLISION_TYPES, SPECIAL_FLAGS, DEFAULT_LAYER_NAMES } from "./types";
