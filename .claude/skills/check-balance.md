# Check Balance

게임 밸런스를 분석하고 리포트를 생성합니다.

## Usage
```
/check-balance [항목]
```

## Parameters
- **항목**: skills, monsters, waves, all (기본값: all)

## Workflow

1. 관련 파일 분석
   - skills: WeaponData.ts
   - monsters: EnemySpawnSystem.ts
   - waves: EnemySpawnSystem.ts

2. 밸런스 리포트 생성
   - DPS 계산 (데미지 / 쿨다운)
   - 효율성 분석
   - 이상치 탐지

## 분석 항목

### 스킬 밸런스
```
DPS = damage * projectileCount / cooldown
효율 = DPS * pierce * area
```

| 스킬 | DPS | 효율 | 평가 |
|------|-----|------|------|
| Fireball | 12.5 | 16.25 | 적정 |
| IceBolt | 1.5 | CC | CC기 |
| Meteor | 8 | 높음 | 궁극기 |
| WaterShield | - | 방어 | 유틸 |

### 몬스터 밸런스
```
위협도 = damage * speed / 100
생존력 = health / 10
밸런스 = 위협도 + 생존력
```

| 몬스터 | 위협도 | 생존력 | 밸런스 |
|--------|--------|--------|--------|
| Slime | 2.0 | 1.5 | 3.5 |
| Goblin | 5.6 | 2.0 | 7.6 |
| Kobold | 5.4 | 1.8 | 7.2 |
| Lizardman | 6.6 | 4.5 | 11.1 |
| Orc | 6.3 | 8.0 | 14.3 |
| Ogre | 8.75 | 40.0 | 48.75 |

## 권장 밸런스 범위

### 스킬
- 일반 스킬 DPS: 8-15
- 궁극기 DPS: 6-10 (높은 범위/관통)
- CC기: 낮은 DPS, 높은 유틸

### 몬스터
- 잡몹 밸런스: 3-8
- 일반 밸런스: 8-15
- 강적 밸런스: 12-20
- 보스 밸런스: 40-60
