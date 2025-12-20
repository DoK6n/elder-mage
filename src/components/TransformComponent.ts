import { Component } from '../ecs/Component';

export class TransformComponent extends Component {
  constructor(
    public x = 0,
    public y = 0,
    public rotation = 0,
    public scaleX = 1,
    public scaleY = 1
  ) {
    super();
  }

  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  distanceTo(other: TransformComponent): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  directionTo(other: TransformComponent): { x: number; y: number } {
    const dx = other.x - this.x;
    const dy = other.y - this.y;
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return { x: 0, y: 0 };
    return { x: dx / length, y: dy / length };
  }
}
