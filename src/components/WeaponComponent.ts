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

export interface WeaponSlot {
  type: WeaponType;
  level: number;
  currentCooldown: number;
  stats: WeaponStats;
  element: ElementType;
}

export class WeaponComponent extends Component {
  public weapons: WeaponSlot[] = [];

  constructor(
    public type: WeaponType = WeaponType.MagicMissile,
    stats?: Partial<WeaponStats>
  ) {
    super();
    // 기본 무기 추가
    this.addWeapon(type, stats);
  }

  addWeapon(type: WeaponType, stats?: Partial<WeaponStats>): void {
    const element = getElementFromWeapon(type);
    const weaponStats: WeaponStats = {
      damage: 10,
      cooldown: 1,
      projectileSpeed: 300,
      projectileCount: 1,
      area: 1,
      duration: 2,
      pierce: 1,
      ...stats,
    };

    this.weapons.push({
      type,
      level: 1,
      currentCooldown: 0,
      stats: weaponStats,
      element,
    });
  }

  canFire(weaponIndex: number): boolean {
    return weaponIndex < this.weapons.length && this.weapons[weaponIndex].currentCooldown <= 0;
  }

  fire(weaponIndex: number): void {
    if (weaponIndex < this.weapons.length) {
      this.weapons[weaponIndex].currentCooldown = this.weapons[weaponIndex].stats.cooldown;
    }
  }

  updateCooldown(dt: number): void {
    for (const weapon of this.weapons) {
      if (weapon.currentCooldown > 0) {
        weapon.currentCooldown -= dt;
      }
    }
  }

  upgrade(weaponIndex: number): void {
    if (weaponIndex < this.weapons.length) {
      const weapon = this.weapons[weaponIndex];
      weapon.level++;

      // 메테오는 밸런스 조정: 크기 5%만 증가, 투사체 증가 없음
      if (weapon.type === WeaponType.Meteor) {
        weapon.stats.damage *= 1.2;
        weapon.stats.cooldown *= 0.95;
        weapon.stats.area *= 1.05;
        // 투사체는 항상 1개 유지
      } else if (weapon.type === WeaponType.WaterShield) {
        // 방어형 실드: 실드량 50% 증가, 쿨다운 8% 감소, 지속시간 10% 증가
        weapon.stats.damage *= 1.5; // 실드량 (damage로 저장)
        weapon.stats.cooldown *= 0.92;
        weapon.stats.duration *= 1.1;
      } else {
        weapon.stats.damage *= 1.2;
        weapon.stats.cooldown *= 0.95;
        // 다른 스킬들은 10% 증가
        weapon.stats.area *= 1.1;

        // 2레벨마다 투사체 +1
        if (weapon.level % 2 === 0) {
          weapon.stats.projectileCount += 1;
        }
      }
    }
  }

  getEffectiveDamage(weaponIndex: number): number {
    if (weaponIndex < this.weapons.length) {
      return Math.floor(this.weapons[weaponIndex].stats.damage);
    }
    return 0;
  }
}
