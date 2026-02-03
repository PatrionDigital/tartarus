import { useEffect, useCallback } from "react";
import { useEditorStore } from "../stores/editorStore";
import { Toolbar } from "./Toolbar";
import { MapCanvas } from "./MapCanvas";
import { TilePalette } from "./TilePalette";
import { LayerPanel } from "./LayerPanel";
import { PropertyPanel } from "./PropertyPanel";
import { NewMapDialog } from "./NewMapDialog";

/**
 * TileMapEditor — drop-in main component for the level editor.
 *
 * Renders the full editor layout: toolbar, canvas viewport, and side panels.
 */
export function TileMapEditor() {
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);

  // ── Keyboard shortcuts ──────────────────────────────────────────────────

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey;
      if (meta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (meta && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      } else if (meta && e.key === "y") {
        e.preventDefault();
        redo();
      }
    },
    [undo, redo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-full w-full bg-gray-900 text-gray-200 select-none">
      {/* Toolbar */}
      <Toolbar />

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
        {/* Left sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 p-2 overflow-y-auto border-r border-gray-700">
          <TilePalette />
          <LayerPanel />
        </div>

        {/* Canvas viewport */}
        <div className="flex-1 relative min-w-0">
          <MapCanvas />
        </div>

        {/* Right sidebar */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2 p-2 overflow-y-auto border-l border-gray-700">
          <PropertyPanel />
        </div>
      </div>

      {/* Dialogs */}
      <NewMapDialog />
    </div>
  );
}
