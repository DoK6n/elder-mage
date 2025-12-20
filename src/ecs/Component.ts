export type ComponentClass<T extends Component = Component> = new (...args: any[]) => T;

export abstract class Component {
  private static _nextId = 0;
  private static readonly _typeIds = new Map<ComponentClass, number>();

  static getTypeId<T extends Component>(componentClass: ComponentClass<T>): number {
    let id = Component._typeIds.get(componentClass);
    if (id === undefined) {
      id = Component._nextId++;
      Component._typeIds.set(componentClass, id);
    }
    return id;
  }

  get typeId(): number {
    return Component.getTypeId(this.constructor as ComponentClass);
  }
}
