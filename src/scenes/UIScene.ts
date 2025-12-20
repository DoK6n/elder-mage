import Phaser from 'phaser';
import { generateUpgradeOptions, WEAPON_DEFINITIONS, type UpgradeOption } from '../game/WeaponData';
import { WeaponType } from '../components/WeaponComponent';
import type { GameScene } from './GameScene';

// 개발자 모드 설정 - 개발 환경에서만 활성화 (프로덕션에서는 절대 표시 안됨)
const isDevelopmentMode = (): boolean => {
  // Vite 개발 환경에서만 활성화 (프로덕션 빌드에서는 항상 false)
  return import.meta.env.DEV;
};

// 스킬별 대표 텍스처 및 프레임 정보
interface SkillIconInfo {
  textureKey: string;
  frame?: number;
  color: number;
}

const SKILL_ICON_MAP: Record<WeaponType, SkillIconInfo> = {
  [WeaponType.MagicMissile]: { textureKey: 'proj_magic', color: 0x00ffff },
  [WeaponType.Fireball]: { textureKey: 'fire-effect', frame: 3, color: 0xff4500 },
  [WeaponType.FireWall]: { textureKey: 'proj_firewall', color: 0xff6600 },
  [WeaponType.Meteor]: { textureKey: 'meteor-effect', frame: 10, color: 0xff2200 },
  [WeaponType.IceBolt]: { textureKey: 'ice-effect', frame: 5, color: 0x1e90ff },
  [WeaponType.WaterShield]: { textureKey: 'proj_watershield', color: 0x4169e1 },
  [WeaponType.Blizzard]: { textureKey: 'proj_blizzard', color: 0xadd8e6 },
  [WeaponType.WindBlade]: { textureKey: 'proj_wind', color: 0x32cd32 },
  [WeaponType.Tornado]: { textureKey: 'proj_tornado', color: 0x228b22 },
  [WeaponType.AirSlash]: { textureKey: 'proj_airslash', color: 0x90ee90 },
  [WeaponType.RockSpike]: { textureKey: 'proj_rock', color: 0x8b4513 },
  [WeaponType.Earthquake]: { textureKey: 'proj_earthquake', color: 0xa0522d },
  [WeaponType.SummonGolem]: { textureKey: 'proj_golem', color: 0x696969 },
  [WeaponType.LightningBolt]: { textureKey: 'proj_lightning', color: 0xffff00 },
  [WeaponType.ChainLightning]: { textureKey: 'proj_chain', color: 0xffd700 },
  [WeaponType.ThunderStorm]: { textureKey: 'proj_thunder', color: 0xf0e68c },
};

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

  // 개발자 모드 관련
  private isDevMode = false;
  private devPanelVisible = false;
  private needsSkillRefresh = false;
  private devToggleButton!: Phaser.GameObjects.Container;
  private devPanel!: Phaser.GameObjects.Container;
  private coordsText!: Phaser.GameObjects.Text;
  private showColliders = false;
  private colliderGraphics!: Phaser.GameObjects.Graphics;
  private selectedSkills: Set<WeaponType> = new Set();
  private skillButtons: Map<WeaponType, Phaser.GameObjects.Container> = new Map();

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { gameScene: GameScene }): void {
    this.gameScene = data.gameScene;
    this.playerWeapons = new Map();
    this.playerPassives = new Map();
    // 플레이어가 시작할 때 가지고 있는 무기: 화염구만
    this.playerWeapons.set(WeaponType.Fireball, 1);
    this.lastPlayerLevel = 1;
    this.isLevelUpShowing = false;

    // 개발자 모드 초기화
    this.isDevMode = isDevelopmentMode();
    this.devPanelVisible = false;
    this.showColliders = false;
    this.selectedSkills = new Set();
    this.skillButtons = new Map();
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

    // 개발자 모드 UI 생성
    if (this.isDevMode) {
      this.createDevModeUI();
    }

    // 시작 무기(Fireball)를 활성 스킬로 설정
    this.selectedSkills.add(WeaponType.Fireball);
    this.gameScene.setActiveSkills(Array.from(this.selectedSkills));
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
    const isNewWeapon = option.type === 'weapon' && option.level === 1;

    if (option.type === 'weapon' && option.weaponType) {
      const currentLevel = this.playerWeapons.get(option.weaponType) || 0;
      this.playerWeapons.set(option.weaponType, currentLevel + 1);
    } else if (option.type === 'passive') {
      const currentLevel = this.playerPassives.get(option.id) || 0;
      this.playerPassives.set(option.id, currentLevel + 1);
    }

    // Apply to player
    this.gameScene.applyUpgrade(option);

    // 새로운 무기를 추가한 경우 즉시 활성화
    if (isNewWeapon && option.weaponType) {
      // 새 스킬을 선택된 스킬 목록에 추가
      this.selectedSkills.add(option.weaponType);
      // GameScene에 활성 스킬 목록 전달하여 즉시 발사되도록 함
      this.gameScene.setActiveSkills(Array.from(this.selectedSkills));

      // 개발자 모드일 경우 패널 업데이트
      if (this.isDevMode) {
        this.needsSkillRefresh = true;
        if (this.devPanelVisible) {
          this.time.delayedCall(0, () => {
            this.refreshSkillButtons();
            this.needsSkillRefresh = false;
          });
        }
      }
    }

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

    // 개발자 모드 업데이트
    this.updateDevPanel();
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

  // ========== 개발자 모드 UI ==========

  private createDevModeUI(): void {
    // 개발자 모드 토글 버튼 (우측 하단)
    this.createDevToggleButton();

    // 개발자 패널 (숨겨진 상태로 시작)
    this.createDevPanel();

    // 충돌 범위 그리기용 Graphics (GameScene에서 렌더링)
    this.colliderGraphics = this.gameScene.add.graphics();
    this.colliderGraphics.setDepth(1000);
  }

  private createDevToggleButton(): void {
    const x = this.cameras.main.width - 60;
    const y = this.cameras.main.height - 30;

    this.devToggleButton = this.add.container(x, y);

    const bg = this.add.rectangle(0, 0, 100, 40, 0x333333, 0.9);
    bg.setStrokeStyle(2, 0x00ff00);

    const text = this.add.text(0, 0, '🔧 DEV', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#00ff00',
    }).setOrigin(0.5, 0.5);

    this.devToggleButton.add([bg, text]);
    this.devToggleButton.setDepth(200);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => bg.setFillStyle(0x444444));
    bg.on('pointerout', () => bg.setFillStyle(0x333333));
    bg.on('pointerdown', () => this.toggleDevPanel());
  }

  private createDevPanel(): void {
    const panelWidth = 280;
    const panelHeight = 400;
    const x = this.cameras.main.width - panelWidth - 10;
    const y = this.cameras.main.height - panelHeight - 50;

    this.devPanel = this.add.container(x, y);
    this.devPanel.setVisible(false);
    this.devPanel.setDepth(199);

    // 패널 배경
    const bg = this.add.rectangle(panelWidth / 2, panelHeight / 2, panelWidth, panelHeight, 0x1a1a2e, 0.95);
    bg.setStrokeStyle(2, 0x00ff00);
    this.devPanel.add(bg);

    // 제목
    const title = this.add.text(panelWidth / 2, 15, '🛠️ Developer Mode', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold',
    }).setOrigin(0.5, 0);
    this.devPanel.add(title);

    // 좌표 표시
    const coordsLabel = this.add.text(10, 45, 'Player Position:', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.devPanel.add(coordsLabel);

    this.coordsText = this.add.text(10, 62, 'X: 0, Y: 0', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff',
    });
    this.devPanel.add(this.coordsText);

    // 충돌 범위 토글
    const colliderToggle = this.createToggleButton(10, 90, 'Show Colliders', this.showColliders, (enabled) => {
      this.showColliders = enabled;
      this.gameScene.setShowColliders(enabled);
    });
    this.devPanel.add(colliderToggle);

    // 스킬 선택 섹션
    const skillsLabel = this.add.text(10, 130, 'Active Skills (click to toggle):', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa',
    });
    this.devPanel.add(skillsLabel);

    // 스킬 버튼들 생성
    this.createSkillButtons(10, 155, panelWidth - 20);
  }

  private createToggleButton(
    x: number,
    y: number,
    label: string,
    initialState: boolean,
    onChange: (enabled: boolean) => void
  ): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);

    const boxSize = 20;
    const box = this.add.rectangle(boxSize / 2, boxSize / 2, boxSize, boxSize, 
      initialState ? 0x00ff00 : 0x333333);
    box.setStrokeStyle(2, 0x00ff00);

    const checkmark = this.add.text(boxSize / 2, boxSize / 2, '✓', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#000000',
    }).setOrigin(0.5, 0.5);
    checkmark.setVisible(initialState);

    const text = this.add.text(boxSize + 10, boxSize / 2, label, {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#ffffff',
    }).setOrigin(0, 0.5);

    container.add([box, checkmark, text]);

    let enabled = initialState;
    box.setInteractive({ useHandCursor: true });
    box.on('pointerdown', () => {
      enabled = !enabled;
      box.setFillStyle(enabled ? 0x00ff00 : 0x333333);
      checkmark.setVisible(enabled);
      onChange(enabled);
    });

    return container;
  }

  private createSkillButtons(startX: number, startY: number, maxWidth: number): void {
    const buttonSize = 36;
    const padding = 4;
    const buttonsPerRow = Math.floor(maxWidth / (buttonSize + padding));

    // 개발자 모드에서는 모든 구현된 스킬 표시
    const allSkills = [
      WeaponType.Fireball,
      WeaponType.IceBolt,
      WeaponType.Meteor,
    ];

    // 현재 플레이어가 실제로 가지고 있는 스킬들
    const playerSkills = this.gameScene.getPlayerWeaponTypes();

    // 플레이어가 가진 스킬만 초기에 활성화 상태로 설정
    playerSkills.forEach(skill => this.selectedSkills.add(skill));
    // GameScene에도 전달
    this.gameScene.setActiveSkills(Array.from(this.selectedSkills));

    allSkills.forEach((skillType, index) => {
      const row = Math.floor(index / buttonsPerRow);
      const col = index % buttonsPerRow;
      const x = startX + col * (buttonSize + padding);
      const y = startY + row * (buttonSize + padding);

      const container = this.add.container(x, y);
      const iconInfo = SKILL_ICON_MAP[skillType];

      // 플레이어가 실제로 가진 스킬인지 확인
      const isActive = this.selectedSkills.has(skillType);

      // 배경 - 보유한 스킬은 활성화(초록색), 미보유는 비활성화(회색)
      const bg = this.add.rectangle(buttonSize / 2, buttonSize / 2, buttonSize, buttonSize,
        0x333333, 0.9);
      bg.setStrokeStyle(3, isActive ? 0x00ff00 : 0x666666);

      // 스킬 아이콘
      let icon: Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
      if (iconInfo.frame !== undefined) {
        icon = this.add.sprite(buttonSize / 2, buttonSize / 2, iconInfo.textureKey, iconInfo.frame);
      } else {
        icon = this.add.image(buttonSize / 2, buttonSize / 2, iconInfo.textureKey);
      }
      icon.setDisplaySize(buttonSize - 8, buttonSize - 8);
      icon.setAlpha(isActive ? 1 : 0.4); // 비활성화 스킬은 반투명

      container.add([bg, icon]);

      // 툴팁 (스킬 이름)
      const def = WEAPON_DEFINITIONS[skillType];
      
      bg.setInteractive({ useHandCursor: true });
      
      // 호버 시 스킬 이름 표시
      bg.on('pointerover', () => {
        const tooltip = this.add.text(buttonSize / 2, -10, def.name, {
          fontFamily: 'Arial',
          fontSize: '10px',
          color: '#ffffff',
          backgroundColor: '#000000',
          padding: { x: 4, y: 2 },
        }).setOrigin(0.5, 1);
        tooltip.setName('tooltip');
        container.add(tooltip);
      });

      bg.on('pointerout', () => {
        const tooltip = container.getByName('tooltip');
        if (tooltip) tooltip.destroy();
      });

      // 클릭 시 스킬 토글 (skillType을 클로저로 명시적 캡처)
      const currentSkillType = skillType;
      bg.on('pointerdown', () => {
        if (this.selectedSkills.has(currentSkillType)) {
          // 활성화 → 비활성화
          this.selectedSkills.delete(currentSkillType);
          bg.setStrokeStyle(3, 0x666666); // 비활성화: 회색
          icon.setAlpha(0.4);
        } else {
          // 비활성화 → 활성화
          this.selectedSkills.add(currentSkillType);
          bg.setStrokeStyle(3, 0x00ff00); // 활성화: 초록색
          icon.setAlpha(1);

          // 플레이어가 해당 무기를 가지고 있지 않으면 추가 (개발자 모드)
          const playerSkills = this.gameScene.getPlayerWeaponTypes();
          if (!playerSkills.includes(currentSkillType)) {
            // 무기를 플레이어에게 추가
            this.gameScene.addWeaponToPlayer(currentSkillType);
          }
        }

        // GameScene에 선택된 스킬 전달
        this.gameScene.setActiveSkills(Array.from(this.selectedSkills));
      });

      container.setData('skillType', skillType);
      this.skillButtons.set(skillType, container);
      this.devPanel.add(container);
    });
  }

  private toggleDevPanel(): void {
    this.devPanelVisible = !this.devPanelVisible;
    this.devPanel.setVisible(this.devPanelVisible);

    // 패널 열릴 때 스킬 버튼 새로고침
    if (this.devPanelVisible) {
      // 새로운 스킬이 추가되었거나 항상 새로고침
      if (this.needsSkillRefresh) {
        this.refreshSkillButtons();
        this.needsSkillRefresh = false;
      } else {
        // 첫 번째 열기이거나 기존 스킬 상태 확인을 위해 새로고침
        this.refreshSkillButtons();
      }
    }
  }

  private refreshSkillButtons(): void {
    // 기존 스킬 버튼들 제거
    this.skillButtons.forEach((container) => {
      container.destroy();
    });
    this.skillButtons.clear();

    // 스킬 버튼 다시 생성
    this.createSkillButtons(10, 155, 260);
  }

  private updateSkillButtonStates(): void {
    // 선택 상태에 따라 테두리 색상과 아이콘 투명도 업데이트
    this.skillButtons.forEach((container, skillType) => {
      const bg = container.getAt(0) as Phaser.GameObjects.Rectangle;
      const icon = container.getAt(1) as Phaser.GameObjects.Sprite | Phaser.GameObjects.Image;
      const isActive = this.selectedSkills.has(skillType);
      
      // 활성화: 초록색 테두리 + 불투명 아이콘
      // 비활성화: 회색 테두리 + 반투명 아이콘
      bg.setStrokeStyle(3, isActive ? 0x00ff00 : 0x666666);
      icon.setAlpha(isActive ? 1 : 0.4);
    });
  }

  private updateDevPanel(): void {
    if (!this.isDevMode || !this.devPanelVisible) return;

    // 플레이어 좌표 업데이트
    const playerPos = this.gameScene.getPlayerPosition();
    if (playerPos && this.coordsText) {
      this.coordsText.setText(`X: ${Math.floor(playerPos.x)}, Y: ${Math.floor(playerPos.y)}`);
    }
  }
}
