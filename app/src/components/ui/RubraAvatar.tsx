import React from 'react';

interface RubraAvatarProps {
  variant: 'user' | 'ai';
  size?: 'sm' | 'md' | 'lg';
  isStreaming?: boolean;
}

const RubraAvatar: React.FC<RubraAvatarProps> = ({ variant, size = 'md', isStreaming = false }) => {
  const sizeClasses = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  if (variant === 'ai') {
    return (
      <div
        className={`
          ${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0
          bg-gradient-to-br from-[#4285f4] to-[#9b72cb]
          border-2 border-[rgba(138,180,248,0.2)]
          ${isStreaming ? 'animate-pulse-glow' : ''}
        `}
      >
        <img
          src="/rubra_sparkle.png"
          alt="Rubra AI"
          className="w-[60%] h-[60%] object-contain invert brightness-200"
        />
      </div>
    );
  }

  return (
    <div
      className={`
        ${sizeClasses[size]} rounded-full flex items-center justify-center flex-shrink-0
        bg-[#212124] border-2 border-[#282a2c]
      `}
    >
      <svg
        width={size === 'sm' ? 14 : size === 'lg' ? 22 : 18}
        height={size === 'sm' ? 14 : size === 'lg' ? 22 : 18}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#9aa0a6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    </div>
  );
};

export default RubraAvatar;
