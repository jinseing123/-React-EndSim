import { X } from 'lucide-react';
import foodsData from '../../data/foods.json';

interface FoodSelectModalProps {
  onClose: () => void;
  onSelect: (foodId: string) => void;
}

export default function FoodSelectModal({ onClose, onSelect }: FoodSelectModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-card border border-border rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3>음식 선택</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-accent rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
            {foodsData.map((food) => (
              <button
                key={food.id}
                onClick={() => onSelect(food.id)}
                className="flex flex-col items-center gap-2 p-3 bg-secondary rounded-lg border border-border hover:border-primary hover:bg-accent transition-all group"
              >
                <div className="w-16 h-16 bg-accent rounded-lg flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                  🍖
                </div>
                <div className="text-xs text-center truncate w-full">{food.name}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
