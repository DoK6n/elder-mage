/**
 * 뱀서라이크 게임용 맵 데이터 - Phaser 4 호환
 * 
 * 맵 구성 전략:
 * 1. 바닥 타일: 랜덤하게 배치하여 자연스러운 초원 느낌
 * 2. 오브젝트: 장애물(충돌), 장식(비충돌) 구분하여 배치
 * 3. 맵 크기: 뱀서류 특성상 넓은 맵 (예: 3200x3200 픽셀)
 */

// ============================================
// 리소스 경로 정의
// ============================================
export const ASSET_BASE_PATH = 'free_fields_tileset_pixel_art_for_tower_defense';

export const AssetPaths = {
  tiles: {
    base: `${ASSET_BASE_PATH}/tiles`,
    // 기본 잔디 타일 (주로 사용할 것들)
    grass: Array.from({ length: 64 }, (_, i) => `fieldstile_${String(i + 1).padStart(2, '0')}.png`),
  },
  objects: {
    bush: Array.from({ length: 6 }, (_, i) => `${ASSET_BASE_PATH}/objects/bush/${i + 1}.png`),
    grass: Array.from({ length: 6 }, (_, i) => `${ASSET_BASE_PATH}/objects/grass/${i + 1}.png`),
    flower: Array.from({ length: 12 }, (_, i) => `${ASSET_BASE_PATH}/objects/flower/${i + 1}.png`),
    stone: Array.from({ length: 16 }, (_, i) => `${ASSET_BASE_PATH}/objects/stone/${i + 1}.png`),
    tree: [
      `${ASSET_BASE_PATH}/objects/decor/tree1.png`,
      `${ASSET_BASE_PATH}/objects/decor/tree2.png`,
    ],
    log: Array.from({ length: 4 }, (_, i) => `${ASSET_BASE_PATH}/objects/decor/log${i + 1}.png`),
    box: Array.from({ length: 4 }, (_, i) => `${ASSET_BASE_PATH}/objects/decor/box${i + 1}.png`),
    dirt: Array.from({ length: 6 }, (_, i) => `${ASSET_BASE_PATH}/objects/decor/dirt${i + 1}.png`),
    fence: Array.from({ length: 10 }, (_, i) => `${ASSET_BASE_PATH}/objects/fence/${i + 1}.png`),
    shadow: Array.from({ length: 6 }, (_, i) => `${ASSET_BASE_PATH}/objects/shadow/${i + 1}.png`),
    camp: Array.from({ length: 6 }, (_, i) => `${ASSET_BASE_PATH}/objects/camp/${i + 1}.png`),
  },
  animated: {
    campfire: [
      `${ASSET_BASE_PATH}/animated_objects/campfire/1.png`,
      `${ASSET_BASE_PATH}/animated_objects/campfire/2.png`,
    ],
    flag: Array.from({ length: 5 }, (_, i) => `${ASSET_BASE_PATH}/animated_objects/flag/${i + 1}.png`),
  },
} as const;

// ============================================
// 타일 타입 정의
// ============================================
export const enum TileType {
  GRASS_PLAIN = 1,        // 기본 잔디
  GRASS_WITH_PATCH = 2,   // 풀 패치가 있는 잔디
  GRASS_DIRT = 3,         // 흙이 섞인 잔디
}

// ============================================
// 오브젝트 타입 정의
// ============================================
export interface MapObject {
  id: string;
  type: 'obstacle' | 'decoration' | 'animated';
  assetKey: string;
  x: number;
  y: number;
  width: number;
  height: number;
  collision: boolean;
  depth: number; // z-index for sorting (y-sorting용)
}

export interface AnimatedObject extends MapObject {
  type: 'animated';
  frameRate: number;
  frames: readonly string[];
}

