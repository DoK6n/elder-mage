import Phaser from 'phaser';
import { Component } from '../ecs/Component';

export class SpriteComponent extends Component {
  public sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc | null = null;
  public width: number;
  public height: number;

  constructor(
    public textureKey = '',
    width = 32,
    height = 32,
    public tint = 0xffffff,
    public depth = 0
  ) {
    super();
    this.width = width;
    this.height = height;
  }

  setSprite(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.Arc): void {
    this.sprite = sprite;
    if (sprite instanceof Phaser.GameObjects.Sprite) {
      sprite.setTint(this.tint);
    }
    sprite.setDepth(this.depth);
  }

  destroy(): void {
    if (this.sprite) {
      this.sprite.destroy();
      this.sprite = null;
    }
  }
}
