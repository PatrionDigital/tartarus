import { useState } from "react";
import { useEditorStore } from "../stores/editorStore";
import { COLLISION_TYPES, SPECIAL_FLAGS } from "../types";
import type { CollisionType, TileProperty } from "../types";

/**
 * Property editor panel — appears in select mode when a tile is selected.
 */
export function PropertyPanel() {
  const selectedTile = useEditorStore((s) => s.selectedTile);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const properties = useEditorStore((s) => s.properties);
  const layers = useEditorStore((s) => s.layers);
  const setTileProperty = useEditorStore((s) => s.setTileProperty);
  const removeTileProperty = useEditorStore((s) => s.removeTileProperty);
  const mapWidth = useEditorStore((s) => s.mapWidth);

  const [newMetaKey, setNewMetaKey] = useState("");
  const [newMetaVal, setNewMetaVal] = useState("");

  if (!selectedTile) {
    return (
      <div className="p-2 bg-gray-800 rounded text-gray-400 text-sm">
        <div className="font-semibold text-xs uppercase tracking-wide mb-1">
          Properties
        </div>
        <p className="text-xs">Select a tile to edit its properties.</p>
      </div>
    );
  }

  const { x, y } = selectedTile;
  const propKey = `${activeLayerId}:${x}:${y}`;
  const prop: TileProperty = properties[propKey] ?? {
    collision: "none",
    flags: [],
    metadata: {},
  };

  const layer = layers.find((l) => l.id === activeLayerId);
  const tileIndex = layer ? layer.data[y * mapWidth + x] : -1;

  const update = (patch: Partial<TileProperty>) => {
    const merged: TileProperty = { ...prop, ...patch };
    // If default, remove instead of storing
    if (
      merged.collision === "none" &&
      merged.flags.length === 0 &&
      Object.keys(merged.metadata).length === 0
    ) {
      removeTileProperty(propKey);
    } else {
      setTileProperty(propKey, merged);
    }
  };

  const toggleFlag = (flag: string) => {
    const flags = prop.flags.includes(flag)
      ? prop.flags.filter((f) => f !== flag)
      : [...prop.flags, flag];
    update({ flags });
  };

  const setMeta = (key: string, value: string) => {
    update({ metadata: { ...prop.metadata, [key]: value } });
  };

  const removeMeta = (key: string) => {
    const { [key]: _, ...rest } = prop.metadata;
    update({ metadata: rest });
  };

  const addMeta = () => {
    if (!newMetaKey.trim()) return;
    setMeta(newMetaKey.trim(), newMetaVal);
    setNewMetaKey("");
    setNewMetaVal("");
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-800 rounded text-gray-200 text-sm">
      <div className="font-semibold text-xs uppercase tracking-wide text-gray-400">
        Properties
      </div>

      <div className="text-xs text-gray-400">
        Layer {activeLayerId} · Tile ({x}, {y}) · Index: {tileIndex}
      </div>

      {/* Collision type */}
      <div>
        <label className="text-xs text-gray-400 block mb-0.5">Collision</label>
        <select
          className="w-full bg-gray-900 text-gray-200 text-xs px-1 py-0.5 rounded"
          value={prop.collision}
          onChange={(e) =>
            update({ collision: e.target.value as CollisionType })
          }
        >
          {COLLISION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      {/* Special flags */}
      <div>
        <label className="text-xs text-gray-400 block mb-0.5">
          Special Flags
        </label>
        <div className="flex flex-wrap gap-1">
          {SPECIAL_FLAGS.map((flag) => (
            <button
              key={flag}
              className={`text-xs px-1.5 py-0.5 rounded ${
                prop.flags.includes(flag)
                  ? "bg-yellow-600 text-black"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
              onClick={() => toggleFlag(flag)}
            >
              {flag}
            </button>
          ))}
        </div>
      </div>

      {/* Custom metadata */}
      <div>
        <label className="text-xs text-gray-400 block mb-0.5">Metadata</label>
        {Object.entries(prop.metadata).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1 mb-0.5">
            <span className="text-xs text-gray-400 w-16 truncate">{k}</span>
            <input
              className="flex-1 bg-gray-900 text-xs text-gray-200 px-1 py-0.5 rounded"
              value={v}
              onChange={(e) => setMeta(k, e.target.value)}
            />
            <button
              className="text-xs text-red-400 hover:text-red-300"
              onClick={() => removeMeta(k)}
            >
              ✕
            </button>
          </div>
        ))}
        <div className="flex items-center gap-1 mt-1">
          <input
            className="w-16 bg-gray-900 text-xs text-gray-200 px-1 py-0.5 rounded"
            placeholder="key"
            value={newMetaKey}
            onChange={(e) => setNewMetaKey(e.target.value)}
          />
          <input
            className="flex-1 bg-gray-900 text-xs text-gray-200 px-1 py-0.5 rounded"
            placeholder="value"
            value={newMetaVal}
            onChange={(e) => setNewMetaVal(e.target.value)}
          />
          <button
            className="text-xs px-1.5 py-0.5 bg-green-600 hover:bg-green-500 rounded"
            onClick={addMeta}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
