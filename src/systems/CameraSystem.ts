import type Phaser from 'phaser';
import { PlayerComponent, TransformComponent } from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class CameraSystem extends System {
  public priority = 50;
  private camera: Phaser.Cameras.Scene2D.Camera | null = null;

  protected readonly requiredComponents: ComponentClass[] = [TransformComponent, PlayerComponent];

  setCamera(camera: Phaser.Cameras.Scene2D.Camera): void {
    this.camera = camera;
  }

  update(_dt: number): void {
    if (!this.camera) return;

    const players = this.getEntities();
    if (players.length === 0) return;

    const player = players[0];
    const transform = player.getComponent(TransformComponent)!;

    this.camera.centerOn(transform.x, transform.y);
  }
}
