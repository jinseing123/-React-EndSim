import React from 'react';
import CustomSelect from './CustomSelect';
import charactersData from '../../data/characters.json';
import armorsData from '../../data/equipments/armor.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';
import weaponsData from '../../data/weapons.json';

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

interface PartyTabProps {
  partyMembers: OperatorData[];
  onUpdate: (data: OperatorData[]) => void;
  onOpenModal: (type: string, target: string) => void;
}

export default function PartyTab({ partyMembers, onUpdate, onOpenModal }: PartyTabProps) {
  const forgeOptions = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];

  const temperamentOptions = Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  const equipmentDefaultIcons = [
    '/images/icons/기타/방어구.png',
    '/images/icons/기타/장갑.png',
    '/images/icons/기타/부품.png',
    '/images/icons/기타/부품.png',
  ];

  // 중첩된 장비 데이터를 찾는 함수
  const findEquipment = (data: any[], id: string | null) => {
    if (!id) return null;
    for (const group of data) {
      const item = group.equips.find((e: any) => e.id === id);
      if (item) return item;
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {partyMembers.map((member, memberIndex) => {
        // 캐릭터 데이터 매칭 (id 기준)
        const character = member.characterId
          ? charactersData.find(c => c.id === member.characterId)
          : null;

        const equipmentData = [
          { type: '상의', key: 'armor' as const, data: findEquipment(armorsData, member.equipment.armor) },
          { type: '장갑', key: 'glove' as const, data: findEquipment(glovesData, member.equipment.glove) },
          { type: '부품1', key: 'part1' as const, data: findEquipment(partsData, member.equipment.part1) },
          { type: '부품2', key: 'part2' as const, data: findEquipment(partsData, member.equipment.part2) },
        ];

        const weaponData = weaponsData.find(w => w.id === member.weaponId);

        return (
          <div key={memberIndex} className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
            {/* 파티원 헤더 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenModal('character', `party${memberIndex + 1}`)}
                className="w-20 h-20 bg-secondary rounded-lg border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center overflow-hidden group shrink-0"
              >
                {/* 수정된 부분: character.image 대신 character.images.profile 사용 
                */}
                {character?.images?.profile ? (
                  <img
                    src={character.images.profile}
                    alt={character.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                ) : (
                  <span className="text-3xl group-hover:scale-110 transition-transform">👤</span>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate">
                  파티원 {memberIndex + 1} {character && <span className="text-primary ml-2">- {character.name}</span>}
                </h4>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground font-medium">돌파:</span>
                    <CustomSelect
                      value={member.breakthrough}
                      options={[
                        { value: 0, label: '0' }, { value: 1, label: '1' },
                        { value: 2, label: '2' }, { value: 3, label: '3' },
                        { value: 4, label: '4' }, { value: 5, label: '5' },
                      ]}
                      onChange={(v) => {
                        const newParty = [...partyMembers];
                        newParty[memberIndex] = { ...newParty[memberIndex], breakthrough: Number(v) };
                        onUpdate(newParty);
                      }}
                      className="h-7 text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>


            {/* 장비 그리드 */}
            <div className="grid grid-cols-4 gap-2">
              {equipmentData.map((eq, eIdx) => (
                <div key={eIdx} className="space-y-1">
                  {/* 장비 버튼 */}
                  <button
                    onClick={() => onOpenModal('equipment', `party${memberIndex + 1}-eq${eIdx + 1}-${eq.key}`)}
                    className="w-full aspect-square bg-secondary rounded border border-zinc-700 hover:border-primary flex items-center justify-center overflow-hidden transition-colors"
                  >
                    {eq.data?.image ? (
                      <img src={eq.data.image} alt={eq.data.name} className="w-[85%] h-[85%] object-contain" />
                    ) : (
                      <img src={equipmentDefaultIcons[eIdx]} className="w-[44%] h-[44%] object-contain group-hover:scale-110 transition-transform" />
                    )}
                  </button>

                  <div className="py-1 text-[10px] text-center text-zinc-500 truncate font-medium px-1">
                    {eq.data?.name || '미선택'}
                  </div>

                  {/* 장비 상세 (스탯/옵션) */}
                  {eq.data ? (
                    <div className="bg-zinc-800/40 p-1.5 rounded-md border border-zinc-800 space-y-1 shadow-inner overflow-hidden">
                      {/* 스탯 표시 */}
                      {eq.data.stats.map((stat: any, sIdx: number) => {
                        const forgeKey = sIdx === 0 ? 'stat1' : 'stat2';
                        return (
                          <div key={sIdx} className="flex items-center justify-between h-6 overflow-hidden">
                            <span className="text-[10px] text-zinc-400 flex-1">
                              {eq.data.stats[sIdx].name}{" "}
                              <span className="text-zinc-200">
                                +{eq.data.stats[sIdx].values[member.equipmentForge[eq.key][forgeKey]]}
                              </span>
                            </span>
                            <CustomSelect
                              value={member.equipmentForge[eq.key][forgeKey]}
                              options={forgeOptions}
                              onChange={(v) => {
                                const newParty = [...partyMembers];
                                newParty[memberIndex].equipmentForge[eq.key][forgeKey] = Number(v);
                                onUpdate(newParty);
                              }}
                              className="text-[10px] scale-[0.8] origin-right"
                            />
                          </div>
                        );
                      })}

                      {/* 옵션 표시 */}
                      {eq.data.options?.[0] && (
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-700/50">
                          <span className="py-1 text-[10px] text-zinc-400 font-bold flex-1">
                            {eq.data.options[0].name}{" "}
                            <span className="text-zinc-200">
                              +{eq.data.options[0].values[member.equipmentForge[eq.key].option]}%
                            </span>
                          </span>
                          <CustomSelect
                            value={member.equipmentForge[eq.key].option}
                            options={forgeOptions}
                            onChange={(v) => {
                              const newParty = [...partyMembers];
                              newParty[memberIndex].equipmentForge[eq.key].option = Number(v);
                              onUpdate(newParty);
                            }}
                            className="text-[10px] scale-[0.8] origin-right"
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[10px] text-center text-zinc-500 py-2 border border-dashed border-zinc-700 rounded">
                      미선택
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 무기 */}
            <div className="flex gap-3">
              <button
                onClick={() => onOpenModal('weapon', `party${memberIndex + 1}-weapon`)}
                className="w-16 h-16 bg-secondary rounded-lg border border-zinc-700 hover:border-primary transition-all flex items-center justify-center shrink-0"
              >
                {weaponData?.image ? (
                  <img src={weaponData.image} alt={weaponData.name} className="w-[80%] h-[80%] object-contain" />
                ) : (
                  <span className="text-2xl opacity-40">⚔️</span>
                )}
              </button>
              {weaponData ? (
                <div className="flex-1 bg-black/20 p-2 rounded border border-border/60 flex flex-col justify-center">
                  <div className="font-bold text-sm text-zinc-200">{weaponData.name}</div>
                  <div className="text-[11px] text-zinc-500">공격력: {weaponData.attack}</div>
                </div>
              ) : (
                <div className="flex-1 bg-black/10 rounded border border-dashed border-border/30 flex items-center justify-center text-[11px] text-zinc-500">
                  무기 미장착
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}