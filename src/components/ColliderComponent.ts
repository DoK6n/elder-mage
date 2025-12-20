import { Component } from '../ecs/Component';

export enum ColliderLayer {
  None = 0,
  Player = 1 << 0,
  Enemy = 1 << 1,
  PlayerProjectile = 1 << 2,
  EnemyProjectile = 1 << 3,
  Pickup = 1 << 4,
}

export class ColliderComponent extends Component {
  constructor(
    public radius = 16,
    public layer: ColliderLayer = ColliderLayer.None,
    public mask: ColliderLayer = ColliderLayer.None,
    public isTrigger = true
  ) {
    super();
  }

  canCollideWith(otherLayer: ColliderLayer): boolean {
    return (this.mask & otherLayer) !== 0;
  }

  static checkCollision(
    x1: number,
    y1: number,
    r1: number,
    x2: number,
    y2: number,
    r2: number
  ): boolean {
    const dx = x1 - x2;
    const dy = y1 - y2;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < r1 + r2;
  }
}
