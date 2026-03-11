import CustomSelect from './CustomSelect';
import armorsData from '../../data/armor.json';
import glovesData from '../../data/gloves.json';
import partsData from '../../data/parts.json';
import weaponsData from '../../data/weapons.json';
import foodsData from '../../data/foods.json';

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

  const levelOptions = Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));
  const forgeOptions = [
    { value: 0, label: '0' },
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: 3, label: '3' },
  ];
  const temperamentOptions = Array.from({ length: 9 }, (_, i) => ({ value: i + 1, label: String(i + 1) }));

  const equipmentData = [
    {
      type: '상의',
      key: 'armor' as const,
      data: armorsData.find(e => e.id === operatorData.equipment.armor),
    },
    {
      type: '장갑',
      key: 'glove' as const,
      data: glovesData.find(e => e.id === operatorData.equipment.glove),
    },
    {
      type: '부품1',
      key: 'part1' as const,
      data: partsData.find(e => e.id === operatorData.equipment.part1),
    },
    {
      type: '부품2',
      key: 'part2' as const,
      data: partsData.find(e => e.id === operatorData.equipment.part2),
    },
  ];

  const weaponData = weaponsData.find(w => w.id === operatorData.weaponId);
  const foodData = foodsData.find(f => f.id === operatorData.foodId);

  return (
    <div className="space-y-6">
      
      {/* 돌파와 레벨을 가로로 배치하는 컨테이너*/} 
      <div className="flex items-center gap-6"> 
        
        {/* 캐릭터 레벨 섹션 */}
        <div className="flex items-center gap-3 flex-1">
          <h3 className="whitespace-nowrap font-medium">캐릭터 레벨</h3>
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

        {/* 돌파 섹션 */}
        <div className="flex items-center gap-3 flex-1">
          <h3 className="whitespace-nowrap font-medium">돌파</h3>
          <CustomSelect
            value={operatorData.breakthrough}
            options={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
              { value: 5, label: '5' },
            ]}
            onChange={(v) => onUpdate({ ...operatorData, breakthrough: Number(v) })}
          />
        </div>

      </div>

      {/* 스킬 레벨 */}
      <div>
        <h3 className="mb-3">스킬 레벨</h3>
        <div className="grid grid-cols-2 gap-3">
          {skillNames.map((name, index) => (
            <div key={index} className="flex items-center gap-2 bg-secondary/50 p-2 rounded border border-border">
              <div className="w-8 h-8 bg-accent rounded flex items-center justify-center text-lg shrink-0">
                {skillIcons[index]}
              </div>
              <span className="text-sm flex-1 min-w-0 truncate">{name}</span>
              <CustomSelect
                value={operatorData.skillLevels[index]}
                options={levelOptions}
                onChange={(v) => {
                  const newLevels: [number, number, number, number] = [...operatorData.skillLevels];
                  newLevels[index] = Number(v);
                  onUpdate({ ...operatorData, skillLevels: newLevels });
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 장비 */}
      <div>
        <h3 className="mb-3">장비</h3>
        <div className="grid grid-cols-4 gap-4">
          {equipmentData.map((eq, index) => (
            <div key={index} className="space-y-1">
              <button
                onClick={() => onOpenModal('equipment', `main-eq${index + 1}-${eq.type}`)}
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
                        {eq.data.stats[0].label}+{eq.data.stats[0].values[operatorData.equipmentForge[eq.key].stat1]}
                      </span>
                      <CustomSelect
                        value={operatorData.equipmentForge[eq.key].stat1}
                        options={forgeOptions}
                        onChange={(v) => {
                          onUpdate({
                            ...operatorData,
                            equipmentForge: {
                              ...operatorData.equipmentForge,
                              [eq.key]: {
                                ...operatorData.equipmentForge[eq.key],
                                stat1: Number(v),
                              },
                            },
                          });
                        }}
                        className="text-xs"
                      />
                    </div>
                  )}
                  {eq.data.stats[1] && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground truncate">
                        {eq.data.stats[1].label}+{eq.data.stats[1].values[operatorData.equipmentForge[eq.key].stat2]}
                      </span>
                      <CustomSelect
                        value={operatorData.equipmentForge[eq.key].stat2}
                        options={forgeOptions}
                        onChange={(v) => {
                          onUpdate({
                            ...operatorData,
                            equipmentForge: {
                              ...operatorData.equipmentForge,
                              [eq.key]: {
                                ...operatorData.equipmentForge[eq.key],
                                stat2: Number(v),
                              },
                            },
                          });
                        }}
                        className="text-xs"
                      />
                    </div>
                  )}
                  {eq.data.options[0] && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground truncate">
                        {eq.data.options[0].label.split(' ')[0]}+{eq.data.options[0].values[operatorData.equipmentForge[eq.key].option]}%
                      </span>
                      <CustomSelect
                        value={operatorData.equipmentForge[eq.key].option}
                        options={forgeOptions}
                        onChange={(v) => {
                          onUpdate({
                            ...operatorData,
                            equipmentForge: {
                              ...operatorData.equipmentForge,
                              [eq.key]: {
                                ...operatorData.equipmentForge[eq.key],
                                option: Number(v),
                              },
                            },
                          });
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
        <h3 className="mb-3">무기</h3>
        <div className="space-y-3">
          <button
            onClick={() => onOpenModal('weapon', 'main-weapon')}
            className="border-zinc-700 w-32 h-32 bg-secondary rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-5xl group"          >
            <span className="group-hover:scale-110 transition-transform">⚔️</span>
          </button>
          {weaponData && (
            <div className="bg-secondary/50 p-3 rounded border border-border space-y-2">
              <div className="font-medium">{weaponData.name}</div>
              <div className="text-sm text-muted-foreground">공격력: {weaponData.attack}</div>
              <div className="space-y-2 pt-2 border-t border-border">
                {weaponData.options.map((option, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="text-muted-foreground text-xs">{option.optionName}</div>
                      <div className="space-y-0.5">
                        {option.effects.map((effect, effIdx) => (
                          <div key={effIdx} className="text-xs">
                            {effect.label}: +{effect.values[operatorData.temperaments[idx] - 1]}
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
                      className="text-xs"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
          {!weaponData && (
            <div className="bg-secondary/50 p-3 rounded border border-border text-sm text-center text-muted-foreground">
              무기를 선택하세요
            </div>
          )}
        </div>
      </div>

      {/* 음식 */}
      <div>
        <h3 className="mb-3">음식</h3>
        <div className="flex gap-3">
          <button
            onClick={() => onOpenModal('food', 'main-food')}
            className="border-zinc-600 w-32 h-32 bg-secondary rounded border-2 border-border hover:border-primary transition-colors flex items-center justify-center text-5xl group"
          >
            <span className="group-hover:scale-110 transition-transform">🍖</span>
          </button>
          {foodData && (
            <div className="flex-1 bg-secondary/50 p-3 rounded border border-border">
              <div className="font-medium mb-2">{foodData.name}</div>
              <div className="space-y-1 text-sm">
                {foodData.effects.map((effect, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    {effect.label} +{effect.value}{effect.type.includes('PERCENT') ? '%' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
          {!foodData && (
            <div className="flex-1 bg-secondary/50 p-3 rounded border border-border text-sm text-center text-muted-foreground flex items-center justify-center">
              음식을 선택하세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
