import { describe, it, expect, vi, beforeEach } from "vitest";
import { AnimationController, type AnimationClips } from "./AnimationController";
import type { AnimatedSprite, Texture } from "pixi.js";

function tex(id: number): Texture {
  return { id } as unknown as Texture;
}

function mockSprite() {
  return {
    textures: [] as Texture[],
    loop: true,
    animationSpeed: 1,
    gotoAndPlay: vi.fn(),
    stop: vi.fn(),
  } as unknown as AnimatedSprite & {
    gotoAndPlay: ReturnType<typeof vi.fn>;
    stop: ReturnType<typeof vi.fn>;
  };
}

const clips: AnimationClips = {
  idle: [tex(0)],
  walk: [tex(1), tex(2)],
};

describe("AnimationController", () => {
  let sprite: ReturnType<typeof mockSprite>;
  beforeEach(() => {
    sprite = mockSprite();
  });

  it("plays a clip: sets textures and restarts from frame 0", () => {
    const c = new AnimationController(sprite, clips);
    c.play("walk");
    expect(sprite.textures).toBe(clips.walk);
    expect(sprite.gotoAndPlay).toHaveBeenCalledWith(0);
    expect(c.state).toBe("walk");
  });

  it("is a no-op when playing the already-current clip", () => {
    const c = new AnimationController(sprite, clips);
    c.play("idle");
    sprite.gotoAndPlay.mockClear();
    c.play("idle");
    expect(sprite.gotoAndPlay).not.toHaveBeenCalled();
  });

  it("applies loop and speed options", () => {
    const c = new AnimationController(sprite, clips);
    c.play("walk", { loop: false, speed: 0.5 });
    expect(sprite.loop).toBe(false);
    expect(sprite.animationSpeed).toBe(0.5);
  });

  it("throws on an unknown state", () => {
    const c = new AnimationController(sprite, clips);
    expect(() => c.play("fly")).toThrow(/fly/);
  });

  it("stop() stops the sprite", () => {
    const c = new AnimationController(sprite, clips);
    c.play("walk");
    c.stop();
    expect(sprite.stop).toHaveBeenCalled();
  });
});
