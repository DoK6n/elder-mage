import Phaser from 'phaser';
import { gameConfig } from './config';

export class Game extends Phaser.Game {
  constructor() {
    super(gameConfig);
  }
}

export function createGame(): Game {
  return new Game();
}
