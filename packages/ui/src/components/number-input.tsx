'use client';

import * as React from 'react';

import { Label } from './label';
import { cn } from './utils';

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className' | 'type'> {
  className?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  ({ className, label, labelClassName, wrapperClassName, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = label ? (id ?? generatedId) : id;

    const inputElement = (
      <input
        type="number"
        id={inputId}
        className={cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
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

NumberInput.displayName = 'NumberInput';

export { NumberInput };
