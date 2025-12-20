import { Component } from '../ecs/Component';

// 속성 타입
export enum ElementType {
  None = 'none',
  Fire = 'fire',
  Water = 'water',
  Wind = 'wind',
  Earth = 'earth',
  Lightning = 'lightning',
}

export enum WeaponType {
  // 기본 마법
  MagicMissile = 'magic_missile',

  // 불 속성
  Fireball = 'fireball',
  FireWall = 'fire_wall',
  Meteor = 'meteor',

  // 물 속성
  IceBolt = 'ice_bolt',
  WaterShield = 'water_shield',
  Blizzard = 'blizzard',

  // 바람 속성
  WindBlade = 'wind_blade',
  Tornado = 'tornado',
  AirSlash = 'air_slash',

  // 땅 속성
  RockSpike = 'rock_spike',
  Earthquake = 'earthquake',
  SummonGolem = 'summon_golem',

  // 전기 속성
  LightningBolt = 'lightning_bolt',
  ChainLightning = 'chain_lightning',
  ThunderStorm = 'thunder_storm',
}

export interface WeaponStats {
  damage: number;
  cooldown: number;
  projectileSpeed: number;
  projectileCount: number;
  area: number;
  duration: number;
  pierce: number;
}

// 무기 타입에서 속성 타입 가져오기
export function getElementFromWeapon(type: WeaponType): ElementType {
  switch (type) {
    case WeaponType.Fireball:
    case WeaponType.FireWall:
    case WeaponType.Meteor:
      return ElementType.Fire;
    case WeaponType.IceBolt:
    case WeaponType.WaterShield:
    case WeaponType.Blizzard:
      return ElementType.Water;
    case WeaponType.WindBlade:
    case WeaponType.Tornado:
    case WeaponType.AirSlash:
      return ElementType.Wind;
    case WeaponType.RockSpike:
    case WeaponType.Earthquake:
    case WeaponType.SummonGolem:
      return ElementType.Earth;
    case WeaponType.LightningBolt:
    case WeaponType.ChainLightning:
    case WeaponType.ThunderStorm:
      return ElementType.Lightning;
    default:
      return ElementType.None;
  }
}

// 속성별 색상
export function getElementColor(element: ElementType): number {
  switch (element) {
    case ElementType.Fire:
      return 0xff4500; // 주황빨강
    case ElementType.Water:
      return 0x1e90ff; // 파랑
    case ElementType.Wind:
      return 0x32cd32; // 초록
    case ElementType.Earth:
      return 0x8b4513; // 갈색
    case ElementType.Lightning:
      return 0xffff00; // 노랑
    default:
      return 0x00ffff; // 기본 시안
  }
}

export class WeaponComponent extends Component {
  public level = 1;
  public currentCooldown = 0;
  public stats: WeaponStats;
  public element: ElementType;

  constructor(
    public type: WeaponType = WeaponType.MagicMissile,
    stats?: Partial<WeaponStats>
  ) {
    super();
    this.element = getElementFromWeapon(type);
    this.stats = {
      damage: 10,
      cooldown: 1,
      projectileSpeed: 300,
      projectileCount: 1,
      area: 1,
      duration: 2,
      pierce: 1,
      ...stats,
    };
  }

  canFire(): boolean {
    return this.currentCooldown <= 0;
  }

  fire(): void {
    this.currentCooldown = this.stats.cooldown;
  }

  updateCooldown(dt: number): void {
    if (this.currentCooldown > 0) {
      this.currentCooldown -= dt;
    }
  }

  upgrade(): void {
    this.level++;
    this.stats.damage *= 1.2;
    this.stats.cooldown *= 0.95;
    this.stats.area *= 1.1;
  }

  getEffectiveDamage(): number {
    return Math.floor(this.stats.damage);
  }
}
