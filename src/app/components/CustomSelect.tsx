import { ChevronDown } from 'lucide-react';

interface CustomSelectProps {
  value: number | string;
  options: { value: number | string; label: string }[];
  onChange: (value: number | string) => void;
  className?: string;
}

export default function CustomSelect({ value, options, onChange, className = '' }: CustomSelectProps) {
  return (
    <div className={`relative inline-block ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value))}
        className="appearance-none bg-secondary text-foreground px-3 py-1.5 pr-7 rounded border border-border cursor-pointer hover:bg-accent transition-colors w-full"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none text-muted-foreground" />
    </div>
  );
}