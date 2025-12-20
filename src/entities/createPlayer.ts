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
  player.addComponent(new HealthComponent(config.health ?? 100, 0)); // regenRate 0으로 변경
  player.addComponent(new PlayerComponent(config.moveSpeed ?? 150));

  // 다중 무기 시스템
  const weaponComp = new WeaponComponent(WeaponType.IceBolt, {
    damage: 11, // 화염구보다 30% 낮은 데미지 (15 * 0.7 ≈ 10.5)
    cooldown: 1.5,
    projectileSpeed: 300,
    projectileCount: 1,
    area: 1.2,
    duration: 2,
    pierce: 1,
  });

  // 화염구 추가 (관통 4회)
  weaponComp.addWeapon(WeaponType.Fireball, {
    damage: 15,
    cooldown: 1.2,
    projectileSpeed: 400,
    projectileCount: 1,
    area: 1,
    duration: 2,
    pierce: 4,
  });

  // 마그마 추가 (광역 데미지, 강력한 데미지)
  weaponComp.addWeapon(WeaponType.Meteor, {
    damage: 80, // 강력한 광역 데미지
    cooldown: 5,
    projectileSpeed: 200,
    projectileCount: 1,
    area: 3,
    duration: 1,
    pierce: 999, // 범위 내 모든 적 타격
  });

  player.addComponent(weaponComp);
  player.addComponent(
    new ColliderComponent(18, ColliderLayer.Player, ColliderLayer.Enemy | ColliderLayer.Pickup)
  );

  // 마법사 스프라이트 (100x100 이미지를 스케일 조정)
  const sprite = new SpriteComponent('player', 160, 160, 0xffffff, 10);
  player.addComponent(sprite);

  const playerSprite = scene.add.sprite(config.x, config.y, 'player');
  playerSprite.setDepth(10);
  playerSprite.setScale(1.6); // 100x100 이미지를 160 크기로 조정 (4배 증가)
  playerSprite.play('player-idle'); // 애니메이션 재생
  sprite.setSprite(playerSprite);

  return player;
}
