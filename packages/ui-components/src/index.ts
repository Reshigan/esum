/**
 * ESUM Energy Trading Platform - UI Components
 * Shared React component library
 */

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

export interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'default',
  size = 'md',
  className
}) => {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base'
  };

  const statusVariant = (() => {
    const s = status.toLowerCase();
    if (['active', 'approved', 'settled', 'paid', 'completed', 'filled'].includes(s)) return 'success';
    if (['pending', 'open', 'scheduled', 'draft', 'invited'].includes(s)) return 'warning';
    if (['rejected', 'failed', 'disputed', 'terminated', 'cancelled', 'expired'].includes(s)) return 'danger';
    if (['suspended', 'requires_resubmission', 'under_review'].includes(s)) return 'info';
    return 'default';
  })();

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[statusVariant],
        sizeClasses[size],
        className
      )}
    >
      {status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
    </span>
  );
};

// ============================================================================
// CURRENCY DISPLAY COMPONENT
// ============================================================================

export interface CurrencyDisplayProps {
  amount: number;
  showCents?: boolean;
  compact?: boolean;
  className?: string;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  showCents = true,
  compact = false,
  className
}) => {
  const formatZAR = (value: number): string => {
    if (compact) {
      if (value >= 1_000_000) {
        return `R${(value / 1_000_000).toFixed(1)}M`;
      }
      if (value >= 1_000) {
        return `R${(value / 1_000).toFixed(1)}K`;
      }
    }
    
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: showCents ? 2 : 0,
      maximumFractionDigits: showCents ? 2 : 0
    }).format(value);
  };

  return (
    <span className={cn('font-mono', className)}>
      {formatZAR(amount)}
    </span>
  );
};

// ============================================================================
// ENERGY UNIT DISPLAY COMPONENT
// ============================================================================

export interface EnergyUnitDisplayProps {
  value: number;
  unit?: 'kwh' | 'mwh' | 'gwh';
  autoUnit?: boolean;
  decimals?: number;
  className?: string;
}

export const EnergyUnitDisplay: React.FC<EnergyUnitDisplayProps> = ({
  value,
  unit = 'mwh',
  autoUnit = false,
  decimals = 2,
  className
}) => {
  const formatEnergy = (val: number, u: string): string => {
    const formatted = val.toFixed(decimals);
    const unitLabels: Record<string, string> = {
      kwh: 'kWh',
      mwh: 'MWh',
      gwh: 'GWh'
    };
    return `${formatted} ${unitLabels[u]}`;
  };

  const displayValue = autoUnit ? (() => {
    if (value >= 1_000_000) return { value: value / 1_000_000, unit: 'gwh' };
    if (value >= 1_000) return { value: value / 1_000, unit: 'mwh' };
    return { value, unit: 'kwh' };
  })() : { value, unit };

  return (
    <span className={cn('font-mono', className)}>
      {formatEnergy(displayValue.value, displayValue.unit)}
    </span>
  );
};

// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================

export interface EmptyStateProps {
  illustration?: React.ReactNode;
  title: string;
  description: string;
  cta?: {
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  illustration,
  title,
  description,
  cta,
  className
}) => {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center p-12 text-center',
      'bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800',
      className
    )}>
      {illustration || (
        <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {description}
      </p>
      {cta && (
        <button
          onClick={cta.onClick}
          className={cn(
            'px-4 py-2 rounded-md font-medium transition-colors',
            cta.variant === 'secondary'
              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          )}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
};

// ============================================================================
// LOADING SPINNER COMPONENT
// ============================================================================

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-2 border-gray-200 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  );
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'glass';
}

export const Card: React.FC<CardProps> = ({ children, className, variant = 'default' }) => {
  const variantClasses = {
    default: 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800',
    glass: 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-white/20 dark:border-gray-700/50'
  };

  return (
    <div className={cn(
      'rounded-lg shadow-sm',
      variantClasses[variant],
      className
    )}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-b border-gray-200 dark:border-gray-800', className)}>
    {children}
  </div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4', className)}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={cn('px-6 py-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50', className)}>
    {children}
  </div>
);

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  className,
  disabled,
  ...props
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-600/50',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
    outline: 'border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 disabled:bg-red-600/50'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-md transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <LoadingSpinner size="sm" className="mr-2" />
      )}
      {children}
    </button>
  );
};

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-3 py-2 rounded-md border bg-white dark:bg-gray-900',
            'text-gray-900 dark:text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-gray-300 dark:border-gray-700',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// ============================================================================
// EXPORT ALL COMPONENTS
// ============================================================================

export {
  StatusBadge,
  CurrencyDisplay,
  EnergyUnitDisplay,
  EmptyState,
  LoadingSpinner,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Input
};
