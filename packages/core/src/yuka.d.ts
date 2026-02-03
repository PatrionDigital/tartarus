declare module "yuka" {
  export class Vehicle {
    position: Vector3;
    velocity: Vector3;
    maxSpeed: number;
    maxForce: number;
    mass: number;
    steering: SteeringManager;
    boundingRadius: number;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
  }

  export class EntityManager {
    entities: Vehicle[];
    add(entity: Vehicle): this;
    remove(entity: Vehicle): this;
    update(delta: number): this;
  }

  export class SteeringManager {
    add(behavior: SteeringBehavior): this;
  }

  export class SteeringBehavior {
    weight: number;
    active: boolean;
  }

  export class SeekBehavior extends SteeringBehavior {
    target: Vector3;
    constructor(target?: Vector3);
  }

  export class AlignmentBehavior extends SteeringBehavior {
    constructor();
  }

  export class CohesionBehavior extends SteeringBehavior {
    constructor();
  }

  export class SeparationBehavior extends SteeringBehavior {
    constructor();
  }
}
