import { useState } from 'react';
import MainOperatorTab from './MainOperatorTab';
import PartyTab from './PartyTab';

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

interface DetailSectionProps {
  mainOperator: OperatorData;
  partyMembers: OperatorData[];
  onUpdateMainOperator: (data: OperatorData) => void;
  onUpdatePartyMembers: (data: OperatorData[]) => void;
  onOpenModal: (type: string, target: string) => void;
}

export default function DetailSection({
  mainOperator,
  partyMembers,
  onUpdateMainOperator,
  onUpdatePartyMembers,
  onOpenModal,
}: DetailSectionProps) {
  const [activeTab, setActiveTab] = useState<'main' | 'party'>('main');

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* 탭 버튼 */}
      <div className="bg-zinc-900 flex border-b border-border">
        <button
          onClick={() => setActiveTab('main')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'main'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          }`}
        >
          메인 오퍼레이터 설정
        </button>
        <button
          onClick={() => setActiveTab('party')}
          className={`flex-1 py-3 transition-colors ${
            activeTab === 'party'
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary/50 text-muted-foreground hover:bg-secondary'
          }`}
        >
          파티원 설정
        </button>
      </div>

      {/* 탭 내용 */}
      <div className="p-6 bg-zinc-900">
        {activeTab === 'main' ? (
          <MainOperatorTab
            operatorData={mainOperator}
            onUpdate={onUpdateMainOperator}
            onOpenModal={onOpenModal}
          />
        ) : (
          <PartyTab
            partyMembers={partyMembers}
            onUpdate={onUpdatePartyMembers}
            onOpenModal={onOpenModal}
          />
        )}
      </div>
    </div>
  );
}
