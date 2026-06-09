import { describe, it, expect } from "vitest";
import { Container, Graphics } from "pixi.js";
import { RenderLayers } from "./RenderLayers";

describe("RenderLayers", () => {
  it("creates one child container per named layer, in order", () => {
    const root = new Container();
    const layers = new RenderLayers(root, ["bg", "entities", "overlay"]);
    expect(root.children.length).toBe(3);
    expect(layers.get("bg").zIndex).toBe(0);
    expect(layers.get("entities").zIndex).toBe(1);
    expect(layers.get("overlay").zIndex).toBe(2);
  });

  it("adds a child into the named layer", () => {
    const root = new Container();
    const layers = new RenderLayers(root, ["bg", "entities"]);
    const child = new Container();
    layers.add("entities", child);
    expect(layers.get("entities").children).toContain(child);
    expect(layers.get("bg").children.length).toBe(0);
  });

  it("clears a layer's children", () => {
    const root = new Container();
    const layers = new RenderLayers(root, ["entities"]);
    layers.add("entities", new Container());
    layers.add("entities", new Container());
    expect(layers.get("entities").children.length).toBe(2);
    layers.clear("entities");
    expect(layers.get("entities").children.length).toBe(0);
  });

  it("throws on an unknown layer name", () => {
    const root = new Container();
    const layers = new RenderLayers(root, ["bg"]);
    expect(() => layers.get("nope")).toThrow(/nope/);
  });

  it("accepts non-Container display objects (e.g. Graphics)", () => {
    const root = new Container();
    const layers = new RenderLayers(root, ["entities"]);
    const g = new Graphics();
    layers.add("entities", g);
    expect(layers.get("entities").children).toContain(g);
  });
});
