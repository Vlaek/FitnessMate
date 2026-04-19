'use client';

import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import * as React from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from './utils';

interface DatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  todayLabel?: string;
  clearLabel?: string;
  className?: string;
}

const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0];

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputValue(value?: string): Date | null {
  if (!value) return null;
  const parts = value.split('-').map(Number);
  if (parts.length !== 3) return null;
  const [year, month, day] = parts;
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day, 12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function formatDisplayDate(value?: string): string {
  const parsed = parseInputValue(value);
  if (!parsed) return '';
  return new Intl.DateTimeFormat(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(parsed);
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  todayLabel = 'Today',
  clearLabel = 'Clear',
  className,
}: DatePickerProps) {
  const selectedDate = React.useMemo(() => parseInputValue(value), [value]);
  const [open, setOpen] = React.useState(false);
  const [visibleMonth, setVisibleMonth] = React.useState<Date>(() =>
    getMonthStart(selectedDate || new Date()),
  );

  React.useEffect(() => {
    if (open) {
      setVisibleMonth(getMonthStart(selectedDate || new Date()));
    }
  }, [open, selectedDate]);

  const monthTitle = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(visibleMonth);

  const weekdayLabels = WEEK_DAYS.map((weekday) =>
    new Intl.DateTimeFormat(undefined, { weekday: 'short' }).format(new Date(2024, 0, 7 + weekday)),
  );

  const monthStart = getMonthStart(visibleMonth);
  const offset = (monthStart.getDay() + 6) % 7;
  const firstCellDate = new Date(monthStart);
  firstCellDate.setDate(firstCellDate.getDate() - offset);

  const days: Date[] = [];
  for (let index = 0; index < 42; index += 1) {
    const day = new Date(firstCellDate);
    day.setDate(firstCellDate.getDate() + index);
    days.push(day);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span>{value ? formatDisplayDate(value) : placeholder}</span>
          <Calendar className="h-4 w-4 opacity-70" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-3" align="start">
        <div className="mb-3 flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setVisibleMonth(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1, 12, 0, 0, 0),
              )
            }
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium capitalize">{monthTitle}</div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() =>
              setVisibleMonth(
                new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1, 12, 0, 0, 0),
              )
            }
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="mb-1 grid grid-cols-7 gap-1 text-center text-xs text-slate-500">
          {weekdayLabels.map((weekday) => (
            <div key={weekday} className="py-1">
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayValue = toInputValue(day);
            const isCurrentMonth =
              day.getMonth() === visibleMonth.getMonth() &&
              day.getFullYear() === visibleMonth.getFullYear();
            const isSelected = dayValue === value;
            const isToday = dayValue === toInputValue(new Date());

            return (
              <Button
                key={dayValue}
                type="button"
                variant={isSelected ? 'default' : 'ghost'}
                size="sm"
                className={cn(
                  'h-8 px-0 text-xs',
                  !isCurrentMonth && 'text-slate-400',
                  isToday && !isSelected && 'border border-slate-300',
                  isSelected ? 'bg-blue-500 hover:bg-blue-600' : '',
                )}
                onClick={() => {
                  onChange(dayValue);
                  setOpen(false);
                }}
              >
                {day.getDate()}
              </Button>
            );
          })}
        </div>

        <div className="mt-3 flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full bg-blue-500 hover:bg-blue-600"
            onClick={() => onChange(toInputValue(new Date()))}
          >
            {todayLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onChange('')}
          >
            {clearLabel}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
