import React from 'react';
import CustomSelect from './CustomSelect';
import armorsData from '../../data/equipments/armors.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';
import weaponsData from '../../data/weapons.json';
import foodsData from '../../data/foods.json';
import charactersData from '../../data/characters.json';
import equipmentSetsData from '../../data/equipments/equipmentSets.json';

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

  const equipmentDefaultIcons = [
    '/images/icons/기타/방어구.png',
    '/images/icons/기타/장갑.png',
    '/images/icons/기타/부품.png',
    '/images/icons/기타/부품.png',
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
      if (item) return { ...item, setName: group.setName };
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

  // ─── 세트효과 계산 ───────────────────────────────────────────────
  // 장착된 장비의 setName을 세트별로 카운트
  const setCountMap: Record<string, number> = {};
  for (const eq of equipmentData) {
    if (eq.data?.setName) {
      setCountMap[eq.data.setName] = (setCountMap[eq.data.setName] || 0) + 1;
    }
  }
  // 3개 이상 착용한 세트만 추출하여 equipmentSets에서 매칭
  const activeSetEffects = Object.entries(setCountMap)
    .filter(([, count]) => count >= 3)
    .map(([setName]) => {
      const setEffect = equipmentSetsData.find(s => s.name === setName);
      return setEffect ? { setName, setEffect } : null;
    })
    .filter(Boolean) as { setName: string; setEffect: typeof equipmentSetsData[number] }[];
  // ─────────────────────────────────────────────────────────────────

  const targetLabelColors: Record<string, string> = {
    '자신': 'text-sky-400',
    '파티': 'text-emerald-400',
    '몹': 'text-rose-400',
  };

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
                  <img src={equipmentDefaultIcons[index]} className="w-[44%] h-[44%] object-contain group-hover:scale-110 transition-transform" />
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
                          +{eq.data.options[0].values[operatorData.equipmentForge[eq.key].option]}
                        </span>
                        <span className="text-primary/70">
                          {eq.data.options[0].type !== 'ARTS_INTENSITY' && '%'}
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

        {/* ──────────────────────────────────────────── */}
      </div>

      {/* ─── 세트 효과 표기 (장비 섹션 div 밖) ─── */}
      {activeSetEffects.length > 0 && (
        <div className="space-y-3">
          {activeSetEffects.map(({ setName, setEffect }) => (
            <div
              key={setName}
              className="bg-zinc-800/60 border border-amber-500/30 rounded-lg p-3 space-y-2"
            >
              {/* 세트 이름 + 활성 뱃지 */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 tracking-wide">{setName}</span>
                <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold">
                  세트효과 ({setCountMap[setName]}개)
                </span>
              </div>

              {/* 옵션 목록: 전체를 하나의 grid로 감싸야 모든 행의 열 너비가 동일하게 정렬됨 */}
              <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
                {setEffect.options.map((opt, oi) => (
                  <React.Fragment key={oi}>
                    <span className={`text-[10px] font-bold leading-5 ${targetLabelColors[opt.target] ?? 'text-zinc-400'}`}>
                      [{opt.target}]
                    </span>
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5">
                      {opt.effects.map((effect, ei) => (
                        <span key={ei} className="text-[10px] text-zinc-300 leading-5">
                          {effect.name}{" "}
                          <span className="font-bold text-amber-300">
                            +{effect.value}
                          </span>
                          <span className="font-bold text-amber-300">
                            {effect.type !== 'ARTS_INTENSITY' && '%'}
                          </span>
                          {ei < opt.effects.length - 1 && (
                            <span className="text-zinc-600 mx-1">·</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
              </div>

              {/* 세트 설명: overflow 없이 전체 출력 */}
              {setEffect.desc && (
                <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-700/50 pt-2 whitespace-pre-line">
                  {setEffect.desc}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      {/* ──────────────────────────────────────────── */}

      {/* 무기 섹션 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">무기</h3>
        <div className="flex gap-3 items-stretch">
          {/* 무기 아이콘 버튼: overflow-hidden 제거, 크기 고정 */}
          <button
            onClick={() => onOpenModal('weapon', 'main-weapon')}
            className="w-20 h-20 shrink-0 bg-zinc-800 rounded-xl border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center group"
          >
            {weaponData?.image ? (
              <img src={weaponData.image} alt={weaponData.name} className="w-[75%] h-[75%] object-contain group-hover:scale-110 transition-transform" />
            ) : (
              <span className="text-3xl opacity-30 group-hover:scale-110 transition-transform">⚔️</span>
            )}
          </button>

          {weaponData ? (
            <div className="flex-1 min-w-0 bg-zinc-800/50 rounded-xl border border-zinc-700 p-3 space-y-2">
              {/* 무기 이름 + 공격력 */}
              <div className="flex items-baseline justify-between gap-2">
                <span className="font-bold text-sm text-primary truncate">{weaponData.name}</span>
                <span className="text-[11px] text-zinc-400 shrink-0">ATK <span className="text-zinc-200 font-bold">{weaponData.attack}</span></span>
              </div>
              {/* 옵션 목록 */}
              <div className="space-y-1 border-t border-zinc-700/60 pt-2">
                {weaponData.options.map((option, idx) => (
                  <div key={idx} className="py-0.5 grid grid-cols-[1fr_auto] items-center gap-2">
                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-zinc-200 block truncate">{option.optionName}</span>
                      <div className="flex flex-col gap-x-2">
                        {option.effects.map((effect, effIdx) => (
                          <span key={effIdx} className="text-[10px] text-zinc-500 font-bold">
                            {effect.label}{" "}
                            <span className="text-primary">
                              +{effect.values[operatorData.temperaments[idx] - 1]}{effect.type.includes('ARTS_INTENSITY') ? '' : '%'}
                            </span>
                          </span>
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
                      className="text-[10px] shrink-0"
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
              무기를 장착하세요
            </div>
          )}
        </div>
      </div>

      {/* 음식 섹션 */}
      <div>
        <h3 className="mb-3 text-sm font-bold">음식</h3>
        <div className="flex gap-3 items-stretch">
          <button
            onClick={() => onOpenModal('food', 'main-food')}
            className="w-20 h-20 shrink-0 bg-zinc-800 rounded-xl border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center group"
          >
            {foodData?.image ? (
              <img src={foodData.image} alt={foodData.name} className="w-[75%] h-[75%] object-contain group-hover:scale-110 transition-transform" />
            ) : (
              <span className="text-3xl opacity-30 group-hover:scale-110 transition-transform">🍖</span>
            )}
          </button>

          {foodData ? (
            <div className="flex-1 min-w-0 bg-zinc-800/50 rounded-xl border border-zinc-700 p-3 space-y-1.5">
              <span className="font-bold text-sm text-orange-400 block truncate">{foodData.name}</span>
              <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-zinc-700/60 pt-2">
                {foodData.effects.map((effect, idx) => (
                  <div key={idx} className="text-[11px] text-zinc-400">
                    {effect.label}{" "}
                    <span className="font-bold text-orange-300">+{effect.value}{effect.type.includes('PERCENT') ? '%' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-xs text-zinc-500">
              전투에 도움이 되는 음식을 섭취하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}