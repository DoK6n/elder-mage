import Phaser from 'phaser';
import { generateUpgradeOptions, type UpgradeOption } from '../game/WeaponData';
import { WeaponType } from '../components/WeaponComponent';
import type { GameScene } from './GameScene';

export class UIScene extends Phaser.Scene {
  private gameScene!: GameScene;

  private healthBar!: Phaser.GameObjects.Graphics;
  private healthText!: Phaser.GameObjects.Text;
  private expBar!: Phaser.GameObjects.Graphics;
  private levelText!: Phaser.GameObjects.Text;
  private killsText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private enemyCountText!: Phaser.GameObjects.Text;

  private gameOverContainer!: Phaser.GameObjects.Container;
  private levelUpContainer!: Phaser.GameObjects.Container;
  private isLevelUpShowing = false;
  private lastPlayerLevel = 1;

  private playerWeapons: Map<WeaponType, number> = new Map();
  private playerPassives: Map<string, number> = new Map();

  // 키보드 네비게이션을 위한 상태
  private selectedCardIndex = 0;
  private upgradeCards: Phaser.GameObjects.Container[] = [];
  private currentUpgradeOptions: UpgradeOption[] = [];

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
    this.playerWeapons = new Map();
    this.playerPassives = new Map();
    this.playerWeapons.set(WeaponType.MagicMissile, 1);
    this.lastPlayerLevel = 1;
    this.isLevelUpShowing = false;
  }

  create(): void {
    this.createHealthBar();
    this.createExpBar();
    this.createStatsDisplay();
    this.createGameOverScreen();
    this.createLevelUpScreen();

    this.events.on('gameOver', this.showGameOver, this);
    this.events.on('levelUp', this.showLevelUp, this);

    // 키보드 네비게이션 설정
    this.input.keyboard?.on('keydown-LEFT', this.handleLeftKey, this);
    this.input.keyboard?.on('keydown-RIGHT', this.handleRightKey, this);
    this.input.keyboard?.on('keydown-ENTER', this.handleConfirmKey, this);
    this.input.keyboard?.on('keydown-SPACE', this.handleConfirmKey, this);
  }

  private handleLeftKey(): void {
    if (!this.isLevelUpShowing || this.upgradeCards.length === 0) return;
    this.selectedCardIndex = (this.selectedCardIndex - 1 + this.upgradeCards.length) % this.upgradeCards.length;
    this.updateCardSelection();
  }

  private handleRightKey(): void {
    if (!this.isLevelUpShowing || this.upgradeCards.length === 0) return;
    this.selectedCardIndex = (this.selectedCardIndex + 1) % this.upgradeCards.length;
    this.updateCardSelection();
  }

  private handleConfirmKey(): void {
    if (!this.isLevelUpShowing || this.currentUpgradeOptions.length === 0) return;
    const selectedOption = this.currentUpgradeOptions[this.selectedCardIndex];
    if (selectedOption) {
      this.selectUpgrade(selectedOption);
    }
  }

  private updateCardSelection(): void {
    this.upgradeCards.forEach((card, index) => {
      const bg = card.getAt(0) as Phaser.GameObjects.Rectangle;
      const hoverBg = card.getAt(1) as Phaser.GameObjects.Rectangle;
      const option = this.currentUpgradeOptions[index];

      if (index === this.selectedCardIndex) {
        // 선택된 카드 하이라이트
        hoverBg.setVisible(true);
        bg.setStrokeStyle(4, 0xffffff);
        this.tweens.add({
          targets: card,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 100,
        });
      } else {
        // 비선택 카드 원래 상태로
        hoverBg.setVisible(false);
        bg.setStrokeStyle(3, option?.color ?? 0xffffff);
        this.tweens.add({
          targets: card,
          scaleX: 1,
          scaleY: 1,
          duration: 100,
        });
      }
    });
  }

  private createHealthBar(): void {
    const barX = 20;
    const barY = 20;

    this.add.rectangle(barX + 100, barY + 10, 200, 20, 0x333333).setOrigin(0.5, 0.5);
    this.healthBar = this.add.graphics();
    this.healthText = this.add
      .text(barX + 100, barY + 10, '100 / 100', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(barX, barY + 10, 'HP', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ff4444',
      })
      .setOrigin(1, 0.5);
  }

  private createExpBar(): void {
    const barX = 20;
    const barY = 50;

    this.add.rectangle(barX + 100, barY + 10, 200, 14, 0x333333).setOrigin(0.5, 0.5);
    this.expBar = this.add.graphics();
    this.levelText = this.add
      .text(barX + 100, barY + 10, 'Lv 1', {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(barX, barY + 10, 'EXP', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#44ff44',
      })
      .setOrigin(1, 0.5);
  }

  private createStatsDisplay(): void {
    const rightX = this.cameras.main.width - 20;

    this.timeText = this.add
      .text(rightX, 20, '00:00', {
        fontFamily: 'Arial',
        fontSize: '24px',
        color: '#ffffff',
      })
      .setOrigin(1, 0);

    this.killsText = this.add
      .text(rightX, 50, 'Kills: 0', {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffaa00',
      })
      .setOrigin(1, 0);

    this.enemyCountText = this.add
      .text(rightX, 75, 'Enemies: 0', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#ff6666',
      })
      .setOrigin(1, 0);
  }

  private createGameOverScreen(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.gameOverContainer = this.add.container(centerX, centerY);
    this.gameOverContainer.setVisible(false);

    const background = this.add.rectangle(0, 0, 400, 300, 0x000000, 0.8);
    background.setStrokeStyle(2, 0xff4444);

    const gameOverText = this.add
      .text(0, -80, 'GAME OVER', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ff4444',
      })
      .setOrigin(0.5, 0.5);

    const statsText = this.add
      .text(0, 0, '', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
        align: 'center',
      })
      .setOrigin(0.5, 0.5);
    statsText.setName('statsText');

    const restartButton = this.add.rectangle(0, 80, 150, 40, 0x4488ff);
    restartButton.setInteractive({ useHandCursor: true });
    restartButton.on('pointerover', () => restartButton.setFillStyle(0x66aaff));
    restartButton.on('pointerout', () => restartButton.setFillStyle(0x4488ff));
    restartButton.on('pointerdown', () => this.restartGame());

    const restartText = this.add
      .text(0, 80, 'RESTART', {
        fontFamily: 'Arial',
        fontSize: '18px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    this.gameOverContainer.add([background, gameOverText, statsText, restartButton, restartText]);
  }

  private createLevelUpScreen(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    this.levelUpContainer = this.add.container(centerX, centerY);
    this.levelUpContainer.setVisible(false);
    this.levelUpContainer.setDepth(100);

    // Dark overlay
    const overlay = this.add.rectangle(0, 0, this.cameras.main.width, this.cameras.main.height, 0x000000, 0.7);

    // Title
    const title = this.add
      .text(0, -280, 'LEVEL UP!', {
        fontFamily: 'Arial',
        fontSize: '48px',
        color: '#ffdd00',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0.5);

    const subtitle = this.add
      .text(0, -230, 'Choose an upgrade', {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
      })
      .setOrigin(0.5, 0.5);

    this.levelUpContainer.add([overlay, title, subtitle]);
  }

  private showLevelUp(): void {
    if (this.isLevelUpShowing) return;

    this.isLevelUpShowing = true;
    this.gameScene.pauseGame();

    // Clear previous cards
    this.levelUpContainer.each((child: Phaser.GameObjects.GameObject) => {
      if (child.name === 'upgrade_card') {
        child.destroy();
      }
    });

    // 키보드 네비게이션 상태 초기화
    this.upgradeCards = [];
    this.selectedCardIndex = 0;

    // Generate upgrade options
    const options = generateUpgradeOptions(this.playerWeapons, this.playerPassives, 3);
    this.currentUpgradeOptions = options;

    // Create cards
    const cardWidth = 200;
    const cardHeight = 280;
    const cardSpacing = 30;
    const totalWidth = options.length * cardWidth + (options.length - 1) * cardSpacing;
    const startX = -totalWidth / 2 + cardWidth / 2;

    options.forEach((option, index) => {
      const cardX = startX + index * (cardWidth + cardSpacing);
      const card = this.createUpgradeCard(cardX, 20, cardWidth, cardHeight, option);
      card.setName('upgrade_card');
      this.upgradeCards.push(card);
      this.levelUpContainer.add(card);
    });

    this.levelUpContainer.setVisible(true);

    // 첫 번째 카드 선택 상태로 표시
    this.updateCardSelection();

    // Flash effect
    this.cameras.main.flash(200, 255, 255, 100);
  }

  private createUpgradeCard(
    x: number,
    y: number,
    width: number,
    height: number,
    option: UpgradeOption
  ): Phaser.GameObjects.Container {
    const card = this.add.container(x, y);

    // Card background
    const bg = this.add.rectangle(0, 0, width, height, 0x1a1a2e);
    bg.setStrokeStyle(3, option.color);

    // Hover effect background
    const hoverBg = this.add.rectangle(0, 0, width, height, option.color, 0.2);
    hoverBg.setVisible(false);

    // Icon circle
    const iconBg = this.add.circle(0, -80, 40, option.color, 0.3);
    iconBg.setStrokeStyle(2, option.color);

    // Icon text
    const iconText = this.add
      .text(0, -80, option.icon, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    // Weapon/Passive name
    const nameText = this.add
      .text(0, -20, option.name, {
        fontFamily: 'Arial',
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold',
      })
      .setOrigin(0.5, 0.5);

    // Type badge
    const typeBadge = this.add
      .text(0, 10, option.type === 'weapon' ? 'WEAPON' : 'PASSIVE', {
        fontFamily: 'Arial',
        fontSize: '12px',
        color: option.type === 'weapon' ? '#ff6b6b' : '#6bff6b',
      })
      .setOrigin(0.5, 0.5);

    // Description
    const descText = this.add
      .text(0, 50, option.description, {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#aaaaaa',
        wordWrap: { width: width - 20 },
        align: 'center',
      })
      .setOrigin(0.5, 0);

    // Level indicator
    const levelText = this.add
      .text(0, 110, `Level ${option.level}`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: option.color.toString(16).padStart(6, '0'),
      })
      .setOrigin(0.5, 0.5);
    levelText.setTint(option.color);

    card.add([bg, hoverBg, iconBg, iconText, nameText, typeBadge, descText, levelText]);

    // Make interactive
    bg.setInteractive({ useHandCursor: true });

    bg.on('pointerover', () => {
      hoverBg.setVisible(true);
      bg.setStrokeStyle(4, 0xffffff);
      this.tweens.add({
        targets: card,
        scaleX: 1.05,
        scaleY: 1.05,
        duration: 100,
      });
    });

    bg.on('pointerout', () => {
      hoverBg.setVisible(false);
      bg.setStrokeStyle(3, option.color);
      this.tweens.add({
        targets: card,
        scaleX: 1,
        scaleY: 1,
        duration: 100,
      });
    });

    bg.on('pointerdown', () => {
      this.selectUpgrade(option);
    });

    return card;
  }

  private selectUpgrade(option: UpgradeOption): void {
    // Update tracking
    if (option.type === 'weapon' && option.weaponType) {
      const currentLevel = this.playerWeapons.get(option.weaponType) || 0;
      this.playerWeapons.set(option.weaponType, currentLevel + 1);
    } else if (option.type === 'passive') {
      const currentLevel = this.playerPassives.get(option.id) || 0;
      this.playerPassives.set(option.id, currentLevel + 1);
    }

    // Apply to player
    this.gameScene.applyUpgrade(option);

    // Hide level up screen
    this.levelUpContainer.setVisible(false);
    this.isLevelUpShowing = false;
    this.gameScene.resumeGame();

    // Selection effect
    this.cameras.main.flash(100, 100, 255, 100);
  }

  private showGameOver(): void {
    const stats = this.gameScene.getPlayerStats();
    if (!stats) return;

    const statsTextObj = this.gameOverContainer.getByName('statsText') as Phaser.GameObjects.Text;
    if (statsTextObj) {
      statsTextObj.setText(
        `Time Survived: ${this.formatTime(stats.time)}\n` +
          `Level Reached: ${stats.level}\n` +
          `Enemies Killed: ${stats.kills}`
      );
    }

    this.gameOverContainer.setVisible(true);
  }

  private restartGame(): void {
    this.gameOverContainer.setVisible(false);
    this.gameScene.restartGame();
  }

  update(): void {
    if (this.isLevelUpShowing) return;

    const stats = this.gameScene.getPlayerStats();
    if (!stats) return;

    // Check for level up
    if (stats.level > this.lastPlayerLevel) {
      this.lastPlayerLevel = stats.level;
      this.showLevelUp();
      return;
    }

    this.updateHealthBar(stats.health, stats.maxHealth);
    this.updateExpBar(stats.experience, stats.experienceToNext, stats.level);
    this.updateStats(stats.kills, stats.time);
    this.updateEnemyCount();
  }

  private updateHealthBar(current: number, max: number): void {
    const percent = current / max;
    const barWidth = 196;
    const barHeight = 16;
    const barX = 22;
    const barY = 22;

    this.healthBar.clear();

    let color = 0x44ff44;
    if (percent < 0.3) color = 0xff4444;
    else if (percent < 0.6) color = 0xffaa00;

    this.healthBar.fillStyle(color, 1);
    this.healthBar.fillRect(barX, barY, barWidth * percent, barHeight);

    this.healthText.setText(`${current} / ${max}`);
  }

  private updateExpBar(current: number, max: number, level: number): void {
    const percent = current / max;
    const barWidth = 196;
    const barHeight = 10;
    const barX = 22;
    const barY = 55;

    this.expBar.clear();
    this.expBar.fillStyle(0x44aaff, 1);
    this.expBar.fillRect(barX, barY, barWidth * percent, barHeight);

    this.levelText.setText(`Lv ${level}`);
  }

  private updateStats(kills: number, time: number): void {
    this.timeText.setText(this.formatTime(time));
    this.killsText.setText(`Kills: ${kills}`);
  }

  private updateEnemyCount(): void {
    const count = this.gameScene.getEnemyCount();
    this.enemyCountText.setText(`Enemies: ${count}`);
  }

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
}
