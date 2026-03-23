import { useState, useMemo } from 'react';
import MainOperatorSection from './components/MainOperatorSection';
import { resolveOperator } from '../utils/resolveOperator';
import DetailSection from './components/DetailSection';
import CharacterSelectModal from './components/CharacterSelectModal';
import EquipmentSelectModal from './components/EquipmentSelectModal';
import WeaponSelectModal from './components/WeaponSelectModal';
import FoodSelectModal from './components/FoodSelectModal';

import charactersData from '../data/characters.json';
import type { OperatorData, BattleContext } from '../types';  // 타입 import

// stat type 영문 키 → 한글 이름 매핑 테이블.
const STAT_LABEL_MAP: { type: string; label: string; isRaw?: boolean }[] = [
  { type: 'ATK_CONST', label: '공격력 (고정)', isRaw: true },
  { type: 'ATK_PERCENT', label: '공격력' },
  { type: 'CRIT_CHANCE', label: '치명타 확률' },
  { type: 'CRIT_DMG', label: '치명타 피해' },
  { type: 'ALL_DMG', label: '모든 피해' },
  { type: 'SKILL_DMG', label: '모든 스킬 피해' },
  { type: 'NORMAL_DMG', label: '일반 공격 피해' },
  { type: 'BATTLE_DMG', label: '배틀 스킬 피해' },
  { type: 'COMBO_DMG', label: '연계 스킬 피해' },
  { type: 'ULTIMATE_DMG', label: '궁극기 피해' },
  { type: 'BATTLE_PHYSICAL_DMG', label: '배틀 스킬 물리 피해' },
  { type: 'ULTIMATE_PHYSICAL_DMG', label: '궁극기 물리 피해' },
  { type: 'STAGGER_DMG', label: '불균형 피해' },
  { type: 'PHYSICAL_DMG', label: '물리 피해' },
  { type: 'PHYSIC_DMG', label: '물리 피해' },
  { type: 'ARTS_DMG', label: '아츠 피해' },
  { type: 'FIRE_DMG', label: '열기 피해' },
  { type: 'ICE_DMG', label: '냉기 피해' },
  { type: 'ELECTRIC_DMG', label: '전기 피해' },
  { type: 'NATURE_DMG', label: '자연 피해' },
  { type: 'ARTS_INTENSITY', label: '오리지늄 아츠 강도', isRaw: true },
  { type: 'ARTS_AMP', label: '아츠 증폭' },
  { type: 'ARTS_VULN', label: '아츠 취약' },
  { type: 'ULTIMATE_CHARGE', label: '궁극기 충전 효율' },
  { type: 'ULTMATE_CHARGE', label: '궁극기 충전 효율' },
  { type: 'COMBO_COOLDOWN_REDUCTION', label: '연계 스킬 쿨타임 감소' },
  { type: 'HEAL', label: '치유 효율' },
  { type: 'ALL_DMG_REDUCTION', label: '받는 피해 감소' },
  { type: 'STAGGER_EFF', label: '불균형 효율 보너스' },
];

// OperatorData 타입은 이미 import 했으므로 중복 정의 제거

