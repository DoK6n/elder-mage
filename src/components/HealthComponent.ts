import { Component } from '../ecs/Component';

export class HealthComponent extends Component {
  public current: number;
  public invincibleTime = 0;
  public invincibleDuration = 0;

  constructor(
    public max = 100,
    public regenRate = 0
  ) {
    super();
    this.current = max;
  }

  damage(amount: number): boolean {
    if (this.isInvincible()) return false;

    this.current = Math.max(0, this.current - amount);
    return true;
  }

  heal(amount: number): void {
    this.current = Math.min(this.max, this.current + amount);
  }

  isDead(): boolean {
    return this.current <= 0;
  }

  getHealthPercent(): number {
    return this.current / this.max;
  }

  setInvincible(duration: number): void {
    this.invincibleDuration = duration;
    this.invincibleTime = duration;
  }

  isInvincible(): boolean {
    return this.invincibleTime > 0;
  }

  updateInvincibility(dt: number): void {
    if (this.invincibleTime > 0) {
      this.invincibleTime -= dt;
    }
  }

  regenerate(dt: number): void {
    if (this.regenRate > 0 && this.current < this.max) {
      this.heal(this.regenRate * dt);
    }
  }
}
