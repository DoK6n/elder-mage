import Phaser from 'phaser';
import {
  HealthComponent,
  PlayerComponent,
  TransformComponent,
  WeaponComponent,
  VelocityComponent,
} from '../components';
import type { WeaponType } from '../components/WeaponComponent';
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

  constructor() {
    super({ key: 'GameScene' });
  }

  create(): void {
    this.world = new World();
    this.isPaused = false;
    this.gameOver = false;

    this.createBackground();
    this.setupSystems();
    this.createPlayer();
    this.setupCamera();
    this.setupUI();
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
    const existingWeapon = player.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;

    if (existingWeapon && existingWeapon.type === weaponType) {
      // Upgrade existing weapon
      existingWeapon.upgrade();
    } else if (level === 1) {
      // Add new weapon - for now just upgrade current weapon stats
      // In a full implementation, player would have multiple weapons
      const def = WEAPON_DEFINITIONS[weaponType];
      if (existingWeapon) {
        existingWeapon.stats.damage += def.baseStats.damage * 0.5;
        existingWeapon.stats.projectileCount += 1;
        existingWeapon.stats.cooldown *= 0.9;
      }
    } else if (existingWeapon) {
      // Upgrade weapon
      existingWeapon.upgrade();
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
        if (weapon) {
          weapon.stats.cooldown *= 1 - effect.cooldownReduction;
        }
      }
    }

    if (effect.damageBonus) {
      const players = this.world.getEntitiesWithComponents(WeaponComponent as ComponentClass<WeaponComponent>);
      for (const p of players) {
        const weapon = p.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
        if (weapon) {
          weapon.stats.damage *= 1 + effect.damageBonus;
        }
      }
    }

    if (effect.areaBonus) {
      const players = this.world.getEntitiesWithComponents(WeaponComponent as ComponentClass<WeaponComponent>);
      for (const p of players) {
        const weapon = p.getComponent(WeaponComponent as ComponentClass<WeaponComponent>)! as WeaponComponent;
        if (weapon) {
          weapon.stats.area *= 1 + effect.areaBonus;
        }
      }
    }
  }
}
