import { Component } from '../ecs/Component';

export class PlayerComponent extends Component {
  public level = 1;
  public experience = 0;
  public experienceToNextLevel = 10;
  public kills = 0;
  public pickupRadius = 50;
  public luck = 1;
  public armor = 0;

  constructor(public moveSpeed = 150) {
    super();
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
