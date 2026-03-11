import CustomSelect from './CustomSelect';
import charactersData from '../../data/characters.json';
import armorsData from '../../data/armor.json';
import glovesData from '../../data/gloves.json';
import partsData from '../../data/parts.json';
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

  return (
    <div className="space-y-8">
      {partyMembers.map((member, memberIndex) => {
        const character = member.characterId
          ? charactersData.find(c => c.id === member.characterId)
          : null;

        const equipmentData = [
          {
            type: '상의',
            key: 'armor' as const,
            data: armorsData.find(e => e.id === member.equipment.armor),
          },
          {
            type: '장갑',
            key: 'glove' as const,
            data: glovesData.find(e => e.id === member.equipment.glove),
          },
          {
            type: '부품1',
            key: 'part1' as const,
            data: partsData.find(e => e.id === member.equipment.part1),
          },
          {
            type: '부품2',
            key: 'part2' as const,
            data: partsData.find(e => e.id === member.equipment.part2),
          },
        ];

        const weaponData = weaponsData.find(w => w.id === member.weaponId);

        return (
          <div key={memberIndex} className="space-y-4 p-4 bg-secondary/30 rounded-lg border border-border">
            {/* 파티원 헤더 */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => onOpenModal('character', `party${memberIndex + 1}`)}
                className="border-1.5 border-zinc-700 w-20 h-20 bg-secondary rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-3xl group shrink-0"
              >
                <span className="group-hover:scale-110 transition-transform">👤</span>
              </button>
              <div className="flex-1">
                <h4>파티원 {memberIndex + 1} {character && `- ${character.name}`}</h4>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">돌파:</span>
                    <CustomSelect
                      value={member.breakthrough}
                      options={[
                        { value: 0, label: '0' },
                        { value: 1, label: '1' },
                        { value: 2, label: '2' },
                        { value: 3, label: '3' },
                        { value: 4, label: '4' },
                        { value: 5, label: '5' },
                      ]}
                      onChange={(v) => {
                        const newParty = [...partyMembers];
                        newParty[memberIndex] = { ...newParty[memberIndex], breakthrough: Number(v) };
                        onUpdate(newParty);
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">아츠이상: </span>
                    <CustomSelect
                      value="가"
                      options={[
                        { value: '가', label: '가' },
                        { value: '나', label: '나' },
                        { value: '다', label: '다' },
                      ]}
                      onChange={() => {}}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <span className="text-muted-foreground">아츠강도: </span>
                    <span>0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 장비 */}
            <div>
              <div className="text-sm mb-2 text-muted-foreground">장비</div>
              <div className="grid grid-cols-4 gap-3">
                {equipmentData.map((eq, eqIndex) => (
                  <div key={eqIndex} className="space-y-1">
                    <button
                      onClick={() => onOpenModal('equipment', `party${memberIndex + 1}-eq${eqIndex + 1}-${eq.type}`)}
                      className="border-1.5 border-zinc-700 w-full aspect-square bg-secondary rounded border border-border hover:border-primary transition-colors flex items-center justify-center text-2xl group"
                    >
                      <span className="group-hover:scale-110 transition-transform">🎽</span>
                    </button>
                    <div className="text-xs text-center text-muted-foreground truncate">
                      {eq.data?.name || eq.type}
                    </div>
                    {eq.data && (
                      <div className="bg-secondary/50 p-1 rounded border border-border space-y-0.5 text-xs">
                        {eq.data.stats[0] && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground truncate">
                              {eq.data.stats[0].label}+{eq.data.stats[0].values[member.equipmentForge[eq.key].stat1]}
                            </span>
                            <CustomSelect
                              value={member.equipmentForge[eq.key].stat1}
                              options={forgeOptions}
                              onChange={(v) => {
                                const newParty = [...partyMembers];
                                newParty[memberIndex] = {
                                  ...newParty[memberIndex],
                                  equipmentForge: {
                                    ...newParty[memberIndex].equipmentForge,
                                    [eq.key]: {
                                      ...newParty[memberIndex].equipmentForge[eq.key],
                                      stat1: Number(v),
                                    },
                                  },
                                };
                                onUpdate(newParty);
                              }}
                              className="text-xs"
                            />
                          </div>
                        )}
                        {eq.data.stats[1] && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground truncate">
                              {eq.data.stats[1].label}+{eq.data.stats[1].values[member.equipmentForge[eq.key].stat2]}
                            </span>
                            <CustomSelect
                              value={member.equipmentForge[eq.key].stat2}
                              options={forgeOptions}
                              onChange={(v) => {
                                const newParty = [...partyMembers];
                                newParty[memberIndex] = {
                                  ...newParty[memberIndex],
                                  equipmentForge: {
                                    ...newParty[memberIndex].equipmentForge,
                                    [eq.key]: {
                                      ...newParty[memberIndex].equipmentForge[eq.key],
                                      stat2: Number(v),
                                    },
                                  },
                                };
                                onUpdate(newParty);
                              }}
                              className="text-xs"
                            />
                          </div>
                        )}
                        {eq.data.options[0] && (
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground truncate">
                              {eq.data.options[0].label.split(' ')[0]}+{eq.data.options[0].values[member.equipmentForge[eq.key].option]}%
                            </span>
                            <CustomSelect
                              value={member.equipmentForge[eq.key].option}
                              options={forgeOptions}
                              onChange={(v) => {
                                const newParty = [...partyMembers];
                                newParty[memberIndex] = {
                                  ...newParty[memberIndex],
                                  equipmentForge: {
                                    ...newParty[memberIndex].equipmentForge,
                                    [eq.key]: {
                                      ...newParty[memberIndex].equipmentForge[eq.key],
                                      option: Number(v),
                                    },
                                  },
                                };
                                onUpdate(newParty);
                              }}
                              className="text-xs"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {!eq.data && (
                      <div className="bg-secondary/50 p-1 rounded border border-border text-xs text-center text-muted-foreground">
                        미선택
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 무기 */}
            <div>
              <div className="text-sm mb-2 text-muted-foreground">무기</div>
              <div className="flex gap-3">
                <button
                  onClick={() => onOpenModal('weapon', `party${memberIndex + 1}-weapon`)}
                  className="border-2 border-zinc-700 w-20 h-20 bg-secondary rounded border border-border hover:border-primary transition-colors flex items-center justify-center text-3xl group shrink-0"
                >
                  <span className="group-hover:scale-110 transition-transform">⚔️</span>
                </button>
                {weaponData && (
                  <div className="flex-1 bg-secondary/50 p-2 rounded border border-border text-xs space-y-1">
                    <div className="font-medium">{weaponData.name}</div>
                    <div className="text-muted-foreground">공격력: {weaponData.attack}</div>
                    <div className="space-y-1 pt-1 border-t border-border">
                      {weaponData.options.map((option, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-muted-foreground truncate">{option.optionName}</div>
                            {option.effects.map((effect, effIdx) => (
                              <div key={effIdx} className="truncate">
                                {effect.label}: +{effect.values[member.temperaments[idx] - 1]}
                                {effect.type.includes('CHANCE') || effect.type.includes('DAMAGE') ? '%' : ''}
                              </div>
                            ))}
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
                            className="text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!weaponData && (
                  <div className="flex-1 bg-secondary/50 p-2 rounded border border-border text-xs text-center text-muted-foreground flex items-center justify-center">
                    무기를 선택하세요
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
