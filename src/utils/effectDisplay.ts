// 무기 효과 설명에서 %를 표기할건지 여부와, 효과 설명에서 괄호로 시작하는 노트를 분리하는 유틸 함수들

const NO_PERCENT_TYPES = new Set(['ARTS_INTENSITY', 'HEAL_SCALING', 'HEAL_FIXED', 'SHIELD_HP_SCALING', 'INT', 'DEX', 'STR', 'WILL']);

export function shouldShowPercentByType(type?: string): boolean {
  if (!type) return true;
  return !NO_PERCENT_TYPES.has(type);
}

export function splitLeadingNote(label?: string): { label: string; note?: string } {
  if (!label) return { label: '' };

  const match = label.match(/^\(([^)]+)\)\s*(.+)$/);
  if (!match) {
    return { label };
  }

  return {
    note: match[1].trim(),
    label: match[2].trim(),
  };
}

export function getIncomingEffectLabel(type: string): string {
  const incomingType = type.replace(/^INCOMING_/, '');

  if (incomingType === 'ALL_DMG') return '받는 피해';
  if (incomingType === 'ARTS_DMG') return '받는 아츠 피해';
  if (incomingType === 'PHYSICAL_DMG' || incomingType === 'PHYSIC_DMG') return '받는 물리 피해';
  if (incomingType === 'FIRE_DMG') return '받는 열기 피해';
  if (incomingType === 'ICE_DMG') return '받는 냉기 피해';
  if (incomingType === 'ELECTRIC_DMG') return '받는 전기 피해';
  if (incomingType === 'NATURE_DMG') return '받는 자연 피해';

  return `받는 피해 (${incomingType})`;
}
