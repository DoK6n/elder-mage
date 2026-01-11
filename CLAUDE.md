# Elder Mage - Project Documentation

## Project Overview
뱀파이어 서바이버 스타일의 마법사 액션 로그라이크 게임. Phaser 3 게임 엔진과 TypeScript를 사용하며, Entity-Component-System(ECS) 아키텍처로 설계됨.

## Tech Stack
- **Engine**: Phaser 3
- **Language**: TypeScript
- **Build Tool**: Vite
- **Package Manager**: npm/bun

## Directory Structure
```
src/
├── main.ts                    # 게임 진입점
├── components/                # ECS 컴포넌트
│   ├── PlayerComponent.ts     # 플레이어 속성 (체력, 레벨, 실드 등)
│   ├── EnemyComponent.ts      # 적 속성 및 EnemyType enum
│   ├── WeaponComponent.ts     # 무기 시스템 및 WeaponType enum
│   ├── TransformComponent.ts  # 위치 정보
│   ├── VelocityComponent.ts   # 속도 정보
│   ├── HealthComponent.ts     # 체력 시스템
│   ├── ColliderComponent.ts   # 충돌 처리
│   ├── SpriteComponent.ts     # 스프라이트 렌더링
│   └── ProjectileComponent.ts # 투사체 속성
├── systems/                   # ECS 시스템
│   ├── WeaponSystem.ts        # 스킬 발사 로직 (핵심 파일)
│   ├── EnemySpawnSystem.ts    # 몬스터 스폰 로직 (웨이브 시스템)
│   ├── CollisionSystem.ts     # 충돌 처리 (데미지, 실드 흡수)
│   ├── MovementSystem.ts      # 이동 처리
│   ├── EnemyAISystem.ts       # 적 AI
│   └── ProjectileSystem.ts    # 투사체 업데이트
├── scenes/
│   ├── BootScene.ts           # 리소스 로딩 (스프라이트시트, 애니메이션)
│   ├── GameScene.ts           # 메인 게임 씬 (맵 렌더링, 이펙트)
│   └── UIScene.ts             # UI 렌더링 (스킬 아이콘, HUD)
├── game/
│   ├── WeaponData.ts          # 스킬 정의 (WEAPON_DEFINITIONS)
│   ├── ProceduralMapData.ts   # 절차적 맵 생성 (타일, 연못, 나무)
│   └── MapData.ts             # 맵 설정
├── ecs/                       # ECS 프레임워크
│   ├── Entity.ts
│   ├── Component.ts
│   ├── System.ts
│   └── World.ts
└── entities/
    └── createPlayer.ts        # 플레이어 엔티티 생성
```

## ECS Architecture
게임은 Entity-Component-System 패턴을 사용:
- **Entity**: 고유 ID를 가진 게임 오브젝트
- **Component**: 데이터만 포함 (예: TransformComponent, HealthComponent)
- **System**: 로직 처리 (예: MovementSystem, WeaponSystem)

---

# Development Guides

## 1. 새 스킬 추가하기

### Step 1: WeaponType enum에 추가
`src/components/WeaponComponent.ts`:
```typescript
export enum WeaponType {
  // 기존 스킬들...
  NewSkill = 'new_skill',  // 새 스킬 추가
}
```

### Step 2: 속성 매핑 추가
같은 파일 `getElementFromWeapon()` 함수에:
```typescript
case WeaponType.NewSkill:
  return ElementType.Fire;  // 적절한 속성 반환
```

### Step 3: WeaponData에 정의 추가
`src/game/WeaponData.ts`:
```typescript
[WeaponType.NewSkill]: {
  type: WeaponType.NewSkill,
  name: 'New Skill',
  description: '스킬 설명',
  baseStats: {
    damage: 10,
    cooldown: 1.0,
    projectileSpeed: 300,  // 0이면 고정형 스킬
    projectileCount: 1,
    area: 1.0,
    duration: 2,
    pierce: 1,
  },
  color: 0xff0000,
  maxLevel: 8,
  element: ElementType.Fire,
  textureKey: 'proj_new',
},
```

### Step 4: WeaponSystem에 발사 로직 구현
`src/systems/WeaponSystem.ts`의 `fireWeapon()`:
```typescript
case WeaponType.NewSkill:
  this.createNewSkill(owner, transform, weaponSlot);
  return;
```

그리고 메서드 구현:
```typescript
private createNewSkill(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
  // 스킬 로직 구현
}
```

### Step 5: 리소스 로딩
`src/scenes/BootScene.ts`:
```typescript
// 이미지인 경우
this.load.image('proj_new', 'assets/skills/new_skill.png');

// 애니메이션인 경우 (스프라이트시트)
this.load.spritesheet('proj_new', 'assets/skills/new_skill.png', {
  frameWidth: 72,
  frameHeight: 72,
});

// 애니메이션 생성 (create()에서)
this.anims.create({
  key: 'new-skill-anim',
  frames: this.anims.generateFrameNumbers('proj_new', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1,
});
```

### Step 6: UI 아이콘 추가
`src/scenes/UIScene.ts`의 `SKILL_ICON_MAP`:
```typescript
const SKILL_ICON_MAP: Record<WeaponType, string> = {
  // 기존...
  [WeaponType.NewSkill]: 'skill_new',
};
```

