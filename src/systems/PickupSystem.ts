import type Phaser from 'phaser';
import {
  HealthComponent,
  PickupComponent,
  PickupType,
  PlayerComponent,
  SpriteComponent,
  TransformComponent,
  VelocityComponent,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class PickupSystem extends System {
  public priority = 35;
  private scene: Phaser.Scene | null = null;

  protected readonly requiredComponents: ComponentClass[] = [TransformComponent, PickupComponent];

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  update(dt: number): void {
    const pickups = this.getEntities();
    const player = this.findPlayer();

    if (!player) return;

    const playerTransform = player.getComponent(TransformComponent)!;
    const playerComp = player.getComponent(PlayerComponent)!;

    for (const pickup of pickups) {
      const transform = pickup.getComponent(TransformComponent)!;
      const pickupComp = pickup.getComponent(PickupComponent)!;
      const sprite = pickup.getComponent(SpriteComponent);

      const distance = playerTransform.distanceTo(transform);

      if (distance < playerComp.pickupRadius) {
        pickupComp.startAttraction();
      }

      if (pickupComp.isBeingAttracted) {
        const direction = transform.directionTo(playerTransform);
        transform.x += direction.x * pickupComp.attractSpeed * dt;
        transform.y += direction.y * pickupComp.attractSpeed * dt;

        if (sprite?.sprite) {
          sprite.sprite.setPosition(transform.x, transform.y);
        }
      }
    }
  }

  private findPlayer() {
    const players = this.world.getEntitiesWithComponents(TransformComponent, PlayerComponent);
    return players[0] || null;
  }
}
