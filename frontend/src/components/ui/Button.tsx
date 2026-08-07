import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, AnchorHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface BaseButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
}

type ButtonAsButton = BaseButtonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, keyof BaseButtonProps> & {
  as?: 'button';
};

type ButtonAsAnchor = BaseButtonProps & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof BaseButtonProps> & {
  as: 'a';
};

export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      as = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses = 'ui-button';
    const variantClasses = `ui-button-${variant}`;
    const sizeClasses = `ui-button-${size}`;
    const widthClass = fullWidth ? 'ui-button-full' : '';
    const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${widthClass} ${className}`.trim();

    const innerContent = (
      <>
        {isLoading && <Loader2 className="animate-spin" size={16} />}
        {!isLoading && leftIcon && <span className="btn-icon">{leftIcon}</span>}
        {children}
        {!isLoading && rightIcon && <span className="btn-icon">{rightIcon}</span>}
      </>
    );

    if (as === 'a') {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          className={combinedClasses}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {innerContent}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={combinedClasses}
        disabled={disabled || isLoading}
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {innerContent}
      </button>
    );
  }
);

Button.displayName = 'Button';
