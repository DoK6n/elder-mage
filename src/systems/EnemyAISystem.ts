import {
  EnemyComponent,
  PlayerComponent,
  SlowComponent,
  FreezeComponent,
  SpriteComponent,
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
      const freezeComp = enemy.getComponent(FreezeComponent);
      const slowComp = enemy.getComponent(SlowComponent);
      const sprite = enemy.getComponent(SpriteComponent);

      enemyComp.updateCooldown(dt);

      // 정지 효과 처리 (최우선)
      if (freezeComp) {
        freezeComp.update(dt);
        if (freezeComp.isExpired()) {
          enemy.removeComponent(FreezeComponent);

          // 틴트 제거
          if (sprite?.sprite && 'clearTint' in sprite.sprite) {
            sprite.sprite.clearTint();
          }

          // 생존한 경우 둔화 효과 적용 (20% 속도 감소, 5초)
          if (!enemy.getComponent(SlowComponent)) {
            enemy.addComponent(new SlowComponent(0.2, 5));
          }
        } else {
          // 정지 상태: 이동 불가
          velocity.vx = 0;
          velocity.vy = 0;
          continue; // 다음 적으로
        }
      }

      // 둔화 효과 처리
      let speedMultiplier = 1;
      if (slowComp) {
        slowComp.update(dt);
        if (slowComp.isExpired()) {
          enemy.removeComponent(SlowComponent);
        } else {
          speedMultiplier = 1 - slowComp.slowAmount;
        }
      }

      const direction = transform.directionTo(playerTransform);
      velocity.vx = direction.x * enemyComp.moveSpeed * speedMultiplier;
      velocity.vy = direction.y * enemyComp.moveSpeed * speedMultiplier;
    }
  }

  private findPlayer() {
    const players = this.world.getEntitiesWithComponents(TransformComponent, PlayerComponent);
    return players[0] || null;
  }
}
