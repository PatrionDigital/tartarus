import { describe, it, expect, vi, beforeEach } from "vitest";

const { init, loadBundle, get } = vi.hoisted(() => ({
  init: vi.fn(async () => undefined),
  loadBundle: vi.fn(async () => ({ hero: { texture: true } })),
  get: vi.fn(),
}));

vi.mock("pixi.js", () => ({
  Assets: { init, loadBundle, get },
}));

import { AssetLoader } from "./AssetLoader";

describe("AssetLoader", () => {
  beforeEach(() => {
    init.mockClear();
    loadBundle.mockClear();
    get.mockClear();
  });

  it("initializes Pixi Assets with the manifest exactly once", async () => {
    const loader = new AssetLoader();
    const manifest = { bundles: [] };
    await loader.init(manifest);
    await loader.init(manifest); // second call is a no-op
    expect(init).toHaveBeenCalledTimes(1);
    expect(init).toHaveBeenCalledWith({ manifest });
  });

  it("throws if loadBundle/texture used before init", async () => {
    const loader = new AssetLoader();
    await expect(loader.loadBundle("game")).rejects.toThrow(/init/i);
    expect(() => loader.texture("hero")).toThrow(/init/i);
  });

  it("loads a bundle and returns a texture by alias", async () => {
    const fakeTexture = { label: "hero" };
    get.mockReturnValue(fakeTexture);
    const loader = new AssetLoader();
    await loader.init({ bundles: [] });
    await loader.loadBundle("game");
    expect(loadBundle).toHaveBeenCalledWith("game");
    expect(loader.texture("hero")).toBe(fakeTexture);
    expect(get).toHaveBeenCalledWith("hero");
  });

  it("returns animation frames from a loaded spritesheet alias", async () => {
    const frames = [{ id: 0 }, { id: 1 }];
    get.mockReturnValue({ animations: { walk: frames } });
    const loader = new AssetLoader();
    await loader.init({ bundles: [] });
    expect(loader.animation("army.json", "walk")).toBe(frames);
  });

  it("throws on a missing animation name", async () => {
    get.mockReturnValue({ animations: {} });
    const loader = new AssetLoader();
    await loader.init({ bundles: [] });
    expect(() => loader.animation("army.json", "nope")).toThrow(/nope/);
  });
});
