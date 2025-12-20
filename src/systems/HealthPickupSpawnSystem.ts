import type Phaser from 'phaser';
import {
  ColliderComponent,
  ColliderLayer,
  PickupComponent,
  PickupType,
  SpriteComponent,
  TransformComponent,
  VelocityComponent,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class HealthPickupSpawnSystem extends System {
  public priority = 5;
  protected readonly requiredComponents: ComponentClass[] = [];

  private scene: Phaser.Scene | null = null;
  private spawnTimer = 0;
  private spawnInterval = 15; // 15초마다 체크
  private spawnChance = 0.3; // 30% 확률

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  update(dt: number): void {
    this.spawnTimer += dt;

    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnTimer = 0;

      // 확률 체크
      if (Math.random() < this.spawnChance) {
        this.spawnHealthPickup();
      }
    }
  }

  private spawnHealthPickup(): void {
    if (!this.scene) return;

    // 화면 범위 내 랜덤 위치
    const camera = this.scene.cameras.main;
    const x = camera.scrollX + Math.random() * camera.width;
    const y = camera.scrollY + Math.random() * camera.height;

    const pickup = this.world.createEntity();
    pickup.addTag('pickup');

    pickup.addComponent(new TransformComponent(x, y));
    pickup.addComponent(new VelocityComponent(0, 0, 0));
    pickup.addComponent(new PickupComponent(PickupType.Health));
    pickup.addComponent(
      new ColliderComponent(20, ColliderLayer.Pickup, ColliderLayer.Player, true)
    );

    const sprite = new SpriteComponent('heal-effect', 40, 40, 0xffffff, 3);
    pickup.addComponent(sprite);

    const pickupSprite = this.scene.add.sprite(x, y, 'heal-effect');
    pickupSprite.setDepth(3);
    pickupSprite.setScale(0.8);
    pickupSprite.play('heal-effect');
    pickupSprite.setAlpha(0.8);
    sprite.setSprite(pickupSprite);

    // 반짝이는 효과
    this.scene.tweens.add({
      targets: pickupSprite,
      alpha: { from: 0.6, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
}
