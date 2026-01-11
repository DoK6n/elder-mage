# Add Skill

새로운 스킬을 게임에 추가합니다.

## Usage
```
/add-skill [스킬이름] [속성] [타입]
```

## Parameters
- **스킬이름**: 영문 스킬 이름 (예: FireStorm)
- **속성**: fire, water, wind, earth, lightning, none
- **타입**: projectile(투사체), aura(오라/고정), defense(방어)

## Workflow

1. **WeaponComponent.ts** 수정
   - `WeaponType` enum에 새 스킬 추가
   - `getElementFromWeapon()`에 속성 매핑 추가

2. **WeaponData.ts** 수정
   - `WEAPON_DEFINITIONS`에 스킬 정의 추가
   - `generateUpgradeOptions()`의 `implementedWeapons` 배열에 추가

3. **WeaponSystem.ts** 수정
   - `fireWeapon()` switch문에 case 추가
   - 스킬 생성 메서드 구현

4. **BootScene.ts** 수정
   - 리소스 로딩 추가 (이미지 또는 스프라이트시트)
   - 애니메이션 생성 (필요시)

5. **UIScene.ts** 수정
   - `SKILL_ICON_MAP`에 아이콘 매핑 추가

## Example
```
/add-skill ThunderStrike lightning projectile
```

## 스킬 타입별 템플릿

### Projectile (투사체)
```typescript
private createThunderStrike(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
  const target = this.findNearestEnemy(transform);
  if (!target) return;

  const targetTransform = target.getComponent(TransformComponent)!;
  const angle = Math.atan2(targetTransform.y - transform.y, targetTransform.x - transform.x);

  this.createProjectileEntity(
    transform.x, transform.y,
    Math.cos(angle) * weaponSlot.stats.projectileSpeed,
    Math.sin(angle) * weaponSlot.stats.projectileSpeed,
    weaponSlot, owner, angle
  );
}
```

### Aura (오라/고정)
```typescript
private createNewAura(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
  for (let i = 0; i < weaponSlot.stats.projectileCount; i++) {
    const angle = (i / weaponSlot.stats.projectileCount) * Math.PI * 2;
    const distance = 60 * weaponSlot.stats.area;
    const x = transform.x + Math.cos(angle) * distance;
    const y = transform.y + Math.sin(angle) * distance;

    // 이펙트 생성 로직
  }
}
```

### Defense (방어)
```typescript
private createDefenseSkill(owner: Entity, transform: TransformComponent, weaponSlot: WeaponSlot): void {
  const playerComp = owner.getComponent(PlayerComponent);
  if (!playerComp) return;

  const shieldAmount = weaponSlot.stats.damage * weaponSlot.stats.area;
  const duration = weaponSlot.stats.duration;

  playerComp.activateShield(shieldAmount, duration);
  // 비주얼 이펙트 생성
}
```

## 밸런스 가이드
| 타입 | 데미지 | 쿨다운 | 범위 | 관통 |
|------|--------|--------|------|------|
| 빠른 투사체 | 5-10 | 0.3-0.8 | 0.7-1.0 | 1-2 |
| 강한 투사체 | 15-25 | 1.0-2.0 | 1.0-1.5 | 1-3 |
| 오라/고정 | 3-8 | 1.5-3.0 | 1.5-3.0 | 999 |
| 궁극기 | 30-50 | 4.0-6.0 | 2.0-4.0 | 999 |
| 방어 | 실드량 | 10-15 | 1.0 | 1 |
