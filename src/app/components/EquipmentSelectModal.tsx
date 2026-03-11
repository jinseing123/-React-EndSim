import { X } from 'lucide-react';
import armorsData from '../../data/armor.json';
import glovesData from '../../data/gloves.json';
import partsData from '../../data/parts.json';

interface EquipmentSelectModalProps {
  target: string | null;
  onClose: () => void;
  onSelect: (equipmentId: string) => void;
}

export default function EquipmentSelectModal({ target, onClose, onSelect }: EquipmentSelectModalProps) {
  const getEquipmentType = () => {
    if (!target) return '상의';
    if (target.includes('상의')) return '상의';
    if (target.includes('장갑')) return '장갑';
    return '부품';
  };

  const equipmentType = getEquipmentType();

  let equipment: typeof armorsData | typeof glovesData | typeof partsData = [];
  let icon = '🎽';

  if (equipmentType === '상의') {
    equipment = armorsData;
    icon = '👕';
  } else if (equipmentType === '장갑') {
    equipment = glovesData;
    icon = '🧤';
  } else {
    equipment = partsData;
    icon = '⚙️';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3>{equipmentType} 선택 {target && `(${target})`}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {equipment.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
              >
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {icon}
                </div>
                <div className="text-xs text-center truncate w-full">{item.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
