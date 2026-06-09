import { describe, it, expect, vi, beforeEach } from "vitest";

const tile = vi.fn();
const clear = vi.fn();
let lastInstance: { x: number; y: number };

vi.mock("@pixi/tilemap", () => ({
  CompositeTilemap: class {
    x = 0;
    y = 0;
    tile = tile;
    clear = clear;
    constructor() {
      lastInstance = this;
    }
  },
}));

// Avoid constructing real GPU textures; stub Texture + Rectangle.
vi.mock("pixi.js", () => ({
  Texture: class {
    source: unknown;
    frame: unknown;
    constructor(opts: { source: unknown; frame: unknown }) {
      this.source = opts.source;
      this.frame = opts.frame;
    }
  },
  Rectangle: class {
    constructor(
      public x: number,
      public y: number,
      public width: number,
      public height: number,
    ) {}
  },
}));

import { TilemapRenderer } from "./TilemapRenderer";
import type { TileMap } from "./types";
import type { Texture } from "pixi.js";

function makeMap(): TileMap {
  // 2x2 map, 16px tiles. One ground layer: tiles [0, -1, -1, 1].
  return {
    name: "t",
    width: 2,
    height: 2,
    tileSize: 16,
    spriteSheet: { src: "ts.png", tileWidth: 16, tileHeight: 16, columns: 2, rows: 1 },
    layers: [
      { id: 0, name: "Ground", visible: true, locked: false, collisionMask: 0, data: [0, -1, -1, 1] },
    ],
    properties: {},
  };
}

const tileset = { source: { label: "ts" } } as unknown as Texture;

describe("TilemapRenderer", () => {
  beforeEach(() => {
    tile.mockClear();
    clear.mockClear();
  });

  it("places one tile() per non-empty cell at pixel coords", () => {
    new TilemapRenderer(makeMap(), tileset);
    // Two non-empty tiles: index 0 at (0,0); index 3 at col1,row1 → (16,16).
    expect(tile).toHaveBeenCalledTimes(2);
    const calls = tile.mock.calls.map((c) => [c[1], c[2]]);
    expect(calls).toContainEqual([0, 0]);
    expect(calls).toContainEqual([16, 16]);
  });

  it("clears before rebuilding", () => {
    const r = new TilemapRenderer(makeMap(), tileset);
    clear.mockClear();
    r.rebuild();
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it("skips invisible layers", () => {
    const map = makeMap();
    map.layers[0].visible = false;
    new TilemapRenderer(map, tileset);
    expect(tile).not.toHaveBeenCalled();
  });

  it("setScroll moves the view by the negative offset", () => {
    const r = new TilemapRenderer(makeMap(), tileset);
    r.setScroll(32, 48);
    expect(r.view.x).toBe(-32);
    expect(r.view.y).toBe(-48);
  });
});
