'use client';

import * as React from 'react';
import { Label } from './label';
import { cn } from './utils';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  className?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, labelClassName, wrapperClassName, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = label ? (id ?? generatedId) : id;

    const inputElement = (
      <input
        type={type}
        id={inputId}
        className={cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (!label) {
      return inputElement;
    }

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        <Label htmlFor={inputId} className={labelClassName}>
          {label}
        </Label>
        {inputElement}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
