import React from 'react';
import { Sparkles } from 'lucide-react';

interface RubraAvatarProps {
  variant: 'ai' | 'user';
  size?: 'sm' | 'md' | 'lg';
  isStreaming?: boolean;
}

const RubraAvatar: React.FC<RubraAvatarProps> = ({ variant, size = 'md', isStreaming = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 20,
  };

  if (variant === 'user') {
    return (
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#8ab4f8] to-[#9b72cb] flex items-center justify-center flex-shrink-0`}
      >
        <span className="text-white text-xs font-medium">A</span>
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2e]
        border border-[#3c4043]
        flex items-center justify-center flex-shrink-0
        ${isStreaming ? 'animate-pulse-glow' : ''}
      `}
    >
      <Sparkles
        size={iconSizes[size]}
        className={isStreaming ? 'text-[#8ab4f8]' : 'text-[#9aa0a6]'}
      />
    </div>
  );
};

export default RubraAvatar;
