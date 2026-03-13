import React from 'react';
import { X } from 'lucide-react';
import armorsData from '../../data/equipments/armor.json';
import glovesData from '../../data/equipments/gloves.json';
import partsData from '../../data/equipments/parts.json';

interface EquipmentSelectModalProps {
  target: string | null;
  onClose: () => void;
  onSelect: (equipmentId: string) => void;
}

export default function EquipmentSelectModal({ target, onClose, onSelect }: EquipmentSelectModalProps) {
  const getEquipmentType = () => {
    if (!target) return '상의';
    const t = target.toLowerCase();
    if (t.includes('armor') || t.includes('상의')) return '상의';
    if (t.includes('glove') || t.includes('장갑')) return '장갑';
    return '부품';
  };

  const equipmentType = getEquipmentType();

  // 1. 선택된 타입에 따른 rawData 설정
  let rawData: any[] = [];
  let defaultIcon = '🎽';

  if (equipmentType === '상의') {
    rawData = armorsData;
    defaultIcon = '👕';
  } else if (equipmentType === '장갑') {
    rawData = glovesData;
    defaultIcon = '🧤';
  } else {
    rawData = partsData;
    defaultIcon = '⚙️';
  }

  // 2. 공통 평탄화 로직: 모든 장비 JSON이 { setName, equips } 구조이므로 동일하게 적용
  const flatEquipmentList = rawData.flatMap((group) => 
    group.equips.map((item: any) => ({
      ...item,
      setName: group.setName // 세트 이름을 아이템 객체에 포함
    }))
  );

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

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {flatEquipmentList.map((item) => (
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