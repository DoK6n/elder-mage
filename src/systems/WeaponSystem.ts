import type Phaser from 'phaser';
import {
  ColliderComponent,
  ColliderLayer,
  EnemyComponent,
  PlayerComponent,
  ProjectileComponent,
  SpriteComponent,
  TransformComponent,
  VelocityComponent,
  WeaponComponent,
  type WeaponSlot,
  WeaponType,
  ElementType,
  getElementFromWeapon,
  getElementColor,
} from '../components';
import type { ComponentClass } from '../ecs/Component';
import type { Entity } from '../ecs/Entity';
import { System } from '../ecs/System';
import { WEAPON_DEFINITIONS } from '../game/WeaponData';

export class WeaponSystem extends System {
  public priority = 20;
  private scene: Phaser.Scene | null = null;

  protected readonly requiredComponents: ComponentClass[] = [
    TransformComponent,
    WeaponComponent,
    PlayerComponent,
  ];

  setScene(scene: Phaser.Scene): void {
    this.scene = scene;
  }

  update(dt: number): void {
    const entities = this.getEntities();

    for (const entity of entities) {
      const transform = entity.getComponent(TransformComponent)!;
      const weapon = entity.getComponent(WeaponComponent)!;

      weapon.updateCooldown(dt);

      // 모든 무기를 순회하며 발사 가능한 무기 발사
      for (let i = 0; i < weapon.weapons.length; i++) {
        if (weapon.canFire(i)) {
          this.fireWeapon(entity, transform, weapon, i);
          weapon.fire(i);
        }
      }
    }
  }

  private fireWeapon(owner: Entity, transform: TransformComponent, weapon: WeaponComponent, weaponIndex: number): void {
    const weaponSlot = weapon.weapons[weaponIndex];
    const weaponDef = WEAPON_DEFINITIONS[weaponSlot.type];
    const textureKey = weaponDef?.textureKey || 'projectile';

    // 특수 무기 처리
    switch (weaponSlot.type) {
      case WeaponType.WaterShield:
      case WeaponType.Earthquake:
        this.createAuraAttack(owner, transform, weaponSlot, textureKey);
        return;

      case WeaponType.FireWall:
        this.createFireWall(owner, transform, weaponSlot);
        return;

      case WeaponType.SummonGolem:
        this.summonGolem(owner, transform, weaponSlot);
        return;

      case WeaponType.Blizzard:
        this.createBlizzard(owner, transform, weaponSlot);
        return;

      case WeaponType.ThunderStorm:
        this.createThunderStorm(owner, transform, weaponSlot);
        return;

      case WeaponType.Tornado:
        this.createTornado(owner, transform, weaponSlot);
        return;

      case WeaponType.RockSpike:
        this.createRockSpike(owner, transform, weaponSlot);
        return;

      case WeaponType.AirSlash:
        this.createCircularAttack(owner, transform, weaponSlot, textureKey);
        return;

      case WeaponType.ChainLightning:
        this.createChainLightning(owner, transform, weaponSlot);
        return;

      case WeaponType.IceBolt:
        this.createIceBolt(owner, transform, weaponSlot);
        return;

      case WeaponType.Fireball:
        this.createFireball(owner, transform, weaponSlot);
        return;

      case WeaponType.Meteor:
        this.createMeteorStrike(owner, transform, weaponSlot);
        return;

      default:
        this.createStandardProjectile(owner, transform, weaponSlot, textureKey);
    }
  }

