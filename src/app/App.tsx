import { useState } from 'react';
import MainOperatorSection from './components/MainOperatorSection';
import DetailSection from './components/DetailSection';
import CharacterSelectModal from './components/CharacterSelectModal';
import EquipmentSelectModal from './components/EquipmentSelectModal';
import WeaponSelectModal from './components/WeaponSelectModal';
import FoodSelectModal from './components/FoodSelectModal';

import charactersData from '../data/characters.json';
import armorsData from '../data/armor.json';
import glovesData from '../data/gloves.json';
import partsData from '../data/parts.json';
import weaponsData from '../data/weapons.json';
import foodsData from '../data/foods.json';

interface OperatorData {
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

export default function App() {
  const [modalType, setModalType] = useState<string | null>(null);
  const [modalTarget, setModalTarget] = useState<string | null>(null);

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

  const handleSelectCharacter = (characterId: string) => {
    if (modalTarget === 'main') {
      setMainOperator({ ...mainOperator, characterId }); // 객체에서 {...객체, 새데이터}: "기존 객체의 내용을 다 복사해오되, 뒤에 적은 데이터만 살짝 바꿔줘" (일부만 수정하기)
    } else if (modalTarget?.startsWith('party')) {
      const partyIndex = parseInt(modalTarget.replace('party', '')) - 1; // 'party1' -> 0, 'party2' -> 1, 'party3' -> 2
      const newParty = [...partyMembers]; // 배열에서 [...배열]: "기존 배열의 내용물을 다 꺼내서 새로운 배열에 담아줘" (복사본 만들기)
      newParty[partyIndex] = { ...newParty[partyIndex], characterId };
      setPartyMembers(newParty);
    }
    setModalType(null);
  };

  const handleSelectEquipment = (equipmentId: string) => {
    if (!modalTarget) return;

    const parts = modalTarget.split('-'); // 'main-eq1-상의' -> ['main', 'eq1', '상의'] 이런식으로 나눠짐
    const target = parts[0];
    const eqSlot = parts[1];
    const eqType = parts[2];

    let equipmentKey: 'armor' | 'glove' | 'part1' | 'part2' = 'armor'; // 해석: equipmentKey는 'armor', 'glove', 'part1', 'part2' 중 하나의 문자열을 가질 수 있는 변수입니다. 초기값은 'armor'로 설정되어 있습니다. 
    if (eqType === '상의') equipmentKey = 'armor';
    else if (eqType === '장갑') equipmentKey = 'glove';
    else if (eqSlot === 'eq3') equipmentKey = 'part1';
    else if (eqSlot === 'eq4') equipmentKey = 'part2';

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
      <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 구역1: 메인 오퍼레이터 */}
        <MainOperatorSection
          operatorData={mainOperator}
          onOpenModal={(type, target) => {
            setModalType(type);
            setModalTarget(target);
          }}
        />

        {/* 구역2: 상세 설정 */}
        <DetailSection
          mainOperator={mainOperator}
          partyMembers={partyMembers}
          onUpdateMainOperator={setMainOperator}
          onUpdatePartyMembers={setPartyMembers}
          onOpenModal={(type, target) => {
            setModalType(type);
            setModalTarget(target);
          }}
        />
      </div>

      {/* 모달 */}
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
