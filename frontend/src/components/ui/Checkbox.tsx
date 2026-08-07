import { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', containerClassName = '', label, id, ...props }, ref) => {
    const inputId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`ui-checkbox-container ${containerClassName}`}>
        <input
          type="checkbox"
          id={inputId}
          ref={ref}
          className={`ui-checkbox ${className}`}
          {...props}
        />
        <label htmlFor={inputId} className="ui-label" style={{ marginBottom: 0, cursor: 'pointer', fontWeight: 'var(--weight-regular)' }}>
          {label}
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
