import Phaser from 'phaser';
import {
  HealthComponent,
  PlayerComponent,
  TransformComponent,
  WeaponComponent,
  VelocityComponent,
  ColliderComponent,
} from '../components';
import { WeaponType } from '../components/WeaponComponent';
import type { ComponentClass } from '../ecs/Component';
import { World } from '../ecs/World';
import { createPlayer } from '../entities';
import { PASSIVE_UPGRADES, WEAPON_DEFINITIONS, type UpgradeOption } from '../game/WeaponData';
import {
  CameraSystem,
  CollisionSystem,
  EnemyAISystem,
  EnemySpawnSystem,
  HealthSystem,
  HealthPickupSpawnSystem,
  InputSystem,
  MovementSystem,
  PickupSystem,
  ProjectileSystem,
  WeaponSystem,
} from '../systems';

export class GameScene extends Phaser.Scene {
  private world!: World;
  private inputSystem!: InputSystem;
  private weaponSystem!: WeaponSystem;
  private enemySpawnSystem!: EnemySpawnSystem;
  private pickupSystem!: PickupSystem;
  private cameraSystem!: CameraSystem;
  private collisionSystem!: CollisionSystem;

  private isPaused = false;
  private gameOver = false;

  private background!: Phaser.GameObjects.TileSprite;

  // 개발자 모드 관련
  private showColliders = false;
  private colliderGraphics!: Phaser.GameObjects.Graphics;
  private activeSkills: WeaponType[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.world = new World();
    this.isPaused = false;
    this.gameOver = false;
    this.showColliders = false;
    this.activeSkills = [];

    this.createBackground();
    this.setupSystems();
    this.createPlayer();
    this.setupCamera();
    this.setupUI();

    // 개발자 모드용 충돌 범위 그래픽
    this.colliderGraphics = this.add.graphics();
    this.colliderGraphics.setDepth(1000);
  }

  private createBackground(): void {
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2a2a4a, 1);
    graphics.fillRect(-2000, -2000, 4000, 4000);

