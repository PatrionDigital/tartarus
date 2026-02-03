import { useState } from "react";
import { useEditorStore } from "../stores/editorStore";

/**
 * Dialog for creating a new map (name, dimensions, tile size).
 */
export function NewMapDialog() {
  const show = useEditorStore((s) => s.showNewMapDialog);
  const newMap = useEditorStore((s) => s.newMap);
  const setShowNewMapDialog = useEditorStore((s) => s.setShowNewMapDialog);

  const [name, setName] = useState("Untitled");
  const [width, setWidth] = useState(32);
  const [height, setHeight] = useState(32);
  const [tileSz, setTileSz] = useState(32);

  if (!show) return null;

  const handleCreate = () => {
    newMap(
      name || "Untitled",
      Math.max(1, Math.min(512, width)),
      Math.max(1, Math.min(512, height)),
      tileSz
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg p-4 w-72 text-gray-200 shadow-xl">
        <h3 className="text-sm font-semibold mb-3">New Map</h3>

        <label className="block text-xs text-gray-400 mb-0.5">Name</label>
        <input
          className="w-full bg-gray-900 text-sm px-2 py-1 rounded mb-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-0.5">
              Width (tiles)
            </label>
            <input
              type="number"
              className="w-full bg-gray-900 text-sm px-2 py-1 rounded"
              value={width}
              min={1}
              max={512}
              onChange={(e) => setWidth(parseInt(e.target.value) || 1)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-gray-400 mb-0.5">
              Height (tiles)
            </label>
            <input
              type="number"
              className="w-full bg-gray-900 text-sm px-2 py-1 rounded"
              value={height}
              min={1}
              max={512}
              onChange={(e) => setHeight(parseInt(e.target.value) || 1)}
            />
          </div>
        </div>

        <label className="block text-xs text-gray-400 mb-0.5">
          Tile Size (px)
        </label>
        <select
          className="w-full bg-gray-900 text-sm px-2 py-1 rounded mb-3"
          value={tileSz}
          onChange={(e) => setTileSz(parseInt(e.target.value))}
        >
          <option value={16}>16×16</option>
          <option value={32}>32×32</option>
          <option value={64}>64×64</option>
        </select>

        <div className="flex gap-2">
          <button
            className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-sm"
            onClick={handleCreate}
          >
            Create
          </button>
          <button
            className="flex-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-500 rounded text-sm"
            onClick={() => setShowNewMapDialog(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
