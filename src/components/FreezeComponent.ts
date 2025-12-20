import { Component } from '../ecs/Component';

export class FreezeComponent extends Component {
  constructor(
    public duration: number = 3 // 3초 동안 완전히 정지
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
