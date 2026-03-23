// utils/resolveOperator.ts
//
// 모든 버프 처리 방식 통일:
//   - buffs: 스킬 레벨에 따른 고정값
//   - conditional-buffs: 특정 조건(BattleContext 값)에 따라 value * 조건값
//   - talent-buffs: 특수 조건에 따른 버프 (if문으로 분기)
//   - potentials: 돌파 레벨에 따라 적용되는 추가 버프 (if문으로 분기)
//
// 각 버프는 trigger 문자열을 보고 if문으로 분기하여 처리
// 구체적인 연산 로직은 TODO 주석으로 표시 (향후 구현)

import charactersData from '../data/characters.json';
import armorsData from '../data/equipments/armors.json';
import glovesData from '../data/equipments/gloves.json';
import partsData from '../data/equipments/parts.json';
import weaponsData from '../data/weapons.json';
import foodsData from '../data/foods.json';
import equipmentSetsData from '../data/equipments/equipmentSets.json';
import type { OperatorData, BattleContext } from '../types/index';

export type StatTotals = Record<string, number>;

// target 상수
const TARGET_SELF = new Set(['자신', '파티']);
const TARGET_PARTY = new Set(['파티', '자신을 제외한 파티']);

function addStat(totals: StatTotals, type: string, value: number) {
    totals[type] = (totals[type] ?? 0) + value;
}

function findEquipment(data: any[], id: string | null): any | null {
    if (!id) return null;
    for (const group of data) {
        const item = group.equips?.find((e: any) => e.id === id);
        if (item) return { ...item, setName: group.setName };
    }
    return null;
}

// ============================================================================
// 캐릭터 버프 처리 (buffs + conditional-buffs + talent-buffs + potentials 통합)
// ============================================================================
function applyCharacterBuffs(
    totals: StatTotals,
    character: any,
    skillLevels: [number, number, number, number],
    breakthrough: number,
    context: BattleContext,
    targetFilter: Set<string>
) {
    if (!character) return;

    // ========================================================================
    // 1. skill-buffs (스킬 레벨 기반 고정값)
    // ========================================================================
    for (const buff of (character['skill-buffs'] ?? [])) {
        if (!targetFilter.has(buff.target)) continue; // 타겟 대상에 따라 필터링

        const levelIdx = skillLevels[SKILL_KEY_MAP[buff.trigger]] - 1;
        const value = (buff.value as number[])[levelIdx] ?? 0;
        addStat(totals, buff.type, value);
    }

    // ========================================================================
    // 2. conditional-buffs (BattleContext 조건값 * 버프값)
    //    trigger 형식: '<스킬타입>-<조건명>'
    // ========================================================================
    for (const buff of (character['conditional-buffs'] ?? [])) {
        if (!targetFilter.has(buff.target)) continue;

        const trigger = buff.trigger as string;
        const value = buff.value ?? 0;

        // 조건에 따른 연산 (if문으로 분기)
        if (trigger === '질베르타-ultimate-방어불능') {
            const defenseBreak = context.defenseBreak;
            const levelIdx = skillLevels[SKILL_KEY_MAP['ultimate']] - 1;
            const baseValue = value[levelIdx];

            addStat(totals, buff.type, baseValue * defenseBreak);
        }
        // TODO: 아츠이상 조건 추가 (연소, 감전, 부식, 동결)
        else if (trigger === '추가예정') {
            // const multiplier = context.artsAbnormal.연소;
            // addStat(totals, buff.type, baseValue * multiplier);
        }
        // TODO: 새로운 조건 추가 시 여기에 else if 추가
    }

    // ========================================================================
    // 3. talent-buffs (특수 조건 기반, if문으로 분기)
    //    trigger 형식: '<캐릭터id>-<스킬타입>-<조건>' 등 다양함
    // ========================================================================
    for (const buff of (character['talent-buffs'] ?? [])) {
        if (!targetFilter.has(buff.target)) continue;

        const trigger = buff.trigger as string;
        const value = buff.value ?? 0;


        // TODO: 새로운 talent-buff 추가 시 여기에 else if 추가
    }

    // ========================================================================
    // 4. potentials (돌파 레벨에 따라 적용, if문으로 분기)
    //    돌파 레벨이 potential-level 이상일 때 적용
    // ========================================================================
    for (const potential of (character.potentials ?? [])) {
        // 돌파 레벨 체크
        if (breakthrough < potential['potential-level']) continue;
        if (!targetFilter.has(potential.target)) continue;

        const trigger = potential.trigger as string;
        const value = potential.value ?? 0;


        if (trigger === '질베르타-ultimate-potential') {
            const defenseBreak = context.defenseBreak;
            const levelIdx = skillLevels[SKILL_KEY_MAP['ultimate']] - 1;
            const baseValue = value[levelIdx];

            addStat(totals, potential.type, baseValue * defenseBreak);

            // 방어불능 +1스택 취급 효과
            if(defenseBreak < 4) {
                addStat(totals, potential.type, baseValue * 2);
            }
        }
        else if (trigger === '미완성') {
            // 예: addStat(totals, buff.type, value);
        }
    }
}

