import { Component, type ComponentClass } from './Component';

export class Entity {
  private static _nextId = 0;

  public readonly id: number;
  public active = true;
  public tags: Set<string> = new Set();

  private readonly components = new Map<number, Component>();

  constructor() {
    this.id = Entity._nextId++;
  }

  addComponent<T extends Component>(component: T): this {
    const typeId = component.typeId;
    this.components.set(typeId, component);
    return this;
  }

  removeComponent<T extends Component>(componentClass: ComponentClass<T>): this {
    const typeId = Component.getTypeId(componentClass);
    this.components.delete(typeId);
    return this;
  }

  getComponent<T extends Component>(componentClass: ComponentClass<T>): T | undefined {
    const typeId = Component.getTypeId(componentClass);
    return this.components.get(typeId) as T | undefined;
  }

  hasComponent<T extends Component>(componentClass: ComponentClass<T>): boolean {
    const typeId = Component.getTypeId(componentClass);
    return this.components.has(typeId);
  }

  hasComponents(...componentClasses: ComponentClass[]): boolean {
    return componentClasses.every((cc) => this.hasComponent(cc));
  }

  addTag(tag: string): this {
    this.tags.add(tag);
    return this;
  }

  removeTag(tag: string): this {
    this.tags.delete(tag);
    return this;
  }

  hasTag(tag: string): boolean {
    return this.tags.has(tag);
  }

  destroy(): void {
    this.active = false;
    this.components.clear();
    this.tags.clear();
  }
}
