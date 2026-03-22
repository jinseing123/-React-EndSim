// utils/resolveOperator.ts
//
// [설계 원칙]
//   모든 소스(캐릭터, 장비, 무기 등)의 effect에 target 필드가 있으며,
//   이를 기준으로 메인 오퍼레이터에게 적용할지 판단한다.
//
//   - target === '자신'               → 해당 오퍼레이터 자신에게만 적용
//   - target === '파티'               → 파티 전원에게 적용 (자신 포함)
//   - target === '자신을 제외한 파티'  → 자신을 제외한 파티원에게 적용
//
//   메인 오퍼레이터 totals 합산 규칙:
//     · 메인 오퍼레이터 소스: target === '자신' 또는 '파티' 인 것
//     · 파티원 소스:          target === '파티' 또는 '자신을 제외한 파티' 인 것
//
// [conditional-buffs 처리]
//   trigger 형식: '<스킬타입>-<조건명>' (예: 'ultimate-방어불능')
//   계산: value[skillLevelIdx] * BattleContext의 해당 조건값
//   새로운 조건이 생기면 CONDITION_VALUE_GETTER 맵에만 추가.

import charactersData from '../data/characters.json';
import armorsData from '../data/equipments/armors.json';
import glovesData from '../data/equipments/gloves.json';
import partsData from '../data/equipments/parts.json';
import weaponsData from '../data/weapons.json';
import foodsData from '../data/foods.json';
import equipmentSetsData from '../data/equipments/equipmentSets.json';
import type { OperatorData } from '../types/index';

// ─────────────────────────────────────────────────
// 모든 stat type을 키로 갖는 합산 레코드 타입.
// 새로운 type이 데이터에 추가되어도 코드 수정 없이 자동 처리됨.
// ─────────────────────────────────────────────────
export type StatTotals = Record<string, number>;

// ─────────────────────────────────────────────────
// 전투 상황값 인터페이스.
// MainOperatorSection의 상태값들을 담아 전달.
// 새로운 전투 상황이 생기면 여기에 필드 추가.
// ─────────────────────────────────────────────────
export interface BattleContext {
    defenseBreak: number;   // 방어불능 단계 (0~4)
    // 추후 확장 예시:
    // artsLevel: number;
    // imbalanceState: boolean;
}

// ─────────────────────────────────────────────────
// conditional-buffs 조건명 → BattleContext에서 값을 꺼내는 함수 맵.
// 새로운 조건이 생기면 여기에만 추가.
// ─────────────────────────────────────────────────
const CONDITION_VALUE_GETTER: Record<string, (ctx: BattleContext) => number> = {
    '방어불능': (ctx) => ctx.defenseBreak,
    // 추후 추가 예시:
    // '연소스택': (ctx) => ctx.artsLevel,
};

// target 값 상수
const SELF_TARGETS   = new Set(['자신', '파티']);           // 자신에게 적용되는 target
const PARTY_TARGETS  = new Set(['파티', '자신을 제외한 파티']); // 파티원에서 자신에게 오는 target

// totals 객체에 type 키로 value를 누적 합산하는 헬퍼
function addStat(totals: StatTotals, type: string, value: number) {
    totals[type] = (totals[type] ?? 0) + value;
}

// 장비 데이터에서 id로 아이템을 찾아 setName을 포함해 반환하는 헬퍼
function findEquip(data: any[], id: string | null): any | null {
    if (!id) return null;
    for (const group of data) {
        const item = group.equips.find((e: any) => e.id === id);
        if (item) return { ...item, setName: group.setName };
    }
    return null;
}

// trigger명 → skillLevels 배열 index 매핑
const SKILL_KEY_MAP: Record<string, number> = {
    normal: 0,
    battle: 1,
    combo: 2,
    ultimate: 3,
};

