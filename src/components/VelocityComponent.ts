import { Component } from '../ecs/Component';

export class VelocityComponent extends Component {
  constructor(
    public vx = 0,
    public vy = 0,
    public speed = 100
  ) {
    super();
  }

  setVelocity(vx: number, vy: number): void {
    this.vx = vx;
    this.vy = vy;
  }

  normalize(): void {
    const length = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    if (length > 0) {
      this.vx = (this.vx / length) * this.speed;
      this.vy = (this.vy / length) * this.speed;
    }
  }

  stop(): void {
    this.vx = 0;
    this.vy = 0;
  }
}
