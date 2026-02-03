/**
 * @tartarus/waves
 *
 * Wave system: wave manager, event system, spawn patterns
 */

// Types
export type {
  WaveEventType,
  SpawnPatternType,
  SpawnPatternConfig,
  SpawnPattern,
  EventRepeat,
  TimedEventData,
  TimedEvent,
  WavePhase,
  WaveGlobalSettings,
  WaveConfigMetadata,
  WaveConfig,
  WaveState,
} from "./types";

// Wave Config Registry
export { WaveConfigRegistry } from "./WaveConfigRegistry";

// Wave Manager
export { WaveManager } from "./WaveManager";
export type { PhaseChangeCallback, EventCallback } from "./WaveManager";

// Wave Controller
export { WaveController } from "./WaveController";

// Event Executor
export { EventExecutor } from "./EventExecutor";
export type { SpawnCommand, SpawnModifier, EventWarning } from "./EventExecutor";

// Spawn Patterns
export { SpawnPatterns } from "./SpawnPatterns";
export type { ViewportInfo } from "./SpawnPatterns";
