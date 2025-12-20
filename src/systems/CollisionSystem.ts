import type Phaser from 'phaser';
import {
  ColliderComponent,
  ColliderLayer,
  EnemyComponent,
  HealthComponent,
  PickupComponent,
  PickupType,
  PlayerComponent,
  ProjectileComponent,
  SpriteComponent,
  TransformComponent,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import type { Entity } from '../ecs/Entity';
import { System } from '../ecs/System';

export interface CollisionEvent {
  entityA: Entity;
  entityB: Entity;
}

export class CollisionSystem extends System {
  public priority = 30;

  protected readonly requiredComponents: ComponentClass[] = [TransformComponent, ColliderComponent];

  private collisionEvents: CollisionEvent[] = [];
  private scene: Phaser.Scene | null = null;

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  update(_dt: number): void {
    this.collisionEvents = [];
    const entities = this.getEntities();

    for (let i = 0; i < entities.length; i++) {
      for (let j = i + 1; j < entities.length; j++) {
        const entityA = entities[i];
        const entityB = entities[j];

        if (this.checkCollision(entityA, entityB)) {
          this.handleCollision(entityA, entityB);
        }
      }
    }
  }

  private checkCollision(entityA: Entity, entityB: Entity): boolean {
    const transformA = entityA.getComponent(TransformComponent)!;
    const transformB = entityB.getComponent(TransformComponent)!;
    const colliderA = entityA.getComponent(ColliderComponent)!;
    const colliderB = entityB.getComponent(ColliderComponent)!;

    if (!colliderA.canCollideWith(colliderB.layer) && !colliderB.canCollideWith(colliderA.layer)) {
      return false;
    }

    return ColliderComponent.checkCollision(
      transformA.x,
      transformA.y,
      colliderA.radius,
      transformB.x,
      transformB.y,
      colliderB.radius
    );
  }

  private handleCollision(entityA: Entity, entityB: Entity): void {
    this.handleProjectileEnemyCollision(entityA, entityB);
    this.handlePlayerEnemyCollision(entityA, entityB);
    this.handlePlayerPickupCollision(entityA, entityB);
  }

  private handleProjectileEnemyCollision(entityA: Entity, entityB: Entity): void {
    let projectileEntity: Entity | null = null;
    let enemyEntity: Entity | null = null;

    if (entityA.hasTag('player_projectile') && entityB.hasTag('enemy')) {
      projectileEntity = entityA;
      enemyEntity = entityB;
    } else if (entityB.hasTag('player_projectile') && entityA.hasTag('enemy')) {
      projectileEntity = entityB;
      enemyEntity = entityA;
    }

    if (!projectileEntity || !enemyEntity) return;

    const projectile = projectileEntity.getComponent(ProjectileComponent)!;
    const enemyHealth = enemyEntity.getComponent(HealthComponent);
    const enemy = enemyEntity.getComponent(EnemyComponent);
    const enemyTransform = enemyEntity.getComponent(TransformComponent);

    if (!projectile.canHit(enemyEntity.id)) return;

    if (enemyHealth && enemyTransform) {
      const damage = projectile.damage;
      enemyHealth.damage(damage);

      // Show damage number
      this.showDamageNumber(enemyTransform.x, enemyTransform.y, damage, false, enemyHealth.isDead());

      if (enemyHealth.isDead() && enemy) {
        // Death effect
        this.spawnDeathEffect(enemyTransform.x, enemyTransform.y, enemy.type);

        this.spawnExperienceOrb(enemyEntity, enemy.experienceValue);
        const sprite = enemyEntity.getComponent(SpriteComponent);
        sprite?.destroy();
        this.world.removeEntity(enemyEntity);

        this.updatePlayerKills();
      }
    }

    const shouldDestroy = projectile.registerHit(enemyEntity.id);
    if (shouldDestroy) {
      const sprite = projectileEntity.getComponent(SpriteComponent);
      sprite?.destroy();
      this.world.removeEntity(projectileEntity);
    }
  }

  private handlePlayerEnemyCollision(entityA: Entity, entityB: Entity): void {
    let playerEntity: Entity | null = null;
    let enemyEntity: Entity | null = null;

    if (entityA.hasTag('player') && entityB.hasTag('enemy')) {
      playerEntity = entityA;
      enemyEntity = entityB;
    } else if (entityB.hasTag('player') && entityA.hasTag('enemy')) {
      playerEntity = entityB;
      enemyEntity = entityA;
    }

    if (!playerEntity || !enemyEntity) return;

    const playerHealth = playerEntity.getComponent(HealthComponent);
    const playerTransform = playerEntity.getComponent(TransformComponent);
    const enemy = enemyEntity.getComponent(EnemyComponent);

    if (playerHealth && playerTransform && enemy && enemy.canAttack()) {
      if (playerHealth.damage(enemy.damage)) {
        playerHealth.setInvincible(0.5);
        // Show damage number for player (red)
        this.showDamageNumber(playerTransform.x, playerTransform.y, enemy.damage, true, false);
      }
      enemy.attack();
    }
  }

  private handlePlayerPickupCollision(entityA: Entity, entityB: Entity): void {
    let playerEntity: Entity | null = null;
    let pickupEntity: Entity | null = null;

    if (entityA.hasTag('player') && entityB.hasTag('pickup')) {
      playerEntity = entityA;
      pickupEntity = entityB;
    } else if (entityB.hasTag('player') && entityA.hasTag('pickup')) {
      playerEntity = entityB;
      pickupEntity = entityA;
    }

    if (!playerEntity || !pickupEntity) return;

    const player = playerEntity.getComponent(PlayerComponent);
    const playerHealth = playerEntity.getComponent(HealthComponent);
    const pickup = pickupEntity.getComponent(PickupComponent);

    if (!player || !pickup) return;

    switch (pickup.type) {
      case PickupType.Experience:
        player.addExperience(pickup.value);
        break;
      case PickupType.Health:
        playerHealth?.heal(pickup.value);
        break;
    }

    const sprite = pickupEntity.getComponent(SpriteComponent);
    sprite?.destroy();
    this.world.removeEntity(pickupEntity);
  }

  private spawnExperienceOrb(enemyEntity: Entity, value: number): void {
    const transform = enemyEntity.getComponent(TransformComponent);
    if (!transform) return;

    const pickup = this.world.createEntity();
    pickup.addTag('pickup');
    pickup.addComponent(new TransformComponent(transform.x, transform.y));
    pickup.addComponent(new PickupComponent(PickupType.Experience, value));
    pickup.addComponent(new ColliderComponent(10, ColliderLayer.Pickup, ColliderLayer.Player));

    const sprite = new SpriteComponent('exp_orb', 12, 12, 0xffffff, 3);
    pickup.addComponent(sprite);

    if (this.scene) {
      const expSprite = this.scene.add.sprite(transform.x, transform.y, 'exp_orb');
      expSprite.setDepth(3);
      sprite.setSprite(expSprite);
    }
  }

  private updatePlayerKills(): void {
    const players = this.world.getEntitiesWithComponents(PlayerComponent);
    for (const player of players) {
      const playerComp = player.getComponent(PlayerComponent);
      playerComp?.addKill();
    }
  }

  private spawnDeathEffect(x: number, y: number, enemyType: string): void {
    if (!this.scene) return;

    // Get color based on enemy type
    let color = 0xffffff;
    let particleCount = 8;
    let scale = 1;

    switch (enemyType) {
      case 'slime':
        color = 0x44aa44; // Green slime
        particleCount = 6;
        scale = 0.8;
        break;
      case 'goblin':
        color = 0x5a8a32; // Green goblin
        particleCount = 8;
        scale = 0.9;
        break;
      case 'kobold':
        color = 0x8b6914; // Brown kobold
        particleCount = 7;
        scale = 0.85;
        break;
      case 'lizardman':
        color = 0x2e8b57; // Sea green lizardman
        particleCount = 10;
        scale = 1.1;
        break;
      case 'orc':
        color = 0x556b2f; // Dark olive orc
        particleCount = 14;
        scale = 1.3;
        break;
      case 'ogre':
        color = 0x8b4513; // Saddle brown ogre
        particleCount = 25;
        scale = 2;
        break;
    }

    // Create particle burst effect
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 50 + Math.random() * 100;
      const size = (4 + Math.random() * 6) * scale;

      const particle = this.scene.add.circle(x, y, size, color, 0.8);
      particle.setDepth(50);

      // Animate particle outward
      this.scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0,
        scaleX: 0.1,
        scaleY: 0.1,
        duration: 300 + Math.random() * 200,
        ease: 'Power2',
        onComplete: () => {
          particle.destroy();
        },
      });
    }

    // Create flash effect at death location
    const flash = this.scene.add.circle(x, y, 20 * scale, 0xffffff, 0.6);
    flash.setDepth(49);
    this.scene.tweens.add({
      targets: flash,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        flash.destroy();
      },
    });

    // Create ring effect for stronger enemies
    if (enemyType === 'orc' || enemyType === 'ogre') {
      const ring = this.scene.add.circle(x, y, 10, color, 0);
      ring.setStrokeStyle(3, color, 1);
      ring.setDepth(48);
      this.scene.tweens.add({
        targets: ring,
        scaleX: 4,
        scaleY: 4,
        alpha: 0,
        duration: 400,
        ease: 'Power1',
        onComplete: () => {
          ring.destroy();
        },
      });
    }
  }

  getCollisionEvents(): CollisionEvent[] {
    return this.collisionEvents;
  }

  private showDamageNumber(x: number, y: number, damage: number, isPlayerDamage: boolean, isCritical: boolean): void {
    if (!this.scene) return;

    // Random offset for variety
    const offsetX = (Math.random() - 0.5) * 30;
    const offsetY = -20 + (Math.random() - 0.5) * 10;

    // Determine color and size based on damage type
    let color = '#ffffff';
    let fontSize = '16px';
    let strokeColor = '#000000';

    if (isPlayerDamage) {
      color = '#ff4444';
      fontSize = '20px';
      strokeColor = '#880000';
    } else if (isCritical) {
      color = '#ffff00';
      fontSize = '24px';
      strokeColor = '#885500';
    } else if (damage >= 20) {
      color = '#ff8800';
      fontSize = '18px';
    }

    const damageText = this.scene.add.text(x + offsetX, y + offsetY, Math.floor(damage).toString(), {
      fontFamily: 'Arial',
      fontSize: fontSize,
      color: color,
      stroke: strokeColor,
      strokeThickness: 3,
      fontStyle: 'bold',
    });

    damageText.setOrigin(0.5, 0.5);
    damageText.setDepth(100);

    // Animate the damage number
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 50,
      alpha: 0,
      scaleX: isCritical ? 1.5 : 1.2,
      scaleY: isCritical ? 1.5 : 1.2,
      duration: isCritical ? 800 : 600,
      ease: 'Power2',
      onComplete: () => {
        damageText.destroy();
      },
    });

    // Add slight bounce effect for critical hits
    if (isCritical) {
      this.scene.tweens.add({
        targets: damageText,
        scaleX: 1.8,
        scaleY: 1.8,
        duration: 100,
        yoyo: true,
        ease: 'Bounce.easeOut',
      });
    }
  }
}