// ============================================
// 맵 설정
// ============================================
export const MapConfig = {
  // 맵 크기 (픽셀)
  width: 3200,
  height: 3200,
  
  // 타일 크기
  tileSize: 32,
  
  // 타일 그리드 크기
  get tilesX() { return this.width / this.tileSize; },  // 100
  get tilesY() { return this.height / this.tileSize; }, // 100
  
  // 플레이어 스폰 위치 (맵 중앙)
  spawnX: 1600,
  spawnY: 1600,
  
  // 안전 구역 (스폰 주변에 장애물 없음)
  safeZoneRadius: 200,
} as const;

// ============================================
// 타일 가중치 (랜덤 배치 시 사용)
// ============================================
export const TileWeights: Record<number, number> = {
  // 기본 풀 타일 (가장 많이 사용)
  1: 30, 2: 30, 3: 30, 4: 30, 5: 25, 6: 25, 7: 25, 8: 25,
  // 풀 패치 타일
  9: 8, 10: 8, 11: 8, 12: 8, 13: 8, 14: 8, 15: 8, 16: 8,
  17: 5, 18: 5, 19: 5, 20: 5, 21: 5, 22: 5, 23: 5, 24: 5,
  // 흙 경계 타일 (적게 사용)
  25: 2, 26: 2, 27: 2, 28: 2, 29: 2, 30: 2, 31: 2, 32: 2,
  33: 2, 34: 2, 35: 2, 36: 2, 37: 2, 38: 2, 39: 2, 40: 2,
  // 나머지
  41: 1, 42: 1, 43: 1, 44: 1, 45: 1, 46: 1, 47: 1, 48: 1,
  49: 1, 50: 1, 51: 1, 52: 1, 53: 1, 54: 1, 55: 1, 56: 1,
  57: 1, 58: 1, 59: 1, 60: 1, 61: 1, 62: 1, 63: 1, 64: 1,
};

// ============================================
// 오브젝트 배치 규칙
// ============================================
export const ObjectPlacement = {
  // 나무: 맵 가장자리와 랜덤 위치에 배치 (충돌 있음)
  tree: {
    density: 0.02, // 타일당 배치 확률
    collision: true,
    collisionRadius: 20,
    minDistance: 150, // 나무 간 최소 거리
    edgeBias: 0.6, // 가장자리에 더 많이 배치
    depth: 'y', // y좌표 기준 깊이
    estimatedSize: { width: 64, height: 80 },
  },
  
  // 돌: 랜덤 배치 (충돌 있음)
  stone: {
    density: 0.015,
    collision: true,
    collisionRadius: 12,
    minDistance: 80,
    edgeBias: 0.3,
    depth: 'y',
    estimatedSize: { width: 24, height: 24 },
  },
  
  // 부시: 장식용 (충돌 없음)
  bush: {
    density: 0.025,
    collision: false,
    minDistance: 60,
    edgeBias: 0.4,
    depth: 'y',
    estimatedSize: { width: 32, height: 32 },
  },
  
  // 풀: 밀집 장식 (충돌 없음)
  grass: {
    density: 0.08,
    collision: false,
    minDistance: 20,
    edgeBias: 0.2,
    depth: 0, // 바닥 레이어
    estimatedSize: { width: 16, height: 16 },
  },
  
  // 꽃: 장식용 (충돌 없음)
  flower: {
    density: 0.04,
    collision: false,
    minDistance: 30,
    edgeBias: 0.2,
    depth: 0,
    estimatedSize: { width: 16, height: 16 },
  },
  
  // 통나무: 약간의 장애물 (충돌 있음)
  log: {
    density: 0.008,
    collision: true,
    collisionRadius: 8,
    minDistance: 100,
    edgeBias: 0.3,
    depth: 'y',
    estimatedSize: { width: 48, height: 16 },
  },
  
  // 캠프파이어: 특수 지점 (애니메이션, 충돌 있음)
  campfire: {
    count: 4, // 맵에 4개만 배치
    collision: true,
    collisionRadius: 24,
    minDistance: 600,
    depth: 'y',
    estimatedSize: { width: 32, height: 32 },
    animated: true,
    frameRate: 8,
  },
} as const;

// ============================================
// 타일맵 생성 유틸리티
// ============================================

