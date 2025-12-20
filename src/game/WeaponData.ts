import { WeaponType, ElementType, type WeaponStats } from '../components/WeaponComponent';

export interface WeaponDefinition {
  type: WeaponType;
  name: string;
  description: string;
  baseStats: WeaponStats;
  color: number;
  maxLevel: number;
  element: ElementType;
  textureKey: string;
}

export interface UpgradeOption {
  id: string;
  type: 'weapon' | 'passive';
  weaponType?: WeaponType;
  name: string;
  description: string;
  level: number;
  color: number;
  icon: string;
}

export const WEAPON_DEFINITIONS: Record<WeaponType, WeaponDefinition> = {
  // ===== 기본 마법 =====
  [WeaponType.MagicMissile]: {
    type: WeaponType.MagicMissile,
    name: 'Magic Missile',
    description: '기본 마법 미사일. 가장 가까운 적을 추적',
    baseStats: {
      damage: 8,
      cooldown: 0.8,
      projectileSpeed: 350,
      projectileCount: 1,
      area: 1,
      duration: 2,
      pierce: 1,
    },
    color: 0x00ffff,
    maxLevel: 8,
    element: ElementType.None,
    textureKey: 'proj_magic',
  },

  // ===== 불 속성 =====
  [WeaponType.Fireball]: {
    type: WeaponType.Fireball,
    name: 'Fireball',
    description: '불덩이를 발사. 적에게 맞으면 폭발',
    baseStats: {
      damage: 15,
      cooldown: 1.2,
      projectileSpeed: 300,
      projectileCount: 1,
      area: 1.3,
      duration: 2.5,
      pierce: 1,
    },
    color: 0xff4500,
    maxLevel: 8,
    element: ElementType.Fire,
    textureKey: 'proj_fire',
  },
  [WeaponType.FireWall]: {
    type: WeaponType.FireWall,
    name: 'Fire Wall',
    description: '전방에 불의 벽 생성. 지속 데미지',
    baseStats: {
      damage: 6,
      cooldown: 3.0,
      projectileSpeed: 0,
      projectileCount: 1,
      area: 2.0,
      duration: 4,
      pierce: 999,
    },
    color: 0xff6600,
    maxLevel: 8,
    element: ElementType.Fire,
    textureKey: 'proj_firewall',
  },
  [WeaponType.Meteor]: {
    type: WeaponType.Meteor,
    name: 'Meteor',
    description: '하늘에서 운석 소환. 광역 폭발',
    baseStats: {
      damage: 40,
      cooldown: 5.0,
      projectileSpeed: 400,
      projectileCount: 1,
      area: 2.5,
      duration: 1.5,
      pierce: 999,
    },
    color: 0xff2200,
    maxLevel: 8,
    element: ElementType.Fire,
    textureKey: 'proj_meteor',
  },

  // ===== 물 속성 =====
  [WeaponType.IceBolt]: {
    type: WeaponType.IceBolt,
    name: 'Ice Bolt',
    description: '주변에 얼음 생성. 적을 얼림',
    baseStats: {
      damage: 3,
      cooldown: 2.0,
      projectileSpeed: 0,
      projectileCount: 1,
      area: 1.2,
      duration: 1.5,
      pierce: 999,
    },
    color: 0x1e90ff,
    maxLevel: 8,
    element: ElementType.Water,
    textureKey: 'proj_ice',
  },
  [WeaponType.WaterShield]: {
    type: WeaponType.WaterShield,
    name: 'Water Shield',
    description: '주변에 물의 방패 생성. 접근하는 적 데미지',
    baseStats: {
      damage: 4,
      cooldown: 0.5,
      projectileSpeed: 0,
      projectileCount: 1,
      area: 1.8,
      duration: 0.1,
      pierce: 999,
    },
    color: 0x4169e1,
    maxLevel: 8,
    element: ElementType.Water,
    textureKey: 'proj_watershield',
  },
  [WeaponType.Blizzard]: {
    type: WeaponType.Blizzard,
    name: 'Blizzard',
    description: '넓은 범위에 눈보라 소환. 슬로우 효과',
    baseStats: {
      damage: 8,
      cooldown: 4.0,
      projectileSpeed: 0,
      projectileCount: 8,
      area: 3.0,
      duration: 5,
      pierce: 999,
    },
    color: 0xadd8e6,
    maxLevel: 8,
    element: ElementType.Water,
    textureKey: 'proj_blizzard',
  },

  // ===== 바람 속성 =====
  [WeaponType.WindBlade]: {
    type: WeaponType.WindBlade,
    name: 'Wind Blade',
    description: '빠른 바람 칼날 발사. 고속, 다연발',
    baseStats: {
      damage: 6,
      cooldown: 0.4,
      projectileSpeed: 600,
      projectileCount: 2,
      area: 0.7,
      duration: 1,
      pierce: 2,
    },
    color: 0x32cd32,
    maxLevel: 8,
    element: ElementType.Wind,
    textureKey: 'proj_wind',
  },
  [WeaponType.Tornado]: {
    type: WeaponType.Tornado,
    name: 'Tornado',
    description: '토네이도 소환. 적을 끌어당기며 데미지',
    baseStats: {
      damage: 5,
      cooldown: 4.0,
      projectileSpeed: 100,
      projectileCount: 1,
      area: 2.0,
      duration: 5,
      pierce: 999,
    },
    color: 0x228b22,
    maxLevel: 8,
    element: ElementType.Wind,
    textureKey: 'proj_tornado',
  },
  [WeaponType.AirSlash]: {
    type: WeaponType.AirSlash,
    name: 'Air Slash',
    description: '360도 바람 칼날 발사',
    baseStats: {
      damage: 12,
      cooldown: 2.0,
      projectileSpeed: 350,
      projectileCount: 8,
      area: 1.0,
      duration: 1.5,
      pierce: 3,
    },
    color: 0x90ee90,
    maxLevel: 8,
    element: ElementType.Wind,
    textureKey: 'proj_airslash',
  },

  // ===== 땅 속성 =====
  [WeaponType.RockSpike]: {
    type: WeaponType.RockSpike,
    name: 'Rock Spike',
    description: '땅에서 바위 돌출. 느리지만 강력',
    baseStats: {
      damage: 20,
      cooldown: 1.5,
      projectileSpeed: 0,
      projectileCount: 1,
      area: 1.5,
      duration: 0.5,
      pierce: 999,
    },
    color: 0x8b4513,
    maxLevel: 8,
    element: ElementType.Earth,
    textureKey: 'proj_rock',
  },
  [WeaponType.Earthquake]: {
    type: WeaponType.Earthquake,
    name: 'Earthquake',
    description: '지진을 일으켜 광역 데미지',
    baseStats: {
      damage: 15,
      cooldown: 5.0,
      projectileSpeed: 0,
      projectileCount: 1,
      area: 4.0,
      duration: 1,
      pierce: 999,
    },
    color: 0xa0522d,
    maxLevel: 8,
    element: ElementType.Earth,
    textureKey: 'proj_earthquake',
  },
  [WeaponType.SummonGolem]: {
    type: WeaponType.SummonGolem,
    name: 'Summon Golem',
    description: '골렘 소환. 어그로를 끌고 적을 공격',
    baseStats: {
      damage: 25,
      cooldown: 15.0,
      projectileSpeed: 60,
      projectileCount: 1,
      area: 2.0,
      duration: 8,
      pierce: 999,
    },
    color: 0x696969,
    maxLevel: 8,
    element: ElementType.Earth,
    textureKey: 'proj_golem',
  },

  // ===== 전기 속성 =====
  [WeaponType.LightningBolt]: {
    type: WeaponType.LightningBolt,
    name: 'Lightning Bolt',
    description: '번개 발사. 즉발, 높은 데미지',
    baseStats: {
      damage: 18,
      cooldown: 1.0,
      projectileSpeed: 1000,
      projectileCount: 1,
      area: 0.8,
      duration: 0.3,
      pierce: 2,
    },
    color: 0xffff00,
    maxLevel: 8,
    element: ElementType.Lightning,
    textureKey: 'proj_lightning',
  },
  [WeaponType.ChainLightning]: {
    type: WeaponType.ChainLightning,
    name: 'Chain Lightning',
    description: '번개가 적들 사이를 연쇄 점프',
    baseStats: {
      damage: 12,
      cooldown: 1.5,
      projectileSpeed: 800,
      projectileCount: 1,
      area: 1.0,
      duration: 0.5,
      pierce: 5,
    },
    color: 0xffd700,
    maxLevel: 8,
    element: ElementType.Lightning,
    textureKey: 'proj_chain',
  },
  [WeaponType.ThunderStorm]: {
    type: WeaponType.ThunderStorm,
    name: 'Thunder Storm',
    description: '천둥 폭풍. 랜덤 위치에 번개 낙뢰',
    baseStats: {
      damage: 22,
      cooldown: 3.0,
      projectileSpeed: 0,
      projectileCount: 5,
      area: 1.2,
      duration: 3,
      pierce: 999,
    },
    color: 0xf0e68c,
    maxLevel: 8,
    element: ElementType.Lightning,
    textureKey: 'proj_thunder',
  },
};

