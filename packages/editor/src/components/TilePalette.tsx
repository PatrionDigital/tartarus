import { useRef, useCallback } from "react";
import { useEditorStore } from "../stores/editorStore";
import type { SpriteSheetConfig } from "../types";

/**
 * Tile palette: import a sprite sheet, configure slicing, select tiles.
 */
export function TilePalette() {
  const fileRef = useRef<HTMLInputElement>(null);

  const spriteSheet = useEditorStore((s) => s.spriteSheet);
  const spriteSheetImage = useEditorStore((s) => s.spriteSheetImage);
  const selectedTileIndex = useEditorStore((s) => s.selectedTileIndex);
  const setSpriteSheet = useEditorStore((s) => s.setSpriteSheet);
  const setSelectedTileIndex = useEditorStore((s) => s.setSelectedTileIndex);
  const tileSize = useEditorStore((s) => s.tileSize);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        const img = new Image();
        img.onload = () => {
          const tw = tileSize;
          const th = tileSize;
          const cols = Math.floor(img.width / tw);
          const rows = Math.floor(img.height / th);
          const config: SpriteSheetConfig = {
            src: dataUrl,
            tileWidth: tw,
            tileHeight: th,
            columns: cols,
            rows: rows,
          };
          setSpriteSheet(config, img);
        };
        img.src = dataUrl;
      };
      reader.readAsDataURL(file);
    },
    [tileSize, setSpriteSheet]
  );

  const totalTiles = spriteSheet
    ? spriteSheet.columns * spriteSheet.rows
    : 0;

  const paletteColSize = 40; // display size per tile in palette

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-800 rounded text-gray-200 text-sm">
      <div className="font-semibold text-xs uppercase tracking-wide text-gray-400">
        Tile Palette
      </div>

      {/* Import button */}
      <button
        className="px-2 py-1 bg-blue-600 hover:bg-blue-500 rounded text-xs"
        onClick={() => fileRef.current?.click()}
      >
        Import Sprite Sheet
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Sprite sheet info */}
      {spriteSheet && (
        <div className="text-xs text-gray-400">
          {spriteSheet.columns}×{spriteSheet.rows} tiles ({spriteSheet.tileWidth}×
          {spriteSheet.tileHeight}px)
        </div>
      )}

      {/* Tile grid */}
      {spriteSheetImage && spriteSheet && (
        <div
          className="grid gap-px overflow-y-auto max-h-64"
          style={{
            gridTemplateColumns: `repeat(${Math.min(spriteSheet.columns, 8)}, ${paletteColSize}px)`,
          }}
        >
          {Array.from({ length: totalTiles }, (_, i) => {
            const col = i % spriteSheet.columns;
            const row = Math.floor(i / spriteSheet.columns);
            return (
              <canvas
                key={i}
                width={paletteColSize}
                height={paletteColSize}
                className={`cursor-pointer border ${
                  selectedTileIndex === i
                    ? "border-yellow-400 border-2"
                    : "border-gray-600"
                }`}
                onClick={() => setSelectedTileIndex(i)}
                ref={(cvs) => {
                  if (!cvs) return;
                  const ctx = cvs.getContext("2d");
                  if (!ctx) return;
                  ctx.clearRect(0, 0, paletteColSize, paletteColSize);
                  ctx.imageSmoothingEnabled = false;
                  ctx.drawImage(
                    spriteSheetImage,
                    col * spriteSheet.tileWidth,
                    row * spriteSheet.tileHeight,
                    spriteSheet.tileWidth,
                    spriteSheet.tileHeight,
                    0,
                    0,
                    paletteColSize,
                    paletteColSize
                  );
                }}
              />
            );
          })}
        </div>
      )}

      {/* Fallback: numeric palette when no sprite sheet */}
      {!spriteSheetImage && (
        <div className="grid grid-cols-8 gap-px">
          {Array.from({ length: 32 }, (_, i) => (
            <button
              key={i}
              className={`w-8 h-8 text-xs flex items-center justify-center rounded ${
                selectedTileIndex === i
                  ? "bg-yellow-500 text-black"
                  : "bg-gray-700 hover:bg-gray-600 text-gray-300"
              }`}
              onClick={() => setSelectedTileIndex(i)}
            >
              {i}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