// ─────────────────────────────────────────────────
// 캐릭터 buffs + conditional-buffs를 totals에 합산하는 헬퍼.
// isSelf: true → SELF_TARGETS 체크, false → PARTY_TARGETS 체크
// ─────────────────────────────────────────────────
function applyCharacterBuffs(
    totals: StatTotals,
    character: any,
    skillLevels: [number, number, number, number],
    context: BattleContext,
    targetFilter: Set<string>
) {
    // 일반 buffs
    for (const buff of (character.buffs ?? [])) {
        if (!targetFilter.has(buff.target as string)) continue;
        const skillIdx = SKILL_KEY_MAP[buff.trigger as string];
        if (skillIdx === undefined) continue;
        const levelIdx = skillLevels[skillIdx] - 1;
        addStat(totals, buff.type, (buff.value as number[])[levelIdx] ?? 0);
    }

    // conditional-buffs
    for (const buff of (character['conditional-buffs'] ?? [])) {
        if (!targetFilter.has(buff.target as string)) continue;
        const triggerParts = (buff.trigger as string).split('-');
        if (triggerParts.length < 2) continue;

        const [skillKey, ...condParts] = triggerParts;
        const condition = condParts.join('-'); // 조건명에 '-'가 포함될 경우 대비
        const skillIdx = SKILL_KEY_MAP[skillKey];
        const getCondValue = CONDITION_VALUE_GETTER[condition];
        if (skillIdx === undefined || getCondValue === undefined) continue;

        const levelIdx = skillLevels[skillIdx] - 1;
        const baseValue = (buff.value as number[])[levelIdx] ?? 0;
        addStat(totals, buff.type, baseValue * getCondValue(context));
    }
}

// ─────────────────────────────────────────────────
// 장비 세트효과를 totals에 합산하는 헬퍼.
// ─────────────────────────────────────────────────
function applySetEffects(
    totals: StatTotals,
    items: (any | null)[],
    targetFilter: Set<string>
): { target: string; type: string; value: number; name: string }[] {
    const setCountMap: Record<string, number> = {};
    for (const item of items) {
        if (item?.setName) setCountMap[item.setName] = (setCountMap[item.setName] || 0) + 1;
    }

    const activeEffects = Object.entries(setCountMap)
        .filter(([, count]) => count >= 3)
        .flatMap(([setName]) => {
            const set = equipmentSetsData.find(s => s.name === setName);
            return set?.options.flatMap(opt =>
                opt.effects.map(e => ({ target: opt.target, ...e }))
            ) ?? [];
        });

    for (const effect of activeEffects) {
        if (targetFilter.has(effect.target)) {
            addStat(totals, effect.type, effect.value);
        }
    }

    return activeEffects; // 반환값은 메인 오퍼레이터의 경우 activeSetEffects로 활용
}

