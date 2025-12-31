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
export const RIVER_ASSET_PATH = 'river_tileset_pixel_art_for_tower_defense';

export const AssetPaths = {
  tiles: {
    base: `${ASSET_BASE_PATH}/tiles`,
    river: `${RIVER_ASSET_PATH}/tiles`,
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
    // river_tileset 풀 오브젝트
    riverGrass: Array.from({ length: 26 }, (_, i) => `${RIVER_ASSET_PATH}/objects/grass/${i + 1}.png`),
  },
  animated: {
    campfire: [
      `${ASSET_BASE_PATH}/animated_objects/campfire/1.png`,
      `${ASSET_BASE_PATH}/animated_objects/campfire/2.png`,
    ],
    flag: Array.from({ length: 5 }, (_, i) => `${ASSET_BASE_PATH}/animated_objects/flag/${i + 1}.png`),
  },
  effects: {
    circlewave: [`${RIVER_ASSET_PATH}/effects/circlewave1.png`, `${RIVER_ASSET_PATH}/effects/circlewave2.png`],
    splash: Array.from({ length: 4 }, (_, i) => `${RIVER_ASSET_PATH}/effects/splash${i + 1}.png`),
    wave: Array.from({ length: 4 }, (_, i) => `${RIVER_ASSET_PATH}/effects/wave${i + 1}.png`),
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

// 연못 데이터 인터페이스
export interface PondData {
  id: string;
  x: number;
  y: number;
  width: number;  // 타일 개수
  height: number; // 타일 개수
  tiles: { x: number; y: number; tileId: number }[];
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
// 타일 ID 정의
// ============================================
export const TileId = {
  GRASS: 38,           // 순수 잔디
  // 도로 타일 (free_fields_tileset)
  ROAD_CENTER: 5,      // 도로 중앙
  ROAD_H: 6,           // 수평 도로
  ROAD_V: 13,          // 수직 도로
  ROAD_CORNER_TL: 1,   // 좌상단 코너
  ROAD_CORNER_TR: 3,   // 우상단 코너
  ROAD_CORNER_BL: 17,  // 좌하단 코너
  ROAD_CORNER_BR: 19,  // 우하단 코너
  ROAD_T_UP: 2,        // T자 위
  ROAD_T_DOWN: 18,     // T자 아래
  ROAD_T_LEFT: 9,      // T자 좌
  ROAD_T_RIGHT: 11,    // T자 우
  ROAD_CROSS: 10,      // 십자
  // 도로-잔디 경계
  ROAD_EDGE_TOP: 25,
  ROAD_EDGE_BOTTOM: 41,
  ROAD_EDGE_LEFT: 33,
  ROAD_EDGE_RIGHT: 35,
} as const;

// ============================================
// 타일 가중치 (기본 잔디 영역용)
// ============================================
export const TileWeights: Record<number, number> = {
  // 순수 잔디 타일 (38번) - 100%
  38: 100,
};

// ============================================
// 오브젝트 배치 규칙
// ============================================
export const ObjectPlacement = {
  // 나무: 맵 가장자리와 랜덤 위치에 배치 (충돌 있음)
  // 엘더우드 - 숲이 울창한 느낌
  tree: {
    density: 0.06, // 타일당 배치 확률 (3배 증가)
    collision: true,
    collisionRadius: 20,
    minDistance: 100, // 나무 간 최소 거리 (줄임)
    edgeBias: 0.4, // 전체적으로 분포
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
  
  // 풀: 밀집 장식 (충돌 없음) - 마법의 숲 느낌을 위해 밀도 증가
  grass: {
    density: 0.15,
    collision: false,
    minDistance: 15,
    edgeBias: 0.1,
    depth: 0, // 바닥 레이어
    estimatedSize: { width: 16, height: 16 },
  },

  // river_tileset 풀: 추가 장식 (충돌 없음)
  riverGrass: {
    density: 0.12,
    collision: false,
    minDistance: 18,
    edgeBias: 0.1,
    depth: 0,
    estimatedSize: { width: 16, height: 16 },
  },

  // 꽃: 장식용 (충돌 없음) - 밀도 증가
  flower: {
    density: 0.06,
    collision: false,
    minDistance: 25,
    edgeBias: 0.15,
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

  return TileId.GRASS;
}

/**
 * 시드 기반 랜덤 (일관된 맵 생성용)
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * 도로 경로 생성 (연결된 길)
 * 맵 중앙에서 사방으로 뻗어나가는 도로
 */
function generateRoadPaths(seed: number, tilesX: number, tilesY: number): Set<string> {
  const roadTiles = new Set<string>();
  const centerX = Math.floor(tilesX / 2);
  const centerY = Math.floor(tilesY / 2);

  // 중앙에서 시작하는 4개의 주요 도로
  const directions = [
    { dx: 1, dy: 0 },   // 동
    { dx: -1, dy: 0 },  // 서
    { dx: 0, dy: 1 },   // 남
    { dx: 0, dy: -1 },  // 북
  ];

  // 각 방향으로 구불구불한 도로 생성
  for (let i = 0; i < directions.length; i++) {
    const dir = directions[i];
    let x = centerX;
    let y = centerY;
    let pathSeed = seed + i * 1000;

    // 도로 길이 (40-60 타일)
    const length = 40 + Math.floor(seededRandom(pathSeed) * 20);

    for (let step = 0; step < length; step++) {
      // 현재 위치에 도로 타일 추가 (3타일 폭)
      for (let w = -1; w <= 1; w++) {
        const roadX = x + (dir.dy !== 0 ? w : 0);
        const roadY = y + (dir.dx !== 0 ? w : 0);
        if (roadX >= 0 && roadX < tilesX && roadY >= 0 && roadY < tilesY) {
          roadTiles.add(`${roadX},${roadY}`);
        }
      }

      // 다음 위치로 이동 (약간의 구불거림)
      x += dir.dx;
      y += dir.dy;

      // 가끔 옆으로 휘어짐 (20% 확률)
      if (seededRandom(pathSeed + step) < 0.2) {
        if (dir.dx !== 0) {
          y += seededRandom(pathSeed + step + 0.5) > 0.5 ? 1 : -1;
        } else {
          x += seededRandom(pathSeed + step + 0.5) > 0.5 ? 1 : -1;
        }
      }

      // 경계 체크
      x = Math.max(3, Math.min(tilesX - 4, x));
      y = Math.max(3, Math.min(tilesY - 4, y));
    }
  }

  // 분기 도로 추가 (주요 도로에서 갈라지는 작은 길)
  const roadArray = Array.from(roadTiles);
  for (let i = 0; i < 8; i++) {
    const branchSeed = seed + 5000 + i * 500;
    const startIdx = Math.floor(seededRandom(branchSeed) * roadArray.length);
    const [startX, startY] = roadArray[startIdx].split(',').map(Number);

    // 랜덤 방향
    const angle = seededRandom(branchSeed + 1) * Math.PI * 2;
    let bx = startX;
    let by = startY;
    const branchLength = 15 + Math.floor(seededRandom(branchSeed + 2) * 15);

    for (let step = 0; step < branchLength; step++) {
      // 2타일 폭
      for (let w = 0; w <= 1; w++) {
        const roadX = bx + (Math.abs(Math.cos(angle)) > 0.5 ? 0 : w);
        const roadY = by + (Math.abs(Math.sin(angle)) > 0.5 ? 0 : w);
        if (roadX >= 0 && roadX < tilesX && roadY >= 0 && roadY < tilesY) {
          roadTiles.add(`${roadX},${roadY}`);
        }
      }

      bx += Math.round(Math.cos(angle));
      by += Math.round(Math.sin(angle));

      // 경계 체크
      if (bx < 2 || bx >= tilesX - 2 || by < 2 || by >= tilesY - 2) break;
    }
  }

  return roadTiles;
}

/**
 * 도로 타일에 적절한 타일 ID 결정 (주변 타일 기반)
 */
function getRoadTileId(x: number, y: number, roadTiles: Set<string>): number {
  const hasTop = roadTiles.has(`${x},${y - 1}`);
  const hasBottom = roadTiles.has(`${x},${y + 1}`);
  const hasLeft = roadTiles.has(`${x - 1},${y}`);
  const hasRight = roadTiles.has(`${x + 1},${y}`);

  // 연결 수에 따라 타일 결정
  const connections = [hasTop, hasBottom, hasLeft, hasRight].filter(Boolean).length;

  if (connections === 4) return TileId.ROAD_CROSS;
  if (connections === 3) {
    if (!hasTop) return TileId.ROAD_T_DOWN;
    if (!hasBottom) return TileId.ROAD_T_UP;
    if (!hasLeft) return TileId.ROAD_T_RIGHT;
    return TileId.ROAD_T_LEFT;
  }
  if (connections === 2) {
    if (hasTop && hasBottom) return TileId.ROAD_V;
    if (hasLeft && hasRight) return TileId.ROAD_H;
    if (hasTop && hasRight) return TileId.ROAD_CORNER_BL;
    if (hasTop && hasLeft) return TileId.ROAD_CORNER_BR;
    if (hasBottom && hasRight) return TileId.ROAD_CORNER_TL;
    if (hasBottom && hasLeft) return TileId.ROAD_CORNER_TR;
  }
  if (connections === 1) {
    if (hasTop || hasBottom) return TileId.ROAD_V;
    return TileId.ROAD_H;
  }

  return TileId.ROAD_CENTER;
}

/**
 * 바닥 타일맵 생성
 * 2D 배열 반환 (Phaser Tilemap 호환)
 * 전부 잔디로 구성
 */
export function generateGroundTilemap(seed = 12345): number[][] {
  const { tilesX, tilesY } = MapConfig;
  const tilemap: number[][] = [];

  for (let y = 0; y < tilesY; y++) {
    const row: number[] = [];
    for (let x = 0; x < tilesX; x++) {
      // 전부 잔디 타일
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
    'tree', 'stone', 'bush', 'grass', 'riverGrass', 'flower', 'log'
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

// 연못 타일 ID (river_tileset 기준)
// 8x8 그리드에서 잔디-물 경계 타일
const PondTileId = {
  // 외곽 코너 (잔디→물, 바깥쪽 둥근 코너)
  CORNER_TL: 1,   // 좌상단 외곽 코너
  CORNER_TR: 3,   // 우상단 외곽 코너
  CORNER_BL: 17,  // 좌하단 외곽 코너
  CORNER_BR: 19,  // 우하단 외곽 코너
  // 가장자리
  EDGE_TOP: 2,    // 상단 가장자리
  EDGE_BOTTOM: 18, // 하단 가장자리
  EDGE_LEFT: 9,   // 좌측 가장자리
  EDGE_RIGHT: 11, // 우측 가장자리
  // 내부 코너 (물→잔디, 안쪽 둥근 코너)
  INNER_TL: 4,    // 좌상단 내부 코너
  INNER_TR: 5,    // 우상단 내부 코너
  INNER_BL: 12,   // 좌하단 내부 코너
  INNER_BR: 13,   // 우하단 내부 코너
  // 중앙 물 타일들 (변형)
  WATER_1: 10,    // 기본 물
  WATER_2: 33,    // 물 변형 1
  WATER_3: 34,    // 물 변형 2
  WATER_4: 41,    // 물 변형 3
  WATER_5: 42,    // 물 변형 4
} as const;

/**
 * 연못 생성 (2개, 자연스러운 불규칙 형태)
 * river_tileset의 물 타일 사용
 */
export function generatePonds(seed = 12345): PondData[] {
  const ponds: PondData[] = [];
  const { spawnX, spawnY, safeZoneRadius } = MapConfig;

  // 연못 위치 (맵의 대각선 위치에 배치)
  const pondPositions = [
    { x: 600, y: 600 },    // 좌상단
    { x: 2600, y: 2600 },  // 우하단
  ];

  for (let i = 0; i < pondPositions.length; i++) {
    const pos = pondPositions[i];

    // 안전 구역 체크
    const dx = pos.x - spawnX;
    const dy = pos.y - spawnY;
    if (Math.sqrt(dx * dx + dy * dy) < safeZoneRadius + 100) continue;

    const pondSeed = seed + i * 1000;

    // 불규칙한 연못 형태 생성 (노이즈 기반)
    const baseWidth = 6 + Math.floor(seededRandom(pondSeed) * 3);  // 6-8
    const baseHeight = 5 + Math.floor(seededRandom(pondSeed + 1) * 3); // 5-7

    // 연못 마스크 생성 (어느 타일이 물인지)
    const pondMask: boolean[][] = [];
    for (let py = 0; py < baseHeight + 2; py++) {
      pondMask[py] = [];
      for (let px = 0; px < baseWidth + 2; px++) {
        // 기본 타원형 + 노이즈로 불규칙하게
        const centerX = (baseWidth + 2) / 2;
        const centerY = (baseHeight + 2) / 2;
        const normalX = (px - centerX) / (baseWidth / 2);
        const normalY = (py - centerY) / (baseHeight / 2);
        const dist = normalX * normalX + normalY * normalY;

        // 노이즈 추가
        const noise = seededRandom(pondSeed + py * 100 + px) * 0.4 - 0.2;

        pondMask[py][px] = dist + noise < 1.0;
      }
    }

    const tiles: { x: number; y: number; tileId: number }[] = [];

    // 타일 배치
    for (let py = 0; py < baseHeight + 2; py++) {
      for (let px = 0; px < baseWidth + 2; px++) {
        if (!pondMask[py][px]) continue;

        const tileX = pos.x + px * 32;
        const tileY = pos.y + py * 32;

        // 주변 타일 체크
        const hasTop = py > 0 && pondMask[py - 1]?.[px];
        const hasBottom = py < baseHeight + 1 && pondMask[py + 1]?.[px];
        const hasLeft = px > 0 && pondMask[py]?.[px - 1];
        const hasRight = px < baseWidth + 1 && pondMask[py]?.[px + 1];
        const hasTL = py > 0 && px > 0 && pondMask[py - 1]?.[px - 1];
        const hasTR = py > 0 && px < baseWidth + 1 && pondMask[py - 1]?.[px + 1];
        const hasBL = py < baseHeight + 1 && px > 0 && pondMask[py + 1]?.[px - 1];
        const hasBR = py < baseHeight + 1 && px < baseWidth + 1 && pondMask[py + 1]?.[px + 1];

        let tileId: number = PondTileId.WATER_1;

        // 외곽 코너
        if (!hasTop && !hasLeft && hasBottom && hasRight) {
          tileId = PondTileId.CORNER_TL;
        } else if (!hasTop && !hasRight && hasBottom && hasLeft) {
          tileId = PondTileId.CORNER_TR;
        } else if (!hasBottom && !hasLeft && hasTop && hasRight) {
          tileId = PondTileId.CORNER_BL;
        } else if (!hasBottom && !hasRight && hasTop && hasLeft) {
          tileId = PondTileId.CORNER_BR;
        }
        // 가장자리
        else if (!hasTop && hasBottom) {
          tileId = PondTileId.EDGE_TOP;
        } else if (!hasBottom && hasTop) {
          tileId = PondTileId.EDGE_BOTTOM;
        } else if (!hasLeft && hasRight) {
          tileId = PondTileId.EDGE_LEFT;
        } else if (!hasRight && hasLeft) {
          tileId = PondTileId.EDGE_RIGHT;
        }
        // 내부 코너 (대각선 체크)
        else if (hasTop && hasLeft && hasBottom && hasRight) {
          if (!hasTL) tileId = PondTileId.INNER_TL;
          else if (!hasTR) tileId = PondTileId.INNER_TR;
          else if (!hasBL) tileId = PondTileId.INNER_BL;
          else if (!hasBR) tileId = PondTileId.INNER_BR;
          else {
            // 중앙 물 - 랜덤 변형
            const waterVariants = [
              PondTileId.WATER_1, PondTileId.WATER_1, PondTileId.WATER_1,
              PondTileId.WATER_2, PondTileId.WATER_3,
              PondTileId.WATER_4, PondTileId.WATER_5,
            ];
            const variantIdx = Math.floor(seededRandom(pondSeed + py * 50 + px) * waterVariants.length);
            tileId = waterVariants[variantIdx];
          }
        }

        tiles.push({ x: tileX, y: tileY, tileId });
      }
    }

    // 실제 연못 크기 계산
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const tile of tiles) {
      minX = Math.min(minX, tile.x);
      maxX = Math.max(maxX, tile.x);
      minY = Math.min(minY, tile.y);
      maxY = Math.max(maxY, tile.y);
    }

    ponds.push({
      id: `pond_${i}`,
      x: minX,
      y: minY,
      width: Math.ceil((maxX - minX) / 32) + 1,
      height: Math.ceil((maxY - minY) / 32) + 1,
      tiles,
    });
  }

  return ponds;
}

// ============================================
// Phaser 4 호환 맵 데이터 구조
// ============================================
export interface VampireSurvivorsMapData {
  config: typeof MapConfig;
  groundTilemap: number[][];
  objects: MapObject[];
  ponds: PondData[];
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
    ponds: generatePonds(seed),
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
