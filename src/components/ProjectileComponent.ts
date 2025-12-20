import { Component } from '../ecs/Component';

export class ProjectileComponent extends Component {
  public hitEntities: Set<number> = new Set();
  public lifetime: number;

  constructor(
    public damage = 10,
    public speed = 300,
    public pierce = 1,
    public maxLifetime = 2,
    public ownerId = -1
  ) {
    super();
    this.lifetime = maxLifetime;
  }

  updateLifetime(dt: number): boolean {
    this.lifetime -= dt;
    return this.lifetime <= 0;
  }

  canHit(entityId: number): boolean {
    if (this.pierce <= 0) return false;
    return !this.hitEntities.has(entityId);
  }

  registerHit(entityId: number): boolean {
    this.hitEntities.add(entityId);
    this.pierce--;
    return this.pierce <= 0;
  }
}
