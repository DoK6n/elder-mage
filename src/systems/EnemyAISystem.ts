import {
  EnemyComponent,
  PlayerComponent,
  TransformComponent,
  VelocityComponent,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class EnemyAISystem extends System {
  public priority = 15;

  protected readonly requiredComponents: ComponentClass[] = [
    TransformComponent,
    VelocityComponent,
    EnemyComponent,
  ];

  update(dt: number): void {
    const enemies = this.getEntities();
    const player = this.findPlayer();

    if (!player) return;

    const playerTransform = player.getComponent(TransformComponent)!;

    for (const enemy of enemies) {
      const transform = enemy.getComponent(TransformComponent)!;
      const velocity = enemy.getComponent(VelocityComponent)!;
      const enemyComp = enemy.getComponent(EnemyComponent)!;

      enemyComp.updateCooldown(dt);

      const direction = transform.directionTo(playerTransform);
      velocity.vx = direction.x * enemyComp.moveSpeed;
      velocity.vy = direction.y * enemyComp.moveSpeed;
    }
  }

  private findPlayer() {
    const players = this.world.getEntitiesWithComponents(TransformComponent, PlayerComponent);
    return players[0] || null;
  }
}
