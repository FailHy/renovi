import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  children: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const baseClass = 'btn';
  const variantClass = variant === 'primary' ? 'btn-primary' 
    : variant === 'secondary' ? 'btn-secondary'
    : variant === 'outline' ? 'btn-outline'
    : variant === 'danger' ? 'btn-danger'
    : variant === 'ghost' ? 'btn-ghost'
    : '';

  return (
    <button 
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}