/**
 * 가중치 기반 랜덤 타일 선택
 */
export function getWeightedRandomTile(seed?: number): number {
  const weights = Object.entries(TileWeights);
  const totalWeight = weights.reduce((sum, [, w]) => sum + w, 0);
  
  let random = (seed !== undefined ? seededRandom(seed) : Math.random()) * totalWeight;
  
  for (const [tile, weight] of weights) {
    random -= weight;
    if (random <= 0) return parseInt(tile);
  }
  
  return 1;
}

/**
 * 시드 기반 랜덤 (일관된 맵 생성용)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 바닥 타일맵 생성
 * 2D 배열 반환 (Phaser Tilemap 호환)
 */
export function generateGroundTilemap(seed = 12345): number[][] {
  const { tilesX, tilesY } = MapConfig;
  const tilemap: number[][] = [];
  
  for (let y = 0; y < tilesY; y++) {
    const row: number[] = [];
    for (let x = 0; x < tilesX; x++) {
      const tileSeed = seed + y * tilesX + x;
      row.push(getWeightedRandomTile(tileSeed));
    }
    tilemap.push(row);
  }
  
  return tilemap;
}

/**
 * 오브젝트 배치 생성
 */
export function generateMapObjects(seed = 12345): MapObject[] {
  const objects: MapObject[] = [];
  const { width, height, spawnX, spawnY, safeZoneRadius } = MapConfig;
  
  let objectId = 0;
  
  // 안전 구역 체크
  const isInSafeZone = (x: number, y: number) => {
    const dx = x - spawnX;
    const dy = y - spawnY;
    return Math.sqrt(dx * dx + dy * dy) < safeZoneRadius;
  };
  
  // 최소 거리 체크
  const isTooClose = (x: number, y: number, existingObjects: MapObject[], minDist: number) => {
    return existingObjects.some(obj => {
      const dx = x - obj.x;
      const dy = y - obj.y;
      return Math.sqrt(dx * dx + dy * dy) < minDist;
    });
  };
  
  // 각 오브젝트 타입별 배치
  const objectTypes = [
    'tree', 'stone', 'bush', 'grass', 'flower', 'log'
  ] as const;

  for (const type of objectTypes) {
    const config = ObjectPlacement[type];
    const assets = AssetPaths.objects[type] as readonly string[];
    
    if ('density' in config) {
      const gridSize = 100; // 그리드 기반 배치
      const gridCellsX = Math.floor(width / gridSize);
      const gridCellsY = Math.floor(height / gridSize);
      
      for (let gy = 0; gy < gridCellsY; gy++) {
        for (let gx = 0; gx < gridCellsX; gx++) {
          const cellSeed = seed + gy * gridCellsX + gx + type.charCodeAt(0) * 1000;
          
          if (seededRandom(cellSeed) > config.density * 10) continue;
          
          // 가장자리 바이어스 적용
          const distToEdge = Math.min(
            gx, gy, gridCellsX - gx - 1, gridCellsY - gy - 1
          ) / (Math.min(gridCellsX, gridCellsY) / 2);
          
          if ('edgeBias' in config && seededRandom(cellSeed + 0.5) > (1 - distToEdge * (1 - config.edgeBias))) {
            continue;
          }
          
          const x = gx * gridSize + seededRandom(cellSeed + 0.1) * gridSize;
          const y = gy * gridSize + seededRandom(cellSeed + 0.2) * gridSize;
          
          if (isInSafeZone(x, y)) continue;
          if (isTooClose(x, y, objects.filter(o => o.type === 'obstacle'), config.minDistance)) continue;
          
          const assetIndex = Math.floor(seededRandom(cellSeed + 0.3) * assets.length);
          const size = config.estimatedSize;
          
          objects.push({
            id: `${type}_${objectId++}`,
            type: config.collision ? 'obstacle' : 'decoration',
            assetKey: assets[assetIndex],
            x,
            y,
            width: size.width,
            height: size.height,
            collision: config.collision,
            depth: config.depth === 'y' ? y : (config.depth as number),
          });
        }
      }
    }
  }
  
  // 캠프파이어 (특수 배치)
  const campfireConfig = ObjectPlacement.campfire;
  const campfirePositions = [
    { x: 800, y: 800 },
    { x: 2400, y: 800 },
    { x: 800, y: 2400 },
    { x: 2400, y: 2400 },
  ];
  
  for (const pos of campfirePositions) {
    if (!isInSafeZone(pos.x, pos.y)) {
      const animObj: AnimatedObject = {
        id: `campfire_${objectId++}`,
        type: 'animated',
        assetKey: 'campfire',
        x: pos.x,
        y: pos.y,
        width: campfireConfig.estimatedSize.width,
        height: campfireConfig.estimatedSize.height,
        collision: campfireConfig.collision,
        depth: pos.y,
        frameRate: campfireConfig.frameRate,
        frames: AssetPaths.animated.campfire,
      };
      objects.push(animObj);
    }
  }
  
  return objects;
}

