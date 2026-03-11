import { useState } from 'react';
import CustomSelect from './CustomSelect';
import charactersData from '../../data/characters.json';

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

interface MainOperatorSectionProps {
  operatorData: OperatorData;
  onOpenModal: (type: string, target: string) => void; // 해석: onOpenModal은 함수타입으로, type과 target이라는 매개변수를 받음. type은 모달의 종류(예: 'character', 'weapon', 'equipment' 등)를 나타내는 문자열이고, target은 어떤 요소를 대상으로 하는지 나타내는 문자열입니다. 예를 들어, 'main-character', 'party1-weapon' 등.
}

// App에서 이 컴포넌트를 불러올때 <MainOperatorSection /> 으로 불러옴 <- 이게 export default function MainOperatorSection() { ... } 이 부분임. 
// MainOperatorSection() 괄호안에 매개변수 { operatorData, onOpenModal }가 존재하므로 App에서 <MainOperatorSection operatorData={...} onOpenModal={...} /> 이렇게 props를 전달해줘야함.
// MainOperatorSectionProps는 props의 타입을 정의한것임. operatorData는 OperatorData 타입, onOpenModal은 함수타입. MainOperatorSection 컴포넌트는 operatorData와 onOpenModal을 props로 받아서 사용함.
// props는 여기서 MainOperatorSection 컴포넌트가 부모 컴포넌트(App)로부터 전달받는 데이터나 함수를 의미함. MainOperatorSection은 operatorData와 onOpenModal이라는 props를 받아서 내부에서 사용함.
export default function MainOperatorSection({ operatorData, onOpenModal }: MainOperatorSectionProps) {
  const [imbalanceState, setImbalanceState] = useState(false);
  const [defenseBreak, setDefenseBreak] = useState(0);
  const [artsType, setArtsType] = useState(0);
  const [artsLevel, setArtsLevel] = useState(0);

  const character = charactersData.find(c => c.id === operatorData.characterId) || charactersData[0]; //조건 만족시 c가 character에 할당, 만족하는게 없으면 charactersData[0] 할당

  const getStatValue = (type: string, level: number) => {
    const stat = character.stats.find(s => s.type === type); // 1. 해당 타입(HP, ATK 등)을 찾음
    return stat ? stat.values[level] : 0; // 2. 찾으면 해당 레벨의 값을 반환
  };

  // 1. HP와 ATK만 담은 배열 (오른쪽 위)
  const primaryStats = [
    { name: '생명력', value: getStatValue('HP', operatorData.operatorLevel), icon: '/images/icons/스탯/hp.png' },
    { name: '공격력', value: getStatValue('ATK', operatorData.operatorLevel), icon: '/images/icons/스탯/atk.png' },
  ];

  // 2. 나머지 4대 스탯 (오른쪽 아래)
  const secondaryStats = [
    { name: '힘', value: getStatValue('STR', operatorData.operatorLevel), icon: '/images/icons/스탯/str.png' },
    { name: '민첩', value: getStatValue('DEX', operatorData.operatorLevel), icon: '/images/icons/스탯/dex.png' },
    { name: '지능', value: getStatValue('INT', operatorData.operatorLevel), icon: '/images/icons/스탯/int.png' },
    { name: '의지', value: getStatValue('WIS', operatorData.operatorLevel), icon: '/images/icons/스탯/wis.png' },
  ];

  const skills = [
    {
      name: character.skills.normal.type,
      damage: `${character.skills.normal.damagePct[operatorData.skillLevels[0] - 1]}%`,
      icon: '🗡️'
    },
    {
      name: character.skills.battle.type,
      damage: `${character.skills.battle.damagePct[operatorData.skillLevels[1] - 1]}%`,
      icon: '⚔️'
    },
    {
      name: character.skills.chain.type,
      damage: `${character.skills.chain.damagePct[operatorData.skillLevels[2] - 1]}%`,
      icon: '🔗'
    },
    {
      name: character.skills.ultimate.type,
      damage: `${character.skills.ultimate.damagePct[operatorData.skillLevels[3] - 1]}%`,
      icon: '💥'
    },
  ];

  const artsTypeOptions = [
    { value: 0, label: '🔥' },
    { value: 1, label: '❄️' },
    { value: 2, label: '⚡' },
    { value: 3, label: '🌿' },
  ];

  return (
    <div className="bg-zinc-900 bg-card border border-border rounded-lg p-6 space-y-6">
      <h2>메인 오퍼레이터</h2>

      <div className="bg-zinc-900 bg-card border border-border rounded-lg p-6 space-y-6">
        <h2>메인 오퍼레이터</h2>

        {/* 전체 레이아웃 컨테이너: md 이상에서 2컬럼 그리드로 1:1 비율 유지 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          
          {/* [왼쪽] 캐릭터 이미지 구역 */}
          <div className="items-center flex justify-center">
            <button
              onClick={() => onOpenModal('character', 'main')}
              className="items-center border-zinc-700 relative w-60 h-60 bg-secondary rounded-lg border-1 border-border hover:border-primary transition-colors overflow-hidden group"
            >
              <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                👤
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              <div className="absolute bottom-2 left-2 right-2 bg-zinc-900 backdrop-blur-sm px-2 py-1 rounded text-sm text-center">
                {character.name}
              </div>
            </button>
          </div>

          {/* STATS */}
          <div className="flex-1 space-y-3">
            
            {/* HP, ATK (오른쪽 위) */}
            <div className="grid grid-cols-2 gap-3">
              {primaryStats.map((stat, index) => (
                <div key={index} className="bg-secondary/50 rounded p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded flex items-center justify-center text-2xl">
                      <img 
                                  src={stat.icon} 
                                  alt={stat.name} 
                                  className="w-10 h-10 object-contain" // 아이콘 크기에 맞게 조절
                                />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground truncate">{stat.name}</div>
                      <div className="font-medium">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* STR, DEX, INT, WIS (오른쪽 아래) */}
            <div className="grid grid-cols-2 gap-3">
              {secondaryStats.map((stat, index) => (
                <div key={index} className="bg-secondary/50 rounded p-3 border border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-accent rounded flex items-center justify-center text-2xl">
                      <img 
                                  src={stat.icon} 
                                  alt={stat.name} 
                                  className="w-10 h-10 object-contain" // 아이콘 크기에 맞게 조절
                                />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-muted-foreground truncate">{stat.name}</div>
                      <div className="font-medium">{stat.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* 스킬 정보 */}
      <div className="grid grid-cols-2 gap-3">
        {skills.map((skill, index) => (
          <div key={index} className="bg-secondary/50 rounded p-3 border border-border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-accent rounded flex items-center justify-center text-2xl">
                {skill.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground truncate">{skill.name}</div>
                <div className="font-medium">{skill.damage}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 설정 */}
      <div className="space-y-4 pt-4 border-t border-border">
        {/* 불균형 상태 */}
        <div className="flex items-center justify-between">
          <span>불균형 상태</span>
          <button
            onClick={() => setImbalanceState(!imbalanceState)}
            className={`px-4 py-1.5 rounded transition-colors ${
              imbalanceState
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-foreground hover:bg-accent'
            }`}
          >
            {imbalanceState ? 'ON' : 'OFF'}
          </button>
        </div>

        {/* 방어불능 단계 */}
        <div className="flex items-center justify-between">
          <span>방어불능 단계</span>
          <CustomSelect
            value={defenseBreak}
            options={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ]}
            onChange={(v) => setDefenseBreak(Number(v))}
          />
        </div>

        {/* 아츠부착 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span>아츠부착 타입</span>
            <div className="flex gap-2">
              {artsTypeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setArtsType(opt.value)}
                  className={`w-10 h-10 rounded transition-colors ${
                    artsType === opt.value
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-accent'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span>아츠부착 단계</span>
            <CustomSelect
              value={artsLevel}
              options={[
                { value: 0, label: '0' },
                { value: 1, label: '1' },
                { value: 2, label: '2' },
                { value: 3, label: '3' },
                { value: 4, label: '4' },
              ]}
              onChange={(v) => setArtsLevel(Number(v))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
