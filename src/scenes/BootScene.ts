import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();

    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff',
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x4488ff, 1);
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });
  }

  create(): void {
    this.generateTextures();
    this.scene.start('GameScene');
  }

  private generateTextures(): void {
    this.createPlayerTexture();
    this.createEnemyTextures();
    this.createProjectileTextures();
    this.createExpOrbTexture();
    this.createGolemTexture();
  }

  private createPlayerTexture(): void {
    const g = this.add.graphics();
    const size = 40;

    // Wizard Hat - pointed cone shape
    g.fillStyle(0x2a1a4a); // Dark purple hat
    g.fillTriangle(20, 0, 8, 16, 32, 16);
    // Hat brim
    g.fillStyle(0x3a2a5a);
    g.fillRect(6, 14, 28, 4);
    // Hat band with gold trim
    g.fillStyle(0xffd700);
    g.fillRect(8, 14, 24, 2);
    // Hat star decoration
    g.fillStyle(0xffff00);
    g.fillCircle(20, 8, 2);

    // Head
    g.fillStyle(0xffdbac);
    g.fillRect(12, 16, 16, 12);

    // Beard (white wizard beard)
    g.fillStyle(0xcccccc);
    g.fillRect(14, 24, 12, 6);
    g.fillTriangle(16, 28, 20, 36, 24, 28);

    // Eyes
    g.fillStyle(0x4488ff); // Magical blue eyes
    g.fillRect(14, 20, 3, 3);
    g.fillRect(23, 20, 3, 3);
    // Eye glint
    g.fillStyle(0xffffff);
    g.fillRect(15, 20, 1, 1);
    g.fillRect(24, 20, 1, 1);

    // Body (purple wizard robe)
    g.fillStyle(0x4a2a7a);
    g.fillRect(10, 28, 20, 10);
    // Robe trim
    g.fillStyle(0x6a3a9a);
    g.fillRect(10, 28, 20, 2);

    // Left arm holding staff
    g.fillStyle(0x3a1a6a);
    g.fillRect(4, 28, 6, 8);

    // Right arm
    g.fillStyle(0x3a1a6a);
    g.fillRect(30, 28, 6, 8);

    // Hands
    g.fillStyle(0xffdbac);
    g.fillRect(4, 34, 4, 4);
    g.fillRect(32, 34, 4, 4);

    // Staff
    g.fillStyle(0x8b4513); // Brown wooden staff
    g.fillRect(0, 10, 3, 30);
    // Staff orb (magical)
    g.fillStyle(0x00ffff);
    g.fillCircle(1, 8, 4);
    // Orb glow
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(0, 6, 2);
    // Staff binding
    g.fillStyle(0xffd700);
    g.fillRect(0, 12, 3, 2);

    g.generateTexture('player', size, size);
    g.destroy();
  }

  private createEnemyTextures(): void {
    // Slime - green blob (초반 몬스터)
    this.createSlimeTexture('enemy_slime', 0x44aa44, 24);

    // Goblin - small green humanoid
    this.createGoblinTexture('enemy_goblin', 0x5a8a32, 28);

    // Kobold - dog-like reptilian
    this.createKoboldTexture('enemy_kobold', 0x8b6914, 26);

    // Lizardman - tall reptilian warrior
    this.createLizardmanTexture('enemy_lizardman', 0x2e8b57, 36);

    // Orc - large green brute
    this.createOrcTexture('enemy_orc', 0x556b2f, 44);

    // Ogre - massive boss creature
    this.createOgreTexture('enemy_ogre', 0x8b4513, 64);
  }

  private createSlimeTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();

    // Slime body
    g.fillStyle(color);
    g.fillEllipse(size / 2, size / 2 + 2, size - 4, size - 8);

    // Highlight
    g.fillStyle(0xffffff, 0.3);
    g.fillEllipse(size / 2 - 4, size / 2 - 2, 6, 4);

    // Eyes
    g.fillStyle(0x000000);
    g.fillCircle(size / 2 - 4, size / 2, 2);
    g.fillCircle(size / 2 + 4, size / 2, 2);

    // Eye whites
    g.fillStyle(0xffffff);
    g.fillCircle(size / 2 - 4, size / 2 - 1, 1);
    g.fillCircle(size / 2 + 4, size / 2 - 1, 1);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createGoblinTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();
    const cx = size / 2;
    const cy = size / 2;

    // Body (ragged cloth)
    g.fillStyle(0x5a4a3a);
    g.fillRect(cx - 6, cy, 12, 10);

    // Head (large for goblin)
    g.fillStyle(color);
    g.fillEllipse(cx, cy - 4, 14, 12);

    // Large pointed ears
    g.fillStyle(color);
    g.fillTriangle(cx - 10, cy - 4, cx - 6, cy - 10, cx - 4, cy - 2);
    g.fillTriangle(cx + 10, cy - 4, cx + 6, cy - 10, cx + 4, cy - 2);

    // Eyes (yellow, menacing)
    g.fillStyle(0xffff00);
    g.fillCircle(cx - 3, cy - 4, 3);
    g.fillCircle(cx + 3, cy - 4, 3);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 3, cy - 4, 1);
    g.fillCircle(cx + 3, cy - 4, 1);

    // Big nose
    g.fillStyle(color * 0.8);
    g.fillTriangle(cx - 2, cy, cx, cy + 4, cx + 2, cy);

    // Sharp teeth grin
    g.fillStyle(0xffffff);
    g.fillRect(cx - 4, cy + 2, 2, 2);
    g.fillRect(cx + 2, cy + 2, 2, 2);

    // Arms
    g.fillStyle(color);
    g.fillRect(cx - 10, cy + 2, 4, 8);
    g.fillRect(cx + 6, cy + 2, 4, 8);

    // Legs
    g.fillStyle(color);
    g.fillRect(cx - 5, cy + 10, 4, 6);
    g.fillRect(cx + 1, cy + 10, 4, 6);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createKoboldTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();
    const cx = size / 2;
    const cy = size / 2;

    // Body (scaled)
    g.fillStyle(color);
    g.fillRect(cx - 5, cy, 10, 8);

    // Head (dog-like snout)
    g.fillStyle(color);
    g.fillEllipse(cx, cy - 3, 10, 10);

    // Snout
    g.fillStyle(color * 0.9);
    g.fillEllipse(cx, cy, 6, 4);

    // Ears (pointed up)
    g.fillStyle(color);
    g.fillTriangle(cx - 6, cy - 6, cx - 3, cy - 14, cx - 1, cy - 4);
    g.fillTriangle(cx + 6, cy - 6, cx + 3, cy - 14, cx + 1, cy - 4);

    // Eyes (red, beady)
    g.fillStyle(0xff3300);
    g.fillCircle(cx - 3, cy - 5, 2);
    g.fillCircle(cx + 3, cy - 5, 2);

    // Nose
    g.fillStyle(0x333333);
    g.fillCircle(cx, cy + 1, 2);

    // Tail
    g.lineStyle(3, color);
    g.lineBetween(cx, cy + 8, cx + 6, cy + 12);

    // Small claws
    g.fillStyle(color * 0.7);
    g.fillRect(cx - 8, cy + 2, 3, 6);
    g.fillRect(cx + 5, cy + 2, 3, 6);

    // Feet
    g.fillRect(cx - 4, cy + 8, 3, 4);
    g.fillRect(cx + 1, cy + 8, 3, 4);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createLizardmanTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();
    const cx = size / 2;
    const cy = size / 2;

    // Body (muscular, scaled)
    g.fillStyle(color);
    g.fillRect(cx - 7, cy - 2, 14, 14);

    // Scales pattern
    g.fillStyle(color * 0.8);
    for (let i = 0; i < 3; i++) {
      g.fillRect(cx - 5 + i * 4, cy, 3, 3);
      g.fillRect(cx - 3 + i * 4, cy + 4, 3, 3);
    }

    // Head (reptilian)
    g.fillStyle(color);
    g.fillEllipse(cx, cy - 8, 12, 10);

    // Snout
    g.fillStyle(color * 0.9);
    g.fillRect(cx - 3, cy - 6, 6, 4);

    // Crest/spines
    g.fillStyle(0x1a5a37);
    g.fillTriangle(cx - 2, cy - 14, cx, cy - 18, cx + 2, cy - 14);
    g.fillTriangle(cx - 1, cy - 12, cx, cy - 15, cx + 1, cy - 12);

    // Eyes (yellow, slit pupils)
    g.fillStyle(0xffcc00);
    g.fillEllipse(cx - 4, cy - 10, 3, 4);
    g.fillEllipse(cx + 4, cy - 10, 3, 4);
    g.fillStyle(0x000000);
    g.fillRect(cx - 4, cy - 11, 1, 3);
    g.fillRect(cx + 4, cy - 11, 1, 3);

    // Arms (muscular)
    g.fillStyle(color);
    g.fillRect(cx - 12, cy, 5, 10);
    g.fillRect(cx + 7, cy, 5, 10);

    // Claws
    g.fillStyle(0x333333);
    g.fillTriangle(cx - 12, cy + 10, cx - 10, cy + 14, cx - 8, cy + 10);
    g.fillTriangle(cx + 12, cy + 10, cx + 10, cy + 14, cx + 8, cy + 10);

    // Legs
    g.fillStyle(color);
    g.fillRect(cx - 6, cy + 12, 5, 6);
    g.fillRect(cx + 1, cy + 12, 5, 6);

    // Tail
    g.lineStyle(4, color);
    g.lineBetween(cx, cy + 12, cx - 8, cy + 16);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createOrcTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();
    const cx = size / 2;
    const cy = size / 2;

    // Body (bulky, muscular)
    g.fillStyle(color);
    g.fillRect(cx - 10, cy - 2, 20, 18);

    // Chest armor
    g.fillStyle(0x4a3a2a);
    g.fillRect(cx - 8, cy, 16, 10);
    g.fillStyle(0x5a4a3a);
    g.fillRect(cx - 6, cy + 2, 12, 6);

    // Head (brutish)
    g.fillStyle(color);
    g.fillEllipse(cx, cy - 10, 16, 14);

    // Brow ridge
    g.fillStyle(color * 0.8);
    g.fillRect(cx - 7, cy - 14, 14, 4);

    // Lower jaw/tusks
    g.fillStyle(0xfffff0);
    g.fillTriangle(cx - 5, cy - 4, cx - 4, cy - 8, cx - 3, cy - 4);
    g.fillTriangle(cx + 5, cy - 4, cx + 4, cy - 8, cx + 3, cy - 4);

    // Eyes (red, angry)
    g.fillStyle(0xff0000);
    g.fillCircle(cx - 4, cy - 12, 3);
    g.fillCircle(cx + 4, cy - 12, 3);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 4, cy - 12, 1);
    g.fillCircle(cx + 4, cy - 12, 1);

    // Nose (flat)
    g.fillStyle(color * 0.7);
    g.fillRect(cx - 2, cy - 8, 4, 3);

    // Arms (massive)
    g.fillStyle(color);
    g.fillRect(cx - 16, cy - 2, 6, 14);
    g.fillRect(cx + 10, cy - 2, 6, 14);

    // Wrist bands
    g.fillStyle(0x3a2a1a);
    g.fillRect(cx - 16, cy + 8, 6, 3);
    g.fillRect(cx + 10, cy + 8, 6, 3);

    // Fists
    g.fillStyle(color);
    g.fillRect(cx - 17, cy + 11, 7, 5);
    g.fillRect(cx + 10, cy + 11, 7, 5);

    // Legs
    g.fillStyle(0x3a3a2a);
    g.fillRect(cx - 8, cy + 16, 7, 6);
    g.fillRect(cx + 1, cy + 16, 7, 6);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createOgreTexture(key: string, color: number, size: number): void {
    const g = this.add.graphics();
    const cx = size / 2;
    const cy = size / 2;

    // Body (massive, round belly)
    g.fillStyle(color);
    g.fillEllipse(cx, cy + 5, 36, 30);

    // Belly
    g.fillStyle(0xa08060);
    g.fillEllipse(cx, cy + 8, 24, 20);

    // Head (small compared to body)
    g.fillStyle(color);
    g.fillEllipse(cx, cy - 18, 22, 18);

    // Single eye or two small eyes
    g.fillStyle(0xffff00);
    g.fillCircle(cx - 5, cy - 20, 5);
    g.fillCircle(cx + 5, cy - 20, 5);
    g.fillStyle(0x000000);
    g.fillCircle(cx - 5, cy - 20, 2);
    g.fillCircle(cx + 5, cy - 20, 2);

    // Brow
    g.fillStyle(color * 0.7);
    g.fillRect(cx - 10, cy - 26, 20, 4);

    // Mouth (huge, drooling)
    g.fillStyle(0x2a1a0a);
    g.fillRect(cx - 8, cy - 12, 16, 6);
    // Teeth
    g.fillStyle(0xffffcc);
    g.fillTriangle(cx - 6, cy - 12, cx - 4, cy - 8, cx - 2, cy - 12);
    g.fillTriangle(cx + 6, cy - 12, cx + 4, cy - 8, cx + 2, cy - 12);

    // Ears
    g.fillStyle(color);
    g.fillEllipse(cx - 12, cy - 16, 6, 8);
    g.fillEllipse(cx + 12, cy - 16, 6, 8);

    // Arms (tree trunk thick)
    g.fillStyle(color);
    g.fillRect(cx - 24, cy - 5, 10, 24);
    g.fillRect(cx + 14, cy - 5, 10, 24);

    // Hands/fists
    g.fillStyle(color * 0.9);
    g.fillEllipse(cx - 19, cy + 22, 8, 10);
    g.fillEllipse(cx + 19, cy + 22, 8, 10);

    // Legs (stumpy)
    g.fillStyle(color);
    g.fillRect(cx - 12, cy + 20, 10, 12);
    g.fillRect(cx + 2, cy + 20, 10, 12);

    // Club in hand
    g.fillStyle(0x5a4020);
    g.fillRect(cx - 26, cy - 10, 6, 30);
    g.fillStyle(0x4a3010);
    g.fillEllipse(cx - 23, cy - 14, 8, 10);

    // Loincloth
    g.fillStyle(0x4a3a2a);
    g.fillRect(cx - 10, cy + 18, 20, 6);

    g.generateTexture(key, size, size);
    g.destroy();
  }

  private createProjectileTextures(): void {
    // 기본 마법 미사일
    this.createMagicProjectile();

    // 불 속성
    this.createFireProjectile();
    this.createFireWallProjectile();
    this.createMeteorProjectile();

    // 물 속성
    this.createIceProjectile();
    this.createWaterShieldProjectile();
    this.createBlizzardProjectile();

    // 바람 속성
    this.createWindProjectile();
    this.createTornadoProjectile();
    this.createAirSlashTexture();

    // 땅 속성
    this.createRockProjectile();
    this.createEarthquakeProjectile();

    // 전기 속성
    this.createLightningProjectile();
    this.createChainLightningProjectile();
    this.createThunderProjectile();

    // 기존 호환용
    this.createLegacyProjectile();
  }

  private createLegacyProjectile(): void {
    const g = this.add.graphics();
    const size = 16;
    g.fillStyle(0x00ffff);
    g.fillCircle(size / 2, size / 2, 6);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(size / 2, size / 2, 3);
    g.generateTexture('projectile', size, size);
    g.destroy();
  }

  private createMagicProjectile(): void {
    const g = this.add.graphics();
    const size = 16;
    const cx = size / 2;
    const cy = size / 2;

    // Outer glow
    g.fillStyle(0x00ffff, 0.3);
    g.fillCircle(cx, cy, 7);

    // Main orb
    g.fillStyle(0x00ffff);
    g.fillCircle(cx, cy, 5);

    // Inner bright core
    g.fillStyle(0xffffff, 0.8);
    g.fillCircle(cx - 1, cy - 1, 2);

    g.generateTexture('proj_magic', size, size);
    g.destroy();
  }

  // ===== 불 속성 =====
  private createFireProjectile(): void {
    const g = this.add.graphics();
    const size = 20;
    const cx = size / 2;
    const cy = size / 2;

    // Outer flame glow
    g.fillStyle(0xff6600, 0.4);
    g.fillCircle(cx, cy, 9);

    // Main fireball
    g.fillStyle(0xff4500);
    g.fillCircle(cx, cy, 6);

    // Inner hot core
    g.fillStyle(0xffff00);
    g.fillCircle(cx, cy, 3);

    // Bright center
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx - 1, cy - 1, 1);

    // Flame trail effect
    g.fillStyle(0xff2200, 0.6);
    g.fillTriangle(cx - 8, cy, cx - 3, cy - 3, cx - 3, cy + 3);

    g.generateTexture('proj_fire', size, size);
    g.destroy();
  }

  private createFireWallProjectile(): void {
    const g = this.add.graphics();
    const size = 48;
    const cx = size / 2;

    // Fire wall - vertical flames
    for (let i = 0; i < 5; i++) {
      const x = 8 + i * 8;
      const height = 20 + Math.sin(i * 1.5) * 8;

      // Outer flame
      g.fillStyle(0xff4500, 0.7);
      g.fillTriangle(x - 4, size - 4, x, size - height, x + 4, size - 4);

      // Inner flame
      g.fillStyle(0xffff00, 0.8);
      g.fillTriangle(x - 2, size - 4, x, size - height + 6, x + 2, size - 4);
    }

    // Base glow
    g.fillStyle(0xff6600, 0.5);
    g.fillRect(4, size - 8, size - 8, 6);

    g.generateTexture('proj_firewall', size, size);
    g.destroy();
  }

  private createMeteorProjectile(): void {
    const g = this.add.graphics();
    const size = 32;
    const cx = size / 2;
    const cy = size / 2;

    // Fiery trail
    g.fillStyle(0xff4500, 0.5);
    g.fillTriangle(cx - 12, cy - 8, cx + 4, cy + 8, cx - 12, cy + 8);

    // Outer glow
    g.fillStyle(0xff2200, 0.6);
    g.fillCircle(cx + 2, cy, 12);

    // Rock body
    g.fillStyle(0x8b0000);
    g.fillCircle(cx + 2, cy, 8);

    // Hot cracks
    g.lineStyle(2, 0xff6600);
    g.lineBetween(cx - 2, cy - 4, cx + 6, cy);
    g.lineBetween(cx, cy + 2, cx + 4, cy + 6);

    // Bright spots
    g.fillStyle(0xffff00, 0.8);
    g.fillCircle(cx, cy - 2, 2);

    g.generateTexture('proj_meteor', size, size);
    g.destroy();
  }

  // ===== 물 속성 =====
  private createIceProjectile(): void {
    const g = this.add.graphics();
    const size = 18;
    const cx = size / 2;
    const cy = size / 2;

    // Outer frost glow
    g.fillStyle(0xadd8e6, 0.4);
    g.fillCircle(cx, cy, 8);

    // Ice crystal shape (diamond)
    g.fillStyle(0x1e90ff);
    g.fillTriangle(cx, cy - 7, cx + 5, cy, cx, cy + 7);
    g.fillTriangle(cx, cy - 7, cx - 5, cy, cx, cy + 7);

    // Inner shine
    g.fillStyle(0xffffff, 0.7);
    g.fillTriangle(cx - 2, cy - 3, cx + 1, cy, cx - 2, cy + 2);

    g.generateTexture('proj_ice', size, size);
    g.destroy();
  }

  private createWaterShieldProjectile(): void {
    const g = this.add.graphics();
    const size = 40;
    const cx = size / 2;
    const cy = size / 2;

    // Outer water ring
    g.lineStyle(4, 0x4169e1, 0.6);
    g.strokeCircle(cx, cy, 16);

    // Inner water ring
    g.lineStyle(3, 0x1e90ff, 0.8);
    g.strokeCircle(cx, cy, 12);

    // Water droplets around
    g.fillStyle(0x00bfff, 0.7);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const dx = Math.cos(angle) * 14;
      const dy = Math.sin(angle) * 14;
      g.fillCircle(cx + dx, cy + dy, 3);
    }

    g.generateTexture('proj_watershield', size, size);
    g.destroy();
  }

  private createBlizzardProjectile(): void {
    const g = this.add.graphics();
    const size = 12;
    const cx = size / 2;
    const cy = size / 2;

    // Snowflake
    g.fillStyle(0xffffff, 0.9);
    g.fillCircle(cx, cy, 3);

    // Snowflake arms
    g.lineStyle(2, 0xadd8e6, 0.8);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      g.lineBetween(cx, cy, cx + Math.cos(angle) * 5, cy + Math.sin(angle) * 5);
    }

    g.generateTexture('proj_blizzard', size, size);
    g.destroy();
  }

  // ===== 바람 속성 =====
  private createWindProjectile(): void {
    const g = this.add.graphics();
    const size = 16;
    const cx = size / 2;
    const cy = size / 2;

    // Wind blade arc
    g.fillStyle(0x32cd32, 0.3);
    g.fillCircle(cx, cy, 7);

    // Main blade
    g.fillStyle(0x90ee90, 0.8);
    g.fillTriangle(cx - 6, cy, cx + 6, cy - 3, cx + 6, cy + 3);

    // Sharp edge
    g.lineStyle(2, 0xffffff, 0.6);
    g.lineBetween(cx - 6, cy, cx + 6, cy);

    g.generateTexture('proj_wind', size, size);
    g.destroy();
  }

  private createTornadoProjectile(): void {
    const g = this.add.graphics();
    const size = 32;
    const cx = size / 2;
    const cy = size / 2;

    // Tornado spiral - multiple ellipses getting smaller
    g.fillStyle(0x32cd32, 0.3);
    g.fillEllipse(cx, cy + 8, 14, 6);

    g.fillStyle(0x228b22, 0.4);
    g.fillEllipse(cx, cy + 4, 12, 5);

    g.fillStyle(0x32cd32, 0.5);
    g.fillEllipse(cx, cy, 10, 4);

    g.fillStyle(0x90ee90, 0.6);
    g.fillEllipse(cx, cy - 4, 8, 3);

    g.fillStyle(0xffffff, 0.4);
    g.fillEllipse(cx, cy - 8, 6, 2);

    // Top point
    g.fillStyle(0x90ee90, 0.7);
    g.fillTriangle(cx - 3, cy - 10, cx, cy - 16, cx + 3, cy - 10);

    g.generateTexture('proj_tornado', size, size);
    g.destroy();
  }

  // ===== 땅 속성 =====
  private createRockProjectile(): void {
    const g = this.add.graphics();
    const size = 20;
    const cx = size / 2;
    const cy = size / 2;

    // Rock spike from ground
    g.fillStyle(0x8b4513);
    g.fillTriangle(cx - 6, cy + 8, cx, cy - 8, cx + 6, cy + 8);

    // Rock texture
    g.fillStyle(0xa0522d, 0.7);
    g.fillTriangle(cx - 3, cy + 6, cx, cy - 4, cx + 3, cy + 6);

    // Cracks
    g.lineStyle(1, 0x5c3317);
    g.lineBetween(cx - 2, cy, cx + 1, cy + 4);

    // Dirt particles at base
    g.fillStyle(0x8b4513, 0.6);
    g.fillCircle(cx - 5, cy + 7, 2);
    g.fillCircle(cx + 5, cy + 7, 2);

    g.generateTexture('proj_rock', size, size);
    g.destroy();
  }

  private createEarthquakeProjectile(): void {
    const g = this.add.graphics();
    const size = 48;
    const cx = size / 2;
    const cy = size / 2;

    // Shockwave rings
    g.lineStyle(3, 0x8b4513, 0.4);
    g.strokeCircle(cx, cy, 20);

    g.lineStyle(4, 0xa0522d, 0.6);
    g.strokeCircle(cx, cy, 14);

    g.lineStyle(3, 0xd2691e, 0.8);
    g.strokeCircle(cx, cy, 8);

    // Center crack
    g.fillStyle(0x5c3317);
    g.fillRect(cx - 2, cy - 10, 4, 20);
    g.fillRect(cx - 10, cy - 2, 20, 4);

    // Debris
    g.fillStyle(0x8b4513, 0.7);
    g.fillRect(cx + 8, cy - 8, 4, 4);
    g.fillRect(cx - 12, cy + 6, 3, 3);

    g.generateTexture('proj_earthquake', size, size);
    g.destroy();
  }

  // ===== 전기 속성 =====
  private createLightningProjectile(): void {
    const g = this.add.graphics();
    const size = 20;
    const cx = size / 2;
    const cy = size / 2;

    // Outer glow
    g.fillStyle(0xffff00, 0.3);
    g.fillCircle(cx, cy, 9);

    // Lightning bolt shape
    g.fillStyle(0xffff00);
    g.fillTriangle(cx - 2, cy - 8, cx + 4, cy - 2, cx, cy);
    g.fillTriangle(cx, cy, cx + 2, cy + 2, cx - 4, cy + 8);

    // Bright core
    g.fillStyle(0xffffff, 0.9);
    g.fillRect(cx - 1, cy - 6, 2, 12);

    g.generateTexture('proj_lightning', size, size);
    g.destroy();
  }

  private createChainLightningProjectile(): void {
    const g = this.add.graphics();
    const size = 24;
    const cx = size / 2;
    const cy = size / 2;

    // Electric aura
    g.fillStyle(0xffd700, 0.3);
    g.fillCircle(cx, cy, 11);

    // Main spark
    g.fillStyle(0xffff00);
    g.fillCircle(cx, cy, 5);

    // Branching lightning
    g.lineStyle(2, 0xffffff, 0.9);
    // Branch 1
    g.lineBetween(cx, cy, cx + 6, cy - 4);
    g.lineBetween(cx + 6, cy - 4, cx + 10, cy - 2);
    // Branch 2
    g.lineBetween(cx, cy, cx - 5, cy + 5);
    g.lineBetween(cx - 5, cy + 5, cx - 8, cy + 8);
    // Branch 3
    g.lineBetween(cx, cy, cx + 4, cy + 6);

    // Core glow
    g.fillStyle(0xffffff);
    g.fillCircle(cx, cy, 2);

    g.generateTexture('proj_chain', size, size);
    g.destroy();
  }

  private createThunderProjectile(): void {
    const g = this.add.graphics();
    const size = 16;
    const cx = size / 2;

    // Thunder strike from above
    g.fillStyle(0xffff00, 0.4);
    g.fillRect(cx - 4, 0, 8, size);

    // Main bolt
    g.fillStyle(0xffffff);
    g.fillRect(cx - 2, 0, 4, size);

    // Zigzag effect
    g.lineStyle(3, 0xffff00);
    g.lineBetween(cx, 0, cx - 3, 5);
    g.lineBetween(cx - 3, 5, cx + 3, 10);
    g.lineBetween(cx + 3, 10, cx, size);

    g.generateTexture('proj_thunder', size, size);
    g.destroy();
  }

  // Air slash texture
  private createAirSlashTexture(): void {
    const g = this.add.graphics();
    const size = 20;
    const cx = size / 2;
    const cy = size / 2;

    // Crescent blade shape
    g.fillStyle(0x90ee90, 0.6);
    g.fillEllipse(cx, cy, 8, 4);

    g.fillStyle(0xffffff, 0.4);
    g.fillEllipse(cx, cy, 6, 2);

    g.generateTexture('proj_airslash', size, size);
    g.destroy();
  }

  private createExpOrbTexture(): void {
    const g = this.add.graphics();
    const size = 12;

    // Mana crystal (마법사 테마에 맞게 마나 크리스탈로 변경)
    g.fillStyle(0x9932cc);
    g.fillTriangle(6, 0, 0, 6, 6, 12);
    g.fillTriangle(6, 0, 12, 6, 6, 12);

    // Shine
    g.fillStyle(0xda70d6, 0.7);
    g.fillTriangle(6, 2, 3, 6, 6, 10);

    // Inner glow
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(5, 5, 2);

    g.generateTexture('exp_orb', size, size);
    g.destroy();
  }

  private createGolemTexture(): void {
    const g = this.add.graphics();
    const size = 48;
    const cx = size / 2;
    const cy = size / 2;

    // Body (rocky, chunky)
    g.fillStyle(0x696969);
    g.fillRect(cx - 12, cy - 4, 24, 22);

    // Head
    g.fillStyle(0x808080);
    g.fillRect(cx - 8, cy - 16, 16, 14);

    // Glowing eyes (magical)
    g.fillStyle(0x00ffff);
    g.fillRect(cx - 6, cy - 12, 4, 4);
    g.fillRect(cx + 2, cy - 12, 4, 4);

    // Eye glow
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(cx - 4, cy - 10, 3);
    g.fillCircle(cx + 4, cy - 10, 3);

    // Arms (thick, rocky)
    g.fillStyle(0x5a5a5a);
    g.fillRect(cx - 20, cy - 2, 8, 18);
    g.fillRect(cx + 12, cy - 2, 8, 18);

    // Fists
    g.fillStyle(0x4a4a4a);
    g.fillRect(cx - 22, cy + 14, 10, 8);
    g.fillRect(cx + 12, cy + 14, 10, 8);

    // Legs
    g.fillStyle(0x5a5a5a);
    g.fillRect(cx - 10, cy + 18, 8, 8);
    g.fillRect(cx + 2, cy + 18, 8, 8);

    // Rock texture/cracks
    g.lineStyle(2, 0x3a3a3a);
    g.lineBetween(cx - 6, cy, cx + 2, cy + 8);
    g.lineBetween(cx + 4, cy + 2, cx + 8, cy + 10);

    // Magical runes on chest
    g.lineStyle(2, 0x00ffff, 0.8);
    g.lineBetween(cx - 4, cy, cx, cy + 6);
    g.lineBetween(cx, cy + 6, cx + 4, cy);
    g.strokeCircle(cx, cy + 3, 4);

    // Shoulder rocks
    g.fillStyle(0x6a6a6a);
    g.fillCircle(cx - 14, cy - 4, 5);
    g.fillCircle(cx + 14, cy - 4, 5);

    g.generateTexture('proj_golem', size, size);
    g.destroy();
  }
}
