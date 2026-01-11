# Debug Game

게임 디버깅 및 테스트를 위한 도구입니다.

## Usage
```
/debug-game [명령]
```

## Commands
- **spawn**: 특정 몬스터 즉시 스폰
- **time**: 게임 시간 조작
- **skill**: 스킬 즉시 획득

## 디버그 코드 추가 위치

### GameScene.ts - 키보드 디버그
```typescript
// create()에서 디버그 키 설정
if (import.meta.env.DEV) {
  this.input.keyboard?.on('keydown-F1', () => {
    // 무적 모드 토글
    const player = this.world.getEntitiesWithTag('player')[0];
    const health = player?.getComponent(HealthComponent);
    if (health) health.invincible = !health.invincible;
  });

  this.input.keyboard?.on('keydown-F2', () => {
    // 경험치 대량 획득
    const player = this.world.getEntitiesWithTag('player')[0];
    const playerComp = player?.getComponent(PlayerComponent);
    if (playerComp) playerComp.gainExperience(1000);
  });

  this.input.keyboard?.on('keydown-F3', () => {
    // 시간 빨리감기 (5분)
    const spawnSystem = this.world.getSystem(EnemySpawnSystem);
    if (spawnSystem) spawnSystem.gameTime += 300;
  });
}
```

## 테스트 시나리오

### 스킬 테스트
1. F2로 경험치 획득하여 레벨업
2. 원하는 스킬 선택
3. 스킬 동작 확인

### 웨이브 테스트
1. F3으로 시간 빨리감기
2. 해당 시간대 몬스터 스폰 확인
3. 난이도 체감 테스트

### 보스 테스트
1. F3을 여러번 눌러 5분(300초) 도달
2. Ogre 보스 스폰 확인
3. 보스전 밸런스 테스트