// ============================================
// Phaser 4 호환 맵 데이터 구조
// ============================================
export interface VampireSurvivorsMapData {
  config: typeof MapConfig;
  groundTilemap: number[][];
  objects: MapObject[];
  assetPaths: typeof AssetPaths;
}

/**
 * 완전한 맵 데이터 생성
 */
export function createMapData(seed = 12345): VampireSurvivorsMapData {
  return {
    config: MapConfig,
    groundTilemap: generateGroundTilemap(seed),
    objects: generateMapObjects(seed),
    assetPaths: AssetPaths,
  };
}

// ============================================
// Phaser 4에서 사용하는 예시 (참고용)
// ============================================
/*
// Scene에서 사용 예시:

import { createMapData, AssetPaths, MapConfig } from './mapData';

class GameScene extends Phaser.Scene {
  preload() {
    // 타일 로드
    for (let i = 1; i <= 64; i++) {
      const key = `tile_${i}`;
      this.load.image(key, `${AssetPaths.tiles.base}/fieldstile_${String(i).padStart(2, '0')}.png`);
    }
    
    // 오브젝트 로드
    Object.entries(AssetPaths.objects).forEach(([type, paths]) => {
      paths.forEach((path, idx) => {
        this.load.image(`${type}_${idx}`, path);
      });
    });
    
    // 애니메이션 스프라이트 로드
    this.load.spritesheet('campfire', AssetPaths.animated.campfire[0], {
      frameWidth: 32, frameHeight: 32
    });
  }
  
  create() {
    const mapData = createMapData();
    
    // 바닥 타일 렌더링
    const { tileSize } = MapConfig;
    mapData.groundTilemap.forEach((row, y) => {
      row.forEach((tileId, x) => {
        this.add.image(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          `tile_${tileId}`
        );
      });
    });
    
    // 오브젝트 렌더링 (깊이 정렬)
    const sortedObjects = mapData.objects.sort((a, b) => a.depth - b.depth);
    
    sortedObjects.forEach(obj => {
      if (obj.type === 'animated') {
        const anim = obj as AnimatedObject;
        const sprite = this.add.sprite(obj.x, obj.y, obj.assetKey);
        this.anims.create({
          key: `${obj.assetKey}_anim`,
          frames: anim.frames.map(f => ({ key: f })),
          frameRate: anim.frameRate,
          repeat: -1
        });
        sprite.play(`${obj.assetKey}_anim`);
      } else {
        this.add.image(obj.x, obj.y, obj.assetKey);
      }
      
      // 충돌 처리
      if (obj.collision) {
        // physics body 추가
      }
    });
    
    // 카메라 설정 (뱀서 스타일)
    this.cameras.main.setBounds(0, 0, MapConfig.width, MapConfig.height);
    // 플레이어 따라가기 설정 등
  }
}
*/

// ============================================
// 미리 생성된 기본 맵 데이터 (바로 사용 가능)
// ============================================
export const DEFAULT_MAP_DATA = createMapData(42);
