import { Component } from '../ecs/Component';

export class PlayerComponent extends Component {
  public level = 1;
  public experience = 0;
  public experienceToNextLevel = 10;
  public kills = 0;
  public pickupRadius = 50;
  public luck = 1;
  public armor = 0;

  // 실드 관련 속성
  public shieldAmount = 0; // 현재 실드량
  public maxShield = 0; // 최대 실드량 (활성화 시 설정)
  public shieldDuration = 0; // 남은 지속시간
  public shieldActive = false; // 실드 활성화 여부

  constructor(public moveSpeed = 150) {
    super();
  }

  // 실드 활성화
  activateShield(amount: number, duration: number): void {
    this.shieldAmount = amount;
    this.maxShield = amount;
    this.shieldDuration = duration;
    this.shieldActive = true;
  }

  // 실드 데미지 처리 (흡수한 데미지량 반환, 남은 데미지는 플레이어가 받음)
  absorbDamage(damage: number): number {
    if (!this.shieldActive || this.shieldAmount <= 0) {
      return damage; // 실드 없으면 전체 데미지 통과
    }

    if (this.shieldAmount >= damage) {
      // 실드가 모든 데미지 흡수
      this.shieldAmount -= damage;
      return 0;
    } else {
      // 실드 파괴, 남은 데미지 반환
      const remainingDamage = damage - this.shieldAmount;
      this.shieldAmount = 0;
      this.shieldActive = false;
      return remainingDamage;
    }
  }

  // 실드 업데이트 (매 프레임 호출)
  updateShield(dt: number): void {
    if (this.shieldActive) {
      this.shieldDuration -= dt;
      if (this.shieldDuration <= 0) {
        this.shieldAmount = 0;
        this.shieldActive = false;
      }
    }
  }

  // 실드 상태 확인
  getShieldPercent(): number {
    if (this.maxShield <= 0) return 0;
    return this.shieldAmount / this.maxShield;
  }

  addExperience(amount: number): boolean {
    this.experience += amount;
    if (this.experience >= this.experienceToNextLevel) {
      this.levelUp();
      return true;
    }
    return false;
  }

  private levelUp(): void {
    this.level++;
    this.experience -= this.experienceToNextLevel;
    this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.5);
  }

  getExperiencePercent(): number {
    return this.experience / this.experienceToNextLevel;
  }

  addKill(): void {
    this.kills++;
  }
}
