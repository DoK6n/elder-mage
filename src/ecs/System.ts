import type { ComponentClass } from './Component';
import type { Entity } from './Entity';
import type { World } from './World';

export abstract class System {
  public priority = 0;
  public enabled = true;
  protected world!: World;

  protected abstract readonly requiredComponents: ComponentClass[];

  setWorld(world: World): void {
    this.world = world;
  }

  abstract update(dt: number): void;

  protected getEntities(): Entity[] {
    return this.world.getEntitiesWithComponents(...this.requiredComponents);
  }

  protected getEntitiesWithTag(tag: string): Entity[] {
    return this.world.getEntitiesWithTag(tag);
  }
}
