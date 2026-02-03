declare module 'yuka' {
  export class EntityManager {
    add(entity: any): this;
    remove(entity: any): this;
    update(delta: number): this;
    entities: any[];
  }
  export class Vehicle {
    position: Vector3;
    velocity: Vector3;
    maxSpeed: number;
    maxForce: number;
    mass: number;
    steering: SteeringManager;
    boundingRadius: number;
    updateNeighborhood: boolean;
    neighborhoodRadius: number;
  }
  export class SteeringManager {
    add(behavior: any): this;
    remove(behavior: any): this;
    behaviors: any[];
  }
  export class SeekBehavior {
    target: Vector3;
    weight: number;
    active: boolean;
    constructor(target?: Vector3);
  }
  export class FleeBehavior {
    target: Vector3;
    panicDistance: number;
    weight: number;
    constructor(target?: Vector3, panicDistance?: number);
  }
  export class ArriveBehavior {
    target: Vector3;
    deceleration: number;
    weight: number;
    constructor(target?: Vector3, deceleration?: number);
  }
  export class SeparationBehavior {
    weight: number;
    constructor();
  }
  export class AlignmentBehavior {
    weight: number;
    constructor();
  }
  export class CohesionBehavior {
    weight: number;
    constructor();
  }
  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    copy(v: Vector3): this;
    distanceTo(v: Vector3): number;
  }
}
