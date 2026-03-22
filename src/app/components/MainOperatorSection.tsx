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

interface BattleContext {
  imbalanceState: boolean;
  defenseBreak: number;
  artsType: number;
  artsLevel: number;
  artsAbnormalType: number | null;
  artsAbnormalParty: number;
}

interface FinalStats {
  str: number;
  dex: number;
  int: number;
  wil: number;
  artsIntensity: number;
  critChance: number;
}

interface MainOperatorSectionProps {
  operatorData: OperatorData;
  battleContext: BattleContext;
  onBattleContextChange: (ctx: BattleContext) => void;
  finalAtk: number;
  finalStats: FinalStats;
  onOpenModal: (type: string, target: string) => void;
}

export default function MainOperatorSection({ operatorData, battleContext, onBattleContextChange, finalAtk, finalStats, onOpenModal }: MainOperatorSectionProps) {
  const { imbalanceState, defenseBreak, artsType, artsLevel, artsAbnormalType, artsAbnormalParty } = battleContext;

  // battleContext의 단일 필드만 바꾸는 헬퍼
  const set = <K extends keyof BattleContext>(key: K, value: BattleContext[K]) =>
    onBattleContextChange({ ...battleContext, [key]: value });

  const character = charactersData.find(c => c.id === operatorData.characterId) || charactersData[0];

  const getStatValue = (name: string, level: number) => {
    const stat = character.stats.find(s => s.name === name);
    return stat ? stat.values[level] : 0;
  };

  const primaryStats = [
    { name: '공격력', value: finalAtk, icon: '/images/icons/스탯/공격력.png' },
  ];

  const secondaryStats = [
    { name: '힘',  value: finalStats.str, icon: '/images/icons/스탯/힘.png' },
    { name: '민첩', value: finalStats.dex, icon: '/images/icons/스탯/민첩.png' },
    { name: '지능', value: finalStats.int, icon: '/images/icons/스탯/지능.png' },
    { name: '의지', value: finalStats.wil, icon: '/images/icons/스탯/의지.png' },
  ];

  const extraStats = [
    { name: '치명타 확률', value: finalStats.critChance,    icon: '/images/icons/기타/치명타.png' },
    { name: '아츠 강도',  value: finalStats.artsIntensity, icon: '/images/icons/기타/아츠강도.png' },
  ];

  const skillCategories = [
    { title: "기타", icon: character.images.normal, levelIdx: 0, list: character.skills.normal },
    { title: "배틀 스킬", icon: character.images.battle, levelIdx: 1, list: character.skills.battle },
    { title: "연계 스킬", icon: character.images.combo, levelIdx: 2, list: character.skills.combo },
    { title: "궁극기", icon: character.images.ultimate, levelIdx: 3, list: character.skills.ultimate }
  ];

  return (
    <div className="bg-zinc-900 bg-card border border-border rounded-lg p-6 space-y-6">
      <h2 className="text-xl font-bold">메인 오퍼레이터</h2>

      {/* 상단 이미지 및 스탯 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          <button
            onClick={() => onOpenModal('character', 'main')}
            className="relative w-[80%] aspect-square rounded-full border-[3px] border-white shadow-lg group overflow-hidden"
            style={{ backgroundColor: character.images?.skillColor || '#444' }}
          >
            {character.images?.profile ? (
              <img
                src={character.images.profile}
                alt={character.name}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">👤</div>
            )}
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
                  <div className="text-[15px] font-bold text-muted-foreground">{s.name}</div>
                  <div className="text-[18px] font-bold">{s.value}</div>
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

          <div className="grid grid-cols-2 gap-3">
            {extraStats.map((s, i) => (
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


      {/* 스킬 정보 구역: 2x2 그리드 레이아웃 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {skillCategories.map((cat, i) => (
          <div key={i} className="flex flex-col bg-secondary/20 rounded-lg border border-border overflow-hidden">
            {/* 상단: 아이콘 및 타이틀 영역 */}
            <div className="bg-zinc-800/80 p-3 flex items-center gap-3 border-b border-border">
              <div
                className="w-13 h-13 flex items-center justify-center rounded-full border-[2px] shadow-lg overflow-hidden shrink-0"
                style={{
                  backgroundColor: character.images?.skillColor || '#444',
                  borderColor: 'rgba(255, 255, 255, 1)'
                }}
              >
                <img
                  src={cat.icon}
                  alt={cat.title}
                  className="w-[85%] h-[85%] object-contain block mx-auto"
                />
              </div>
              <span className="px-1 text-[15px] font-bold text-primary tracking-tight">
                {cat.title}
              </span>
            </div>

            {/* 하단: 스킬 리스트 영역 */}
            <div className="p-3 space-y-2">
              {cat.list.map((skill: any, idx: number) => {
                const val = skill.damagePct[operatorData.skillLevels[cat.levelIdx] - 1];
                const critVal = Math.floor(val * 1.5);

                return (
                  <div key={idx} className="flex justify-between items-center gap-2 border-b border-zinc-800 last:border-0 pb-1 last:pb-0">
                    {/* 스킬 이름 */}
                    <span className="text-[13px] text-zinc-400 truncate flex-1">
                      {skill.name || "피해 계수"}
                    </span>

                    {/* 피해량 표기: [일반] / [아이콘] [치명타] */}
                    <div className="flex items-center gap-2">
                      {/* 일반 피해량 */}
                      <span className="text-[15px] font-mono font-bold text-primary">
                        {val}%
                      </span>

                      <span className="text-zinc-600 text-[12px]">/</span>

                      {/* 치명타 피해량 및 아이콘 */}
                      <div className="flex items-center gap-1">
                        <img
                          src={"./images/icons/기타/치명타.png"}
                          alt="crit"
                          className="w-4 h-4 object-contain"
                        />
                        <span className="text-[15px] font-mono font-bold text-orange-400">
                          {critVal}%
                        </span>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* 하단 세팅 구역 */}
      <div className="space-y-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">불균형 상태</span>
          <button
            onClick={() => set('imbalanceState', !imbalanceState)}
            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${imbalanceState ? 'bg-primary text-black' : 'bg-secondary text-zinc-400'
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
            onChange={v => set('defenseBreak', Number(v))}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠부착 타입</span>
            <div className="flex gap-1">
              {[
                { label: '열기 부착', icon: '/images/icons/아츠부착/열기 부착.png' },
                { label: '냉기 부착', icon: '/images/icons/아츠부착/냉기 부착.png' },
                { label: '전기 부착', icon: '/images/icons/아츠부착/전기 부착.png' },
                { label: '자연 부착', icon: '/images/icons/아츠부착/자연 부착.png' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => set('artsType', i)}
                  className={`w-9 h-9 rounded-md transition-all flex items-center justify-center ${artsType === i ? 'bg-primary ring-2 ring-primary/50' : 'bg-secondary hover:bg-zinc-700'
                    }`}
                  title={item.label}
                >
                  <img src={item.icon} alt={item.label} className="w-6 h-6 object-contain" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠부착 단계</span>
            <CustomSelect
              value={artsLevel}
              options={[0, 1, 2, 3, 4].map(v => ({ value: v, label: String(v) }))}
              onChange={v => set('artsLevel', Number(v))}
            />
          </div>
        </div>

        {/* 아츠이상 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠이상 타입</span>
            <div className="flex gap-1">
              {[
                { label: '연소', icon: '/images/icons/아츠이상/연소.png' },
                { label: '동결', icon: '/images/icons/아츠이상/동결.png' },
                { label: '쇄빙', icon: '/images/icons/아츠이상/쇄빙.png' },
                { label: '감전', icon: '/images/icons/아츠이상/감전.png' },
                { label: '부식', icon: '/images/icons/아츠이상/부식.png' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => set('artsAbnormalType', artsAbnormalType === i ? null : i)}
                  className={`w-9 h-9 rounded-md transition-all flex items-center justify-center ${artsAbnormalType === i ? 'bg-primary ring-2 ring-primary/50' : 'bg-secondary hover:bg-zinc-700'
                    }`}
                  title={item.label}
                >
                  <img src={item.icon} alt={item.label} className="w-6 h-6 object-contain" />
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">아츠이상 부여 파티원</span>
            <CustomSelect
              value={artsAbnormalParty}
              options={[
                { value: 0, label: '없음' },
                { value: 1, label: '파티원 1' },
                { value: 2, label: '파티원 2' },
                { value: 3, label: '파티원 3' },
              ]}
              onChange={v => set('artsAbnormalParty', Number(v))}
            />
          </div>
        </div>
      </div>
    </div>
  );
}