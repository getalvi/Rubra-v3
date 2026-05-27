import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconButtonProps {
  icon: LucideIcon;
  onClick?: () => void;
  variant?: 'ghost' | 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  tooltip?: string;
  active?: boolean;
}

const IconButton: React.FC<IconButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  className = '',
  tooltip = '',
  active = false,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const variantClasses = {
    ghost: `text-[#9aa0a6] hover:text-[#e8eaed] hover:bg-[#2a2a2e] ${active ? 'text-[#e8eaed] bg-[#2a2a2e]' : ''}`,
    filled: `bg-[#2a2a2e] text-[#e8eaed] hover:bg-[#3c4043] ${active ? 'bg-[#3c4043]' : ''}`,
    outline: `border border-[#3c4043] text-[#9aa0a6] hover:bg-[#2a2a2e] hover:text-[#e8eaed] ${active ? 'bg-[#2a2a2e] text-[#e8eaed]' : ''}`,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${sizeClasses[size]} ${variantClasses[variant]}
        rounded-full flex items-center justify-center
        transition-all duration-150 ease-out
        active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100
        ${className}
      `}
      title={tooltip}
      aria-label={tooltip || 'button'}
    >
      <Icon size={iconSizes[size]} />
    </button>
  );
};

export default IconButton;
