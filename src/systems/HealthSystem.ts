import { HealthComponent, SpriteComponent } from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class HealthSystem extends System {
  public priority = 40;

  protected readonly requiredComponents: ComponentClass[] = [HealthComponent];

  update(dt: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const health = entity.getComponent(HealthComponent)!;
      const sprite = entity.getComponent(SpriteComponent);

      health.updateInvincibility(dt);
      health.regenerate(dt);

      if (sprite?.sprite && health.isInvincible()) {
        const alpha = Math.sin(Date.now() * 0.02) * 0.3 + 0.7;
        sprite.sprite.setAlpha(alpha);
      } else if (sprite?.sprite) {
        sprite.sprite.setAlpha(1);
      }
    }
  }
}
