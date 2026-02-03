import {
  type EnemyTypeConfig,
  type EnemyTypeConfigJSON,
  parseEnemyTypeConfig,
  validateEnemyTypeConfig,
} from "@tartarus/core";

/**
 * Config loader interface — injectable strategy for loading enemy configs.
 * Consumers provide their own implementation (fetch, fs, bundled, etc.)
 */
export interface ConfigLoader {
  loadJSON<T>(path: string): Promise<T>;
}

/**
 * Default fetch-based config loader (works in browsers)
 */
export class FetchConfigLoader implements ConfigLoader {
  async loadJSON<T>(path: string): Promise<T> {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to load config: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }
}

/**
 * Registry for loading and caching enemy type configurations
 *
 * Loads enemy configs from JSON files and provides access to them.
 * Configs are cached after first load to avoid repeated loads.
 */
export class EnemyTypeRegistry {
  private configs: Map<string, EnemyTypeConfig> = new Map();
  private basePath: string;
  private loader: ConfigLoader;

  /**
   * Create a new registry
   * @param basePath - Base path for loading JSON files (default: /data/enemies/)
   * @param loader - Config loader strategy (default: FetchConfigLoader)
   */
  constructor(basePath: string = "/data/enemies/", loader?: ConfigLoader) {
    this.basePath = basePath;
    this.loader = loader ?? new FetchConfigLoader();
  }

  /**
   * Load an enemy type config by ID
   * @param id - Enemy type ID (filename without .json)
   * @returns The config, or null if not found or invalid
   */
  async load(id: string): Promise<EnemyTypeConfig | null> {
    // Return cached if available
    const cached = this.configs.get(id);
    if (cached) {
      return cached;
    }

    try {
      const json = await this.loader.loadJSON<unknown>(`${this.basePath}${id}.json`);

      if (!validateEnemyTypeConfig(json)) {
        console.warn(`Invalid enemy config format for '${id}'`);
        return null;
      }

      const config = parseEnemyTypeConfig(json as EnemyTypeConfigJSON);
      this.configs.set(id, config);

      return config;
    } catch (error) {
      console.warn(`Error loading enemy config '${id}':`, error);
      return null;
    }
  }

  /**
   * Load multiple enemy configs at once
   * @param ids - Array of enemy type IDs
   * @returns Promise that resolves when all are loaded (or failed)
   */
  async loadMultiple(ids: string[]): Promise<void> {
    await Promise.all(ids.map((id) => this.load(id)));
  }

  /**
   * Register a config directly (bypasses loader)
   */
  register(config: EnemyTypeConfig): void {
    this.configs.set(config.id, config);
  }

  /**
   * Get a cached config by ID
   */
  get(id: string): EnemyTypeConfig | undefined {
    return this.configs.get(id);
  }

  /**
   * Get all loaded configs
   */
  getAll(): EnemyTypeConfig[] {
    return Array.from(this.configs.values());
  }

  /**
   * Clear all cached configs
   */
  clear(): void {
    this.configs.clear();
  }

  /**
   * Check if a config is loaded
   */
  has(id: string): boolean {
    return this.configs.has(id);
  }
}
