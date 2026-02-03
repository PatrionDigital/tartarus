import { create } from "zustand";
import type {
  TileMap,
  TileLayer,
  TileProperty,
  TilePropertyMap,
  SpriteSheetConfig,
  EditorTool,
  MapViewport,
  TileCoord,
  HistoryEntry,
  CollisionType,
} from "../types";
import { DEFAULT_LAYER_NAMES } from "../types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createEmptyLayer(
  id: number,
  width: number,
  height: number
): TileLayer {
  return {
    id,
    name: DEFAULT_LAYER_NAMES[id] ?? `Layer ${id}`,
    visible: true,
    locked: false,
    collisionMask: id === 1 ? 0xffff : 0, // Walls default to full collision
    data: new Array(width * height).fill(-1),
  };
}

function createDefaultLayers(width: number, height: number): TileLayer[] {
  return Array.from({ length: 4 }, (_, i) =>
    createEmptyLayer(i, width, height)
  );
}

function cloneLayers(layers: TileLayer[]): TileLayer[] {
  return layers.map((l) => ({ ...l, data: [...l.data] }));
}

function cloneProperties(props: TilePropertyMap): TilePropertyMap {
  const out: TilePropertyMap = {};
  for (const key of Object.keys(props)) {
    const p = props[key];
    out[key] = {
      collision: p.collision,
      flags: [...p.flags],
      metadata: { ...p.metadata },
    };
  }
  return out;
}

