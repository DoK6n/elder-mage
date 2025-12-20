import { ProjectileComponent, SpriteComponent, TransformComponent } from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class ProjectileSystem extends System {
  public priority = 25;

  protected readonly requiredComponents: ComponentClass[] = [
    TransformComponent,
    ProjectileComponent,
  ];

  update(dt: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const projectile = entity.getComponent(ProjectileComponent)!;

      const expired = projectile.updateLifetime(dt);

      if (expired || projectile.pierce <= 0) {
        const sprite = entity.getComponent(SpriteComponent);
        sprite?.destroy();
        this.world.removeEntity(entity);
      }
    }
  }
}
