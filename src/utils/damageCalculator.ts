// DamageCalculator.ts
const main = resolveOperator(mainOperator);
const party = partyMembers.map(resolveOperator);

// 사용 예시
main.stats.atk          // 공격력
main.character.images   // 이미지 정보
main.activeSetEffects   // 세트효과
party[0].weapon         // 파티원1 무기