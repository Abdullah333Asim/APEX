import React from 'react';
import { Link } from 'react-router-dom';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface GlassButtonProps {
  variant?: 'primary' | 'secondary';
  active?: boolean;
  to?: string;
  onClick?: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  variant = 'secondary',
  active = false,
  to,
  onClick,
  children,
  className,
  disabled = false,
  type = 'button',
  icon
}) => {
  const baseClasses = clsx(
    'glass-btn',
    variant === 'primary' && 'primary',
    active && 'active-state',
    className
  );

  const innerContent = (
    <>
      <span className="span-1" />
      <span className="span-2" />
      <span className="span-3" />
      <span className="span-4" />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {icon && <span className="text-current opacity-90">{icon}</span>}
        {children}
      </span>
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} onClick={onClick} className={baseClasses}>
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={twMerge(baseClasses, disabled && 'opacity-50 cursor-not-allowed pointer-events-none')}
    >
      {innerContent}
    </button>
  );
};
