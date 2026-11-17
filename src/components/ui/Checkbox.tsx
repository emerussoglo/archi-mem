"use client";

import React from 'react';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'> {
  label: string;
  description?: string;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, indeterminate = false, onChange, className = '', id, ...props }, ref) => {
    const checkboxId = id || label.toLowerCase().replace(/\s+/g, '-');
    const [isIndeterminate, setIsIndeterminate] = React.useState(indeterminate);

    React.useEffect(() => {
      setIsIndeterminate(indeterminate);
    }, [indeterminate]);

    const handleRef = React.useCallback((node: HTMLInputElement | null) => {
      if (node) {
        node.indeterminate = isIndeterminate;
      }
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref && typeof ref === 'object') {
        ref.current = node;
      }
    }, [ref, isIndeterminate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (onChange) {
        onChange(e.target.checked);
      }
    };

    return (
      <div className={`checkbox-row ${className}`}>
        <input
          ref={handleRef}
          type="checkbox"
          id={checkboxId}
          className="form-checkbox mt-0.5"
          onChange={handleChange}
          {...props}
        />
        <div className="flex-1 min-w-0">
          <label htmlFor={checkboxId} className="checkbox-label">
            {label}
          </label>
          {description && (
            <p className="checkbox-description">{description}</p>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';