const MAX_HISTORY = 50;

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export interface EditorState {
  // Map state
  mapName: string;
  mapWidth: number;
  mapHeight: number;
  tileSize: number;
  layers: TileLayer[];
  properties: TilePropertyMap;

  // Sprite sheet
  spriteSheet: SpriteSheetConfig | null;
  spriteSheetImage: HTMLImageElement | null;

  // Editor state
  activeLayerId: number;
  activeTool: EditorTool;
  selectedTileIndex: number; // active brush from palette, -1 = none
  showGrid: boolean;
  viewport: MapViewport;

  // Selection (select tool)
  selectedTile: TileCoord | null;

  // History
  undoStack: HistoryEntry[];
  redoStack: HistoryEntry[];

  // New-map dialog
  showNewMapDialog: boolean;

  // ── Actions ─────────────────────────────────────────────────────────────

  // Map lifecycle
  newMap: (name: string, width: number, height: number, tileSize: number) => void;
  exportMap: () => TileMap;
  importMap: (map: TileMap) => void;

  // Sprite sheet
  setSpriteSheet: (config: SpriteSheetConfig, img: HTMLImageElement) => void;

  // Layers
  setActiveLayer: (id: number) => void;
  toggleLayerVisibility: (id: number) => void;
  toggleLayerLocked: (id: number) => void;
  renameLayer: (id: number, name: string) => void;
  setLayerCollisionMask: (id: number, mask: number) => void;
  addLayer: () => void;

  // Tools
  setActiveTool: (tool: EditorTool) => void;
  setSelectedTileIndex: (index: number) => void;
  setShowGrid: (show: boolean) => void;

  // Viewport
  setViewport: (v: Partial<MapViewport>) => void;

  // Painting
  paintTile: (x: number, y: number) => void;
  eraseTile: (x: number, y: number) => void;
  floodFill: (x: number, y: number) => void;

  // Selection
  selectTile: (coord: TileCoord | null) => void;
  setTileProperty: (key: string, prop: TileProperty) => void;
  removeTileProperty: (key: string) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Dialog
  setShowNewMapDialog: (show: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set, get) => ({
  // Initial defaults
  mapName: "Untitled",
  mapWidth: 32,
  mapHeight: 32,
  tileSize: 32,
  layers: createDefaultLayers(32, 32),
  properties: {},

  spriteSheet: null,
  spriteSheetImage: null,

  activeLayerId: 0,
  activeTool: "paint",
  selectedTileIndex: -1,
  showGrid: true,
  viewport: { offsetX: 0, offsetY: 0, zoom: 1 },

  selectedTile: null,

  undoStack: [],
  redoStack: [],

  showNewMapDialog: false,

  // ── Map lifecycle ───────────────────────────────────────────────────────

  newMap: (name, width, height, tileSize) => {
    set({
      mapName: name,
      mapWidth: width,
      mapHeight: height,
      tileSize,
      layers: createDefaultLayers(width, height),
      properties: {},
      activeLayerId: 0,
      selectedTile: null,
      undoStack: [],
      redoStack: [],
      viewport: { offsetX: 0, offsetY: 0, zoom: 1 },
      showNewMapDialog: false,
    });
  },

  exportMap: () => {
    const s = get();
    return {
      name: s.mapName,
      width: s.mapWidth,
      height: s.mapHeight,
      tileSize: s.tileSize,
      layers: cloneLayers(s.layers),
      spriteSheet: s.spriteSheet ?? {
        src: "",
        tileWidth: s.tileSize,
        tileHeight: s.tileSize,
        columns: 0,
        rows: 0,
      },
      properties: cloneProperties(s.properties),
    };
  },

  importMap: (map) => {
    const img = get().spriteSheetImage;
    set({
      mapName: map.name,
      mapWidth: map.width,
      mapHeight: map.height,
      tileSize: map.tileSize,
      layers: cloneLayers(map.layers),
      properties: cloneProperties(map.properties),
      spriteSheet: map.spriteSheet.src ? { ...map.spriteSheet } : null,
      activeLayerId: 0,
      selectedTile: null,
      undoStack: [],
      redoStack: [],
      viewport: { offsetX: 0, offsetY: 0, zoom: 1 },
    });
    // If the import includes a sprite sheet src, try loading the image
    if (map.spriteSheet.src && !img) {
      const newImg = new Image();
      newImg.onload = () => {
        set({ spriteSheetImage: newImg });
      };
      newImg.src = map.spriteSheet.src;
    }
  },

  // ── Sprite sheet ────────────────────────────────────────────────────────

  setSpriteSheet: (config, img) => {
    set({ spriteSheet: config, spriteSheetImage: img });
  },

  // ── Layers ──────────────────────────────────────────────────────────────

  setActiveLayer: (id) => set({ activeLayerId: id }),

  toggleLayerVisibility: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, visible: !l.visible } : l
      ),
    })),

  toggleLayerLocked: (id) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, locked: !l.locked } : l
      ),
    })),

  renameLayer: (id, name) =>
    set((s) => ({
      layers: s.layers.map((l) => (l.id === id ? { ...l, name } : l)),
    })),

  setLayerCollisionMask: (id, mask) =>
    set((s) => ({
      layers: s.layers.map((l) =>
        l.id === id ? { ...l, collisionMask: mask & 0xffff } : l
      ),
    })),

  addLayer: () => {
    const s = get();
    if (s.layers.length >= 16) return;
    const id = s.layers.length;
    set({
      layers: [...s.layers, createEmptyLayer(id, s.mapWidth, s.mapHeight)],
      activeLayerId: id,
    });
  },

  // ── Tools ───────────────────────────────────────────────────────────────

  setActiveTool: (tool) => set({ activeTool: tool, selectedTile: null }),
  setSelectedTileIndex: (index) => set({ selectedTileIndex: index }),
  setShowGrid: (show) => set({ showGrid: show }),

  // ── Viewport ────────────────────────────────────────────────────────────

  setViewport: (v) =>
    set((s) => ({ viewport: { ...s.viewport, ...v } })),

  // ── Painting ────────────────────────────────────────────────────────────

  paintTile: (x, y) => {
    const s = get();
    const layer = s.layers.find((l) => l.id === s.activeLayerId);
    if (!layer || layer.locked) return;
    if (x < 0 || x >= s.mapWidth || y < 0 || y >= s.mapHeight) return;
    const idx = y * s.mapWidth + x;
    if (layer.data[idx] === s.selectedTileIndex) return; // no change
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== state.activeLayerId) return l;
        const data = [...l.data];
        data[idx] = state.selectedTileIndex;
        return { ...l, data };
      }),
    }));
  },

  eraseTile: (x, y) => {
    const s = get();
    const layer = s.layers.find((l) => l.id === s.activeLayerId);
    if (!layer || layer.locked) return;
    if (x < 0 || x >= s.mapWidth || y < 0 || y >= s.mapHeight) return;
    const idx = y * s.mapWidth + x;
    if (layer.data[idx] === -1) return;
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== state.activeLayerId) return l;
        const data = [...l.data];
        data[idx] = -1;
        return { ...l, data };
      }),
    }));
  },

  floodFill: (x, y) => {
    const s = get();
    const layer = s.layers.find((l) => l.id === s.activeLayerId);
    if (!layer || layer.locked) return;
    if (x < 0 || x >= s.mapWidth || y < 0 || y >= s.mapHeight) return;

    const target = layer.data[y * s.mapWidth + x];
    const replacement = s.selectedTileIndex;
    if (target === replacement) return;

    const data = [...layer.data];
    const w = s.mapWidth;
    const h = s.mapHeight;
    const stack: [number, number][] = [[x, y]];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop()!;
      const ci = cy * w + cx;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      if (data[ci] !== target) continue;
      data[ci] = replacement;
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === state.activeLayerId ? { ...l, data } : l
      ),
    }));
  },

  // ── Selection ───────────────────────────────────────────────────────────

  selectTile: (coord) => set({ selectedTile: coord }),

  setTileProperty: (key, prop) =>
    set((s) => ({
      properties: { ...s.properties, [key]: prop },
    })),

  removeTileProperty: (key) =>
    set((s) => {
      const { [key]: _, ...rest } = s.properties;
      return { properties: rest };
    }),

  // ── History ─────────────────────────────────────────────────────────────

  pushHistory: () =>
    set((s) => {
      const entry: HistoryEntry = {
        layers: cloneLayers(s.layers),
        properties: cloneProperties(s.properties),
      };
      const stack = [...s.undoStack, entry];
      if (stack.length > MAX_HISTORY) stack.shift();
      return { undoStack: stack, redoStack: [] };
    }),

  undo: () =>
    set((s) => {
      if (s.undoStack.length === 0) return s;
      const entry = s.undoStack[s.undoStack.length - 1];
      const redoEntry: HistoryEntry = {
        layers: cloneLayers(s.layers),
        properties: cloneProperties(s.properties),
      };
      return {
        layers: cloneLayers(entry.layers),
        properties: cloneProperties(entry.properties),
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack, redoEntry],
        selectedTile: null,
      };
    }),

  redo: () =>
    set((s) => {
      if (s.redoStack.length === 0) return s;
      const entry = s.redoStack[s.redoStack.length - 1];
      const undoEntry: HistoryEntry = {
        layers: cloneLayers(s.layers),
        properties: cloneProperties(s.properties),
      };
      return {
        layers: cloneLayers(entry.layers),
        properties: cloneProperties(entry.properties),
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack, undoEntry],
        selectedTile: null,
      };
    }),

  // ── Dialog ──────────────────────────────────────────────────────────────

  setShowNewMapDialog: (show) => set({ showNewMapDialog: show }),
}));
