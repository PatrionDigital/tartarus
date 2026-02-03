import { useRef, useCallback } from "react";
import { useEditorStore } from "../stores/editorStore";
import type { EditorTool, TileMap } from "../types";

const TOOLS: { id: EditorTool; label: string; icon: string }[] = [
  { id: "paint", label: "Paint", icon: "🖌" },
  { id: "select", label: "Select", icon: "👆" },
  { id: "erase", label: "Erase", icon: "🧹" },
  { id: "fill", label: "Fill", icon: "🪣" },
];

/**
 * Top toolbar: New, Save, Load, Undo/Redo, tool selection, grid, zoom.
 */
export function Toolbar() {
  const fileRef = useRef<HTMLInputElement>(null);

  const activeTool = useEditorStore((s) => s.activeTool);
  const showGrid = useEditorStore((s) => s.showGrid);
  const viewport = useEditorStore((s) => s.viewport);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const mapName = useEditorStore((s) => s.mapName);

  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const setShowGrid = useEditorStore((s) => s.setShowGrid);
  const setViewport = useEditorStore((s) => s.setViewport);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const exportMap = useEditorStore((s) => s.exportMap);
  const importMap = useEditorStore((s) => s.importMap);
  const setShowNewMapDialog = useEditorStore((s) => s.setShowNewMapDialog);

  // ── Save ────────────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    const map = exportMap();
    const json = JSON.stringify(map, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${map.name || "tilemap"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [exportMap]);

  // ── Load ────────────────────────────────────────────────────────────────

  const handleLoad = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const map: TileMap = JSON.parse(reader.result as string);
          importMap(map);
        } catch (err) {
          console.error("Failed to parse map JSON:", err);
        }
      };
      reader.readAsText(file);
      // Reset input so the same file can be reloaded
      e.target.value = "";
    },
    [importMap]
  );

  // ── Zoom ────────────────────────────────────────────────────────────────

  const zoomIn = () =>
    setViewport({ zoom: Math.min(viewport.zoom * 1.25, 10) });
  const zoomOut = () =>
    setViewport({ zoom: Math.max(viewport.zoom / 1.25, 0.1) });
  const zoomReset = () =>
    setViewport({ zoom: 1, offsetX: 0, offsetY: 0 });

  // ── Button style helper ─────────────────────────────────────────────────

  const btn =
    "px-2 py-1 text-xs rounded transition-colors";
  const btnDefault = `${btn} bg-gray-700 hover:bg-gray-600 text-gray-200`;
  const btnActive = `${btn} bg-blue-600 text-white`;
  const btnDisabled = `${btn} bg-gray-700 text-gray-500 cursor-not-allowed`;

  return (
    <div className="flex items-center gap-1 p-1.5 bg-gray-900 rounded flex-wrap">
      {/* Map name */}
      <span className="text-xs text-gray-400 mr-2 truncate max-w-32">
        {mapName}
      </span>

      {/* New / Save / Load */}
      <button className={btnDefault} onClick={() => setShowNewMapDialog(true)}>
        📄 New
      </button>
      <button className={btnDefault} onClick={handleSave}>
        💾 Save
      </button>
      <button className={btnDefault} onClick={() => fileRef.current?.click()}>
        📂 Load
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleLoad}
      />

      <div className="w-px h-5 bg-gray-600 mx-1" />

      {/* Undo / Redo */}
      <button
        className={undoStack.length > 0 ? btnDefault : btnDisabled}
        onClick={undo}
        disabled={undoStack.length === 0}
        title="Undo"
      >
        ↩
      </button>
      <button
        className={redoStack.length > 0 ? btnDefault : btnDisabled}
        onClick={redo}
        disabled={redoStack.length === 0}
        title="Redo"
      >
        ↪
      </button>

      <div className="w-px h-5 bg-gray-600 mx-1" />

      {/* Tools */}
      {TOOLS.map((tool) => (
        <button
          key={tool.id}
          className={activeTool === tool.id ? btnActive : btnDefault}
          onClick={() => setActiveTool(tool.id)}
          title={tool.label}
        >
          {tool.icon} {tool.label}
        </button>
      ))}

      <div className="w-px h-5 bg-gray-600 mx-1" />

      {/* Grid toggle */}
      <button
        className={showGrid ? btnActive : btnDefault}
        onClick={() => setShowGrid(!showGrid)}
        title="Toggle grid"
      >
        #
      </button>

      {/* Zoom */}
      <button className={btnDefault} onClick={zoomOut} title="Zoom out">
        −
      </button>
      <span className="text-xs text-gray-400 w-10 text-center">
        {Math.round(viewport.zoom * 100)}%
      </span>
      <button className={btnDefault} onClick={zoomIn} title="Zoom in">
        +
      </button>
      <button className={btnDefault} onClick={zoomReset} title="Reset view">
        ⌂
      </button>
    </div>
  );
}
