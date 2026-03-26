import { StatTotals } from './resolveOperator';
import { BattleContext } from '../types';

export interface DamageResult {
  normal: number;
  crit: number;
}

/**
 * 데미지 계산 로직
 * @param baseAtk 최종 공격력 (FINAL_ATK)
 * @param skillValue 스킬 계수 (damagePct, % 단위)
 * @param skillType 스킬 종류 (normal, battle, combo, ultimate)
 * @param property 속성 (물리, 열기, 전기, 자연, 냉기)
 * @param totals StatTotals 객체
 * @param context BattleContext 객체
 */
export function calculateDamage(
  baseAtk: number,
  skillValue: number,
  skillType: 'normal' | 'battle' | 'combo' | 'ultimate',
  property: string,
  totals: StatTotals,
  context: BattleContext
): DamageResult {
  // 1. 피해량 증가 버프 합산
  let dmgIncrease = 0;
  
  // 공통 피해 증가
  dmgIncrease += (totals['ALL_DMG'] ?? 0);
  
  // 공격 타입별 피해 증가
  if (skillType === 'normal') dmgIncrease += (totals['NORMAL_DMG'] ?? 0);
  if (skillType === 'battle') {
    dmgIncrease += (totals['BATTLE_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }
  if (skillType === 'combo') {
    dmgIncrease += (totals['COMBO_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }
  if (skillType === 'ultimate') {
    dmgIncrease += (totals['ULTIMATE_DMG'] ?? 0);
    dmgIncrease += (totals['SKILL_DMG'] ?? 0);
  }

  // 속성별 피해 증가
  if (property === '물리') {
    dmgIncrease += (totals['PHYSICAL_DMG'] ?? 0);
    dmgIncrease += (totals['PHYSIC_DMG'] ?? 0); // 오타 대응
    if (skillType === 'battle') dmgIncrease += (totals['BATTLE_PHYSICAL_DMG'] ?? 0);
    if (skillType === 'ultimate') dmgIncrease += (totals['ULTIMATE_PHYSICAL_DMG'] ?? 0);
  } else {
    dmgIncrease += (totals['ARTS_DMG'] ?? 0);
    if (property === '열기') dmgIncrease += (totals['FIRE_DMG'] ?? 0);
    if (property === '전기') dmgIncrease += (totals['ELECTRIC_DMG'] ?? 0);
    if (property === '자연') dmgIncrease += (totals['NATURE_DMG'] ?? 0);
    if (property === '냉기') dmgIncrease += (totals['ICE_DMG'] ?? 0);
  }

  const dmgIncreaseMult = 1 + dmgIncrease / 100;

  // 2. 취약 버프 합산
  let vulnerability = 0;
  if (property === '물리') {
    // 갑옷 파괴는 물리 취약으로 취급 (단계당 10%로 가정, 필요시 totals에서 가져오도록 수정 가능)
    // 현재 BattleContext의 armorBreak 단계를 활용
    vulnerability += (context.armorBreak * 10); 
    // 추가적인 물리 취약 스탯이 있다면 여기에 합산
  } else {
    vulnerability += (totals['ARTS_VULN'] ?? 0);
    if (property === '열기') vulnerability += (totals['FIRE_VULN'] ?? 0);
    if (property === '전기') vulnerability += (totals['ELECTRIC_VULN'] ?? 0);
    if (property === '자연') vulnerability += (totals['NATURE_VULN'] ?? 0);
    if (property === '냉기') vulnerability += (totals['ICE_VULN'] ?? 0);
  }
  const vulnerabilityMult = 1 + vulnerability / 100;

  // 3. 증폭 버프 합산
  let amplification = 0;
  if (property !== '물리') {
    amplification += (totals['ARTS_AMP'] ?? 0);
    if (property === '열기') amplification += (totals['FIRE_AMP'] ?? 0);
    if (property === '전기') amplification += (totals['ELECTRIC_AMP'] ?? 0);
    if (property === '자연') amplification += (totals['NATURE_AMP'] ?? 0);
    if (property === '냉기') amplification += (totals['ICE_AMP'] ?? 0);
  }
  const amplificationMult = 1 + amplification / 100;

  // 4. 공통 적용 버프 합산 (감전, 부식, 불균형 데미지)
  let commonBuffMult = 1;
  if (context.imbalanceState) {
    const imbalanceDmg = (totals['STAGGER_DMG'] ?? 0);
    commonBuffMult += imbalanceDmg / 100;
  }
  // 감전, 부식 등은 스택당 피해 증가로 계산 (예시 로직)
  if (context.artsAbnormal['감전'] > 0) {
    commonBuffMult += (context.artsAbnormal['감전'] * 0.05); // 스택당 5% 가정
  }
  if (context.artsAbnormal['부식'] > 0) {
    commonBuffMult += (context.artsAbnormal['부식'] * 0.05); // 스택당 5% 가정
  }

  // 5. 최종 데미지 계산
  // (1 * 2 * 3 * 4) * skill_value (%) * baseAtk
  const finalDamage = Math.round(
    baseAtk * (skillValue / 100) * dmgIncreaseMult * vulnerabilityMult * amplificationMult * commonBuffMult
  );

  // 6. 치명타 데미지 계산
  // 기본 1.5배, CRIT_DMG 스탯 반영
  const critDmgStat = (totals['CRIT_DMG'] ?? 0);
  const critMultiplier = 1.5 + (critDmgStat / 100);
  const critDamage = Math.round(finalDamage * critMultiplier);

  return {
    normal: finalDamage,
    crit: critDamage
  };
}
