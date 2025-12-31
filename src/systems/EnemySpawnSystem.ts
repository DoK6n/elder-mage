import type Phaser from 'phaser';
import {
  ColliderComponent,
  ColliderLayer,
  EnemyComponent,
  EnemyType,
  HealthComponent,
  PlayerComponent,
  SpriteComponent,
  TransformComponent,
  VelocityComponent,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

interface SpawnWave {
  time: number;
  enemyType: EnemyType;
  count: number;
  spawnRate: number;
  healthMultiplier: number;
  damageMultiplier: number;
  endTime?: number; // 종료 시간 (없으면 계속 유지)
}

export class EnemySpawnSystem extends System {
  public priority = 5;

  protected readonly requiredComponents: ComponentClass[] = [];

  private scene: Phaser.Scene | null = null;
  private gameTime = 0;
  private spawnTimers: Map<number, number> = new Map(); // 각 웨이브별 스폰 타이머
  private maxEnemies = 200;

  // 여러 웨이브가 동시에 활성화될 수 있음
  private readonly waves: SpawnWave[] = [
    // 슬라임 - 초반 몬스터 (0초~120초)
    {
      time: 0,
      endTime: 120,
      enemyType: EnemyType.Slime,
      count: 5,
      spawnRate: 2,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    // 슬라임 강화 (120초~ 계속)
    {
      time: 120,
      enemyType: EnemyType.Slime,
      count: 6,
      spawnRate: 2.5,
      healthMultiplier: 1.5,
      damageMultiplier: 1.2,
    },
    // 고블린 등장 (60초~ 계속)
    {
      time: 60,
      enemyType: EnemyType.Goblin,
      count: 4,
      spawnRate: 2,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    // 코볼트 등장 (120초~ 계속)
    {
      time: 120,
      enemyType: EnemyType.Kobold,
      count: 5,
      spawnRate: 1.8,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    // 리자드맨 등장 (180초~ 계속)
    {
      time: 180,
      enemyType: EnemyType.Lizardman,
      count: 3,
      spawnRate: 2.5,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    // 오크 등장 (240초~ 계속)
    {
      time: 240,
      enemyType: EnemyType.Orc,
      count: 2,
      spawnRate: 3,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
    // 오우거 보스 등장 (300초~ 계속, 가끔씩)
    {
      time: 300,
      enemyType: EnemyType.Ogre,
      count: 1,
      spawnRate: 45,
      healthMultiplier: 1,
      damageMultiplier: 1,
    },
  ];

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  update(dt: number): void {
    this.gameTime += dt;

    const enemyCount = this.world.getEntitiesWithTag('enemy').length;
    if (enemyCount >= this.maxEnemies) return;

    // 모든 활성 웨이브 처리
    const activeWaves = this.getActiveWaves();
    for (const [waveIndex, wave] of activeWaves) {
      // 각 웨이브별 타이머 업데이트
      const currentTimer = (this.spawnTimers.get(waveIndex) || 0) + dt;

      if (currentTimer >= wave.spawnRate) {
        this.spawnTimers.set(waveIndex, 0);
        this.spawnEnemies(wave);
      } else {
        this.spawnTimers.set(waveIndex, currentTimer);
      }
    }
  }

  private getActiveWaves(): [number, SpawnWave][] {
    const active: [number, SpawnWave][] = [];
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves[i];
      // 시작 시간이 지났고, 종료 시간이 없거나 아직 안 지났으면 활성
      if (this.gameTime >= wave.time && (wave.endTime === undefined || this.gameTime < wave.endTime)) {
        active.push([i, wave]);
      }
    }
    return active;
  }

  private spawnEnemies(wave: SpawnWave): void {
    const player = this.findPlayer();
    if (!player) return;

    const playerTransform = player.getComponent(TransformComponent)!;

    for (let i = 0; i < wave.count; i++) {
      this.spawnEnemy(playerTransform, wave);
    }
  }

  private spawnEnemy(playerTransform: TransformComponent, wave: SpawnWave): void {
    const spawnDistance = 400 + Math.random() * 100;
    const angle = Math.random() * Math.PI * 2;
    const x = playerTransform.x + Math.cos(angle) * spawnDistance;
    const y = playerTransform.y + Math.sin(angle) * spawnDistance;

    const enemy = this.world.createEntity();
    enemy.addTag('enemy');

    const enemyConfig = this.getEnemyConfig(wave.enemyType);

    enemy.addComponent(new TransformComponent(x, y));
    enemy.addComponent(new VelocityComponent(0, 0, enemyConfig.speed));
    enemy.addComponent(new HealthComponent(Math.floor(enemyConfig.health * wave.healthMultiplier)));
    enemy.addComponent(
      new EnemyComponent(
        wave.enemyType,
        Math.floor(enemyConfig.damage * wave.damageMultiplier),
        enemyConfig.experience,
        enemyConfig.speed
      )
    );
    enemy.addComponent(
      new ColliderComponent(
        enemyConfig.radius,
        ColliderLayer.Enemy,
        ColliderLayer.Player | ColliderLayer.PlayerProjectile
      )
    );

    const sprite = new SpriteComponent(
      enemyConfig.textureKey,
      enemyConfig.size,
      enemyConfig.size,
      0xffffff,
      2
    );
    enemy.addComponent(sprite);

    if (this.scene) {
      const enemySprite = this.scene.add.sprite(x, y, enemyConfig.textureKey);
      enemySprite.setDepth(2);
      // 100x100 이미지를 각 몬스터의 size에 맞게 스케일 조정 (4배 증가)
      enemySprite.setScale((enemyConfig.size / 100) * 4);
      // 애니메이션 재생
      enemySprite.play(enemyConfig.animKey);
      sprite.setSprite(enemySprite);
    }
  }

  private getEnemyConfig(type: EnemyType): {
    health: number;
    damage: number;
    speed: number;
    experience: number;
    radius: number;
    size: number;
    textureKey: string;
    animKey: string;
  } {
    switch (type) {
      case EnemyType.Slime:
        // 슬라임: 느리고 약함, 초보자 몬스터
        return { health: 15, damage: 5, speed: 40, experience: 1, radius: 12, size: 24, textureKey: 'enemy_slime', animKey: 'slime-idle' };
      case EnemyType.Goblin:
        // 고블린: 빠르고 약함, 무리로 공격
        return { health: 20, damage: 8, speed: 70, experience: 2, radius: 14, size: 28, textureKey: 'enemy_goblin', animKey: 'goblin-idle' };
      case EnemyType.Kobold:
        // 코볼트: 매우 빠름, 약함
        return { health: 18, damage: 6, speed: 90, experience: 2, radius: 13, size: 26, textureKey: 'enemy_kobold', animKey: 'kobold-idle' };
      case EnemyType.Lizardman:
        // 리자드맨: 중간 스탯, 밸런스형
        return { health: 45, damage: 12, speed: 55, experience: 4, radius: 18, size: 36, textureKey: 'enemy_lizardman', animKey: 'lizardman-idle' };
      case EnemyType.Orc:
        // 오크: 강력하고 느림
        return { health: 80, damage: 18, speed: 35, experience: 6, radius: 22, size: 44, textureKey: 'enemy_orc', animKey: 'orc-idle' };
      case EnemyType.Ogre:
        // 오우거: 보스급, 매우 강력
        return { health: 400, damage: 35, speed: 25, experience: 50, radius: 32, size: 64, textureKey: 'enemy_ogre', animKey: 'ogre-idle' };
      default:
        return { health: 15, damage: 5, speed: 40, experience: 1, radius: 12, size: 24, textureKey: 'enemy_slime', animKey: 'slime-idle' };
    }
  }

  private findPlayer() {
    const players = this.world.getEntitiesWithComponents(TransformComponent, PlayerComponent);
    return players[0] || null;
  }

  getGameTime(): number {
    return this.gameTime;
  }
}