export function resolveOperator(
    op: OperatorData,
    context: BattleContext,
    partyMembers?: OperatorData[]
) {
    const character = charactersData.find(c => c.id === op.characterId);
    const totals: StatTotals = {};

    // ─────────────────────────────────────────────────
    // 1. 캐릭터 기본 스탯
    //    index = operatorLevel
    // ─────────────────────────────────────────────────
    if (character) {
        for (const stat of character.stats) {
            addStat(totals, stat.type, stat.values[op.operatorLevel] ?? 0);
        }
    }

    // ─────────────────────────────────────────────────
    // 2. 캐릭터 buffs + conditional-buffs (자신 대상)
    //    SELF_TARGETS: '자신', '파티'
    // ─────────────────────────────────────────────────
    if (character) {
        applyCharacterBuffs(totals, character, op.skillLevels, context, SELF_TARGETS);
    }

    // ─────────────────────────────────────────────────
    // 3. 장비 stats + options
    //    index = equipmentForge의 stat1 / stat2 / option (0-based)
    //    장비 stats에는 target 필드가 없으므로 무조건 합산.
    //    장비 options는 target 필드가 있으면 체크, 없으면 합산.
    // ─────────────────────────────────────────────────
    const armor = findEquip(armorsData, op.equipment.armor);
    const glove = findEquip(glovesData, op.equipment.glove);
    const part1 = findEquip(partsData, op.equipment.part1);
    const part2 = findEquip(partsData, op.equipment.part2);

    const equipEntries = [
        { item: armor, forgeKey: 'armor' as const },
        { item: glove, forgeKey: 'glove' as const },
        { item: part1, forgeKey: 'part1' as const },
        { item: part2, forgeKey: 'part2' as const },
    ];

    for (const { item, forgeKey } of equipEntries) {
        if (!item) continue;
        const forge = op.equipmentForge[forgeKey];

        // stats에는 target 없음 → 무조건 합산
        if (item.stats?.[0]) addStat(totals, item.stats[0].type, item.stats[0].values[forge.stat1] ?? 0);
        if (item.stats?.[1]) addStat(totals, item.stats[1].type, item.stats[1].values[forge.stat2] ?? 0);

        // options: target 있으면 SELF_TARGETS 체크, 없으면 합산
        for (const opt of (item.options ?? [])) {
            if (opt.target !== undefined && !SELF_TARGETS.has(opt.target)) continue;
            addStat(totals, opt.type, opt.values[forge.option] ?? 0);
        }
    }

    // ─────────────────────────────────────────────────
    // 4. 장비 세트효과 (자신 대상)
    //    SELF_TARGETS 필터 적용
    // ─────────────────────────────────────────────────
    const activeSetEffects = applySetEffects(totals, [armor, glove, part1, part2], SELF_TARGETS);

    // ─────────────────────────────────────────────────
    // 5. 무기
    //    무기 공격력 → WEAPON_ATK 키로 별도 저장 (target 없음)
    //    무기 옵션 effect → target 있으면 SELF_TARGETS 체크, 없으면 합산
    //    index = temperaments[optionIndex] (0-based)
    // ─────────────────────────────────────────────────
    const weapon = weaponsData.find(w => w.id === op.weaponId);

    if (weapon) {
        addStat(totals, 'WEAPON_ATK', weapon.attack);

        weapon.options.forEach((opt, optIdx) => {
            const tempLevel = Math.max(0, (op.temperaments?.[optIdx] ?? 1) - 1);
            for (const effect of opt.effects) {
                if ((effect as any).target !== undefined && !SELF_TARGETS.has((effect as any).target)) continue;
                addStat(totals, effect.type, effect.values[tempLevel] ?? 0);
            }
        });
    }

    // ─────────────────────────────────────────────────
    // 6. 음식 (고정값, target 없음)
    // ─────────────────────────────────────────────────
    const food = foodsData.find(f => f.id === op.foodId);

    if (food) {
        for (const effect of food.effects) {
            addStat(totals, effect.type, effect.value);
        }
    }

    // ─────────────────────────────────────────────────
    // 7. 파티원이 메인 오퍼레이터에게 주는 버프
    //    PARTY_TARGETS 필터: '파티', '자신을 제외한 파티'
    //    처리 대상:
    //      - 파티원 캐릭터 buffs + conditional-buffs
    //      - 파티원 장비 세트효과
    //      - 파티원 무기 옵션 effect
    // ─────────────────────────────────────────────────
    for (const member of (partyMembers ?? [])) {
        if (!member.characterId) continue;

        const memberChar = charactersData.find(c => c.id === member.characterId);

        // 파티원 캐릭터 buffs + conditional-buffs
        if (memberChar) {
            applyCharacterBuffs(totals, memberChar, member.skillLevels, context, PARTY_TARGETS);
        }

        // 파티원 장비 세트효과
        const mArmor = findEquip(armorsData, member.equipment.armor);
        const mGlove = findEquip(glovesData, member.equipment.glove);
        const mPart1 = findEquip(partsData, member.equipment.part1);
        const mPart2 = findEquip(partsData, member.equipment.part2);
        applySetEffects(totals, [mArmor, mGlove, mPart1, mPart2], PARTY_TARGETS);

        // 파티원 무기 옵션 effect
        const memberWeapon = weaponsData.find(w => w.id === member.weaponId);
        if (memberWeapon) {
            memberWeapon.options.forEach((opt, optIdx) => {
                const tempLevel = Math.max(0, (op.temperaments?.[optIdx] ?? 1) - 1);
                for (const effect of opt.effects) {
                    if (!PARTY_TARGETS.has((effect as any).target)) continue;
                    addStat(totals, effect.type, effect.values[tempLevel] ?? 0);
                }
            });
        }
    }

    // ─────────────────────────────────────────────────
    // 8. 능력치 최종값 계산 (MAIN_STAT / SUB_STAT 배율 적용)
    //
    //    캐릭터의 main-stat 타입인 능력치:
    //      최종값 = 합산값 * (1 + MAIN_STAT / 100)
    //    캐릭터의 sub-stat 타입인 능력치:
    //      최종값 = 합산값 * (1 + SUB_STAT / 100)
    //    그 외 능력치:
    //      최종값 = 합산값 그대로
    //
    //    MAIN_STAT / SUB_STAT 버프가 없으면(= 0) 배율 = 1 → 합산값과 동일.
    //    결과는 FINAL_{TYPE} 키로 totals에 저장.
    //
    //    대상 능력치: STR, DEX, INT, WILL, ARTS_INTENSITY, CRIT_CHANCE
    // ─────────────────────────────────────────────────
    const mainStatType = (character as any)?.['main-stat']?.type ?? '';
    const subStatType  = (character as any)?.['sub-stat']?.type  ?? '';
    const mainStatMult = 1 + (totals['MAIN_STAT'] ?? 0) / 100;
    const subStatMult  = 1 + (totals['SUB_STAT']  ?? 0) / 100;

    const SCALED_STAT_TYPES = ['STR', 'DEX', 'INT', 'WILL', 'ARTS_INTENSITY', 'CRIT_CHANCE'];

    for (const statType of SCALED_STAT_TYPES) {
        const raw = totals[statType] ?? 0;
        let mult = 1;
        if (statType === mainStatType) mult = mainStatMult;
        else if (statType === subStatType) mult = subStatMult;
        totals[`FINAL_${statType}`] = Math.round(raw * mult);
    }

    // ─────────────────────────────────────────────────
    // 9. 최종 공격력 계산
    //    공식: {(오퍼레이터 공격력 + 무기 공격력) * (100 + ATK_PERCENT) / 100 + ATK_CONST}
    //          * (1 + 메인스탯최종값 * 0.005 + 서브스탯최종값 * 0.002)
    // ─────────────────────────────────────────────────
    const operatorAtk = totals['OPERATOR_ATK'] ?? 0;
    const weaponAtk   = totals['WEAPON_ATK']   ?? 0;
    const atkPercent  = totals['ATK_PERCENT']  ?? 0;
    const atkConst    = totals['ATK_CONST']    ?? 0;

    // 최종 공격력 계산에는 FINAL_ 스탯값 사용
    const mainStatFinal = totals[`FINAL_${mainStatType}`] ?? totals[mainStatType] ?? 0;
    const subStatFinal  = totals[`FINAL_${subStatType}`]  ?? totals[subStatType]  ?? 0;

    const finalAtk = Math.round(
        ((operatorAtk + weaponAtk) * (100 + atkPercent) / 100 + atkConst)
        * (1 + mainStatFinal * 0.005 + subStatFinal * 0.002)
    );
    totals['FINAL_ATK'] = finalAtk;

    return {
        raw: op,
        character,
        equipment: { armor, glove, part1, part2 },
        activeSetEffects,   // 메인 오퍼레이터 세트효과 전체 (외부 활용용)
        weapon,
        food,
        totals,             // 모든 소스의 type별 합산값
    };
}
