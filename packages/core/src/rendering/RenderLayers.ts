import { Container, type ContainerChild } from "pixi.js";

/**
 * Named, z-ordered container groups under a root container. Layers render in
 * declaration order (first = bottom). Add entities to a layer by name.
 */
export class RenderLayers {
  private readonly layers = new Map<string, Container>();

  constructor(root: Container, layerNames: string[]) {
    root.sortableChildren = true;
    layerNames.forEach((name, i) => {
      const layer = new Container();
      layer.label = name;
      layer.zIndex = i;
      root.addChild(layer);
      this.layers.set(name, layer);
    });
  }

  /** Get a layer container by name. Throws if unknown. */
  get(name: string): Container {
    const layer = this.layers.get(name);
    if (!layer) throw new Error(`RenderLayers: unknown layer "${name}"`);
    return layer;
  }

  /** Add a display object into the named layer. */
  add(name: string, child: ContainerChild): void {
    this.get(name).addChild(child);
  }

  /** Remove all children from the named layer. */
  clear(name: string): void {
    this.get(name).removeChildren();
  }
}