export interface PassiveUpgrade {
  id: string;
  name: string;
  description: string;
  maxLevel: number;
  color: number;
  effect: (level: number) => {
    moveSpeed?: number;
    maxHealth?: number;
    armor?: number;
    luck?: number;
    pickupRadius?: number;
    cooldownReduction?: number;
    damageBonus?: number;
    areaBonus?: number;
  };
}

export const PASSIVE_UPGRADES: PassiveUpgrade[] = [
  {
    id: 'mana_flow',
    name: 'Mana Flow',
    description: '-8% 쿨다운 감소',
    maxLevel: 5,
    color: 0x9932cc,
    effect: (level) => ({ cooldownReduction: level * 0.08 }),
  },
  {
    id: 'arcane_power',
    name: 'Arcane Power',
    description: '+12% 마법 데미지',
    maxLevel: 5,
    color: 0x8a2be2,
    effect: (level) => ({ damageBonus: level * 0.12 }),
  },
  {
    id: 'spell_amplify',
    name: 'Spell Amplify',
    description: '+15% 마법 범위',
    maxLevel: 5,
    color: 0x4169e1,
    effect: (level) => ({ areaBonus: level * 0.15 }),
  },
  {
    id: 'enchanted_boots',
    name: 'Enchanted Boots',
    description: '+10% 이동 속도',
    maxLevel: 5,
    color: 0x87ceeb,
    effect: (level) => ({ moveSpeed: level * 0.1 }),
  },
  {
    id: 'vitality',
    name: 'Vitality',
    description: '+25 최대 체력',
    maxLevel: 5,
    color: 0xff6b6b,
    effect: (level) => ({ maxHealth: level * 25 }),
  },
  {
    id: 'magic_barrier',
    name: 'Magic Barrier',
    description: '+1 방어력 (데미지 감소)',
    maxLevel: 5,
    color: 0x808080,
    effect: (level) => ({ armor: level }),
  },
  {
    id: 'fortune',
    name: 'Fortune',
    description: '+10% 행운',
    maxLevel: 5,
    color: 0x32cd32,
    effect: (level) => ({ luck: level * 0.1 }),
  },
  {
    id: 'mana_magnet',
    name: 'Mana Magnet',
    description: '+30% 아이템 흡수 범위',
    maxLevel: 5,
    color: 0xff00ff,
    effect: (level) => ({ pickupRadius: level * 0.3 }),
  },
];