// 스킬 타입 → 인덱스 매핑
const SKILL_KEY_MAP: Record<string, number> = {
    normal: 0,
    battle: 1,
    combo: 2,
    ultimate: 3,
};

// ============================================================================
// 메인 함수
// ============================================================================
export function resolveOperator(
    op: OperatorData,
    context: BattleContext,
    partyMembers?: OperatorData[]
) {
    const character = charactersData.find(c => c.id === op.characterId);
    const totals: StatTotals = {};

    // ========================================================================
    // 1. 캐릭터 기본 스탯 (레벨 기반)
    // ========================================================================
    if (character) {
        for (const stat of character.stats) {
            addStat(totals, stat.type, stat.values[op.operatorLevel] ?? 0);
        }
    }

    // ========================================================================
    // 2. 캐릭터 버프 (자신 대상)
    // ========================================================================
    if (character) {
        applyCharacterBuffs(totals, character, op.skillLevels, op.breakthrough, context, TARGET_SELF);
    }

    // ========================================================================
    // 3. 장비 stats + options
    // ========================================================================
    const armor = findEquipment(armorsData, op.equipment.armor);
    const glove = findEquipment(glovesData, op.equipment.glove);
    const part1 = findEquipment(partsData, op.equipment.part1);
    const part2 = findEquipment(partsData, op.equipment.part2);

    const equipEntries = [
        { item: armor, forgeKey: 'armor' as const },
        { item: glove, forgeKey: 'glove' as const },
        { item: part1, forgeKey: 'part1' as const },
        { item: part2, forgeKey: 'part2' as const },
    ];

    for (const { item, forgeKey } of equipEntries) {
        if (!item) continue;
        const forge = op.equipmentForge[forgeKey];

        // 스탯
        if (item.stats?.[0]) addStat(totals, item.stats[0].type, item.stats[0].values[forge.stat1] ?? 0);
        if (item.stats?.[1]) addStat(totals, item.stats[1].type, item.stats[1].values[forge.stat2] ?? 0);

        // 옵션
        for (const opt of (item.options ?? [])) {
            if (opt.target !== undefined && !TARGET_SELF.has(opt.target)) continue;
            addStat(totals, opt.type, opt.values[forge.option] ?? 0);
        }
    }

    // ========================================================================
    // 4. 장비 세트효과 (3개 이상 장착 시)
    // ========================================================================
    const setCountMap: Record<string, number> = {};
    for (const item of [armor, glove, part1, part2]) {
        if (item?.setName) setCountMap[item.setName] = (setCountMap[item.setName] || 0) + 1;
    }

    for (const [setName, count] of Object.entries(setCountMap)) {
        if (count < 3) continue;
        const setEffect = equipmentSetsData.find(s => s.name === setName);
        if (!setEffect) continue;

        for (const opt of setEffect.options) {
            for (const effect of opt.effects) {
                if (TARGET_SELF.has(opt.target)) {
                    addStat(totals, effect.type, effect.value);
                }
            }
        }
    }

    // ========================================================================
    // 5. 무기
    // ========================================================================
    const weapon = weaponsData.find(w => w.id === op.weaponId);
    if (weapon) {
        addStat(totals, 'WEAPON_ATK', weapon.attack);

        weapon.options.forEach((opt, idx) => {
            const tempLevel = Math.max(0, (op.temperaments[idx] ?? 1) - 1);
            for (const effect of opt.effects) {
                if (effect.target !== undefined && !TARGET_SELF.has(effect.target)) continue;
                addStat(totals, effect.type, effect.values[tempLevel] ?? 0);
            }
        });
    }

    // ========================================================================
    // 6. 음식
    // ========================================================================
    const food = foodsData.find(f => f.id === op.foodId);
    if (food) {
        for (const effect of food.effects) {
            addStat(totals, effect.type, effect.value);
        }
    }

    // ========================================================================
    // 7. 파티원 버프 (중복 방지)
    // ========================================================================
    const appliedSources = new Set<string>();

    for (const member of (partyMembers ?? [])) {
        if (!member.characterId) continue;

        const memberChar = charactersData.find(c => c.id === member.characterId);

        // 파티원 캐릭터 버프 (파티 대상)
        if (memberChar) {
            applyCharacterBuffs(totals, memberChar, member.skillLevels, member.breakthrough, context, TARGET_PARTY);
        }

        // 파티원 장비 세트효과 (중복 방지)
        const mArmor = findEquipment(armorsData, member.equipment.armor);
        const mGlove = findEquipment(glovesData, member.equipment.glove);
        const mPart1 = findEquipment(partsData, member.equipment.part1);
        const mPart2 = findEquipment(partsData, member.equipment.part2);

        const mSetCountMap: Record<string, number> = {};
        for (const item of [mArmor, mGlove, mPart1, mPart2]) {
            if (item?.setName) mSetCountMap[item.setName] = (mSetCountMap[item.setName] || 0) + 1;
        }

        for (const [setName, count] of Object.entries(mSetCountMap)) {
            if (count < 3) continue;
            const sourceKey = `set:${setName}`;
            if (appliedSources.has(sourceKey)) continue;
            appliedSources.add(sourceKey);

            const setEffect = equipmentSetsData.find(s => s.name === setName);
            if (!setEffect) continue;

            for (const opt of setEffect.options) {
                for (const effect of opt.effects) {
                    if (TARGET_PARTY.has(opt.target)) {
                        addStat(totals, effect.type, effect.value);
                    }
                }
            }
        }

        // 파티원 무기 옵션 (중복 방지)
        const memberWeapon = weaponsData.find(w => w.id === member.weaponId);
        if (memberWeapon) {
            memberWeapon.options.forEach((opt, idx) => {
                const sourceKey = `weapon:${memberWeapon.id}:${opt.optionName}`;
                if (appliedSources.has(sourceKey)) return;
                appliedSources.add(sourceKey);

                const tempLevel = Math.max(0, (member.temperaments[idx] ?? 1) - 1);
                for (const effect of opt.effects) {
                    if (!TARGET_PARTY.has(effect.target)) continue;
                    addStat(totals, effect.type, effect.values[tempLevel] ?? 0);
                }
            });
        }
    }

    // ========================================================================
    // 8. 최종 능력치 계산 (MAIN_STAT / SUB_STAT 배율)
    // ========================================================================
    const mainStatType = character?.['main-stat']?.type ?? '';
    const subStatType = character?.['sub-stat']?.type ?? '';
    const mainStatMult = 1 + (totals['MAIN_STAT'] ?? 0) / 100;
    const subStatMult = 1 + (totals['SUB_STAT'] ?? 0) / 100;

    const SCALED_STAT_TYPES = ['STR', 'DEX', 'INT', 'WILL', 'ARTS_INTENSITY', 'CRIT_CHANCE'];

    for (const statType of SCALED_STAT_TYPES) {
        const raw = totals[statType] ?? 0;
        let mult = 1;
        if (statType === mainStatType) mult = mainStatMult;
        else if (statType === subStatType) mult = subStatMult;
        totals[`FINAL_${statType}`] = Math.round(raw * mult);
    }

    // ========================================================================
    // 9. 최종 공격력 계산
    // ========================================================================
    const operatorAtk = totals['OPERATOR_ATK'] ?? 0;
    const weaponAtk = totals['WEAPON_ATK'] ?? 0;
    const atkPercent = totals['ATK_PERCENT'] ?? 0;
    const atkConst = totals['ATK_CONST'] ?? 0;

    const mainStatFinal = totals[`FINAL_${mainStatType}`] ?? totals[mainStatType] ?? 0;
    const subStatFinal = totals[`FINAL_${subStatType}`] ?? totals[subStatType] ?? 0;

    const finalAtk = Math.round(
        ((operatorAtk + weaponAtk) * (100 + atkPercent) / 100 + atkConst)
        * (1 + mainStatFinal * 0.005 + subStatFinal * 0.002)
    );
    totals['FINAL_ATK'] = finalAtk;

    return {
        raw: op,
        character,
        equipment: { armor, glove, part1, part2 },
        weapon,
        food,
        totals,
    };
}