  // 표준 투사체 발사
  private createStandardProjectile(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot,
    textureKey: string
  ): void {
    const nearestEnemy = this.findNearestEnemy(transform);

    for (let i = 0; i < weaponSlot.stats.projectileCount; i++) {
      const projectile = this.world.createEntity();
      projectile.addTag('projectile');
      projectile.addTag('player_projectile');

      const angle = this.calculateProjectileAngle(transform, nearestEnemy, i, weaponSlot);
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      projectile.addComponent(new TransformComponent(transform.x, transform.y));

      projectile.addComponent(
        new VelocityComponent(
          dirX * weaponSlot.stats.projectileSpeed,
          dirY * weaponSlot.stats.projectileSpeed,
          weaponSlot.stats.projectileSpeed
        )
      );

      projectile.addComponent(
        new ProjectileComponent(
          Math.floor(weaponSlot.stats.damage),
          weaponSlot.stats.projectileSpeed,
          weaponSlot.stats.pierce,
          weaponSlot.stats.duration,
          owner.id
        )
      );

      projectile.addComponent(
        new ColliderComponent(
          8 * weaponSlot.stats.area,
          ColliderLayer.PlayerProjectile,
          ColliderLayer.Enemy
        )
      );

      const sprite = new SpriteComponent(textureKey, 16, 16, 0xffffff, 5);
      projectile.addComponent(sprite);

      if (this.scene) {
        const projectileSprite = this.scene.add.sprite(transform.x, transform.y, textureKey);
        projectileSprite.setDepth(5);
        projectileSprite.setScale(weaponSlot.stats.area);
        projectileSprite.setRotation(angle);
        sprite.setSprite(projectileSprite);

        // 속성별 파티클 효과
        this.addElementalTrail(projectileSprite, weaponSlot.element);
      }
    }
  }

  // 오라/광역 공격 (Water Shield, Earthquake 등)
  private createAuraAttack(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot,
    textureKey: string
  ): void {
    const projectile = this.world.createEntity();
    projectile.addTag('projectile');
    projectile.addTag('player_projectile');

    projectile.addComponent(new TransformComponent(transform.x, transform.y));
    projectile.addComponent(new VelocityComponent(0, 0, 0));

    projectile.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        0,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    const radius = 50 * weaponSlot.stats.area;
    projectile.addComponent(
      new ColliderComponent(radius, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
    );

    const sprite = new SpriteComponent(textureKey, 40, 40, 0xffffff, 4);
    projectile.addComponent(sprite);

    if (this.scene) {
      const color = getElementColor(weaponSlot.element);

      // 광역 이펙트
      const circle = this.scene.add.circle(transform.x, transform.y, radius * 0.5, color, 0.3);
      circle.setDepth(4);
      circle.setStrokeStyle(3, color, 0.8);

      this.scene.tweens.add({
        targets: circle,
        scaleX: 1.5,
        scaleY: 1.5,
        alpha: 0,
        duration: weaponSlot.stats.duration * 1000,
        onComplete: () => circle.destroy(),
      });

      // 파티클
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const px = transform.x + Math.cos(angle) * radius * 0.3;
        const py = transform.y + Math.sin(angle) * radius * 0.3;

        const particle = this.scene.add.circle(px, py, 4, color, 0.8);
        particle.setDepth(5);

        this.scene.tweens.add({
          targets: particle,
          x: transform.x + Math.cos(angle) * radius,
          y: transform.y + Math.sin(angle) * radius,
          alpha: 0,
          duration: weaponSlot.stats.duration * 800,
          onComplete: () => particle.destroy(),
        });
      }
    }
  }

