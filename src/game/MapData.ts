/**
 * 맵 시스템 - 3개의 맵 정의
 */

export enum MapType {
  Elderwood = 'elderwood',
  Moonlit = 'moonlit',
  Starfall = 'starfall',
}

export interface MapDefinition {
  id: MapType;
  name: string;
  description: string;
  backgroundColor: number;
}

export const MAP_DEFINITIONS: Record<MapType, MapDefinition> = {
  [MapType.Elderwood]: {
    id: MapType.Elderwood,
    name: 'Elderwood Vale',
    description: '고대 마법이 깃든 신비로운 숲',
    backgroundColor: 0x5a7d3a,
  },
  [MapType.Moonlit]: {
    id: MapType.Moonlit,
    name: 'Moonlit Thicket',
    description: '달빛이 비추는 마법의 덤불숲',
    backgroundColor: 0x4a6d2a,
  },
  [MapType.Starfall]: {
    id: MapType.Starfall,
    name: 'Starfall Grove',
    description: '별이 떨어지는 마법사의 숲',
    backgroundColor: 0x6a8d4a,
  },
};

export const DEFAULT_MAP = MapType.Elderwood;
