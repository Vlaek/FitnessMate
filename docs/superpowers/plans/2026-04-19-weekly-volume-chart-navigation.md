# Weekly Volume Chart Navigation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Monday-Sunday weekly navigation with previous/next arrows to the training volume chart card without changing the rest of analytics.

**Architecture:** Keep the behavior local to the analytics page by introducing a selected-week state, deriving a seven-day Monday-Sunday dataset for the chart, and rendering a compact week navigator in the chart card header. The existing analytics summaries and other cards remain unchanged.

**Tech Stack:** Next.js, React 19, TypeScript, Recharts, dayjs

---

### Task 1: Build Weekly Chart Data Derivation

**Files:**
- Modify: `apps/web/app/analytics/page.tsx`

- [ ] **Step 1: Inspect the existing analytics page data flow and identify the current limited chart dataset**

Read and map:
- where `workoutHistory` is loaded
- how chart data is currently aggregated
- where the current limit on output points is applied

- [ ] **Step 2: Add week helper utilities and selected-week state**

```tsx
const getStartOfWeek = (date: dayjs.Dayjs) => {
  const day = date.day();
  const diffToMonday = day === 0 ? 6 : day - 1;
  return date.subtract(diffToMonday, 'day').startOf('day');
};

const currentWeekStart = getStartOfWeek(dayjs());
const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStart);
```

- [ ] **Step 3: Build a seven-day weekly dataset for the chart**

```tsx
const weeklyVolumeData = useMemo(() => {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = selectedWeekStart.add(index, 'day');
    return {
      date,
      key: date.format('YYYY-MM-DD'),
      label: t(date.format('dddd').toLowerCase()),
      volume: 0,
    };
  });

  const volumeByDate = new Map(days.map((day) => [day.key, 0]));

  workoutHistory.forEach((workout) => {
    const workoutDate = dayjs(workout.date);
    const key = workoutDate.format('YYYY-MM-DD');

    if (!volumeByDate.has(key)) {
      return;
    }

    const totalVolume = workout.exercises.reduce((sum, exercise) => {
      const sets = Number(exercise.sets) || 0;
      const reps = Number(exercise.reps) || 0;
      const weight = Number(exercise.weight) || 0;
      return sum + sets * reps * weight;
    }, 0);

    volumeByDate.set(key, (volumeByDate.get(key) || 0) + totalVolume);
  });

  return days.map((day) => ({
    name: day.label,
    volume: volumeByDate.get(day.key) || 0,
  }));
}, [selectedWeekStart, workoutHistory, t]);
```

- [ ] **Step 4: Run typecheck for the analytics page changes**

Run: `.\node_modules\.bin\tsc.CMD --noEmit`
Expected: PASS

### Task 2: Add Weekly Navigation UI to the Chart Card

**Files:**
- Modify: `apps/web/app/analytics/page.tsx`

- [ ] **Step 1: Add previous and next week handlers**

```tsx
const handlePreviousWeek = () => {
  setSelectedWeekStart((current) => current.subtract(7, 'day'));
};

const handleNextWeek = () => {
  setSelectedWeekStart((current) => {
    const nextWeek = current.add(7, 'day');
    return nextWeek.isAfter(currentWeekStart, 'day') ? current : nextWeek;
  });
};

const isCurrentWeekSelected = selectedWeekStart.isSame(currentWeekStart, 'day');
const selectedWeekLabel = `${selectedWeekStart.format('DD.MM')} - ${selectedWeekStart.add(6, 'day').format('DD.MM')}`;
```

- [ ] **Step 2: Render the week navigator in the volume chart card header**

```tsx
<CardHeader className="flex flex-row items-center justify-between space-y-0">
  <CardTitle>{t('trainingVolumeOverTime')}</CardTitle>
  <div className="flex items-center gap-2">
    <Button type="button" variant="outline" size="icon" onClick={handlePreviousWeek}>
      <ChevronLeft className="size-4" />
    </Button>
    <span className="min-w-[120px] text-center text-sm font-medium text-slate-600">
      {selectedWeekLabel}
    </span>
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleNextWeek}
      disabled={isCurrentWeekSelected}
    >
      <ChevronRight className="size-4" />
    </Button>
  </div>
</CardHeader>
```

- [ ] **Step 3: Point the chart at the new weekly dataset**

```tsx
<BarChart data={weeklyVolumeData}>
```

- [ ] **Step 4: Re-run typecheck**

Run: `.\node_modules\.bin\tsc.CMD --noEmit`
Expected: PASS

### Task 3: Verify Navigation Behavior

**Files:**
- Verify: `apps/web/app/analytics/page.tsx`

- [ ] **Step 1: Confirm no future-week navigation is allowed**

Check that:
- current week disables the right arrow
- navigating backward enables the right arrow again
- returning to current week disables it again

- [ ] **Step 2: Confirm all seven days are always present**

Check that:
- the chart always renders Monday through Sunday
- missing workout days show zero values
- workouts in the selected week are still summed correctly

- [ ] **Step 3: Run final verification**

Run: `.\node_modules\.bin\tsc.CMD --noEmit`
Expected: PASS
