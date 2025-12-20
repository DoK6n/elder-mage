import type { ComponentClass } from './Component';
import { Entity } from './Entity';
import type { System } from './System';

export class World {
  private readonly entities: Map<number, Entity> = new Map();
  private readonly systems: System[] = [];
  private readonly entitiesToRemove: Set<number> = new Set();

  createEntity(): Entity {
    const entity = new Entity();
    this.entities.set(entity.id, entity);
    return entity;
  }

  addEntity(entity: Entity): void {
    this.entities.set(entity.id, entity);
  }

  removeEntity(entity: Entity): void {
    this.entitiesToRemove.add(entity.id);
  }

  removeEntityById(id: number): void {
    this.entitiesToRemove.add(id);
  }

  getEntity(id: number): Entity | undefined {
    return this.entities.get(id);
  }

  getAllEntities(): Entity[] {
    return Array.from(this.entities.values()).filter((e) => e.active);
  }

  getEntitiesWithComponents(...componentClasses: ComponentClass[]): Entity[] {
    return this.getAllEntities().filter((entity) => entity.hasComponents(...componentClasses));
  }

  getEntitiesWithTag(tag: string): Entity[] {
    return this.getAllEntities().filter((entity) => entity.hasTag(tag));
  }

  addSystem(system: System): void {
    system.setWorld(this);
    this.systems.push(system);
    this.systems.sort((a, b) => a.priority - b.priority);
  }

  removeSystem(system: System): void {
    const index = this.systems.indexOf(system);
    if (index !== -1) {
      this.systems.splice(index, 1);
    }
  }

  update(dt: number): void {
    for (const system of this.systems) {
      if (system.enabled) {
        system.update(dt);
      }
    }

    this.cleanupEntities();
  }

  private cleanupEntities(): void {
    for (const id of this.entitiesToRemove) {
      const entity = this.entities.get(id);
      if (entity) {
        entity.destroy();
        this.entities.delete(id);
      }
    }
    this.entitiesToRemove.clear();
  }

  clear(): void {
    for (const entity of this.entities.values()) {
      entity.destroy();
    }
    this.entities.clear();
    this.systems.length = 0;
  }

  getEntityCount(): number {
    return this.entities.size;
  }
}
