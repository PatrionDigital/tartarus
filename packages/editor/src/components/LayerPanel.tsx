import { useEditorStore } from "../stores/editorStore";

/**
 * Layer management panel: visibility, locking, active selection, collision masks.
 */
export function LayerPanel() {
  const layers = useEditorStore((s) => s.layers);
  const activeLayerId = useEditorStore((s) => s.activeLayerId);
  const setActiveLayer = useEditorStore((s) => s.setActiveLayer);
  const toggleLayerVisibility = useEditorStore((s) => s.toggleLayerVisibility);
  const toggleLayerLocked = useEditorStore((s) => s.toggleLayerLocked);
  const renameLayer = useEditorStore((s) => s.renameLayer);
  const setLayerCollisionMask = useEditorStore((s) => s.setLayerCollisionMask);
  const addLayer = useEditorStore((s) => s.addLayer);

  return (
    <div className="flex flex-col gap-2 p-2 bg-gray-800 rounded text-gray-200 text-sm">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs uppercase tracking-wide text-gray-400">
          Layers
        </span>
        {layers.length < 16 && (
          <button
            className="text-xs px-2 py-0.5 bg-green-600 hover:bg-green-500 rounded"
            onClick={addLayer}
          >
            + Add
          </button>
        )}
      </div>

      <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
        {[...layers].reverse().map((layer) => {
          const isActive = layer.id === activeLayerId;
          return (
            <div
              key={layer.id}
              className={`flex items-center gap-1 px-1.5 py-1 rounded cursor-pointer ${
                isActive ? "bg-blue-700" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => setActiveLayer(layer.id)}
            >
              {/* Visibility toggle */}
              <button
                className="text-xs w-5 h-5 flex items-center justify-center"
                title={layer.visible ? "Hide layer" : "Show layer"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerVisibility(layer.id);
                }}
              >
                {layer.visible ? "👁" : "🚫"}
              </button>

              {/* Lock toggle */}
              <button
                className="text-xs w-5 h-5 flex items-center justify-center"
                title={layer.locked ? "Unlock" : "Lock"}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLayerLocked(layer.id);
                }}
              >
                {layer.locked ? "🔒" : "🔓"}
              </button>

              {/* Layer name */}
              <input
                className="flex-1 bg-transparent text-xs text-gray-200 outline-none min-w-0"
                value={layer.name}
                onChange={(e) => renameLayer(layer.id, e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />

              {/* Collision mask */}
              <input
                className="w-12 bg-gray-900 text-xs text-gray-300 px-1 rounded text-center"
                title="Collision mask (hex u16)"
                value={layer.collisionMask.toString(16).toUpperCase().padStart(4, "0")}
                onChange={(e) => {
                  const v = parseInt(e.target.value, 16);
                  if (!isNaN(v)) setLayerCollisionMask(layer.id, v);
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