    for (let x = -2000; x < 2000; x += 50) {
      for (let y = -2000; y < 2000; y += 50) {
        graphics.fillStyle(0x3a3a5a, 1);
        graphics.fillRect(x, y, 2, 2);
      }
    }
  }

  private setupSystems(): void {
    this.inputSystem = new InputSystem();
    this.inputSystem.setInput(this);

    this.weaponSystem = new WeaponSystem();
    this.weaponSystem.setScene(this);

    this.enemySpawnSystem = new EnemySpawnSystem();
    this.enemySpawnSystem.setScene(this);

    this.pickupSystem = new PickupSystem();
    this.pickupSystem.setScene(this);

    const healthPickupSpawnSystem = new HealthPickupSpawnSystem();
    healthPickupSpawnSystem.setScene(this);

    this.cameraSystem = new CameraSystem();

    this.collisionSystem = new CollisionSystem();
    this.collisionSystem.setScene(this);

    this.world.addSystem(this.inputSystem);
    this.world.addSystem(new MovementSystem());
    this.world.addSystem(this.weaponSystem);
    this.world.addSystem(new ProjectileSystem());
    this.world.addSystem(new EnemyAISystem());
    this.world.addSystem(this.collisionSystem);
    this.world.addSystem(this.enemySpawnSystem);
    this.world.addSystem(healthPickupSpawnSystem);
    this.world.addSystem(this.pickupSystem);
    this.world.addSystem(new HealthSystem());
    this.world.addSystem(this.cameraSystem);
  }

  private createPlayer(): void {
    createPlayer(this.world, this, {
      x: 0,
      y: 0,
      health: 100,
      moveSpeed: 150,
    });
  }

  private setupCamera(): void {
    this.cameras.main.setBackgroundColor(0x1a1a2e);
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
    this.cameraSystem.setCamera(this.cameras.main);
  }

  private setupUI(): void {
    this.scene.launch('UIScene', { gameScene: this });
  }

  update(_time: number, delta: number): void {
    if (this.isPaused || this.gameOver) return;

    const dt = delta / 1000;
    this.world.update(dt);

    this.checkGameOver();

    // 개발자 모드: 충돌 범위 그리기
    this.drawColliders();
  }

  private checkGameOver(): void {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>, HealthComponent as ComponentClass<HealthComponent>);
    if (players.length === 0) return;

    const player = players[0];
    const health = player.getComponent(HealthComponent as ComponentClass<HealthComponent>)! as HealthComponent;

    if (health.isDead()) {
      this.gameOver = true;
      this.scene.get('UIScene').events.emit('gameOver');
    }
  }

  getPlayerStats(): {
    health: number;
    maxHealth: number;
    level: number;
    experience: number;
    experienceToNext: number;
    kills: number;
    time: number;
  } | null {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>, HealthComponent as ComponentClass<HealthComponent>);
    if (players.length === 0) return null;

    const player = players[0];
    const health = player.getComponent(HealthComponent as ComponentClass<HealthComponent>)! as HealthComponent;
    const playerComp = player.getComponent(PlayerComponent as ComponentClass<PlayerComponent>)! as PlayerComponent;

    return {
      health: Math.floor(health.current),
      maxHealth: health.max,
      level: playerComp.level,
      experience: playerComp.experience,
      experienceToNext: playerComp.experienceToNextLevel,
      kills: playerComp.kills,
      time: this.enemySpawnSystem.getGameTime(),
    };
  }

  getEnemyCount(): number {
    return this.world.getEntitiesWithTag('enemy').length;
  }

  pauseGame(): void {
    this.isPaused = true;
  }

  resumeGame(): void {
    this.isPaused = false;
  }

  restartGame(): void {
    this.scene.stop('UIScene');
    this.world.clear();
    this.scene.restart();
  }

  applyUpgrade(option: UpgradeOption): void {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>);
    if (players.length === 0) return;

    const player = players[0];
    const playerComp = player.getComponent(PlayerComponent as ComponentClass<PlayerComponent>)! as PlayerComponent;
    const health = player.getComponent(HealthComponent as ComponentClass<HealthComponent>)! as HealthComponent    ;
    const velocity = player.getComponent(VelocityComponent as ComponentClass<VelocityComponent>)! as VelocityComponent;

    if (option.type === 'weapon' && option.weaponType) {  
      this.applyWeaponUpgrade(player, option.weaponType, option.level);
    } else if (option.type === 'passive') {
      this.applyPassiveUpgrade(playerComp, health, velocity, option.id, option.level);
    }
  }

  private applyWeaponUpgrade(
    player: ReturnType<typeof this.world.createEntity>,
    weaponType: WeaponType,
    level: number
  ): void {
    const weaponComp = player.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
    if (!weaponComp) return;

    // 해당 무기가 이미 있는지 찾기
    const weaponIndex = weaponComp.weapons.findIndex((w) => w.type === weaponType);

    if (weaponIndex >= 0) {
      // 기존 무기 업그레이드
      weaponComp.upgrade(weaponIndex);
    } else if (level === 1) {
      // 새로운 무기 추가
      const def = WEAPON_DEFINITIONS[weaponType];
      weaponComp.addWeapon(weaponType, def.baseStats);
      console.log(`[GameScene] 새로운 무기 추가: ${def.name}`);
    }
  }

  private applyPassiveUpgrade(
    playerComp: PlayerComponent,
    health: HealthComponent | undefined,
    velocity: VelocityComponent | undefined,
    passiveId: string,
    level: number
  ): void {
    const passive = PASSIVE_UPGRADES.find((p) => p.id === passiveId);
    if (!passive) return;

    const effect = passive.effect(1); // Get single level effect

    if (effect.moveSpeed && velocity) {
      playerComp.moveSpeed *= 1 + effect.moveSpeed;
      velocity.speed = playerComp.moveSpeed;
    }

    if (effect.maxHealth && health) {
      health.max += effect.maxHealth;
      health.current += effect.maxHealth;
    }

    if (effect.armor) {
      playerComp.armor += effect.armor;
    }

    if (effect.luck) {
      playerComp.luck *= 1 + effect.luck;
    }

    if (effect.pickupRadius) {
      playerComp.pickupRadius *= 1 + effect.pickupRadius;
    }

    if (effect.cooldownReduction) {
      const players = this.world.getEntitiesWithComponents(WeaponComponent as ComponentClass<WeaponComponent>);
      for (const p of players) {
        const weapon = p.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
        if (weapon && weapon.weapons.length > 0) {
          for (const w of weapon.weapons) {
            w.stats.cooldown *= 1 - effect.cooldownReduction;
          }
        }
      }
    }

    if (effect.damageBonus) {
      const players = this.world.getEntitiesWithComponents(WeaponComponent as ComponentClass<WeaponComponent>);
      for (const p of players) {
        const weapon = p.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
        if (weapon && weapon.weapons.length > 0) {
          for (const w of weapon.weapons) {
            w.stats.damage *= 1 + effect.damageBonus;
          }
        }
      }
    }

    if (effect.areaBonus) {
      const players = this.world.getEntitiesWithComponents(WeaponComponent as ComponentClass<WeaponComponent>);
      for (const p of players) {
        const weapon = p.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
        if (weapon && weapon.weapons.length > 0) {
          for (const w of weapon.weapons) {
            w.stats.area *= 1 + effect.areaBonus;
          }
        }
      }
    }
  }

  // ========== 개발자 모드 메서드들 ==========

  getPlayerPosition(): { x: number; y: number } | null {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>, TransformComponent as ComponentClass<TransformComponent>);
    if (players.length === 0) return null;

    const transform = players[0].getComponent(TransformComponent as ComponentClass<TransformComponent>)! as TransformComponent;
    return { x: transform.x, y: transform.y };
  }

  getPlayerWeaponTypes(): WeaponType[] {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>, WeaponComponent as ComponentClass<WeaponComponent>);
    if (players.length === 0) return [];

    const weapon = players[0].getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
    return weapon.weapons.map(w => w.type);
  }

  setShowColliders(show: boolean): void {
    this.showColliders = show;
    if (!show && this.colliderGraphics) {
      this.colliderGraphics.clear();
    }
  }

  setActiveSkills(skills: WeaponType[]): void {
    this.activeSkills = skills;
    this.weaponSystem.setActiveSkills(skills);
  }

  addWeaponToPlayer(weaponType: WeaponType): void {
    const players = this.world.getEntitiesWithComponents(PlayerComponent as ComponentClass<PlayerComponent>);
    if (players.length === 0) return;

    const player = players[0];
    const weaponComp = player.getComponent(WeaponComponent as ComponentClass<WeaponComponent>) as WeaponComponent;
    if (!weaponComp) return;

    // 이미 가지고 있는지 확인
    const hasWeapon = weaponComp.weapons.some(w => w.type === weaponType);
    if (hasWeapon) return;

    // 무기 정의에서 기본 스탯 가져오기
    const def = WEAPON_DEFINITIONS[weaponType];
    weaponComp.addWeapon(weaponType, def.baseStats);
    console.log(`[DevMode] 무기 추가: ${def.name}`);
  }

  private drawColliders(): void {
    if (!this.showColliders || !this.colliderGraphics) return;

    this.colliderGraphics.clear();

    // 플레이어 충돌 범위 (녹색)
    const players = this.world.getEntitiesWithComponents(
      TransformComponent as ComponentClass<TransformComponent>,
      ColliderComponent as ComponentClass<ColliderComponent>,
      PlayerComponent as ComponentClass<PlayerComponent>
    );
    for (const entity of players) {
      const transform = entity.getComponent(TransformComponent as ComponentClass<TransformComponent>)! as TransformComponent;
      const collider = entity.getComponent(ColliderComponent as ComponentClass<ColliderComponent>)! as ColliderComponent;
      this.colliderGraphics.lineStyle(2, 0x00ff00, 0.8);
      this.colliderGraphics.strokeCircle(transform.x, transform.y, collider.radius);
    }

    // 적 충돌 범위 (빨간색)
    const enemies = this.world.getEntitiesWithTag('enemy');
    for (const entity of enemies) {
      const transform = entity.getComponent(TransformComponent as ComponentClass<TransformComponent>);
      const collider = entity.getComponent(ColliderComponent as ComponentClass<ColliderComponent>);
      if (transform && collider) {
        this.colliderGraphics.lineStyle(2, 0xff0000, 0.6);
        this.colliderGraphics.strokeCircle(transform.x, transform.y, collider.radius);
      }
    }

    // 투사체 충돌 범위 (노란색/파란색)
    const projectiles = this.world.getEntitiesWithTag('projectile');
    for (const entity of projectiles) {
      const transform = entity.getComponent(TransformComponent as ComponentClass<TransformComponent>);
      const collider = entity.getComponent(ColliderComponent as ComponentClass<ColliderComponent>);
      if (transform && collider) {
        const isPlayerProjectile = entity.hasTag('player_projectile');
        this.colliderGraphics.lineStyle(2, isPlayerProjectile ? 0x00ffff : 0xff00ff, 0.5);
        this.colliderGraphics.strokeCircle(transform.x, transform.y, collider.radius);
      }
    }

    // 픽업 아이템 충돌 범위 (보라색)
    const pickups = this.world.getEntitiesWithTag('pickup');
    for (const entity of pickups) {
      const transform = entity.getComponent(TransformComponent as ComponentClass<TransformComponent>);
      const collider = entity.getComponent(ColliderComponent as ComponentClass<ColliderComponent>);
      if (transform && collider) {
        this.colliderGraphics.lineStyle(2, 0xff00ff, 0.5);
        this.colliderGraphics.strokeCircle(transform.x, transform.y, collider.radius);
      }
    }
  }
}
