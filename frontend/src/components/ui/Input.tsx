import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className = '',
      containerClassName = '',
      label,
      helperText,
      error,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorClass = error ? 'ui-input-error' : '';
    
    return (
      <div className={`form-group ${containerClassName}`}>
        {label && (
          <label htmlFor={inputId} className="ui-label">
            {label}
          </label>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {leftIcon && (
            <span style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }}>
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`ui-input ${errorClass} ${className}`}
            style={{ 
              paddingLeft: leftIcon ? '40px' : '16px',
              paddingRight: rightIcon ? '40px' : '16px'
            }}
            {...props}
          />
          {rightIcon && (
            <span style={{ position: 'absolute', right: '12px', color: 'var(--text-tertiary)' }}>
              {rightIcon}
            </span>
          )}
        </div>
        {(error || helperText) && (
          <span className={`ui-helper-text ${error ? 'ui-helper-error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