export function generateUpgradeOptions(
  currentWeapons: Map<WeaponType, number>,
  currentPassives: Map<string, number>,
  count: number = 3
): UpgradeOption[] {
  const options: UpgradeOption[] = [];

  // 현재 구현된 스킬만 업그레이드 옵션에 추가
  const implementedWeapons = [
    WeaponType.Fireball,
    WeaponType.IceBolt,
    WeaponType.Meteor,
  ];

  // Add weapon options (new weapons or upgrades)
  for (const weaponType of implementedWeapons) {
    const currentLevel = currentWeapons.get(weaponType) || 0;
    const def = WEAPON_DEFINITIONS[weaponType];

    if (currentLevel < def.maxLevel) {
      options.push({
        id: `weapon_${weaponType}`,
        type: 'weapon',
        weaponType,
        name: def.name,
        description:
          currentLevel === 0 ? def.description : `Level ${currentLevel + 1}: +20% 데미지, +1 투사체`,
        level: currentLevel + 1,
        color: def.color,
        icon: currentLevel === 0 ? 'NEW' : `Lv${currentLevel + 1}`,
      });
    }
  }

  // Add passive options
  for (const passive of PASSIVE_UPGRADES) {
    const currentLevel = currentPassives.get(passive.id) || 0;

    if (currentLevel < passive.maxLevel) {
      options.push({
        id: passive.id,
        type: 'passive',
        name: passive.name,
        description: passive.description,
        level: currentLevel + 1,
        color: passive.color,
        icon: currentLevel === 0 ? 'NEW' : `Lv${currentLevel + 1}`,
      });
    }
  }

  // Shuffle and pick random options
  const shuffled = options.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
