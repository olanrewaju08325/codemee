import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  error?: string;
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className = '',
      containerClassName = '',
      label,
      helperText,
      error,
      id,
      children,
      ...props
    },
    ref
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
    const errorClass = error ? 'ui-input-error' : '';
    
    return (
      <div className={`form-group ${containerClassName}`}>
        {label && (
          <label htmlFor={selectId} className="ui-label">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={`ui-input ${errorClass} ${className}`}
          {...props}
        >
          {children}
        </select>
        {(error || helperText) && (
          <span className={`ui-helper-text ${error ? 'ui-helper-error' : ''}`}>
            {error || helperText}
          </span>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
