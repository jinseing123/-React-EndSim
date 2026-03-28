import { BuffTotals } from './resolveOperator';
import { BattleContext } from '../types';

type SkillType = 'normal' | 'battle' | 'combo' | 'ultimate';

export interface DamageResult {
  normal: number;
  crit: number;
}

/**
 * 데미지 계산 로직
 * @param baseAtk 최종 공격력 (FINAL_ATK)
 * @param skillValue 스킬 계수 (damagePct, % 단위)
 * @param skillType 스킬 종류 (normal, battle, combo, ultimate)
 * @param skill 스킬 데이터 { property, 'replace-skill-dmg-type'? }
 * @param totals BuffTotals 객체
 * @param context BattleContext 객체
 */
export function calculateDamage(
  baseAtk: number,
  skillValue: number,
  skillType: SkillType,
  skill: { property: string; 'replace-skill-dmg-type'?: SkillType },
  totals: BuffTotals,
  context: BattleContext
): DamageResult {
  const getIncomingDamageIncrease = (): number => {
    let incoming = totals['INCOMING_ALL_DMG'] ?? 0;

    if (skill.property === '물리') {
      incoming += (totals['INCOMING_PHYSICAL_DMG'] ?? 0);
      incoming += (totals['INCOMING_PHYSIC_DMG'] ?? 0); // 오타 대응
      return incoming;
    }

    incoming += (totals['INCOMING_ARTS_DMG'] ?? 0);
    if (skill.property === '열기') incoming += (totals['INCOMING_FIRE_DMG'] ?? 0);
    if (skill.property === '전기') incoming += (totals['INCOMING_ELECTRIC_DMG'] ?? 0);
    if (skill.property === '자연') incoming += (totals['INCOMING_NATURE_DMG'] ?? 0);
    if (skill.property === '냉기') incoming += (totals['INCOMING_ICE_DMG'] ?? 0);

    return incoming;
  };

  // 1. 피해량 증가 버프 합산
  let dmgIncrease = 0;
  
  // 공통 피해 증가
  dmgIncrease += (totals['ALL_DMG'] ?? 0);
  
  // 스킬 내 replace-skill-dmg-type으로 skillType 대체 (예: 레바테인 궁극기 제1단계 → normal)
  const appliedSkillType = skill['replace-skill-dmg-type'] ?? skillType;
  
  // 공격 타입별 피해 증가
  if (appliedSkillType === 'normal') dmgIncrease += (totals['NORMAL_DMG'] ?? 0);
  if (appliedSkillType === 'battle') {
    dmgIncrease += (totals['BATTLE_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }
  if (appliedSkillType === 'combo') {
    dmgIncrease += (totals['COMBO_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }
  if (appliedSkillType === 'ultimate') {
    dmgIncrease += (totals['ULTIMATE_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }

  // 불균형 피해(STAGGER_DMG)는 공통 배율이 아니라 피해량 증가에 합산
  if (context.imbalanceState) {
    dmgIncrease += (totals['STAGGER_DMG'] ?? 0);
  }

  // 속성별 피해 증가
  if (skill.property === '물리') {
    dmgIncrease += (totals['PHYSICAL_DMG'] ?? 0);
    dmgIncrease += (totals['PHYSIC_DMG'] ?? 0); // 오타 대응
    if (skillType === 'battle') dmgIncrease += (totals['BATTLE_PHYSICAL_DMG'] ?? 0);
    if (skillType === 'ultimate') dmgIncrease += (totals['ULTIMATE_PHYSICAL_DMG'] ?? 0);
  } else {
    dmgIncrease += (totals['ARTS_DMG'] ?? 0);
    if (skill.property === '열기') dmgIncrease += (totals['FIRE_DMG'] ?? 0);
    if (skill.property === '전기') dmgIncrease += (totals['ELECTRIC_DMG'] ?? 0);
    if (skill.property === '자연') dmgIncrease += (totals['NATURE_DMG'] ?? 0);
    if (skill.property === '냉기') dmgIncrease += (totals['ICE_DMG'] ?? 0);
  }

  const dmgIncreaseMult = 1 + dmgIncrease / 100;

  // 2. 아츠이상 상태 버프 합산 (감전, 부식, 갑옷파괴)
  const shockBuff = totals['SHOCK_BUFF'] ?? 0;
  const corrosionBuff = totals['CORROSION_BUFF'] ?? 0;
  const armorBreakBuff = skill.property === '물리' ? (totals['ARMOR_BREAK_BUFF'] ?? 0) : 0;

  const artsAbnormalBuffMult = 1 + (shockBuff + corrosionBuff + armorBreakBuff) / 100;

  // 2-1. 받는 피해 증가 버프: INCOMING_*끼리는 합산, 다른 그룹과는 곱연산
  const incomingDamageMult = 1 + getIncomingDamageIncrease() / 100;

  // 3. 취약 버프 합산 (기존 취약 스탯만, 상태이상 제외)
  let vulnerability = 0;
  if (skill.property !== '물리') {
    vulnerability += (totals['ARTS_VULN'] ?? 0);
    if (skill.property === '열기') vulnerability += (totals['FIRE_VULN'] ?? 0);
    if (skill.property === '전기') vulnerability += (totals['ELECTRIC_VULN'] ?? 0);
    if (skill.property === '자연') vulnerability += (totals['NATURE_VULN'] ?? 0);
    if (skill.property === '냉기') vulnerability += (totals['ICE_VULN'] ?? 0);
  }
  const vulnerabilityMult = 1 + vulnerability / 100;

  // 3. 증폭 버프 합산
  let amplification = 0;
  if (skill.property !== '물리') {
    amplification += (totals['ARTS_AMP'] ?? 0);
    if (skill.property === '열기') amplification += (totals['FIRE_AMP'] ?? 0);
    if (skill.property === '전기') amplification += (totals['ELECTRIC_AMP'] ?? 0);
    if (skill.property === '자연') amplification += (totals['NATURE_AMP'] ?? 0);
    if (skill.property === '냉기') amplification += (totals['ICE_AMP'] ?? 0);
  }
  const amplificationMult = 1 + amplification / 100;

  // 4. 공통 적용 버프 합산 (예약)
  let commonBuffMult = 1;

  // 5. 최종 데미지 계산
  // (1 * 2 * 3 * 4 * artsAbnormalBuff) * skill_value (%) * baseAtk
  let finalDamage = Math.round(
    baseAtk * (skillValue / 100) * dmgIncreaseMult * vulnerabilityMult * amplificationMult * commonBuffMult * artsAbnormalBuffMult * incomingDamageMult
  );

  // 5-1. 불균형 피해
  if (context.imbalanceState) {
    const basicStaggerMult = 1.3; // 기본 불균형 피해 배율 
    finalDamage = Math.round(finalDamage * basicStaggerMult);
  }

  // 6. 치명타 데미지 계산
  // 기본 1.5배, CRIT_DMG 스탯 반영
  const critDmgStat = (totals['CRIT_DMG'] ?? 0);
  const critMultiplier = 1.5 + (critDmgStat / 100);
  const critDamage = Math.round(finalDamage * critMultiplier);

  return {
    normal: finalDamage,
    crit: critDamage,
  };
}
