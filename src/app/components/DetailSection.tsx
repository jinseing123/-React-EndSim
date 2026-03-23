import { useState } from 'react';
import MainOperatorTab from './MainOperatorTab';
import PartyTab from './PartyTab';
import type { OperatorData, BattleContext } from '../../types';  // 추가

interface DetailSectionProps {
  mainOperator: OperatorData;
  partyMembers: OperatorData[];
  onUpdateMainOperator: (data: OperatorData) => void;
  onUpdatePartyMembers: (data: OperatorData[]) => void;
  onOpenModal: (type: string, target: string) => void;
  battleContext: BattleContext;  // 추가
}

export default function DetailSection({
  mainOperator,
  partyMembers,
  onUpdateMainOperator,
  onUpdatePartyMembers,
  onOpenModal,
  battleContext,  // 추가
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
            battleContext={battleContext}  // 추가
          />
        )}
      </div>
    </div>
  );
}