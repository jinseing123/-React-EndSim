import React from 'react';
import CustomSelect from './CustomSelect';
import armorsData from '../../data/equipments/armor.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';
import weaponsData from '../../data/weapons.json';
import foodsData from '../../data/foods.json';
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

interface MainOperatorTabProps {
  operatorData: OperatorData;
  onUpdate: (data: OperatorData) => void;
  onOpenModal: (type: string, target: string) => void;
}

export default function MainOperatorTab({ operatorData, onUpdate, onOpenModal }: MainOperatorTabProps) {
  const skillIcons = ['🗡️', '⚔️', '🔗', '💥'];
  const skillNames = ['일반공격', '배틀스킬', '연계스킬', '궁극기'];

  const character = charactersData.find(c => c.id === operatorData.characterId) || charactersData[0];

  const getStatValue = (name: string, level: number) => {
    const stat = character.stats.find(s => s.name === name);
    return stat ? stat.values[level] : 0;
  };

  const skillCategories = [
    { title: "일반 공격", icon: character.images.normal, levelIdx: 0, list: character.skills.normal },
    { title: "배틀 스킬", icon: character.images.battle, levelIdx: 1, list: character.skills.battle },
    { title: "연계 스킬", icon: character.images.combo, levelIdx: 2, list: character.skills.combo },
    { title: "궁극기", icon: character.images.ultimate, levelIdx: 3, list: character.skills.ultimate }
  ];

  const levelOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const forgeOptions = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];
  const temperamentOptions = Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  // 중첩된 JSON 구조(setName > equips)에서 아이템을 찾는 헬퍼 함수
  const findEquipment = (data: any[], id: string | null) => {
    if (!id) return null;
    for (const group of data) {
      const item = group.equips.find((e: any) => e.id === id);
      if (item) return item;
    }
    return null;
  };

  const equipmentData = [
    {
      type: '상의',
      key: 'armor' as const,
      data: findEquipment(armorsData, operatorData.equipment.armor),
    },
    {
      type: '장갑',
      key: 'glove' as const,
      data: findEquipment(glovesData, operatorData.equipment.glove),
    },
    {
      type: '부품1',
      key: 'part1' as const,
      data: findEquipment(partsData, operatorData.equipment.part1),
    },
    {
      type: '부품2',
      key: 'part2' as const,
      data: findEquipment(partsData, operatorData.equipment.part2),
    },
  ];

  const weaponData = weaponsData.find(w => w.id === operatorData.weaponId);
  const foodData = foodsData.find(f => f.id === operatorData.foodId);

  return (
    <div className="space-y-6">

      {/* 돌파와 레벨 섹션 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3 flex-1">
          <h3 className="whitespace-nowrap font-medium text-sm text-zinc-300">캐릭터 레벨</h3>
          <CustomSelect
            value={operatorData.operatorLevel}
            options={[
              { value: 0, label: '60' },
              { value: 1, label: '80' },
              { value: 2, label: '90' }
            ]}
            onChange={(v) => onUpdate({ ...operatorData, operatorLevel: Number(v) })}
          />
        </div>

        <div className="flex items-center gap-3 flex-1">
          <h3 className="whitespace-nowrap font-medium text-sm text-zinc-300">돌파</h3>
          <CustomSelect
            value={operatorData.breakthrough}
            options={[
              { value: 0, label: '0' }, { value: 1, label: '1' },
              { value: 2, label: '2' }, { value: 3, label: '3' },
              { value: 4, label: '4' }, { value: 5, label: '5' },
            ]}
            onChange={(v) => onUpdate({ ...operatorData, breakthrough: Number(v) })}
          />
        </div>
      </div>

      {/* 스킬 레벨 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">스킬 레벨</h3>
        <div className="grid grid-cols-2 gap-3">
          {skillNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2 bg-secondary/30 p-2 rounded border border-zinc-800">
              {/* 아이콘 및 타이틀 영역 */}
              <div className="flex items-center gap-2">
                <div
                  className="w-10 h-10 flex items-center justify-center rounded-full border-[2px] shadow-lg overflow-hidden shrink-0"
                  style={{
                    backgroundColor: character.images?.skillColor || '#444',
                    borderColor: 'rgba(255, 255, 255, 1)'
                  }}
                >
                  <img
                    src={skillCategories[index].icon}
                    alt={skillCategories[index].title}
                    className="w-[85%] h-[85%] object-contain block mx-auto"
                  />
                </div>
                {/* 텍스트 영역: 가로폭을 제한하거나 유연하게 설정 */}
                <span className="text-[13px] text-primary tracking-tight font-bold w-16 truncate">
                  {skillCategories[index].title}
                </span>
              </div>

              {/* ml-auto를 사용하여 오른쪽으로 밀어냄 */}
              <div className="ml-auto">
                <CustomSelect
                  value={operatorData.skillLevels[index]}
                  options={levelOptions}
                  onChange={(v) => {
                    const newLevels: [number, number, number, number] = [...operatorData.skillLevels];
                    newLevels[index] = Number(v);
                    onUpdate({ ...operatorData, skillLevels: newLevels });
                  }}
                  className="text-xs"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 장비 섹션 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">장비</h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-4">
          {equipmentData.map((eq, index) => (
            <div key={index} className="space-y-2 min-w-0">
              <button
                onClick={() => onOpenModal('equipment', `main-eq${index + 1}-${eq.key}`)}
                className="w-full aspect-square bg-secondary rounded-lg border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center overflow-hidden group relative"
              >
                {eq.data?.image ? (
                  <img src={eq.data.image} alt={eq.data.name} className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <span className="text-2xl opacity-40 text-zinc-400 group-hover:scale-110 transition-all">🎽</span>
                )}
                <div className="absolute top-1 left-1 text-[9px] bg-black/60 px-1 rounded text-zinc-300 pointer-events-none">
                  {eq.type}
                </div>
              </button>

              <div className="text-[10px] text-center text-zinc-500 truncate font-medium px-1">
                {eq.data?.name || '미선택'}
              </div>

              {eq.data ? (
                <div className="bg-zinc-800/40 p-1.5 rounded-md border border-zinc-800 space-y-1 shadow-inner overflow-hidden">
                  {/* 스탯 정보 표시 로직 수정: 텍스트 겹침 방지 */}
                  {[0, 1].map((i) => {
                    const stat = eq.data.stats[i];
                    if (!stat) return null;
                    const forgeKey = i === 0 ? 'stat1' : 'stat2';
                    return (
                      <div key={i} className="flex items-center justify-between gap-1">
                        <span className="text-[10px] text-zinc-400 flex-1 leading-tight">
                          {stat.name}{" "}<span className="text-zinc-200">+{stat.values[operatorData.equipmentForge[eq.key][forgeKey]]}</span>
                        </span>
                        <CustomSelect
                          value={operatorData.equipmentForge[eq.key][forgeKey]}
                          options={forgeOptions}
                          onChange={(v) => onUpdate({
                            ...operatorData,
                            equipmentForge: {
                              ...operatorData.equipmentForge,
                              [eq.key]: { ...operatorData.equipmentForge[eq.key], [forgeKey]: Number(v) }
                            }
                          })}
                          className="text-[10px] min-w-[32px]"
                        />
                      </div>
                    );
                  })}
                  {/* 옵션 정보 */}
                  {eq.data.options?.[0] && (
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-700/50">
                      <span className="py-1 text-[10px] text-zinc-400 font-bold flex-1">
                        {eq.data.options[0].name}{" "}
                        <span className="text-primary/70">
                          +{eq.data.options[0].values[operatorData.equipmentForge[eq.key].option]}%
                        </span>
                      </span>
                      <CustomSelect
                        value={operatorData.equipmentForge[eq.key].option}
                        options={forgeOptions}
                        onChange={(v) => onUpdate({
                          ...operatorData,
                          equipmentForge: {
                            ...operatorData.equipmentForge,
                            [eq.key]: { ...operatorData.equipmentForge[eq.key], option: Number(v) }
                          }
                        })}
                        className="text-[10px] min-w-[32px]"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-2 rounded-md border border-dashed border-zinc-800 text-[10px] text-center text-zinc-600 bg-zinc-900/10">
                  선택 필요
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 무기 섹션 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">무기</h3>
        <div className="flex gap-4">
          <button
            onClick={() => onOpenModal('weapon', 'main-weapon')}
            className="w-24 h-24 bg-secondary rounded-xl border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center text-3xl group overflow-hidden shrink-0"
          >
            {weaponData?.image ? (
              <img src={weaponData.image} alt={weaponData.name} className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform" />
            ) : (
              <span className="group-hover:scale-110 transition-transform opacity-40">⚔️</span>
            )}
          </button>
          {weaponData ? (
            <div className="flex-1 bg-secondary/30 p-3 rounded-xl border border-zinc-800 flex flex-col justify-center space-y-1.5 min-w-0">
              <div className="font-bold text-sm text-primary truncate">{weaponData.name}</div>
              <div className="text-xs text-zinc-400 font-medium">기본 공격력: <span className="text-zinc-100">{weaponData.attack}</span></div>
              <div className="grid grid-cols-1 gap-1.5 pt-1.5 border-t border-zinc-800">
                {weaponData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-black/20 p-1.5 rounded-lg gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] text-zinc-500 font-medium truncate">{option.optionName}</div>
                      <div className="flex flex-wrap gap-x-2">
                        {option.effects.map((effect, effIdx) => (
                          <div key={effIdx} className="text-[11px] font-bold text-zinc-300">
                            {effect.label} +{effect.values[operatorData.temperaments[idx] - 1]}
                            {effect.type.includes('CHANCE') || effect.type.includes('DAMAGE') ? '%' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                    <CustomSelect
                      value={operatorData.temperaments[idx]}
                      options={temperamentOptions}
                      onChange={(v) => {
                        const newTemp: [number, number, number] = [...operatorData.temperaments];
                        newTemp[idx] = Number(v);
                        onUpdate({ ...operatorData, temperaments: newTemp });
                      }}
                      className="h-6 w-10 text-[10px]"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-secondary/20 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
              무기를 장착하여 전투력을 높이세요
            </div>
          )}
        </div>
      </div>

      {/* 음식 섹션 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">음식</h3>
        <div className="flex gap-4">
          <button
            onClick={() => onOpenModal('food', 'main-food')}
            className="w-24 h-24 bg-secondary rounded-xl border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center text-3xl group shrink-0"
          >
            {foodData?.image ? (
              <img src={foodData.image} alt={foodData.name} className="w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform" />
            ) : (
              <span className="group-hover:scale-110 transition-transform opacity-40">🍖</span>
            )}
          </button>
          {foodData ? (
            <div className="flex-1 bg-secondary/30 p-3 rounded-xl border border-zinc-800 flex flex-col justify-center min-w-0">
              <div className="font-bold text-sm text-orange-400 mb-1 truncate">{foodData.name}</div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                {foodData.effects.map((effect, idx) => (
                  <div key={idx} className="text-xs font-medium text-zinc-400">
                    {effect.label} <span className="text-zinc-200">+{effect.value}{effect.type.includes('PERCENT') ? '%' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-secondary/20 rounded-xl border border-dashed border-zinc-800 flex items-center justify-center text-xs text-zinc-500">
              전투에 도움이 되는 음식을 섭취하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}