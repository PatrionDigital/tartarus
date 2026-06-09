import { CompositeTilemap } from "@pixi/tilemap";
import { Rectangle, Texture } from "pixi.js";
import type { TileMap, SpriteSheetConfig } from "./types";

/**
 * Slice a tileset texture into per-index sub-textures using its grid config.
 * Index order is row-major (col fastest), matching the editor's tile indices.
 */
export function sliceTileset(tileset: Texture, ss: SpriteSheetConfig): Texture[] {
  const frames: Texture[] = [];
  for (let row = 0; row < ss.rows; row++) {
    for (let col = 0; col < ss.columns; col++) {
      frames.push(
        new Texture({
          source: tileset.source,
          frame: new Rectangle(
            col * ss.tileWidth,
            row * ss.tileHeight,
            ss.tileWidth,
            ss.tileHeight,
          ),
        }),
      );
    }
  }
  return frames;
}

/**
 * Runtime renderer for a Tartarus TileMap. Builds a CompositeTilemap from the
 * map's layers and a tileset texture. Add `renderer.view` to the stage.
 */
export class TilemapRenderer {
  readonly view: CompositeTilemap;
  private readonly frames: Texture[];

  constructor(
    private readonly map: TileMap,
    tileset: Texture,
  ) {
    this.view = new CompositeTilemap();
    this.frames = sliceTileset(tileset, map.spriteSheet);
    this.rebuild();
  }

  /** Rebuild all tile geometry from the map data. */
  rebuild(): void {
    this.view.clear();
    const { width, tileSize, layers } = this.map;
    for (const layer of layers) {
      if (!layer.visible) continue;
      for (let i = 0; i < layer.data.length; i++) {
        const idx = layer.data[i];
        if (idx < 0) continue;
        const frame = this.frames[idx];
        if (!frame) continue;
        const x = (i % width) * tileSize;
        const y = Math.floor(i / width) * tileSize;
        this.view.tile(frame, x, y);
      }
    }
  }

  /** Scroll the map by moving the view to the negative of the offset. */
  setScroll(x: number, y: number): void {
    this.view.x = -x;
    this.view.y = -y;
  }
}
