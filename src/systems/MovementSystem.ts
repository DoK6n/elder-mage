import { SpriteComponent, TransformComponent, VelocityComponent } from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class MovementSystem extends System {
  public priority = 10;

  protected readonly requiredComponents: ComponentClass[] = [TransformComponent, VelocityComponent];

  update(dt: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent)!;
      const velocity = entity.getComponent(VelocityComponent)!;

      transform.x += velocity.vx * dt;
      transform.y += velocity.vy * dt;

      const sprite = entity.getComponent(SpriteComponent);
      if (sprite?.sprite) {
        sprite.sprite.setPosition(transform.x, transform.y);

        if (velocity.vx !== 0 && 'setFlipX' in sprite.sprite) {
          (sprite.sprite as Phaser.GameObjects.Sprite).setFlipX(velocity.vx < 0);
        }
      }
    }
  }
}
