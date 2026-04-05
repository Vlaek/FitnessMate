'use client';

import { Check, ChevronsUpDown } from 'lucide-react';
import * as React from 'react';

import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

export interface Option {
  value: string;
  label: string;
  group?: string;
}

interface ComboboxProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ options, value, onChange, placeholder, className, disabled }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState('');

    // Filter options based on search term
    const filteredOptions = React.useMemo(() => {
      if (!searchTerm) return options;

      const term = searchTerm.toLowerCase();
      return options.filter(
        (option) =>
          option.label.toLowerCase().includes(term) ||
          (option.group && option.group.toLowerCase().includes(term)),
      );
    }, [options, searchTerm]);

    // Find current option to display
    const currentOption = options.find((option) => option.value === value);

    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      target.scrollTop += e.deltaY;
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn('w-full justify-between truncate text-left font-normal', className)}
            disabled={disabled}
          >
            <span className="truncate">{currentOption ? currentOption.label : placeholder}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent ref={ref} className="w-full p-0" align="start">
          <div className="p-1">
            <Input
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={placeholder}
              className="mb-2 w-full"
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setOpen(false);
                }
              }}
            />
          </div>
          <div className="max-h-60 overflow-y-auto" onWheel={handleWheel}>
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className="hover:bg-accent hover:text-accent-foreground relative cursor-default py-2 pr-8 pl-2 select-none data-disabled:pointer-events-none data-disabled:opacity-50"
                  onMouseDown={() => onChange(option.value)}
                >
                  <span className="flex items-center">{option.label}</span>
                  {value === option.value && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-2">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground py-2 pl-2 text-sm">No options found</div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    );
  },
);

Combobox.displayName = 'Combobox';

export { Combobox };
