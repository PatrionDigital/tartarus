import { Container, Graphics } from "pixi.js";
import { Scene } from "../SceneManager";
import { InputSystem, type InputState } from "../InputSystem";
import { Camera } from "../Camera";
import { createGameWorld, type GameWorld, type Entity } from "../ecs/World";
import { movementSystem } from "../ecs/systems/MovementSystem";
import { renderSystem } from "../ecs/systems/RenderSystem";
import { invincibilitySystem } from "../ecs/systems/InvincibilitySystem";

/**
 * Grid background settings
 */
export interface GridConfig {
  size: number;
  colorPrimary: number;
  colorSecondary: number;
  lineColor: number;
  lineAlpha: number;
}

const DEFAULT_GRID: GridConfig = {
  size: 64,
  colorPrimary: 0x1a1a2e,
  colorSecondary: 0x16213e,
  lineColor: 0x0f3460,
  lineAlpha: 0.5,
};

/**
 * Player visual config
 */
export interface PlayerConfig {
  radius: number;
  color: number;
  strokeColor: number;
  strokeWidth: number;
  speed: number;
  health: number;
  startX: number;
  startY: number;
}

const DEFAULT_PLAYER: PlayerConfig = {
  radius: 20,
  color: 0x00ff88,
  strokeColor: 0xffffff,
  strokeWidth: 3,
  speed: 200,
  health: 100,
  startX: 0,
  startY: 0,
};

/**
 * SkeletonGameScene — minimal playable scene with player + camera.
 *
 * Use this as a starting point for building your own game.
 * Wires up: ECS world, player entity, camera follow, grid background,
 * input handling, and the render system.
 *
 * Extend or compose on top of this to add combat, enemies, waves, etc.
 */
export class SkeletonGameScene extends Scene {
  // Containers
  private backgroundContainer: Container | null = null;
  private backgroundGraphics: Graphics | null = null;
  private gameContainer: Container | null = null;

  // Core systems
  private inputSystem: InputSystem | null = null;
  protected world: GameWorld | null = null;
  protected playerEntity: Entity | null = null;
  protected camera: Camera | null = null;

  // Dimensions (updated on resize)
  protected width = 800;
  protected height = 600;

  // Configuration
  protected gridConfig: GridConfig;
  protected playerConfig: PlayerConfig;

  constructor(
    name = "game",
    options?: { grid?: Partial<GridConfig>; player?: Partial<PlayerConfig> }
  ) {
    super(name);
    this.gridConfig = { ...DEFAULT_GRID, ...options?.grid };
    this.playerConfig = { ...DEFAULT_PLAYER, ...options?.player };
  }

  // ── Input ──────────────────────────────────────────────

  /** Attach an InputSystem (call before scene enters, or in your game setup). */
  setInputSystem(input: InputSystem): void {
    this.inputSystem = input;
  }

  protected getInput(): InputState {
    return this.inputSystem?.getState() ?? { movement: { x: 0, y: 0 } };
  }

  // ── Lifecycle ──────────────────────────────────────────

  protected onEnter(): void {
    this.initBackground();
    this.initGameContainer();
    this.initWorld();
    this.initCamera();
    this.initPlayer();
    this.onSceneReady();
  }

  protected onExit(): void {
    // Clean up player sprite
    if (this.playerEntity?.sprite) {
      this.playerEntity.sprite.graphics.destroy();
    }

    // Let subclasses clean up their stuff
    this.onSceneCleanup();

    // Tear down containers
    this.container.removeChildren();
    this.backgroundContainer = null;
    this.backgroundGraphics = null;
    this.gameContainer = null;
    this.world = null;
    this.playerEntity = null;
    this.camera = null;
  }

  protected onUpdate(deltaMs: number): void {
    if (!this.world || !this.camera) return;

    const input = this.getInput();

    // 1. Move player from input
    movementSystem(this.world, deltaMs, input);

    // 2. Camera follows player
    if (this.playerEntity?.position) {
      this.camera.update(
        this.playerEntity.position.x,
        this.playerEntity.position.y,
        deltaMs
      );
    }

    // 3. Invincibility flash effects
    invincibilitySystem(this.world, deltaMs);

    // 4. Let subclass run additional systems (combat, enemies, etc.)
    this.onGameUpdate(deltaMs, input);

    // 5. Render all sprites relative to camera
    renderSystem(
      this.world,
      { x: this.camera.x, y: this.camera.y },
      this.width,
      this.height
    );

    // 6. Redraw background grid
    this.updateBackground();
  }

