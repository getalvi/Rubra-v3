import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface SuggestionCardProps {
  text: string;
  icon: LucideIcon;
  onClick: () => void;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ text, icon: Icon, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full min-h-[144px] p-5 rounded-3xl
        bg-[#212124] hover:bg-[#2a2a2e]
        border border-transparent hover:border-[rgba(255,255,255,0.1)]
        flex flex-col justify-between
        text-left
        transition-all duration-200 ease-out
        hover:-translate-y-0.5 hover:shadow-md
        active:scale-[0.98]
        group
      "
    >
      <p className="text-[#e8eaed] text-sm font-normal leading-relaxed">
        {text}
      </p>
      <div className="self-end w-10 h-10 rounded-full bg-[#0d0d0d] flex items-center justify-center group-hover:bg-[#1a1a1a] transition-colors">
        <Icon size={20} className="text-[#8ab4f8]" />
      </div>
    </button>
  );
};

export default SuggestionCard;
