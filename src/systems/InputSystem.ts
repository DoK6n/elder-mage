import type Phaser from 'phaser';
import { PlayerComponent, TransformComponent, VelocityComponent } from '../components';
import type { ComponentClass } from '../ecs/Component';
import { System } from '../ecs/System';

export class InputSystem extends System {
  public priority = 0;

  protected readonly requiredComponents: ComponentClass[] = [
    TransformComponent,
    VelocityComponent,
    PlayerComponent,
  ];

  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
  private wasd: {
    W: Phaser.Input.Keyboard.Key;
    A: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
  } | null = null;

  setInput(scene: Phaser.Scene): void {
    if (scene.input.keyboard) {
      this.cursors = scene.input.keyboard.createCursorKeys();
      this.wasd = {
        W: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        A: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        S: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        D: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      };
    }
  }

  update(_dt: number): void {
    if (!this.cursors || !this.wasd) return;

    const entities = this.getEntities();

    for (const entity of entities) {
      const velocity = entity.getComponent(VelocityComponent)!;
      const player = entity.getComponent(PlayerComponent)!;

      let dx = 0;
      let dy = 0;

      if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
      if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
      if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
      if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;

      if (dx !== 0 && dy !== 0) {
        const length = Math.sqrt(dx * dx + dy * dy);
        dx /= length;
        dy /= length;
      }

      velocity.vx = dx * player.moveSpeed;
      velocity.vy = dy * player.moveSpeed;
    }
  }
}
