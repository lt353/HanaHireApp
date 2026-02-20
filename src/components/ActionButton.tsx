import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
}

/**
 * ActionButton - Consistent interactive button component
 *
 * Features:
 * - Consistent hover effect (scale 105%)
 * - Consistent press effect (scale 95%)
 * - Smooth 200ms transitions
 * - Multiple size and style variants
 */
export function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: ActionButtonProps) {
  // Base styles - always applied
  const baseStyles = 'font-black uppercase tracking-widest rounded-2xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100';

  // Size variants
  const sizeStyles = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-4 text-sm',
    lg: 'px-8 py-5 text-base h-16',
    xl: 'px-10 py-6 text-xl h-20'
  };

  // Color/style variants
  const variantStyles = {
    primary: 'bg-[#0077BE] text-white border-2 border-[#0077BE]/30 hover:border-[#0077BE] hover:border-4',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    success: 'bg-[#2ECC71] text-white border-2 border-[#2ECC71]/30 hover:border-[#1a7a3e] hover:border-4',
    danger: 'bg-[#FF6B6B] text-white hover:bg-[#FF6B6B]/90',
    outline: 'bg-white border-2 border-gray-200 text-gray-700 hover:border-[#0077BE] hover:border-4 hover:bg-[#0077BE]/5'
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
