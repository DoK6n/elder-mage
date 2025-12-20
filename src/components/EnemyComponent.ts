import { Component } from '../ecs/Component';

export enum EnemyType {
  Slime = 'slime',
  Goblin = 'goblin',
  Kobold = 'kobold',
  Lizardman = 'lizardman',
  Orc = 'orc',
  Ogre = 'ogre',
}

export class EnemyComponent extends Component {
  public targetEntityId: number | null = null;

  constructor(
    public type: EnemyType = EnemyType.Basic,
    public damage = 10,
    public experienceValue = 1,
    public moveSpeed = 50,
    public attackCooldown = 1,
    public currentAttackCooldown = 0
  ) {
    super();
  }

  canAttack(): boolean {
    return this.currentAttackCooldown <= 0;
  }

  attack(): void {
    this.currentAttackCooldown = this.attackCooldown;
  }

  updateCooldown(dt: number): void {
    if (this.currentAttackCooldown > 0) {
      this.currentAttackCooldown -= dt;
    }
  }
}