### Step 7: 업그레이드 옵션에 추가
`src/game/WeaponData.ts`의 `generateUpgradeOptions()`:
```typescript
const implementedWeapons = [
  WeaponType.Fireball,
  WeaponType.IceBolt,
  WeaponType.Meteor,
  WeaponType.WaterShield,
  WeaponType.NewSkill,  // 새 스킬 추가
];
```

### 스킬 타입별 패턴

**투사체 스킬** (Fireball 참고):
- projectileSpeed > 0
- createProjectileEntity() 사용

**오라/고정 스킬** (IceBolt 참고):
- projectileSpeed = 0
- 플레이어 주변에 생성

**방어 스킬** (WaterShield 참고):
- PlayerComponent의 shield 시스템 사용
- damage 필드를 실드량으로 사용

---

## 2. 새 몬스터 추가하기

### Step 1: EnemyType enum에 추가
`src/components/EnemyComponent.ts`:
```typescript
export enum EnemyType {
  Slime = 'slime',
  // ...
  NewEnemy = 'newenemy',
}
```

### Step 2: EnemySpawnSystem에 설정 추가
`src/systems/EnemySpawnSystem.ts`의 `getEnemyConfig()`:
```typescript
case EnemyType.NewEnemy:
  return {
    health: 30,
    damage: 10,
    speed: 50,
    experience: 3,
    radius: 16,
    size: 32,
    textureKey: 'enemy_newenemy',
    animKey: 'newenemy-idle',
  };
```

### Step 3: 스폰 웨이브 추가
같은 파일의 `waves` 배열에:
```typescript
{
  time: 180,           // 등장 시간 (초)
  endTime: 300,        // 종료 시간 (없으면 계속)
  enemyType: EnemyType.NewEnemy,
  count: 3,            // 한번에 스폰 수
  spawnRate: 2.5,      // 스폰 주기 (초)
  healthMultiplier: 1,
  damageMultiplier: 1,
},
```

### Step 4: 리소스 로딩
`src/scenes/BootScene.ts`:
```typescript
this.load.spritesheet('enemy_newenemy', 'assets/enemies/newenemy.png', {
  frameWidth: 100,
  frameHeight: 100,
});

// create()에서 애니메이션
this.anims.create({
  key: 'newenemy-idle',
  frames: this.anims.generateFrameNumbers('enemy_newenemy', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
```

### 몬스터 밸런스 참고
| 타입 | 체력 | 데미지 | 속도 | 경험치 | 특징 |
|------|------|--------|------|--------|------|
| Slime | 15 | 5 | 40 | 1 | 느리고 약함 |
| Goblin | 20 | 8 | 70 | 2 | 빠름 |
| Kobold | 18 | 6 | 90 | 2 | 매우 빠름 |
| Lizardman | 45 | 12 | 55 | 4 | 밸런스형 |
| Orc | 80 | 18 | 35 | 6 | 강하고 느림 |
| Ogre | 400 | 35 | 25 | 50 | 보스급 |

---

## 3. 맵 수정하기

### 타일 설정
`src/game/ProceduralMapData.ts`:

```typescript
// 타일 가중치 (숫자가 높을수록 자주 등장)
export const TileWeights: Record<number, number> = {
  38: 100,  // 순수 잔디 (현재 100% 사용)
  // 다른 타일 추가 시 가중치 조절
};
```

### 나무 밀도 조절
`generateTrees()` 함수:
```typescript
const density = 0.06;      // 나무 밀도 (높을수록 많음)
const minDistance = 100;   // 나무 간 최소 거리
const edgeBias = 0.4;      // 가장자리 편향 (낮을수록 균일)
```

### 연못 추가/수정
`generatePonds()` 함수로 자연스러운 연못 생성:
- 타원형 + 노이즈로 자연스러운 형태
- 물가 타일 자동 선택 (모서리, 가장자리)

### 맵 크기
`getMapDimensions()`:
```typescript
export function getMapDimensions(mapId: string) {
  return {
    widthInTiles: 100,   // 타일 너비
    heightInTiles: 100,  // 타일 높이
    tileSize: 64,        // 타일 크기 (픽셀)
  };
}
```

---

## Common Patterns

### 스프라이트시트 로딩
```typescript
// 단일 이미지
this.load.image('key', 'path/to/image.png');

// 스프라이트시트 (애니메이션용)
this.load.spritesheet('key', 'path/to/sheet.png', {
  frameWidth: 72,
  frameHeight: 72,
});
```

### 애니메이션 생성
```typescript
this.anims.create({
  key: 'anim-name',
  frames: this.anims.generateFrameNumbers('texture-key', { start: 0, end: 7 }),
  frameRate: 10,
  repeat: -1,  // -1 = 무한 반복
});
```

### 엔티티에 태그 추가
```typescript
const entity = this.world.createEntity();
entity.addTag('enemy');  // 태그로 그룹 식별
```

### 엔티티 검색
```typescript
// 태그로 검색
const enemies = this.world.getEntitiesWithTag('enemy');

// 컴포넌트로 검색
const players = this.world.getEntitiesWithComponents(TransformComponent, PlayerComponent);
```

---

## Assets Location
```
public/assets/
├── skills/          # 스킬 이펙트 이미지
├── enemies/         # 몬스터 스프라이트시트
├── tilesets/        # 맵 타일셋
├── effects/         # 이펙트 스프라이트시트
└── ui/              # UI 요소
```

---

## Build & Run Commands
```bash
# 개발 서버 실행
bun run dev

# 빌드
bun run build

# 린트
bun run lint
```
