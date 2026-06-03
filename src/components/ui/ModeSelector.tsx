import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Zap, Brain, Cpu, Check } from 'lucide-react';
import type { AIMode } from '@/hooks/useChat';

interface ModeSelectorProps {
  mode: AIMode;
  onChange: (mode: AIMode) => void;
}

const modes: { value: AIMode; label: string; icon: typeof Zap; color: string; desc: string }[] = [
  { value: 'auto', label: 'Auto', icon: Cpu, color: '#8ab4f8', desc: 'Automatically select mode' },
  { value: 'fast', label: 'Fast', icon: Zap, color: '#81c995', desc: 'Quick responses' },
  { value: 'hermes', label: 'Hermes', icon: Brain, color: '#f9ab72', desc: 'Deep reasoning' },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ mode, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const current = modes.find(m => m.value === mode) || modes[0];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] transition-all duration-150"
      >
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: current.color }}
        />
        <span>{current.label}</span>
        <ChevronDown size={14} className={`transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-[#2a2a2e] border border-[#3c4043] shadow-lg z-50 overflow-hidden">
          {modes.map(m => {
            const Icon = m.icon;
            const isActive = mode === m.value;
            return (
              <button
                key={m.value}
                onClick={() => {
                  onChange(m.value);
                  setOpen(false);
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3
                  hover:bg-[#3c4043] transition-colors duration-150
                  ${isActive ? 'bg-[rgba(138,180,248,0.08)]' : ''}
                `}
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${m.color}20` }}
                >
                  <Icon size={16} style={{ color: m.color }} />
                </span>
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${isActive ? 'text-[#8ab4f8]' : 'text-[#e8eaed]'}`}>
                    {m.label}
                  </div>
                  <div className="text-xs text-[#9aa0a6]">{m.desc}</div>
                </div>
                {isActive && <Check size={16} className="text-[#8ab4f8] flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
