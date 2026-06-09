import type { AnimatedSprite, Texture } from "pixi.js";

/** Named animation clips: state name → ordered frame textures. */
export interface AnimationClips {
  [state: string]: Texture[];
}

export interface PlayOptions {
  loop?: boolean;
  speed?: number;
}

/**
 * Drives an AnimatedSprite by named state. Switching to the current state is a
 * no-op; switching states swaps the frame set and restarts playback.
 */
export class AnimationController {
  private current?: string;

  constructor(
    private readonly sprite: AnimatedSprite,
    private readonly clips: AnimationClips,
  ) {}

  /** Current animation state, or undefined if nothing has played yet. */
  get state(): string | undefined {
    return this.current;
  }

  /** Play a named clip. No-op if already current. */
  play(state: string, opts: PlayOptions = {}): void {
    if (state === this.current) return;
    const frames = this.clips[state];
    if (!frames) {
      throw new Error(`AnimationController: unknown animation state "${state}"`);
    }
    this.current = state;
    this.sprite.textures = frames;
    if (opts.loop !== undefined) this.sprite.loop = opts.loop;
    if (opts.speed !== undefined) this.sprite.animationSpeed = opts.speed;
    this.sprite.gotoAndPlay(0);
  }

  /** Stop playback at the current frame. */
  stop(): void {
    this.sprite.stop();
  }
}
