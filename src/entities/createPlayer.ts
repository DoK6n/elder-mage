import type Phaser from 'phaser';
import {
  ColliderComponent,
  ColliderLayer,
  HealthComponent,
  PlayerComponent,
  SpriteComponent,
  TransformComponent,
  VelocityComponent,
  WeaponComponent,
  WeaponType,
} from '../components';
import type { World } from '../ecs/World';

export interface PlayerConfig {
  x: number;
  y: number;
  health?: number;
  moveSpeed?: number;
  weaponType?: WeaponType;
}

export function createPlayer(world: World, scene: Phaser.Scene, config: PlayerConfig) {
  const player = world.createEntity();
  player.addTag('player');

  player.addComponent(new TransformComponent(config.x, config.y));
  player.addComponent(new VelocityComponent(0, 0, config.moveSpeed ?? 150));
  player.addComponent(new HealthComponent(config.health ?? 100, 0.5));
  player.addComponent(new PlayerComponent(config.moveSpeed ?? 150));
  // 기본 무기: Magic Missile (기본 마법 미사일)
  player.addComponent(
    new WeaponComponent(config.weaponType ?? WeaponType.MagicMissile, {
      damage: 8,
      cooldown: 0.8,
      projectileSpeed: 350,
      projectileCount: 1,
      area: 1,
      duration: 2,
      pierce: 1,
    })
  );
  player.addComponent(
    new ColliderComponent(18, ColliderLayer.Player, ColliderLayer.Enemy | ColliderLayer.Pickup)
  );

  // 마법사 스프라이트 (40x40)
  const sprite = new SpriteComponent('player', 40, 40, 0xffffff, 10);
  player.addComponent(sprite);

  const playerSprite = scene.add.sprite(config.x, config.y, 'player');
  playerSprite.setDepth(10);
  playerSprite.setScale(1.2); // 약간 크게
  sprite.setSprite(playerSprite);

  return player;
}
