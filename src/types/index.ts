// src/types/index.ts

// 아츠이상 타입 열거형
export type ArtsAbnormalType = '연소' | '감전' | '부식' | '동결' | null;

// 전투 상황값 인터페이스
export interface BattleContext {
  imbalanceState: boolean;
  defenseBreak: number;           // 방어불능 단계 (0-4)
  artsType: number;               // 아츠부착 타입 (0:열기, 1:냉기, 2:전기, 3:자연)
  artsLevel: number;              // 아츠부착 단계 (0-4)
  artsAbnormal: {
    연소: number;
    감전: number;
    부식: number;
    동결: number;
  };
  artsAbnormalParty: {
    연소: number;
    감전: number;
    부식: number;
    동결: number;
  };
}

// 오퍼레이터 데이터 인터페이스
export interface OperatorData {
  characterId: string | null;
  operatorLevel: number;
  breakthrough: number;
  skillLevels: [number, number, number, number];
  equipment: {
    armor: string | null;
    glove: string | null;
    part1: string | null;
    part2: string | null;
  };
  equipmentForge: {
    armor: { stat1: number; stat2: number; option: number };
    glove: { stat1: number; stat2: number; option: number };
    part1: { stat1: number; stat2: number; option: number };
    part2: { stat1: number; stat2: number; option: number };
  };
  weaponId: string | null;
  temperaments: [number, number, number];
  foodId: string | null;
}