  // 파이어 월 생성
  private createFireWall(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const nearestEnemy = this.findNearestEnemy(transform);
    let angle = Math.random() * Math.PI * 2;

    if (nearestEnemy) {
      const enemyTransform = nearestEnemy.getComponent(TransformComponent)!;
      angle = Math.atan2(enemyTransform.y - transform.y, enemyTransform.x - transform.x);
    }

    const distance = 80;
    const wallX = transform.x + Math.cos(angle) * distance;
    const wallY = transform.y + Math.sin(angle) * distance;

    const projectile = this.world.createEntity();
    projectile.addTag('projectile');
    projectile.addTag('player_projectile');

    projectile.addComponent(new TransformComponent(wallX, wallY));
    projectile.addComponent(new VelocityComponent(0, 0, 0));

    projectile.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        0,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    const radius = 40 * weaponSlot.stats.area;
    projectile.addComponent(
      new ColliderComponent(radius, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
    );

    if (this.scene) {
      // 불벽 이펙트
      const firewall = this.scene.add.sprite(wallX, wallY, 'proj_firewall');
      firewall.setDepth(4);
      firewall.setScale(weaponSlot.stats.area);
      firewall.setRotation(angle);

      // 불꽃 애니메이션
      this.scene.tweens.add({
        targets: firewall,
        scaleY: weaponSlot.stats.area * 1.2,
        duration: 200,
        yoyo: true,
        repeat: Math.floor(weaponSlot.stats.duration * 2.5),
      });

      // 소멸
      this.scene.time.delayedCall(weaponSlot.stats.duration * 1000, () => {
        this.scene?.tweens.add({
          targets: firewall,
          alpha: 0,
          duration: 300,
          onComplete: () => firewall.destroy(),
        });
      });
    }
  }

  // 골렘 소환
  private summonGolem(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const golem = this.world.createEntity();
    golem.addTag('projectile');
    golem.addTag('player_projectile');
    golem.addTag('golem');

    // 플레이어 앞에 소환
    const spawnX = transform.x + (Math.random() - 0.5) * 60;
    const spawnY = transform.y + (Math.random() - 0.5) * 60;

    golem.addComponent(new TransformComponent(spawnX, spawnY));

    // 골렘은 적을 찾아 이동
    golem.addComponent(new VelocityComponent(0, 0, weaponSlot.stats.projectileSpeed));

    golem.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        weaponSlot.stats.projectileSpeed,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    const radius = 24 * weaponSlot.stats.area;
    golem.addComponent(
      new ColliderComponent(radius, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
    );

    const sprite = new SpriteComponent('proj_golem', 48, 48, 0xffffff, 6);
    golem.addComponent(sprite);

    if (this.scene) {
      // 소환 이펙트
      const summonEffect = this.scene.add.circle(spawnX, spawnY, 30, 0x8b4513, 0.5);
      summonEffect.setDepth(3);

      this.scene.tweens.add({
        targets: summonEffect,
        scaleX: 2,
        scaleY: 2,
        alpha: 0,
        duration: 500,
        onComplete: () => summonEffect.destroy(),
      });

      // 골렘 스프라이트
      const golemSprite = this.scene.add.sprite(spawnX, spawnY, 'proj_golem');
      golemSprite.setDepth(6);
      golemSprite.setScale(weaponSlot.stats.area);
      sprite.setSprite(golemSprite);

      // 소환 애니메이션
      golemSprite.setAlpha(0);
      golemSprite.setScale(0.5);

      this.scene.tweens.add({
        targets: golemSprite,
        alpha: 1,
        scaleX: weaponSlot.stats.area,
        scaleY: weaponSlot.stats.area,
        duration: 500,
        ease: 'Back.easeOut',
      });
    }
  }

  // 블리자드
  private createBlizzard(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const radius = 100 * weaponSlot.stats.area;

    for (let i = 0; i < weaponSlot.stats.projectileCount; i++) {
      this.scene?.time.delayedCall(i * 200, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const snowX = transform.x + Math.cos(angle) * dist;
        const snowY = transform.y + Math.sin(angle) * dist;

        const projectile = this.world.createEntity();
        projectile.addTag('projectile');
        projectile.addTag('player_projectile');

        projectile.addComponent(new TransformComponent(snowX, snowY));
        projectile.addComponent(new VelocityComponent(0, 0, 0));

        projectile.addComponent(
          new ProjectileComponent(
            Math.floor(weaponSlot.stats.damage),
            0,
            1,
            0.5,
            owner.id
          )
        );

        projectile.addComponent(
          new ColliderComponent(15 * weaponSlot.stats.area, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
        );

        if (this.scene) {
          const snowflake = this.scene.add.sprite(snowX, snowY - 50, 'proj_blizzard');
          snowflake.setDepth(7);
          snowflake.setScale(weaponSlot.stats.area);

          this.scene.tweens.add({
            targets: snowflake,
            y: snowY,
            rotation: Math.PI * 2,
            alpha: 0,
            duration: 800,
            onComplete: () => snowflake.destroy(),
          });
        }
      });
    }
  }

  // 썬더스톰
  private createThunderStorm(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const radius = 150 * weaponSlot.stats.area;

    for (let i = 0; i < weaponSlot.stats.projectileCount; i++) {
      this.scene?.time.delayedCall(i * 300 + Math.random() * 200, () => {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * radius;
        const strikeX = transform.x + Math.cos(angle) * dist;
        const strikeY = transform.y + Math.sin(angle) * dist;

        const projectile = this.world.createEntity();
        projectile.addTag('projectile');
        projectile.addTag('player_projectile');

        projectile.addComponent(new TransformComponent(strikeX, strikeY));
        projectile.addComponent(new VelocityComponent(0, 0, 0));

        projectile.addComponent(
          new ProjectileComponent(
            Math.floor(weaponSlot.stats.damage),
            0,
            weaponSlot.stats.pierce,
            0.3,
            owner.id
          )
        );

        projectile.addComponent(
          new ColliderComponent(20 * weaponSlot.stats.area, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
        );

        if (this.scene) {
          // 번개 이펙트
          const lightning = this.scene.add.sprite(strikeX, strikeY - 100, 'proj_thunder');
          lightning.setDepth(8);
          lightning.setScale(1, 3);
          lightning.setAlpha(0);

          this.scene.tweens.add({
            targets: lightning,
            alpha: 1,
            y: strikeY,
            duration: 100,
            onComplete: () => {
              // 플래시 효과
              const flash = this.scene?.add.circle(strikeX, strikeY, 30, 0xffffff, 0.8);
              flash?.setDepth(9);

              this.scene?.tweens.add({
                targets: [lightning, flash],
                alpha: 0,
                duration: 200,
                onComplete: () => {
                  lightning.destroy();
                  flash?.destroy();
                },
              });
            },
          });
        }
      });
    }
  }

  // 토네이도
  private createTornado(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const nearestEnemy = this.findNearestEnemy(transform);

    const projectile = this.world.createEntity();
    projectile.addTag('projectile');
    projectile.addTag('player_projectile');
    projectile.addTag('tornado');

    projectile.addComponent(new TransformComponent(transform.x, transform.y));

    let vx = 0;
    let vy = 0;
    if (nearestEnemy) {
      const enemyTransform = nearestEnemy.getComponent(TransformComponent)!;
      const angle = Math.atan2(enemyTransform.y - transform.y, enemyTransform.x - transform.x);
      vx = Math.cos(angle) * weaponSlot.stats.projectileSpeed;
      vy = Math.sin(angle) * weaponSlot.stats.projectileSpeed;
    } else {
      const angle = Math.random() * Math.PI * 2;
      vx = Math.cos(angle) * weaponSlot.stats.projectileSpeed;
      vy = Math.sin(angle) * weaponSlot.stats.projectileSpeed;
    }

    projectile.addComponent(new VelocityComponent(vx, vy, weaponSlot.stats.projectileSpeed));

    projectile.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        weaponSlot.stats.projectileSpeed,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    const radius = 35 * weaponSlot.stats.area;
    projectile.addComponent(
      new ColliderComponent(radius, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
    );

    const sprite = new SpriteComponent('proj_tornado', 32, 32, 0xffffff, 5);
    projectile.addComponent(sprite);

    if (this.scene) {
      const tornado = this.scene.add.sprite(transform.x, transform.y, 'proj_tornado');
      tornado.setDepth(5);
      tornado.setScale(weaponSlot.stats.area);
      sprite.setSprite(tornado);

      // 회전 애니메이션
      this.scene.tweens.add({
        targets: tornado,
        rotation: Math.PI * 8,
        duration: weaponSlot.stats.duration * 1000,
        repeat: 0,
      });
    }
  }

  // 락 스파이크
  private createRockSpike(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const nearestEnemy = this.findNearestEnemy(transform);
    let targetX = transform.x + (Math.random() - 0.5) * 100;
    let targetY = transform.y + (Math.random() - 0.5) * 100;

    if (nearestEnemy) {
      const enemyTransform = nearestEnemy.getComponent(TransformComponent)!;
      targetX = enemyTransform.x;
      targetY = enemyTransform.y;
    }

    const projectile = this.world.createEntity();
    projectile.addTag('projectile');
    projectile.addTag('player_projectile');

    projectile.addComponent(new TransformComponent(targetX, targetY));
    projectile.addComponent(new VelocityComponent(0, 0, 0));

    projectile.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        0,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    const radius = 25 * weaponSlot.stats.area;
    projectile.addComponent(
      new ColliderComponent(radius, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
    );

    if (this.scene) {
      // 땅 갈라짐 이펙트
      const crack = this.scene.add.sprite(targetX, targetY, 'proj_rock');
      crack.setDepth(3);
      crack.setScale(0);
      crack.setAlpha(0.8);

      // 솟아오르는 애니메이션
      this.scene.tweens.add({
        targets: crack,
        scaleX: weaponSlot.stats.area * 1.5,
        scaleY: weaponSlot.stats.area * 1.5,
        duration: 150,
        ease: 'Back.easeOut',
        onComplete: () => {
          this.scene?.tweens.add({
            targets: crack,
            alpha: 0,
            scaleY: weaponSlot.stats.area * 0.5,
            duration: 300,
            delay: 200,
            onComplete: () => crack.destroy(),
          });
        },
      });

      // 먼지 파티클
      for (let i = 0; i < 5; i++) {
        const dust = this.scene.add.circle(
          targetX + (Math.random() - 0.5) * 30,
          targetY + (Math.random() - 0.5) * 30,
          3 + Math.random() * 4,
          0x8b4513,
          0.6
        );
        dust.setDepth(4);

        this.scene.tweens.add({
          targets: dust,
          y: dust.y - 20 - Math.random() * 20,
          alpha: 0,
          duration: 400,
          onComplete: () => dust.destroy(),
        });
      }
    }
  }

  // 체인 라이트닝
  private createChainLightning(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot
  ): void {
    const enemies = this.world.getEntitiesWithComponents(TransformComponent, EnemyComponent);
    if (enemies.length === 0) return;

    // 가장 가까운 적부터 시작
    let currentTarget = this.findNearestEnemy(transform);
    if (!currentTarget) return;

    const hitEnemies = new Set<number>();
    let chainCount = weaponSlot.stats.pierce;
    let lastX = transform.x;
    let lastY = transform.y;

    const chainNext = (delay: number) => {
      if (chainCount <= 0 || !currentTarget) return;

      const targetTransform = currentTarget.getComponent(TransformComponent)!;
      const targetX = targetTransform.x;
      const targetY = targetTransform.y;

      this.scene?.time.delayedCall(delay, () => {
        // 데미지 적용 (충돌 시스템 통해)
        const projectile = this.world.createEntity();
        projectile.addTag('projectile');
        projectile.addTag('player_projectile');

        projectile.addComponent(new TransformComponent(targetX, targetY));
        projectile.addComponent(new VelocityComponent(0, 0, 0));

        projectile.addComponent(
          new ProjectileComponent(
            Math.floor(weaponSlot.stats.damage),
            0,
            1,
            0.1,
            owner.id
          )
        );

        projectile.addComponent(
          new ColliderComponent(15, ColliderLayer.PlayerProjectile, ColliderLayer.Enemy)
        );

        // 번개 라인 이펙트
        if (this.scene) {
          const line = this.scene.add.graphics();
          line.setDepth(8);
          line.lineStyle(3, 0xffff00, 1);
          line.lineBetween(lastX, lastY, targetX, targetY);

          // 전기 스파크
          const spark = this.scene.add.sprite(targetX, targetY, 'proj_chain');
          spark.setDepth(9);
          spark.setScale(weaponSlot.stats.area * 0.8);

          this.scene.tweens.add({
            targets: [line, spark],
            alpha: 0,
            duration: 200,
            onComplete: () => {
              line.destroy();
              spark.destroy();
            },
          });
        }

        hitEnemies.add(currentTarget!.id);
        lastX = targetX;
        lastY = targetY;
        chainCount--;

        // 다음 타겟 찾기
        let nearestDist = Infinity;
        let nextTarget: Entity | null = null;

        for (const enemy of enemies) {
          if (hitEnemies.has(enemy.id)) continue;

          const enemyTransform = enemy.getComponent(TransformComponent)!;
          const dist = Math.hypot(enemyTransform.x - targetX, enemyTransform.y - targetY);

          if (dist < nearestDist && dist < 150) {
            nearestDist = dist;
            nextTarget = enemy;
          }
        }

        currentTarget = nextTarget;
        chainNext(100);
      });
    };

    chainNext(0);
  }

  // 원형 공격 (Air Slash 등)
  private createCircularAttack(
    owner: Entity,
    transform: TransformComponent,
    weaponSlot: WeaponSlot,
    textureKey: string
  ): void {
    for (let i = 0; i < weaponSlot.stats.projectileCount; i++) {
      const angle = (i / weaponSlot.stats.projectileCount) * Math.PI * 2;
      const dirX = Math.cos(angle);
      const dirY = Math.sin(angle);

      const projectile = this.world.createEntity();
      projectile.addTag('projectile');
      projectile.addTag('player_projectile');

      projectile.addComponent(new TransformComponent(transform.x, transform.y));

      projectile.addComponent(
        new VelocityComponent(
          dirX * weaponSlot.stats.projectileSpeed,
          dirY * weaponSlot.stats.projectileSpeed,
          weaponSlot.stats.projectileSpeed
        )
      );

      projectile.addComponent(
        new ProjectileComponent(
          Math.floor(weaponSlot.stats.damage),
          weaponSlot.stats.projectileSpeed,
          weaponSlot.stats.pierce,
          weaponSlot.stats.duration,
          owner.id
        )
      );

      projectile.addComponent(
        new ColliderComponent(
          8 * weaponSlot.stats.area,
          ColliderLayer.PlayerProjectile,
          ColliderLayer.Enemy
        )
      );

      const sprite = new SpriteComponent(textureKey, 16, 16, 0xffffff, 5);
      projectile.addComponent(sprite);

      if (this.scene) {
        const projectileSprite = this.scene.add.sprite(transform.x, transform.y, textureKey);
        projectileSprite.setDepth(5);
        projectileSprite.setScale(weaponSlot.stats.area);
        projectileSprite.setRotation(angle);
        sprite.setSprite(projectileSprite);
      }
    }
  }

  // 속성별 트레일 이펙트
  private addElementalTrail(sprite: Phaser.GameObjects.Sprite, element: ElementType): void {
    if (!this.scene || element === ElementType.None) return;

    const color = getElementColor(element);

    // 주기적으로 트레일 파티클 생성
    const trailEvent = this.scene.time.addEvent({
      delay: 50,
      callback: () => {
        if (!sprite.active) {
          trailEvent.destroy();
          return;
        }

        const trail = this.scene?.add.circle(sprite.x, sprite.y, 3, color, 0.5);
        if (trail) {
          trail.setDepth(4);
          this.scene?.tweens.add({
            targets: trail,
            alpha: 0,
            scaleX: 0.3,
            scaleY: 0.3,
            duration: 200,
            onComplete: () => trail.destroy(),
          });
        }
      },
      repeat: -1,
    });
  }

  private findNearestEnemy(playerTransform: TransformComponent): Entity | null {
    const enemies = this.world.getEntitiesWithComponents(TransformComponent, EnemyComponent);
    let nearest: Entity | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (const enemy of enemies) {
      const enemyTransform = enemy.getComponent(TransformComponent)!;
      const distance = playerTransform.distanceTo(enemyTransform);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = enemy;
      }
    }

    return nearest;
  }

  private calculateProjectileAngle(
    playerTransform: TransformComponent,
    nearestEnemy: Entity | null,
    index: number,
    weaponSlot: WeaponSlot
  ): number {
    let baseAngle = 0;

    if (nearestEnemy) {
      const enemyTransform = nearestEnemy.getComponent(TransformComponent)!;
      baseAngle = Math.atan2(
        enemyTransform.y - playerTransform.y,
        enemyTransform.x - playerTransform.x
      );
    } else {
      baseAngle = Math.random() * Math.PI * 2;
    }

    const spreadAngle = (Math.PI / 6) * (index - (weaponSlot.stats.projectileCount - 1) / 2);
    return baseAngle + spreadAngle;
  }

  // 얼음 공격 (주변에 생성, 정지 효과)
  private createIceBolt(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
    if (!this.scene) return;

    // 캐릭터 주변 8방향에 얼음 생성
    const directions = 8;
    const radius = 80; // 캐릭터로부터의 거리

    for (let i = 0; i < directions; i++) {
      const angle = (i / directions) * Math.PI * 2;
      const iceX = transform.x + Math.cos(angle) * radius;
      const iceY = transform.y + Math.sin(angle) * radius;

      // 약간의 딜레이를 두고 순차적으로 생성
      this.scene.time.delayedCall(i * 50, () => {
        const ice = this.world.createEntity();
        ice.addTag('projectile');
        ice.addTag('player_projectile');
        ice.addTag('ice_projectile'); // 얼음 태그 추가

        ice.addComponent(new TransformComponent(iceX, iceY));
        ice.addComponent(new VelocityComponent(0, 0, 0)); // 정지 상태

        ice.addComponent(
          new ProjectileComponent(
            Math.floor(weaponSlot.stats.damage),
            0,
            999, // 범위 내 모든 적 타격
            1.0, // 1초 동안 유지
            owner.id
          )
        );

        ice.addComponent(
          new ColliderComponent(
            60 * weaponSlot.stats.area, // 충돌 범위
            ColliderLayer.PlayerProjectile,
            ColliderLayer.Enemy
          )
        );

        const sprite = new SpriteComponent('ice-effect', 120, 120, 0xffffff, 5);
        ice.addComponent(sprite);

        // 얼음 이펙트 스프라이트 생성
        const iceSprite = this.scene!.add.sprite(iceX, iceY, 'ice-effect');
        iceSprite.setDepth(5);
        iceSprite.setScale(1.2); // 2배 증가
        iceSprite.setAlpha(0);
        sprite.setSprite(iceSprite);

        // 갑자기 나타나는 효과
        this.scene!.tweens.add({
          targets: iceSprite,
          alpha: 1,
          scaleX: 1.4,
          scaleY: 1.4,
          duration: 100,
          ease: 'Back.easeOut',
          onComplete: () => {
            iceSprite.play('ice-attack'); // 10프레임 애니메이션 재생

            // 애니메이션 종료 후 페이드아웃
            iceSprite.once('animationcomplete', () => {
              this.scene?.tweens.add({
                targets: iceSprite,
                alpha: 0,
                duration: 200,
              });
            });
          },
        });
      });
    }
  }

  // 화염구 (관통 4회)
  private createFireball(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
    const nearestEnemy = this.findNearestEnemy(transform);

    const projectile = this.world.createEntity();
    projectile.addTag('projectile');
    projectile.addTag('player_projectile');

    let angle = 0;
    if (nearestEnemy) {
      const enemyTransform = nearestEnemy.getComponent(TransformComponent)!;
      angle = Math.atan2(
        enemyTransform.y - transform.y,
        enemyTransform.x - transform.x
      );
    } else {
      angle = Math.random() * Math.PI * 2;
    }

    const dirX = Math.cos(angle);
    const dirY = Math.sin(angle);

    projectile.addComponent(new TransformComponent(transform.x, transform.y));
    projectile.addComponent(
      new VelocityComponent(
        dirX * weaponSlot.stats.projectileSpeed,
        dirY * weaponSlot.stats.projectileSpeed,
        weaponSlot.stats.projectileSpeed
      )
    );

    projectile.addComponent(
      new ProjectileComponent(
        Math.floor(weaponSlot.stats.damage),
        weaponSlot.stats.projectileSpeed,
        weaponSlot.stats.pierce,
        weaponSlot.stats.duration,
        owner.id
      )
    );

    projectile.addComponent(
      new ColliderComponent(
        10 * weaponSlot.stats.area,
        ColliderLayer.PlayerProjectile,
        ColliderLayer.Enemy
      )
    );

    const sprite = new SpriteComponent('fire-effect', 20, 20, 0xffffff, 5);
    projectile.addComponent(sprite);

    if (this.scene) {
      const projSprite = this.scene.add.sprite(transform.x, transform.y, 'fire-effect');
      projSprite.setDepth(5);
      projSprite.setScale(1.0); // 2배 증가 (0.5 → 1.0)
      projSprite.play('fire-attack');
      sprite.setSprite(projSprite);
    }
  }

  // 마그마/메테오 낙하 (광역 데미지)
  private createMeteorStrike(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
    if (!this.scene) return;

    // 화면 범위 내 랜덤 위치 선택
    const camera = this.scene.cameras.main;
    const targetX = transform.x + (Math.random() - 0.5) * camera.width * 0.8;
    const targetY = transform.y + (Math.random() - 0.5) * camera.height * 0.8;

    // 경고 표시 (타겟 위치에 원형 표시)
    const warningCircle = this.scene.add.circle(targetX, targetY, 80 * weaponSlot.stats.area, 0xff0000, 0.3);
    warningCircle.setDepth(5);
    warningCircle.setStrokeStyle(3, 0xff0000, 0.8);

    this.scene.tweens.add({
      targets: warningCircle,
      alpha: 0,
      duration: 800,
      onComplete: () => warningCircle.destroy(),
    });

    // 메테오 낙하 이펙트 (meteor_effect.png 스프라이트시트 사용)
    // 프레임 크기: 100x250px, 17프레임 (낙하 + 폭발 애니메이션 포함)
    // 스프라이트 자체가 위에서 아래로 떨어지는 애니메이션이므로 y좌표 고정
    const meteorScale = 2;
    // 착지 지점이 targetY에 오도록 스프라이트 위치 조정
    // 메테오가 스프라이트 하단 근처에서 착지하므로 스프라이트 중심을 targetY로 설정
    const meteorSprite = this.scene.add.sprite(targetX, targetY - 150, 'meteor-effect');
    meteorSprite.setDepth(8);
    meteorSprite.setScale(meteorScale);
    meteorSprite.play('meteor-attack'); // 애니메이션 재생

    // 12fps 기준, 11프레임 도달 시간 = 11 / 12 * 1000 = 약 917ms (착지 시점)
    // 나머지 6프레임 = 6 / 12 * 1000 = 500ms (폭발 애니메이션)
    const impactDelay = 917;
    const remainingDuration = 500;

    // 11프레임(착지 시점)에서 데미지 생성 + 충격파 이펙트
    this.scene.time.delayedCall(impactDelay, () => {
      // 광역 데미지 생성
      const aoe = this.world.createEntity();
      aoe.addTag('projectile');
      aoe.addTag('player_projectile');

      aoe.addComponent(new TransformComponent(targetX, targetY));
      aoe.addComponent(new VelocityComponent(0, 0, 0));

      aoe.addComponent(
        new ProjectileComponent(
          Math.floor(weaponSlot.stats.damage),
          0,
          weaponSlot.stats.pierce,
          remainingDuration / 1000, // 나머지 애니메이션 시간 동안 데미지 지속
          owner.id
        )
      );

      aoe.addComponent(
        new ColliderComponent(
          80 * weaponSlot.stats.area,
          ColliderLayer.PlayerProjectile,
          ColliderLayer.Enemy
        )
      );

      // 충격파 링 효과
      const shockwave = this.scene!.add.circle(targetX, targetY, 40, 0xff4400, 0);
      shockwave.setDepth(5);
      shockwave.setStrokeStyle(5, 0xff4400, 1);

      this.scene!.tweens.add({
        targets: shockwave,
        scaleX: 6,
        scaleY: 6,
        alpha: 0,
        duration: remainingDuration,
        ease: 'Power2',
        onComplete: () => shockwave.destroy(),
      });
    });

    // 애니메이션 완료 후 스프라이트 페이드아웃 및 제거
    meteorSprite.once('animationcomplete', () => {
      this.scene!.tweens.add({
        targets: meteorSprite,
        alpha: 0,
        duration: 300,
        onComplete: () => {
          meteorSprite.destroy();
        },
      });
    });
  }
}
