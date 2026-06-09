import { Assets } from "pixi.js";
import type { AssetsManifest, Spritesheet, Texture } from "pixi.js";

/**
 * Thin, typed wrapper around PixiJS global `Assets`.
 *
 * Usage:
 *   const loader = new AssetLoader();
 *   await loader.init(manifest);      // once, at boot
 *   await loader.loadBundle("game");  // per scene
 *   const tex = loader.texture("hero");
 *   const frames = loader.animation("army.json", "walk");
 */
export class AssetLoader {
  private initialized = false;

  /** Initialize Pixi Assets with a manifest. Idempotent. */
  async init(manifest: AssetsManifest): Promise<void> {
    if (this.initialized) return;
    await Assets.init({ manifest });
    this.initialized = true;
  }

  /** Load a manifest bundle by name. */
  async loadBundle(name: string): Promise<unknown> {
    this.assertReady();
    return Assets.loadBundle(name);
  }

  /** Get a loaded texture by alias. */
  texture(alias: string): Texture {
    this.assertReady();
    return Assets.get<Texture>(alias);
  }

  /** Get an animation's frame textures from a loaded spritesheet alias. */
  animation(sheetAlias: string, name: string): Texture[] {
    this.assertReady();
    const sheet = Assets.get<Spritesheet>(sheetAlias);
    const frames = sheet?.animations?.[name];
    if (!frames) {
      throw new Error(
        `AssetLoader: animation "${name}" not found in spritesheet "${sheetAlias}"`,
      );
    }
    return frames;
  }

  private assertReady(): void {
    if (!this.initialized) {
      throw new Error("AssetLoader: call init(manifest) before loading assets");
    }
  }
}
