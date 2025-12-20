import { Component } from '../ecs/Component';

export class SlowComponent extends Component {
  constructor(
    public slowAmount: number = 0.5, // 50% 속도 감소
    public duration: number = 2 // 2초 지속
  ) {
    super();
  }

  update(dt: number): void {
    this.duration -= dt;
  }

  isExpired(): boolean {
    return this.duration <= 0;
  }
}
