import { X } from 'lucide-react';
import weaponsData from '../../data/weapons.json';
import { useState, useMemo } from 'react';

interface WeaponSelectModalProps {
  target: string | null;
  onClose: () => void;
  onSelect: (weaponId: string) => void;
}

// 무기 타입별 카테고리 매핑 (추후 수정 용이)
const WEAPON_TYPE_CATEGORIES: Record<string, string> = {
  'ONE_HAND_SWORD': '한손검',
  'TWO_HAND_SWORD': '양손검',
  'DAGGER': '단검',
  'BOW': '활',
  'STAFF': '스태프',
  // 필요시 추가
};

export default function WeaponSelectModal({ target, onClose, onSelect }: WeaponSelectModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 무기 타입 목록 추출 (중복 제거)
  const categories = useMemo(() => {
    const types = new Set(weaponsData.map(w => w.type));
    return Array.from(types).map(type => ({
      type,
      label: WEAPON_TYPE_CATEGORIES[type] || type,
    }));
  }, []);

  // 카테고리별 필터링
  const filteredWeapons = useMemo(() => {
    if (!selectedCategory) return weaponsData;
    return weaponsData.filter(w => w.type === selectedCategory);
  }, [selectedCategory]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3>무기 선택 {target && `(${target})`}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 카테고리 탭 */}
        <div className="px-4 pt-3 pb-1 border-b border-border flex gap-2 overflow-x-auto">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-1.5 text-sm rounded-full transition-colors shrink-0 ${
              selectedCategory === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-muted-foreground hover:bg-accent'
            }`}
          >
            전체
          </button>
          {categories.map(({ type, label }) => (
            <button
              key={type}
              onClick={() => setSelectedCategory(type)}
              className={`px-3 py-1.5 text-sm rounded-full transition-colors shrink-0 ${
                selectedCategory === type
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:bg-accent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-120px)]">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {filteredWeapons.map((weapon) => (
              <button
                key={weapon.id}
                onClick={() => onSelect(weapon.id)}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
              >
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  {weapon.image ? (
                    <img src={weapon.image} alt={weapon.name} className="w-full h-full object-contain" />
                  ) : (
                    '⚔️'
                  )}
                </div>
                <div className="text-xs text-center truncate w-full">{weapon.name}</div>
                <div className="text-[9px] text-muted-foreground">{WEAPON_TYPE_CATEGORIES[weapon.type] || weapon.type}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}