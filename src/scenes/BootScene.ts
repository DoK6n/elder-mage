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

    // Load character and monster sprites
    this.loadCharacterSprites();
    this.loadMonsterSprites();
    this.loadMapTiles();
  }

  private loadMapTiles(): void {
    const basePath = 'assets/map/free_fields_tileset_pixel_art_for_tower_defense';

    // Load all 64 grass tiles (fieldstile_01.png ~ fieldstile_64.png)
    for (let i = 1; i <= 64; i++) {
      const tileNumber = String(i).padStart(2, '0');
      const key = `tile_${tileNumber}`;
      this.load.image(key, `${basePath}/tiles/fieldstile_${tileNumber}.png`);
    }

    // Load object textures
    // Bushes
    for (let i = 1; i <= 6; i++) {
      this.load.image(`bush_${i}`, `${basePath}/objects/bush/${i}.png`);
    }

    // Grass tufts
    for (let i = 1; i <= 6; i++) {
      this.load.image(`grass_${i}`, `${basePath}/objects/grass/${i}.png`);
    }

    // Flowers
    for (let i = 1; i <= 12; i++) {
      this.load.image(`flower_${i}`, `${basePath}/objects/flower/${i}.png`);
    }

    // Stones
    for (let i = 1; i <= 16; i++) {
      this.load.image(`stone_${i}`, `${basePath}/objects/stone/${i}.png`);
    }

    // Trees
    this.load.image('tree_1', `${basePath}/objects/decor/tree1.png`);
    this.load.image('tree_2', `${basePath}/objects/decor/tree2.png`);

    // Logs
    for (let i = 1; i <= 4; i++) {
      this.load.image(`log_${i}`, `${basePath}/objects/decor/log${i}.png`);
    }

    // Boxes
    for (let i = 1; i <= 4; i++) {
      this.load.image(`box_${i}`, `${basePath}/objects/decor/box${i}.png`);
    }

    // Dirt patches
    for (let i = 1; i <= 6; i++) {
      this.load.image(`dirt_${i}`, `${basePath}/objects/decor/dirt${i}.png`);
    }

    // Fences
    for (let i = 1; i <= 10; i++) {
      this.load.image(`fence_${i}`, `${basePath}/objects/fence/${i}.png`);
    }

    // Shadows
    for (let i = 1; i <= 6; i++) {
      this.load.image(`shadow_${i}`, `${basePath}/objects/shadow/${i}.png`);
    }

    // Camp objects
    for (let i = 1; i <= 6; i++) {
      this.load.image(`camp_${i}`, `${basePath}/objects/camp/${i}.png`);
    }

    // Animated campfire
    this.load.spritesheet('campfire', `${basePath}/animated_objects/campfire/1.png`, {
      frameWidth: 32,
      frameHeight: 32,
    });

    // Flags
    for (let i = 1; i <= 5; i++) {
      this.load.image(`flag_${i}`, `${basePath}/animated_objects/flag/${i}.png`);
    }
  }

  private loadCharacterSprites(): void {
    const basePath = 'assets/tiny-rpg-pack/Characters(100x100)/Wizard/Wizard';

    // Load wizard sprite sheets (100x100 per frame)
    this.load.spritesheet('player', `${basePath}/Wizard-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('wizard-walk', `${basePath}/Wizard-Walk.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('wizard-attack1', `${basePath}/Wizard-Attack01.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('wizard-attack2', `${basePath}/Wizard-Attack02.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('wizard-hurt', `${basePath}/Wizard-Hurt.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('wizard-death', `${basePath}/Wizard-DEATH.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Load wizard attack effects
    const magicPath = 'assets/tiny-rpg-pack/Magic(Projectile)';
    this.load.spritesheet('ice-effect', `${magicPath}/Wizard-Attack01_Effect.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('fire-effect', `${magicPath}/Wizard-Attack02_Effect.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('heal-effect', `${magicPath}/Priest-Heal_Effect.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('meteor-effect', 'assets/tiny-rpg-pack/Characters(100x100)/Wizard/Magic(projectile)/meteor_effect.png', {
      frameWidth: 100,
      frameHeight: 250,
    });

    // Load skill sprites
    this.load.spritesheet('shield', 'assets/skills/shield.png', {
      frameWidth: 72,
      frameHeight: 72,
    });
  }

  private loadMonsterSprites(): void {
    const baseCharPath = 'assets/tiny-rpg-pack/Characters(100x100)';

    // Load Slime sprite sheets (100x100 per frame)
    const slimePath = `${baseCharPath}/Slime/Slime`;
    this.load.spritesheet('enemy_slime', `${slimePath}/Slime-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('slime-walk', `${slimePath}/Slime-Walk.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('slime-attack', `${slimePath}/Slime-Attack01.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Load Orc sprite sheets
    const orcPath = `${baseCharPath}/Orc/Orc`;
    this.load.spritesheet('enemy_orc', `${orcPath}/Orc-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('orc-walk', `${orcPath}/Orc-Walk.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('orc-attack', `${orcPath}/Orc-Attack01.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Load Skeleton sprite sheets
    const skeletonPath = `${baseCharPath}/Skeleton/Skeleton`;
    this.load.spritesheet('enemy_skeleton', `${skeletonPath}/Skeleton-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('skeleton-walk', `${skeletonPath}/Skeleton-Walk.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
    this.load.spritesheet('skeleton-attack', `${skeletonPath}/Skeleton-Attack01.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Goblin을 Skeleton으로 교체
    this.load.spritesheet('enemy_goblin', `${skeletonPath}/Skeleton-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // 나머지 몬스터들도 사용 가능한 이미지로 매핑
    // Kobold -> Slime
    this.load.spritesheet('enemy_kobold', `${slimePath}/Slime-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Lizardman -> Skeleton
    this.load.spritesheet('enemy_lizardman', `${skeletonPath}/Skeleton-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });

    // Ogre -> Orc (보스급)
    this.load.spritesheet('enemy_ogre', `${orcPath}/Orc-Idle.png`, {
      frameWidth: 100,
      frameHeight: 100,
    });
  }

  create(): void {
    this.createAnimations();
    this.generateTextures();
    this.scene.start('GameScene');
  }

  private createAnimations(): void {
    // Wizard animations
    this.anims.create({
      key: 'player-idle',
      frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
      frameRate: 8,
      repeat: -1,
    });

    // Wizard attack effect animations
    this.anims.create({
      key: 'ice-attack',
      frames: this.anims.generateFrameNumbers('ice-effect', { start: 0, end: 9 }), // 10개 프레임 전부 사용
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'fire-attack',
      frames: this.anims.generateFrameNumbers('fire-effect', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
    });

    this.anims.create({
      key: 'meteor-attack',
      frames: this.anims.generateFrameNumbers('meteor-effect', { start: 0, end: 17 }),
      frameRate: 12, // 17프레임 / 12fps = 약 1.4초
      repeat: 0,
    });

    this.anims.create({
      key: 'heal-effect',
      frames: this.anims.generateFrameNumbers('heal-effect', { start: 0, end: 5 }),
      frameRate: 10,
      repeat: 0,
    });

    // Slime animations
    this.anims.create({
      key: 'slime-idle',
      frames: this.anims.generateFrameNumbers('enemy_slime', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Orc animations
    this.anims.create({
      key: 'orc-idle',
      frames: this.anims.generateFrameNumbers('enemy_orc', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    // Skeleton animations
    this.anims.create({
      key: 'skeleton-idle',
      frames: this.anims.generateFrameNumbers('enemy_skeleton', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Goblin uses skeleton animations
    this.anims.create({
      key: 'goblin-idle',
      frames: this.anims.generateFrameNumbers('enemy_goblin', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Kobold uses slime animations
    this.anims.create({
      key: 'kobold-idle',
      frames: this.anims.generateFrameNumbers('enemy_kobold', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Lizardman uses skeleton animations
    this.anims.create({
      key: 'lizardman-idle',
      frames: this.anims.generateFrameNumbers('enemy_lizardman', { start: 0, end: 5 }),
      frameRate: 6,
      repeat: -1,
    });

    // Ogre uses orc animations
    this.anims.create({
      key: 'ogre-idle',
      frames: this.anims.generateFrameNumbers('enemy_ogre', { start: 0, end: 3 }),
      frameRate: 6,
      repeat: -1,
    });

    // Shield animation
    this.anims.create({
      key: 'shield-loop',
      frames: this.anims.generateFrameNumbers('shield', { start: 0, end: 7 }),
      frameRate: 12,
      repeat: -1,
    });
  }

  private generateTextures(): void {
    // Player and enemy textures are now loaded from sprite sheets
    this.createProjectileTextures();
    this.createExpOrbTexture();
    this.createGolemTexture();
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
