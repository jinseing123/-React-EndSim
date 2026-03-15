// operatorData를 받아서 json파일들에 접근 후, operatorData에 존재하는 정보뿐만 아니라 그 외 관련 정보(장비 스탯, 장비 옵션, 세트효과, 공격력, 스탯, 음식 등)를 반환하는 함수
// utils/resolveOperator.ts

import charactersData from '../data/characters.json';
import armorsData from '../data/equipments/armors.json';
import glovesData from '../data/equipments/gloves.json';
import partsData from '../data/equipments/parts.json';
import weaponsData from '../data/weapons.json';
import foodsData from '../data/foods.json';
import equipmentSetsData from '../data/equipments/equipmentSets.json';
import type { OperatorData } from '../types/index';

export function resolveOperator(op: OperatorData) {
    const character = charactersData.find(c => c.id === op.characterId);

    // 스탯 계산
    const getStatValue = (name: string) => {
        const stat = character?.stats.find(s => s.name === name);
        return stat ? stat.values[op.operatorLevel] : 0;
    };

    // 장비 조회
    const findEquip = (data: any[], id: string | null): any | null => {
        if (!id) return null;
        for (const group of data) {
            const item = group.equips.find((e: any) => e.id === id);
            if (item) return { ...item, setName: group.setName };
        }
        return null;
    };
    const armor = findEquip(armorsData, op.equipment.armor);
    const glove = findEquip(glovesData, op.equipment.glove);
    const part1 = findEquip(partsData, op.equipment.part1);
    const part2 = findEquip(partsData, op.equipment.part2);

    // 세트효과 계산
    const setCountMap: Record<string, number> = {};
    for (const item of [armor, glove, part1, part2]) {
        if (item?.setName) setCountMap[item.setName] = (setCountMap[item.setName] || 0) + 1;
    }
    const activeSetEffects = Object.entries(setCountMap)
        .filter(([, count]) => count >= 3)
        .flatMap(([setName]) => {
            const set = equipmentSetsData.find(s => s.name === setName);
            return set?.options.flatMap(opt =>
                opt.effects.map(e => ({ target: opt.target, ...e }))
            ) ?? [];
        });

    // 무기/음식
    const weapon = weaponsData.find(w => w.id === op.weaponId);
    const food = foodsData.find(f => f.id === op.foodId);

    return {
        raw: op,                  // 원본 operatorData
        character,                // 캐릭터 전체 정보 (이미지 포함)
        stats: {
            atk: getStatValue('공격력'),
            str: getStatValue('힘'),
            dex: getStatValue('민첩'),
            int: getStatValue('지능'),
            wil: getStatValue('의지'),
        },
        equipment: { armor, glove, part1, part2 },
        activeSetEffects,         // 평탄화된 세트효과 목록
        weapon,
        food,
    };
}