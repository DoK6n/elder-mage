# Add Monster

새로운 몬스터를 게임에 추가합니다.

## Usage
```
/add-monster [몬스터이름] [체력] [데미지] [속도]
```

## Parameters
- **몬스터이름**: 영문 몬스터 이름 (예: Skeleton)
- **체력**: 기본 체력 (15-400)
- **데미지**: 기본 데미지 (5-35)
- **속도**: 이동 속도 (25-90)

## Workflow

1. **EnemyComponent.ts** 수정
   - `EnemyType` enum에 새 몬스터 추가

2. **EnemySpawnSystem.ts** 수정
   - `getEnemyConfig()` switch문에 설정 추가
   - `waves` 배열에 스폰 웨이브 추가

3. **BootScene.ts** 수정
   - 스프라이트시트 로딩 추가
   - 애니메이션 생성

## Example
```
/add-monster Skeleton 25 10 60
```

## 몬스터 설정 템플릿

### EnemyComponent.ts
```typescript
export enum EnemyType {
  // 기존...
  Skeleton = 'skeleton',
}
```

### EnemySpawnSystem.ts - getEnemyConfig()
```typescript
case EnemyType.Skeleton:
  return {
    health: 25,
    damage: 10,
    speed: 60,
    experience: 3,
    radius: 15,      // 충돌 반경 (size의 약 절반)
    size: 30,        // 스프라이트 크기
    textureKey: 'enemy_skeleton',
    animKey: 'skeleton-idle',
  };
```

### EnemySpawnSystem.ts - waves
```typescript
{
  time: 90,              // 등장 시간 (초)
  endTime: undefined,    // 종료 시간 (없으면 계속)
  enemyType: EnemyType.Skeleton,
  count: 4,              // 한번에 스폰 수
  spawnRate: 2.0,        // 스폰 주기 (초)
  healthMultiplier: 1,
  damageMultiplier: 1,
},
```

### BootScene.ts
```typescript
// preload()
this.load.spritesheet('enemy_skeleton', 'assets/enemies/skeleton.png', {
  frameWidth: 100,
  frameHeight: 100,
});

// create()
this.anims.create({
  key: 'skeleton-idle',
  frames: this.anims.generateFrameNumbers('enemy_skeleton', { start: 0, end: 3 }),
  frameRate: 6,
  repeat: -1,
});
```

## 밸런스 참고표
| 역할 | 체력 | 데미지 | 속도 | 경험치 | 등장시간 |
|------|------|--------|------|--------|----------|
| 잡몹 | 15-25 | 5-8 | 40-70 | 1-2 | 0-60초 |
| 일반 | 30-50 | 10-15 | 50-60 | 3-4 | 60-180초 |
| 강적 | 60-100 | 15-20 | 30-50 | 5-8 | 180-300초 |
| 보스 | 300-500 | 30-40 | 20-30 | 40-60 | 300초+ |

## 스프라이트 규격
- 크기: 100x100 픽셀 (프레임당)
- 프레임: 4프레임 권장 (idle 애니메이션)
- 파일: `public/assets/enemies/[몬스터명].png`
