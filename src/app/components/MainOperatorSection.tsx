import { useState } from 'react';
import CustomSelect from './CustomSelect';
import charactersData from '../../data/characters.json';

interface OperatorData {
  characterId: string | null;
  operatorLevel: number;
  breakthrough: number;
  skillLevels: [number, number, number, number];
  equipment: { armor: string | null; glove: string | null; part1: string | null; part2: string | null; };
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
  onOpenModal: (type: string, target: string) => void;
}

export default function MainOperatorSection({ operatorData, onOpenModal }: MainOperatorSectionProps) {
  const [imbalanceState, setImbalanceState] = useState(false);
  const [defenseBreak, setDefenseBreak] = useState(0);
  const [artsType, setArtsType] = useState(0);
  const [artsLevel, setArtsLevel] = useState(0);

  const character = charactersData.find(c => c.id === operatorData.characterId) || charactersData[0];

  const getStatValue = (type: string, level: number) => {
    const stat = character.stats.find(s => s.type === type);
    return stat ? stat.values[level] : 0;
  };

  const primaryStats = [
    { name: '공격력', value: getStatValue('ATK', operatorData.operatorLevel), icon: '/images/icons/스탯/atk.png' },
  ];

  const secondaryStats = [
    { name: '힘', value: getStatValue('STR', operatorData.operatorLevel), icon: '/images/icons/스탯/str.png' },
    { name: '민첩', value: getStatValue('DEX', operatorData.operatorLevel), icon: '/images/icons/스탯/dex.png' },
    { name: '지능', value: getStatValue('INT', operatorData.operatorLevel), icon: '/images/icons/스탯/int.png' },
    { name: '의지', value: getStatValue('WIS', operatorData.operatorLevel), icon: '/images/icons/스탯/wis.png' },
  ];

  const skillCategories = [
    { title: "일반 공격", icon: character.images.normal, levelIdx: 0, list: character.skills.normal },
    { title: "배틀 스킬", icon: character.images.battle, levelIdx: 1, list: character.skills.battle },
    { title: "연계 스킬", icon: character.images.combo, levelIdx: 2, list: character.skills.combo },
    { title: "궁극기", icon: character.images.ultimate, levelIdx: 3, list: character.skills.ultimate }
  ];

  return (
    <div className="bg-zinc-900 bg-card border border-border rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">메인 오퍼레이터</h2>

      {/* 상단 이미지 및 스탯 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
        <div className="flex justify-center">
          <button
            onClick={() => onOpenModal('character', 'main')}
            className="relative w-60 h-60 bg-secondary rounded-lg border border-border hover:border-primary transition-colors group overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">👤</div>
            <div className="absolute bottom-2 left-2 right-2 bg-zinc-900/80 backdrop-blur-sm px-2 py-1 rounded text-sm text-center font-bold">
              {character.name}
            </div>
          </button>
        </div>

        {/* 공격력 */}
        <div className="space-y-3">
          <div className="grid grid-cols-1 gap-3">
            {primaryStats.map((s, i) => (
              <div key={i} className="bg-secondary/50 rounded p-3 border border-border flex items-center gap-3">
                <div className="w-15 h-15 flex-shrink-0 bg-accent rounded p-1">
                  <img src={s.icon} alt={s.name} className="w-full h-full object-contain" />
                </div>
                <div className="px-1.5 min-w-0">
                  <div className="text-[20px] font-bold text-muted-foreground">{s.name}</div>
                  <div className="text-[20px]font-bold text-sm">{s.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {secondaryStats.map((s, i) => (
              <div key={i} className="bg-secondary/50 rounded p-3 border border-border flex items-center gap-3">
                <div className="w-10 h-10 flex-shrink-0 bg-accent rounded p-1">
                  <img src={s.icon} alt={s.name} className="w-full h-full object-contain" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground">{s.name}</div>
                  <div className="font-bold text-sm">{s.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 스킬 정보 구역: 카테고리가 왼쪽에 위치하는 레이아웃 */}
      <div className="space-y-4">
        {skillCategories.map((cat, i) => (
          <div key={i} className="flex flex-col md:flex-row bg-secondary/20 rounded-lg border border-border overflow-hidden">
            {/* [왼쪽] 아이콘 영역 */}
            <div className="w-full md:w-36 bg-zinc-800/80 p-4 flex flex-row md:flex-col items-center justify-center gap-3 border-b md:border-b-0 md:border-r border-border">

              {/* 1. 원형 컨테이너: flex와 items-center, justify-center로 자식을 정중앙 배치 */}
              <div
                className="w-16 h-16 flex items-center justify-center rounded-full border-[3px] shadow-xl overflow-hidden shrink-0"
                style={{
                  backgroundColor: character.images?.skillColor || '#444',
                  borderColor: 'rgba(255, 255, 255, 1)'
                }}
              >
                {/* 2. 이미지: object-contain으로 비율을 유지하며 중앙에 맞춤 */}
                <img
                  src={cat.icon}
                  alt={cat.title}
                  className="w-[80%] h-[80%] object-contain block mx-auto"
                />
              </div>

              <span className="text-[13px] font-black text-primary text-center leading-tight uppercase tracking-tighter break-keep">
                {cat.title}
              </span>
            </div>

            {/* 오른쪽 상세 스킬 리스트 영역 */}
            <div className="flex-1 p-4 space-y-3">
              {cat.list.map((skill: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center gap-4 border-b border-zinc-800 last:border-0 pb-2 last:pb-0">
                  <div className="min-w-0 flex-1">
                    {skill.name ? (
                      <span className="text-sm font-medium text-zinc-300">
                        {skill.name}
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500 italic">피해 계수</span>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <span className="text-sm font-black text-primary font-mono">
                      {skill.damagePct[operatorData.skillLevels[cat.levelIdx] - 1]}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 세팅 구역 */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">불균형 상태</span>
          <button
            onClick={() => setImbalanceState(!imbalanceState)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${imbalanceState ? 'bg-primary text-white' : 'bg-secondary text-zinc-400'
              }`}
          >
            {imbalanceState ? 'ON' : 'OFF'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">방어불능 단계</span>
          <CustomSelect
            value={defenseBreak}
            options={[0, 1, 2, 3, 4].map(v => ({ value: v, label: String(v) }))}
            onChange={v => setDefenseBreak(Number(v))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠부착 타입</span>
            <div className="flex gap-1">
              {['🔥', '❄️', '⚡', '🌿'].map((label, i) => (
                <button
                  key={i}
                  onClick={() => setArtsType(i)}
                  className={`w-9 h-9 rounded-md transition-all ${artsType === i ? 'bg-primary' : 'bg-secondary hover:bg-zinc-700'
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠부착 단계</span>
            <CustomSelect
              value={artsLevel}
              options={[0, 1, 2, 3, 4].map(v => ({ value: v, label: String(v) }))}
              onChange={v => setArtsLevel(Number(v))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}