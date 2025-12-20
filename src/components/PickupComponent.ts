import { Component } from '../ecs/Component';

export enum PickupType {
  Experience = 'experience',
  Health = 'health',
  Magnet = 'magnet',
  Chest = 'chest',
  Coin = 'coin',
}

export class PickupComponent extends Component {
  public isBeingAttracted = false;
  public attractSpeed = 400;

  constructor(
    public type: PickupType = PickupType.Experience,
    public value = 1
  ) {
    super();
  }

  startAttraction(): void {
    this.isBeingAttracted = true;
  }
}