export default function App() {
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [battleContext, setBattleContext] = useState<BattleContext>({
    imbalanceState: false,
    defenseBreak: 0,
    artsType: 0,
    artsLevel: 0,
    artsAbnormal: {
      연소: 0,
      감전: 0,
      부식: 0,
      동결: 0,
    },
    artsAbnormalParty: {
      연소: 0,
      감전: 0,
      부식: 0,
      동결: 0,
    },
  });

  const [mainOperator, setMainOperator] = useState<OperatorData>({
    characterId: charactersData[0].id,
    operatorLevel: 0,
    breakthrough: 0,
    skillLevels: [1, 1, 1, 1],
    equipment: { armor: null, glove: null, part1: null, part2: null },
    equipmentForge: {
      armor: { stat1: 0, stat2: 0, option: 0 },
      glove: { stat1: 0, stat2: 0, option: 0 },
      part1: { stat1: 0, stat2: 0, option: 0 },
      part2: { stat1: 0, stat2: 0, option: 0 },
    },
    weaponId: null,
    temperaments: [1, 1, 1],
    foodId: null,
  });

  const [partyMembers, setPartyMembers] = useState<OperatorData[]>([
    {
      characterId: null,
      operatorLevel: 0,
      breakthrough: 0,
      skillLevels: [1, 1, 1, 1],
      equipment: { armor: null, glove: null, part1: null, part2: null },
      equipmentForge: {
        armor: { stat1: 0, stat2: 0, option: 0 },
        glove: { stat1: 0, stat2: 0, option: 0 },
        part1: { stat1: 0, stat2: 0, option: 0 },
        part2: { stat1: 0, stat2: 0, option: 0 },
      },
      weaponId: null,
      temperaments: [1, 1, 1],
      foodId: null,
    },
    {
      characterId: null,
      operatorLevel: 0,
      breakthrough: 0,
      skillLevels: [1, 1, 1, 1],
      equipment: { armor: null, glove: null, part1: null, part2: null },
      equipmentForge: {
        armor: { stat1: 0, stat2: 0, option: 0 },
        glove: { stat1: 0, stat2: 0, option: 0 },
        part1: { stat1: 0, stat2: 0, option: 0 },
        part2: { stat1: 0, stat2: 0, option: 0 },
      },
      weaponId: null,
      temperaments: [1, 1, 1],
      foodId: null,
    },
    {
      characterId: null,
      operatorLevel: 0,
      breakthrough: 0,
      skillLevels: [1, 1, 1, 1],
      equipment: { armor: null, glove: null, part1: null, part2: null },
      equipmentForge: {
        armor: { stat1: 0, stat2: 0, option: 0 },
        glove: { stat1: 0, stat2: 0, option: 0 },
        part1: { stat1: 0, stat2: 0, option: 0 },
        part2: { stat1: 0, stat2: 0, option: 0 },
      },
      weaponId: null,
      temperaments: [1, 1, 1],
      foodId: null,
    },
  ]);

  const { mainTotals, finalAtk, finalStats } = useMemo(() => {
    const totals = resolveOperator(mainOperator, battleContext, partyMembers).totals;
    return {
      mainTotals: totals,
      finalAtk: totals['FINAL_ATK'] ?? 0,
      finalStats: {
        str: totals['FINAL_STR'] ?? 0,
        dex: totals['FINAL_DEX'] ?? 0,
        int: totals['FINAL_INT'] ?? 0,
        wil: totals['FINAL_WILL'] ?? 0,
        artsIntensity: totals['FINAL_ARTS_INTENSITY'] ?? 0,
        critChance: totals['FINAL_CRIT_CHANCE'] ?? 0,
      },
    };
  }, [mainOperator, partyMembers, battleContext]);

  const handleSelectCharacter = (characterId: string) => {
    if (modalTarget === 'main') {
      setMainOperator({ ...mainOperator, characterId });
    } else if (modalTarget?.startsWith('party')) {
      const partyIndex = parseInt(modalTarget.replace('party', '')) - 1;
      const newParty = [...partyMembers];
      newParty[partyIndex] = { ...newParty[partyIndex], characterId };
      setPartyMembers(newParty);
    }
    setModalType(null);
  };

  const handleSelectEquipment = (equipmentId: string) => {
    if (!modalTarget) return;

    const parts = modalTarget.split('-');
    const target = parts[0];
    const equipmentKey = parts[2] as 'armor' | 'glove' | 'part1' | 'part2';

    if (target === 'main') {
      setMainOperator({
        ...mainOperator,
        equipment: { ...mainOperator.equipment, [equipmentKey]: equipmentId },
      });
    } else if (target.startsWith('party')) {
      const partyIndex = parseInt(target.replace('party', '')) - 1;
      const newParty = [...partyMembers];
      newParty[partyIndex] = {
        ...newParty[partyIndex],
        equipment: { ...newParty[partyIndex].equipment, [equipmentKey]: equipmentId },
      };
      setPartyMembers(newParty);
    }
    setModalType(null);
  };

  const handleSelectWeapon = (weaponId: string) => {
    if (!modalTarget) return;

    if (modalTarget === 'main-weapon') {
      setMainOperator({ ...mainOperator, weaponId });
    } else if (modalTarget?.startsWith('party')) {
      const partyIndex = parseInt(modalTarget.split('-')[0].replace('party', '')) - 1;
      const newParty = [...partyMembers];
      newParty[partyIndex] = { ...newParty[partyIndex], weaponId };
      setPartyMembers(newParty);
    }
    setModalType(null);
  };

  const handleSelectFood = (foodId: string) => {
    setMainOperator({ ...mainOperator, foodId });
    setModalType(null);
  };

  return (
    <div className="dark min-h-screen bg-background text-foreground p-6">

      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-zinc-800 border border-l-0 border-border text-primary px-1.5 py-4 rounded-r-lg hover:bg-zinc-700 transition-colors flex flex-col items-center gap-1.5 shadow-lg"
          title="합산 스탯 보기"
        >
          {'합산스탯'.split('').map((ch, i) => (
            <span key={i} className="text-[11px] font-bold leading-none">{ch}</span>
          ))}
        </button>
      )}

      <aside
        className={`fixed left-0 top-0 h-full z-40 w-60 bg-zinc-900 border-r border-border flex flex-col shadow-2xl transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="bg-zinc-800 px-4 py-3 border-b border-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-sm font-bold text-primary">합산 스탯</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">메인 오퍼레이터 기준</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-zinc-400 hover:text-white transition-colors text-lg leading-none"
          >
            ✕
          </button>
        </div>
        <div className="p-3 space-y-1 overflow-y-auto flex-1">
          {STAT_LABEL_MAP.filter(({ type }) => (mainTotals[type] ?? 0) !== 0).map(({ type, label, isRaw }) => {
            const val = mainTotals[type];
            const display = Number.isInteger(val) ? val : val.toFixed(1);
            return (
              <div key={type} className="flex items-center justify-between gap-2 px-2 py-1.5 rounded hover:bg-zinc-800 transition-colors">
                <span className="text-[11px] text-zinc-400 truncate">{label}</span>
                <span className="text-[12px] font-bold font-mono text-primary shrink-0">
                  {display}{isRaw ? '' : '%'}
                </span>
              </div>
            );
          })}
          {STAT_LABEL_MAP.every(({ type }) => (mainTotals[type] ?? 0) === 0) && (
            <p className="text-[11px] text-zinc-600 text-center py-4">스탯 없음</p>
          )}
        </div>
      </aside>

      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MainOperatorSection
          operatorData={mainOperator}
          battleContext={battleContext}
          onBattleContextChange={setBattleContext}
          finalAtk={finalAtk}
          finalStats={finalStats}
          onOpenModal={(type, target) => {
            setModalType(type);
            setModalTarget(target);
          }}
        />

        <DetailSection
          mainOperator={mainOperator}
          partyMembers={partyMembers}
          onUpdateMainOperator={setMainOperator}
          onUpdatePartyMembers={setPartyMembers}
          onOpenModal={(type, target) => {
            setModalType(type);
            setModalTarget(target);
          }}
          battleContext={battleContext}  // 추가
        />
      </div>

      {modalType === 'character' && (
        <CharacterSelectModal
          target={modalTarget}
          onClose={() => setModalType(null)}
          onSelect={handleSelectCharacter}
        />
      )}
      {modalType === 'equipment' && (
        <EquipmentSelectModal
          target={modalTarget}
          onClose={() => setModalType(null)}
          onSelect={handleSelectEquipment}
        />
      )}
      {modalType === 'weapon' && (
        <WeaponSelectModal
          target={modalTarget}
          onClose={() => setModalType(null)}
          onSelect={handleSelectWeapon}
        />
      )}
      {modalType === 'food' && (
        <FoodSelectModal
          onClose={() => setModalType(null)}
          onSelect={handleSelectFood}
        />
      )}
    </div>
  );
}