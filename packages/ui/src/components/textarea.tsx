'use client';

import React from 'react';
import { Label } from './label';
import { cn } from './utils';

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  className?: string;
  label?: React.ReactNode;
  labelClassName?: string;
  wrapperClassName?: string;
};

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, labelClassName, wrapperClassName, id, rows, ...props }, ref) => {
    const generatedId = React.useId();
    const textareaId = label ? (id ?? generatedId) : id;

    const textareaElement = (
      <textarea
        id={textareaId}
        rows={rows}
        className={cn(
          'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-20 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          rows && 'resize-none',
          className,
        )}
        ref={ref}
        {...props}
      />
    );

    if (!label) {
      return textareaElement;
    }

    return (
      <div className={cn('space-y-2', wrapperClassName)}>
        <Label htmlFor={textareaId} className={labelClassName}>
          {label}
        </Label>
        {textareaElement}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
