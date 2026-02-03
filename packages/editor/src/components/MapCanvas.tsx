import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "../stores/editorStore";

/**
 * Canvas-based map viewport with pan, zoom, and tile editing.
 */
export function MapCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isPanning = useRef(false);
  const isPainting = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const lastPaintCoord = useRef<{ x: number; y: number } | null>(null);

  const mapWidth = useEditorStore((s) => s.mapWidth);
  const mapHeight = useEditorStore((s) => s.mapHeight);
  const tileSize = useEditorStore((s) => s.tileSize);
  const layers = useEditorStore((s) => s.layers);
  const properties = useEditorStore((s) => s.properties);
  const showGrid = useEditorStore((s) => s.showGrid);
  const viewport = useEditorStore((s) => s.viewport);
  const activeTool = useEditorStore((s) => s.activeTool);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const selectedTile = useEditorStore((s) => s.selectedTile);
  const spriteSheetImage = useEditorStore((s) => s.spriteSheetImage);
  const spriteSheet = useEditorStore((s) => s.spriteSheet);

  const setViewport = useEditorStore((s) => s.setViewport);
  const paintTile = useEditorStore((s) => s.paintTile);
  const eraseTile = useEditorStore((s) => s.eraseTile);
  const floodFill = useEditorStore((s) => s.floodFill);
  const selectTile = useEditorStore((s) => s.selectTile);
  const pushHistory = useEditorStore((s) => s.pushHistory);

  // ── Coordinate helpers ──────────────────────────────────────────────────

  const screenToTile = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const rect = canvas.getBoundingClientRect();
      const sx = clientX - rect.left;
      const sy = clientY - rect.top;
      const worldX = (sx - viewport.offsetX) / viewport.zoom;
      const worldY = (sy - viewport.offsetY) / viewport.zoom;
      const tx = Math.floor(worldX / tileSize);
      const ty = Math.floor(worldY / tileSize);
      if (tx < 0 || tx >= mapWidth || ty < 0 || ty >= mapHeight) return null;
      return { x: tx, y: ty };
    },
    [viewport, tileSize, mapWidth, mapHeight]
  );

  // ── Drawing ─────────────────────────────────────────────────────────────

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);

    // Background
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(viewport.offsetX, viewport.offsetY);
    ctx.scale(viewport.zoom, viewport.zoom);

    // Map area background
    ctx.fillStyle = "#16213e";
    ctx.fillRect(0, 0, mapWidth * tileSize, mapHeight * tileSize);

    // Render layers bottom-up
    const sortedLayers = [...layers].sort((a, b) => a.id - b.id);
    for (const layer of sortedLayers) {
      if (!layer.visible) continue;
      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
          const tileIdx = layer.data[y * mapWidth + x];
          if (tileIdx < 0) continue;

          const dx = x * tileSize;
          const dy = y * tileSize;

          if (spriteSheetImage && spriteSheet) {
            // Draw from sprite sheet
            const col = tileIdx % spriteSheet.columns;
            const row = Math.floor(tileIdx / spriteSheet.columns);
            ctx.drawImage(
              spriteSheetImage,
              col * spriteSheet.tileWidth,
              row * spriteSheet.tileHeight,
              spriteSheet.tileWidth,
              spriteSheet.tileHeight,
              dx,
              dy,
              tileSize,
              tileSize
            );
          } else {
            // Fallback: colour-coded placeholder
            const hue = (tileIdx * 37) % 360;
            ctx.fillStyle = `hsl(${hue}, 60%, 45%)`;
            ctx.fillRect(dx, dy, tileSize, tileSize);
            ctx.fillStyle = "#fff";
            ctx.font = `${Math.max(8, tileSize * 0.3)}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
              String(tileIdx),
              dx + tileSize / 2,
              dy + tileSize / 2
            );
          }
        }
      }
    }

    // Property markers (small dots for tiles with props)
    for (const key of Object.keys(properties)) {
      const parts = key.split(":");
      if (parts.length !== 3) continue;
      const px = parseInt(parts[1], 10);
      const py = parseInt(parts[2], 10);
      const prop = properties[key];
      if (prop.collision === "none" && prop.flags.length === 0) continue;
      const cx = px * tileSize + tileSize - 4;
      const cy = py * tileSize + 4;
      ctx.fillStyle =
        prop.collision === "solid"
          ? "#ff4444"
          : prop.collision === "trigger"
            ? "#44ff44"
            : prop.collision === "platform"
              ? "#4488ff"
              : "#ffaa00";
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Grid overlay
    if (showGrid) {
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.lineWidth = 1 / viewport.zoom;
      for (let x = 0; x <= mapWidth; x++) {
        ctx.beginPath();
        ctx.moveTo(x * tileSize, 0);
        ctx.lineTo(x * tileSize, mapHeight * tileSize);
        ctx.stroke();
      }
      for (let y = 0; y <= mapHeight; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * tileSize);
        ctx.lineTo(mapWidth * tileSize, y * tileSize);
        ctx.stroke();
      }
    }

    // Highlight selected tile
    if (selectedTile) {
      ctx.strokeStyle = "#ffcc00";
      ctx.lineWidth = 2 / viewport.zoom;
      ctx.strokeRect(
        selectedTile.x * tileSize,
        selectedTile.y * tileSize,
        tileSize,
        tileSize
      );
    }

    // Highlight active layer non-empty tiles with subtle border
    const activeLayer = layers.find((l) => l.id === activeLayerId);
    if (activeLayer && activeTool === "select") {
      ctx.strokeStyle = "rgba(100,200,255,0.3)";
      ctx.lineWidth = 1 / viewport.zoom;
      for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
          if (activeLayer.data[y * mapWidth + x] >= 0) {
            ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
          }
        }
      }
    }

    ctx.restore();
  }, [
    mapWidth,
    mapHeight,
    tileSize,
    layers,
    properties,
    showGrid,
    viewport,
    selectedTile,
    activeLayerId,
    activeTool,
    spriteSheetImage,
    spriteSheet,
  ]);

  // Redraw on every relevant state change
  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  // ── Event handlers ──────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Middle-click or space+click → pan
      if (e.button === 1) {
        isPanning.current = true;
        lastPan.current = { x: e.clientX, y: e.clientY };
        e.preventDefault();
        return;
      }

      if (e.button !== 0) return;

      const coord = screenToTile(e.clientX, e.clientY);
      if (!coord) return;

      if (activeTool === "select") {
        selectTile(coord);
        return;
      }

      if (activeTool === "fill") {
        pushHistory();
        floodFill(coord.x, coord.y);
        return;
      }

      // Paint or erase — start drag
      pushHistory();
      isPainting.current = true;
      lastPaintCoord.current = coord;
      if (activeTool === "paint") {
        paintTile(coord.x, coord.y);
      } else if (activeTool === "erase") {
        eraseTile(coord.x, coord.y);
      }
    },
    [activeTool, screenToTile, paintTile, eraseTile, floodFill, selectTile, pushHistory]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isPanning.current) {
        const dx = e.clientX - lastPan.current.x;
        const dy = e.clientY - lastPan.current.y;
        lastPan.current = { x: e.clientX, y: e.clientY };
        setViewport({
          offsetX: viewport.offsetX + dx,
          offsetY: viewport.offsetY + dy,
        });
        return;
      }

      if (!isPainting.current) return;

      const coord = screenToTile(e.clientX, e.clientY);
      if (!coord) return;
      if (
        lastPaintCoord.current &&
        lastPaintCoord.current.x === coord.x &&
        lastPaintCoord.current.y === coord.y
      )
        return;
      lastPaintCoord.current = coord;

      if (activeTool === "paint") {
        paintTile(coord.x, coord.y);
      } else if (activeTool === "erase") {
        eraseTile(coord.x, coord.y);
      }
    },
    [activeTool, viewport, screenToTile, paintTile, eraseTile, setViewport]
  );

  const handleMouseUp = useCallback(() => {
    isPanning.current = false;
    isPainting.current = false;
    lastPaintCoord.current = null;
  }, []);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      const factor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
      const newZoom = Math.min(Math.max(viewport.zoom * factor, 0.1), 10);

      // Zoom toward cursor
      const wx = (mx - viewport.offsetX) / viewport.zoom;
      const wy = (my - viewport.offsetY) / viewport.zoom;
      setViewport({
        zoom: newZoom,
        offsetX: mx - wx * newZoom,
        offsetY: my - wy * newZoom,
      });
    },
    [viewport, setViewport]
  );

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-crosshair"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
    />
  );
}
