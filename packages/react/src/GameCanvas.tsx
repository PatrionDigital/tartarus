import { useEffect, useRef, useCallback } from "react";
import { GameEngine } from "@tartarus/core";
import { InputSystem } from "@tartarus/core";
import type { InputState } from "@tartarus/core";
import { SceneManager, Scene } from "@tartarus/core";

export interface GameCanvasProps {
  /** Called when engine is initialized */
  onReady?: (engine: GameEngine, input: InputSystem, sceneManager?: SceneManager) => void;
  /** Called each frame with delta time in ms and input state */
  onUpdate?: (deltaMs: number, input: InputState) => void;
  /** CSS class name for the container */
  className?: string;
  /** Background color (hex) */
  backgroundColor?: number;
  /** Scenes to register (optional scene-based mode) */
  scenes?: Scene[];
  /** Initial scene name to switch to */
  initialScene?: string;
  /** Whether the game is currently playing */
  isPlaying?: boolean;
  /** Whether the game is currently paused */
  isPaused?: boolean;
  /** Called when game should start */
  onStart?: () => void;
  /** Called when game should pause */
  onPause?: () => void;
}

/**
 * GameCanvas - React component wrapper for the Tartarus game engine
 *
 * Handles:
 * - Engine initialization and cleanup
 * - Window resize events
 * - Optional scene-based UI
 *
 * @example
 * ```tsx
 * <GameCanvas
 *   onReady={(engine) => console.log('Engine ready')}
 *   onUpdate={(delta) => updateGame(delta)}
 *   className="w-full h-full"
 * />
 * ```
 */
export function GameCanvas({
  onReady,
  onUpdate,
  className = "",
  backgroundColor = 0x1a1a2e,
  scenes,
  initialScene,
  isPlaying = false,
  isPaused = false,
  onPause,
}: GameCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const inputRef = useRef<InputSystem | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);

  // Store callbacks in refs to avoid re-initializing engine when they change
  const onUpdateRef = useRef(onUpdate);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  // Handle resize
  const handleResize = useCallback(() => {
    const container = containerRef.current;
    const engine = engineRef.current;
    if (!container || !engine) return;

    const { clientWidth, clientHeight } = container;
    if (clientWidth > 0 && clientHeight > 0) {
      engine.resize(clientWidth, clientHeight);
    }
  }, []);

  // Initialize engine
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;
    let resizeObserver: ResizeObserver | null = null;

    const engine = new GameEngine();
    const input = new InputSystem();
    engineRef.current = engine;
    inputRef.current = input;

    const initEngine = async () => {
      try {
        await engine.init(container, { backgroundColor });

        if (isCancelled) {
          engine.destroy();
          input.destroy();
          return;
        }

        resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);
        handleResize();

        input.attach(container);

        // Initialize SceneManager if scenes provided
        let sceneManager: SceneManager | undefined;
        if (scenes && engine.stage) {
          sceneManager = new SceneManager(engine.stage);
          sceneManagerRef.current = sceneManager;

          for (const scene of scenes) {
            sceneManager.register(scene);
          }

          if (initialScene) {
            sceneManager.switchTo(initialScene);
          }

          engine.onUpdate((deltaMs) => {
            sceneManager?.update(deltaMs);
            if (onUpdateRef.current) {
              onUpdateRef.current(deltaMs, input.getState());
            }
          });

          engine.start();
        } else {
          engine.onUpdate((deltaMs) => {
            if (onUpdateRef.current) {
              onUpdateRef.current(deltaMs, input.getState());
            }
          });
        }

        if (onReadyRef.current) {
          onReadyRef.current(engine, input, sceneManager);
        }
      } catch (error) {
        if (!isCancelled) {
          console.error("Failed to initialize game engine:", error);
        }
      }
    };

    initEngine();

    return () => {
      isCancelled = true;
      resizeObserver?.disconnect();
      sceneManagerRef.current?.destroy();
      sceneManagerRef.current = null;
      input.destroy();
      engine.destroy();
      engineRef.current = null;
      inputRef.current = null;
      onPause?.();
    };
  }, [backgroundColor, handleResize, scenes, initialScene, onPause]);

  // Sync game state with engine
  useEffect(() => {
    const engine = engineRef.current;
    const input = inputRef.current;
    if (!engine || !engine.isInitialized) return;

    if (isPlaying && !isPaused) {
      if (!engine.isRunning) {
        engine.start();
      } else if (engine.isPaused) {
        engine.resume();
      }
      input?.enable();
    } else if (isPlaying && isPaused) {
      if (engine.isRunning) {
        engine.pause();
      }
      input?.disable();
    } else if (!isPlaying) {
      if (engine.isRunning || engine.isPaused) {
        engine.stop();
      }
      input?.disable();
    }
  }, [isPlaying, isPaused]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      style={{ touchAction: "none" }}
    />
  );
}
