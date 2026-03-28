import React from 'react';
import CustomSelect from './CustomSelect';
import charactersData from '../../data/characters.json';
import armorsData from '../../data/equipments/armors.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';
import weaponsData from '../../data/weapons.json';
import equipmentSetsData from '../../data/equipments/equipmentSets.json';
import { resolveOperator } from '../../utils/resolveOperator';  // 추가
import type { OperatorData, BattleContext } from '../../types';  // BattleContext 타입 import
import { shouldShowPercentByType, splitLeadingNote } from '../../utils/effectDisplay';

interface PartyTabProps {
  partyMembers: OperatorData[];
  onUpdate: (data: OperatorData[]) => void;
  onOpenModal: (type: string, target: string) => void;
  battleContext: BattleContext;  // 추가: 전투 컨텍스트 전달받음
}

export default function PartyTab({ partyMembers, onUpdate, onOpenModal, battleContext }: PartyTabProps) {
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

  const findEquipment = (data: any[], id: string | null) => {
    if (!id) return null;
    for (const group of data) {
      const item = group.equips.find((e: any) => e.id === id);
      if (item) return { ...item, setName: group.setName };
    }
    return null;
  };

  const targetLabelColors: Record<string, string> = {
    '자신': 'text-sky-400',
    '파티': 'text-emerald-400',
    '몹': 'text-rose-400',
  };

  return (
    <div className="space-y-8">
      {partyMembers.map((member, memberIndex) => {
        const character = member.characterId
          ? charactersData.find(c => c.id === member.characterId)
          : null;

        // 파티원의 계산된 능력치 가져오기 (파티원 간 버프는 전달하지 않음)
        const resolved = member.characterId 
          ? resolveOperator(member, battleContext) 
          : null;
        
        const memberTotals = resolved?.totals ?? {};
        
        // 계산된 최종 능력치
        const memberFinalAtk = memberTotals['FINAL_ATK'] ?? 0;
        const memberFinalStats = {
          str: memberTotals['FINAL_STR'] ?? 0,
          dex: memberTotals['FINAL_DEX'] ?? 0,
          int: memberTotals['FINAL_INT'] ?? 0,
          wil: memberTotals['FINAL_WILL'] ?? 0,
          artsIntensity: memberTotals['FINAL_ARTS_INTENSITY'] ?? 0,
        };

        const equipmentData = [
          { type: '상의', key: 'armor' as const, data: findEquipment(armorsData, member.equipment.armor) },
          { type: '장갑', key: 'glove' as const, data: findEquipment(glovesData, member.equipment.glove) },
          { type: '부품1', key: 'part1' as const, data: findEquipment(partsData, member.equipment.part1) },
          { type: '부품2', key: 'part2' as const, data: findEquipment(partsData, member.equipment.part2) },
        ];

        // 세트효과 계산
        const setCountMap: Record<string, number> = {};
        for (const eq of equipmentData) {
          if (eq.data?.setName) {
            setCountMap[eq.data.setName] = (setCountMap[eq.data.setName] || 0) + 1;
          }
        }
        const activeSetEffects = Object.entries(setCountMap)
          .filter(([, count]) => count >= 3)
          .map(([setName]) => {
            const setEffect = equipmentSetsData.find(s => s.name === setName);
            return setEffect ? { setName, setEffect } : null;
          })
          .filter(Boolean) as { setName: string; setEffect: typeof equipmentSetsData[number] }[];

        const weaponData = weaponsData.find(w => w.id === member.weaponId);

        return (
          <div key={memberIndex} className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
            {/* 파티원 헤더: 이미지 | Lv/돌파 | 여백 | 스탯 */}
            <div className="flex items-stretch gap-2">

              {/* 1열: 이미지 + 이름 */}
              <div className="flex flex-col gap-1 shrink-0 justify-center items-center">
                <button
                  onClick={() => onOpenModal('character', `party${memberIndex + 1}`)}
                  className="w-25 h-25 bg-secondary rounded border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center overflow-hidden group"
                >
                  {character?.images?.profile ? (
                    <img src={character.images.profile} alt={character.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <span className="text-3xl group-hover:scale-110 transition-transform">👤</span>
                  )}
                </button>
                <div className="text-[10px] font-bold text-center truncate text-zinc-400 w-20">
                  {character ? character.name : `파티원 ${memberIndex + 1}`}
                </div>
              </div>

              {/* 2열: Lv / 돌파 선택자 세로 배치 */}
              <div className="flex flex-col justify-center gap-2 shrink-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400 w-6 shrink-0">Lv</span>
                  <CustomSelect
                    value={member.operatorLevel}
                    options={[
                      { value: 0, label: '60' },
                      { value: 1, label: '80' },
                      { value: 2, label: '90' },
                    ]}
                    onChange={(v) => {
                      const newParty = [...partyMembers];
                      newParty[memberIndex] = { ...newParty[memberIndex], operatorLevel: Number(v) };
                      onUpdate(newParty);
                    }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-zinc-400 w-6 shrink-0">돌파</span>
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
                  />
                </div>
              </div>

              {/* 3열: 여백 구분선 */}
              <div className="w-px bg-zinc-700/50 mx-1 self-stretch" />

              {/* 4열: 계산된 능력치 표시 */}
              {character ? (
                <div className="flex-1 min-w-0 flex gap-2 py-3">
                  {/* 왼쪽: 공격력 + 아츠 강도 세로 배치 */}
                  <div className="flex flex-col gap-2 w-[33%]">
                    {/* 공격력 */}
                    <div className="border-zinc-700 bg-secondary/50 rounded border p-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img src="/images/icons/스탯/공격력.png" alt="공격력" className="bg-accent rounded w-9 h-9 object-contain shrink-0" />
                        <span className="text-xs text-zinc-400 truncate">공격력</span>
                      </div>
                      <span className="px-1 text-sm font-bold tabular-nums shrink-0">
                        {memberFinalAtk}
                      </span>
                    </div>

                    {/* 아츠 강도 */}
                    <div className="border-zinc-700 bg-secondary/50 rounded border p-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <img src="/images/icons/기타/아츠강도.png" alt="아츠 강도" className="bg-accent rounded w-9 h-9 object-contain shrink-0" />
                        <span className="text-xs text-zinc-400 truncate">아츠 강도</span>
                      </div>
                      <span className="px-1 text-sm font-bold tabular-nums shrink-0">
                        {memberFinalStats.artsIntensity}
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: 4종 스탯 (2x2 그리드) */}
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    {(['str', 'dex', 'int', 'wil'] as const).map((statKey, idx) => {
                      const statNames = ['힘', '민첩', '지능', '의지'];
                      const statIcons = ['힘', '민첩', '지능', '의지'];
                      return (
                        <div key={statKey} className="border-zinc-700 bg-secondary/50 rounded border p-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <img src={`/images/icons/스탯/${statIcons[idx]}.png`} alt={statNames[idx]} className="bg-accent rounded w-9 h-9 object-contain shrink-0" />
                            <span className="text-xs text-zinc-400 truncate">{statNames[idx]}</span>
                          </div>
                          <span className="px-1 text-sm font-bold tabular-nums shrink-0">
                            {memberFinalStats[statKey]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-zinc-600 italic">
                  캐릭터를 선택하세요
                </div>
              )}
            </div>



            {/* 스킬 레벨 선택자 - 1행 4열 */}
            <div className="grid grid-cols-4 gap-2">
              {(['일반', '배틀', '연계', '궁극기'] as const).map((skillName, sIdx) => (
                <div key={sIdx} className="flex items-center gap-1 bg-secondary/30 p-2 rounded border border-zinc-800">
                  <div
                    className="w-10 h-10 flex items-center justify-center rounded-full border-[2px] overflow-hidden shrink-0"
                    style={{
                      backgroundColor: character?.images?.skillColor || '#444',
                      borderColor: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {character ? (
                      <img
                        src={[character.images.normal, character.images.battle, character.images.combo, character.images.ultimate][sIdx]}
                        alt={skillName}
                        className="w-[85%] h-[85%] object-contain"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-400">{" "}</span>
                    )}
                  </div>
                  <span className="px-1 text-[12px] text-zinc-400">{skillName}</span>
                  <div className="ml-auto shrink-0">
                    <CustomSelect
                      value={member.skillLevels[sIdx]}
                      options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }))}
                      onChange={(v) => {
                        const newParty = [...partyMembers];
                        const newLevels: [number, number, number, number] = [...newParty[memberIndex].skillLevels];
                        newLevels[sIdx] = Number(v);
                        newParty[memberIndex] = { ...newParty[memberIndex], skillLevels: newLevels };
                        onUpdate(newParty);
                      }}
                      className="text-[10px]"
                    />
                  </div>
                </div>
              ))}
            </div>


            {/* 장비 그리드 */}
            <div className="grid grid-cols-4 gap-2">
              {equipmentData.map((eq, eIdx) => (
                <div key={eIdx} className="space-y-1">
                  <button
                    onClick={() => onOpenModal('equipment', `party${memberIndex + 1}-eq${eIdx + 1}-${eq.key}`)}
                    className="w-full aspect-square bg-secondary rounded border border-zinc-700 hover:border-primary flex items-center justify-center overflow-hidden transition-colors"
                  >
                    {eq.data?.image ? (
                      <img src={eq.data.image} alt={eq.data.name} className="w-[85%] h-[85%] object-contain" />
                    ) : (
                      <img src={equipmentDefaultIcons[eIdx]} className="w-[44%] h-[44%] object-contain" />
                    )}
                  </button>

                  <div className="py-1 text-[10px] text-center text-zinc-500 truncate font-medium px-1">
                    {eq.data?.name || '미선택'}
                  </div>

                  {eq.data ? (
                    <div className="bg-zinc-800/40 p-1.5 rounded-md border border-zinc-800 space-y-1 shadow-inner overflow-hidden">
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

                      {eq.data.options?.[0] && (
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-700/50">
                          <span className="py-1 text-[10px] text-zinc-400 font-bold flex-1">
                            {eq.data.options[0].name}{" "}
                            <span className="text-zinc-200">
                              +{eq.data.options[0].values[member.equipmentForge[eq.key].option]}
                            </span>
                            <span className="text-zinc-200">
                              {eq.data.options[0].type !== 'ARTS_INTENSITY' && '%'}
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

            {/* ─── 세트 효과 표기 ─── */}
            {activeSetEffects.length > 0 && (
              <div className="space-y-2">
                {activeSetEffects.map(({ setName, setEffect }) => (
                  <div
                    key={setName}
                    className="bg-zinc-800/60 border border-amber-500/30 rounded-lg p-2.5 space-y-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-400">{setName}</span>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded-full font-bold">
                        세트효과 ({setCountMap[setName]}개)
                      </span>
                    </div>
                    {/* 전체를 하나의 grid로 감싸야 모든 행의 열 너비가 동일하게 정렬됨 */}
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
                    {setEffect.desc && (
                      <p className="text-[10px] text-zinc-500 leading-relaxed border-t border-zinc-700/50 pt-1.5 whitespace-pre-line">
                        {setEffect.desc}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* ─────────────────────── */}

            {/* ✅ 무기 섹션 - 기질 선택자 + 탭정렬 포함 */}
            <div className="flex gap-3 items-stretch">
              <button
                onClick={() => onOpenModal('weapon', `party${memberIndex + 1}-weapon`)}
                className="w-16 h-16 shrink-0 bg-zinc-800 rounded-xl border-2 border-zinc-700 hover:border-primary transition-all flex items-center justify-center group"
              >
                {weaponData?.image ? (
                  <img src={weaponData.image} alt={weaponData.name} className="w-[75%] h-[75%] object-contain group-hover:scale-110 transition-transform" />
                ) : (
                  <span className="text-2xl opacity-30 group-hover:scale-110 transition-transform">⚔️</span>
                )}
              </button>

              {weaponData ? (
                <div className="flex-1 min-w-0 bg-zinc-800/50 rounded-xl border border-zinc-700 p-2.5 space-y-1.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-bold text-sm text-zinc-200 truncate">{weaponData.name}</span>
                    <span className="text-[11px] text-zinc-400 shrink-0">ATK <span className="text-zinc-200 font-bold">{weaponData.attack}</span></span>
                  </div>
                  <div className="space-y-1 border-t border-zinc-700/60 pt-1.5">
                    {weaponData.options.map((option, idx) => (
                      <div key={idx} className="py-0.5 grid grid-cols-[1fr_auto] items-center gap-2">
                        <div className="min-w-0">
                          <span className="text-[11px] font-bold text-zinc-200 block truncate">{option.optionName}</span>
                          <div className="flex flex-col gap-x-2">
                            {option.effects.map((effect, effIdx) => (
                              <span key={effIdx} className="text-[10px] text-zinc-500 font-bold">
                                {(() => {
                                  const split = splitLeadingNote(effect.label);
                                  const note = effect.note ?? split.note;
                                  const value = effect.values[member.temperaments[idx] - 1];
                                  const showPercent = shouldShowPercentByType(effect.type);
                                  return (
                                    <>
                                      <span className="block">{split.label}{" "}
                                        <span className="text-primary">+{value}{showPercent ? '%' : ''}</span>
                                        
                                      {note && (
                                        <span className="px-2 text-[9px] font-medium text-zinc-500/80">({note})</span>
                                      )}
                                      </span>
                                    </>
                                  );
                                })()}
                              </span>
                            ))}
                          </div>
                        </div>
                        <CustomSelect
                          value={member.temperaments[idx]}
                          options={temperamentOptions}
                          onChange={(v) => {
                            const newParty = [...partyMembers];
                            const newTemp: [number, number, number] = [...newParty[memberIndex].temperaments];
                            newTemp[idx] = Number(v);
                            newParty[memberIndex] = { ...newParty[memberIndex], temperaments: newTemp };
                            onUpdate(newParty);
                          }}
                          className="text-[10px] shrink-0"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex-1 bg-zinc-800/20 rounded-xl border border-dashed border-zinc-700 flex items-center justify-center text-[11px] text-zinc-500">
                  무기 미장착
                </div>
              )}
            </div>

            {/* 캐릭터 설명 */}
            <div className="flex-1 min-w-0 bg-zinc-800/50 rounded border border-zinc-700/50 p-3 space-y-2 text-[13px] text-zinc-400 whitespace-pre-line">
              {character?.desc}
            </div>

          </div>
        );
      })}
    </div>
  );
}
