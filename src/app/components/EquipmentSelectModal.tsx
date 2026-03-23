import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import armorsData from '../../data/equipments/armors.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';

interface EquipmentSelectModalProps {
  target: string | null;
  onClose: () => void;
  onSelect: (equipmentId: string) => void;
}

// 장비 아이템 타입 정의
interface EquipmentItem {
  id: string;
  name: string;
  image?: string;
  stats?: Array<{
    name: string;
    type: string;
    values: number[];
  }>;
  options?: Array<{
    name?: string;
    type?: string;
    values: number[];
    target?: string;
  }>;
  setName?: string;
}

interface EquipmentGroup {
  setName: string;
  equips: EquipmentItem[];
}

export default function EquipmentSelectModal({ target, onClose, onSelect }: EquipmentSelectModalProps) {
  const [selectedSet, setSelectedSet] = useState<string | null>(null);

  const getEquipmentType = () => {
    if (!target) return '상의';
    const t = target.toLowerCase();
    if (t.includes('armor') || t.includes('상의')) return '상의';
    if (t.includes('glove') || t.includes('장갑')) return '장갑';
    return '부품';
  };

  const equipmentType = getEquipmentType();

  // 장비 타입에 따른 rawData 설정
  let rawData: EquipmentGroup[] = [];
  let defaultIcon = '🎽';

  if (equipmentType === '상의') {
    rawData = armorsData as EquipmentGroup[];
    defaultIcon = '👕';
  } else if (equipmentType === '장갑') {
    rawData = glovesData as EquipmentGroup[];
    defaultIcon = '🧤';
  } else {
    rawData = partsData as EquipmentGroup[];
    defaultIcon = '⚙️';
  }

  // 세트 목록 추출
  const setNames = useMemo(() => {
    return rawData.map(group => group.setName);
  }, [rawData]);

  // 세트별 필터링된 장비 목록
  const filteredEquipment = useMemo(() => {
    if (!selectedSet) {
      return rawData.flatMap((group) =>
        group.equips.map((item: EquipmentItem) => ({
          ...item,
          setName: group.setName
        }))
      );
    }
    const targetGroup = rawData.find(g => g.setName === selectedSet);
    if (!targetGroup) return [];
    return targetGroup.equips.map((item: EquipmentItem) => ({
      ...item,
      setName: targetGroup.setName
    }));
  }, [rawData, selectedSet]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-zinc-800">
          <h3 className="text-xl font-bold text-white">{equipmentType} 선택</h3>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 세트 카테고리 탭 */}
        <div className="px-4 pt-3 pb-1 border-b border-zinc-800 flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedSet(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors shrink-0 ${
              selectedSet === null
                ? 'bg-primary text-black font-bold'
                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
            }`}
          >
            전체
          </button>
          {setNames.map((setName) => (
            <button
              key={setName}
              onClick={() => setSelectedSet(setName)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors shrink-0 ${
                selectedSet === setName
                  ? 'bg-primary text-black font-bold'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {setName}
            </button>
          ))}
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {filteredEquipment.map((item: EquipmentItem) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex flex-col items-center gap-3 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700 hover:border-primary hover:bg-zinc-800 transition-all group relative"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden border border-zinc-700">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-[85%] h-[85%] object-contain" />
                  ) : (
                    <span className="text-4xl opacity-50">{defaultIcon}</span>
                  )}
                </div>
                <div className="w-full space-y-1">
                  <div className="text-[10px] text-primary/70 font-medium text-center truncate">{item.setName}</div>
                  <div className="text-xs font-bold text-zinc-200 text-center leading-tight h-8 flex items-center justify-center break-keep">
                    {item.name}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}