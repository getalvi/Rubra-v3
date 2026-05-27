import React from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'span' | 'div';
}

const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
}) => {
  return (
    <Component className={`gradient-text ${className}`}>
      {children}
    </Component>
  );
};

export default GradientText;