  protected onResize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  // ── Extension points (override these in your game scene) ──

  /** Called after player + camera are initialized. Add your systems here. */
  protected onSceneReady(): void {}

  /** Called each frame after core systems. Run combat, AI, waves, etc. */
  protected onGameUpdate(_deltaMs: number, _input: InputState): void {}

  /** Called during exit before teardown. Destroy your custom entities here. */
  protected onSceneCleanup(): void {}

  // ── Accessors ──────────────────────────────────────────

  getWorld(): GameWorld | null {
    return this.world;
  }

  getPlayer(): Entity | null {
    return this.playerEntity;
  }

  getCamera(): Camera | null {
    return this.camera;
  }

  getGameContainer(): Container | null {
    return this.gameContainer;
  }

  getDimensions(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // ── Internals ──────────────────────────────────────────

  private initBackground(): void {
    this.backgroundContainer = new Container();
    this.container.addChild(this.backgroundContainer);
    this.backgroundGraphics = new Graphics();
    this.backgroundContainer.addChild(this.backgroundGraphics);
  }

  private initGameContainer(): void {
    this.gameContainer = new Container();
    this.container.addChild(this.gameContainer);
  }

  private initWorld(): void {
    this.world = createGameWorld();
  }

  private initCamera(): void {
    this.camera = new Camera({ lerpFactor: 0.1 });
    this.camera.x = this.playerConfig.startX;
    this.camera.y = this.playerConfig.startY;
  }

  private initPlayer(): void {
    if (!this.world || !this.gameContainer) return;

    const { radius, color, strokeColor, strokeWidth, startX, startY, health } =
      this.playerConfig;

    const graphics = new Graphics();
    graphics.circle(0, 0, radius);
    graphics.fill({ color });
    graphics.stroke({ width: strokeWidth, color: strokeColor });

    this.gameContainer.addChild(graphics);

    this.playerEntity = this.world.add({
      position: { x: startX, y: startY },
      velocity: { vx: 0, vy: 0 },
      health: { current: health, max: health },
      sprite: { graphics },
      playerControlled: true,
    });
  }

  private updateBackground(): void {
    if (!this.backgroundGraphics || !this.camera) return;

    const g = this.backgroundGraphics;
    const { size, colorPrimary, colorSecondary, lineColor, lineAlpha } =
      this.gridConfig;

    g.clear();

    const padding = size * 2;
    const startX =
      Math.floor((this.camera.x - this.width / 2 - padding) / size) * size;
    const startY =
      Math.floor((this.camera.y - this.height / 2 - padding) / size) * size;
    const endX = this.camera.x + this.width / 2 + padding;
    const endY = this.camera.y + this.height / 2 + padding;

    const offsetX = this.width / 2 - this.camera.x;
    const offsetY = this.height / 2 - this.camera.y;

    // Checkerboard
    for (let wx = startX; wx < endX; wx += size) {
      for (let wy = startY; wy < endY; wy += size) {
        const gx = Math.floor(wx / size);
        const gy = Math.floor(wy / size);
        const isEven = (gx + gy) % 2 === 0;

        const sx = wx + offsetX;
        const sy = wy + offsetY;

        g.rect(sx, sy, size, size);
        g.fill({ color: isEven ? colorPrimary : colorSecondary });
        g.rect(sx, sy, size, size);
        g.stroke({ width: 1, color: lineColor, alpha: lineAlpha });
      }
    }

    // Origin crosshair
    const ox = 0 + offsetX;
    const oy = 0 + offsetY;
    if (
      ox > -50 && ox < this.width + 50 &&
      oy > -50 && oy < this.height + 50
    ) {
      g.moveTo(ox - 30, oy);
      g.lineTo(ox + 30, oy);
      g.moveTo(ox, oy - 30);
      g.lineTo(ox, oy + 30);
      g.stroke({ width: 2, color: 0xff6b6b, alpha: 0.8 });
    }
  }
}
