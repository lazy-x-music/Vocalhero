import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-lg shadow-accent/20 active:scale-[0.98]',
  secondary:
    'bg-bg-elevated text-text hover:bg-bg-tertiary border border-border active:scale-[0.98]',
  ghost: 'text-text-secondary hover:text-text hover:bg-white/5',
  outline: 'border border-border-strong text-text hover:bg-white/5 active:scale-[0.98]',
  danger: 'bg-accent/10 text-accent hover:bg-accent/20 border border-accent/30',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-lg gap-1.5',
  md: 'px-5 py-2.5 text-sm rounded-xl gap-2',
  lg: 'px-6 py-3 text-base rounded-xl gap-2',
  xl: 'px-8 py-4 text-lg rounded-2xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', fullWidth, leftIcon, rightIcon, loading, className = '', children, disabled, ...rest },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none select-none ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
        {...rest}
      >
        {loading ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
