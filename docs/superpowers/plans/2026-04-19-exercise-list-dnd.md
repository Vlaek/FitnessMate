# Exercise List Drag and Drop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add drag-and-drop reordering with a visible drag handle to exercise lists in workout modals and introduce smooth modal enter/exit transitions.

**Architecture:** Extract the duplicated exercise-list table into a shared editor component that owns native HTML drag-and-drop behavior and receives form-state callbacks from both modals. Update the shared UI dialog wrapper to animate both overlay and panel using Radix state-based transitions so all modals get consistent open/close motion.

**Tech Stack:** Next.js, React 19, TypeScript, Radix Dialog, Tailwind CSS

---

### Task 1: Extract Shared Exercise List Editor

**Files:**
- Create: `apps/web/app/components/exercise-list-editor.tsx`
- Modify: `apps/web/app/components/template-editor-dialog.tsx`
- Modify: `apps/web/app/components/workout-session-dialog.tsx`

- [ ] **Step 1: Create the shared editor component shell**

```tsx
import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { GripVertical, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IExercise } from '../interfaces/exercise';
import { ExerciseSelector } from './exercise-selector';

type ExerciseListEditorProps = {
  exercises: IExercise[];
  onExerciseFieldChange: (index: number, field: keyof IExercise, value: string | number) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onReorderExercises: (nextExercises: IExercise[]) => void;
};

export function ExerciseListEditor({
  exercises,
  onExerciseFieldChange,
  onAddExercise,
  onRemoveExercise,
  onReorderExercises,
}: ExerciseListEditorProps) {
  const { t } = useTranslation('common');
  const [draggedExerciseId, setDraggedExerciseId] = useState<string | null>(null);
  const [dropTargetExerciseId, setDropTargetExerciseId] = useState<string | null>(null);

  return <div className="overflow-x-auto">{/* table markup goes here */}</div>;
}
```

- [ ] **Step 2: Implement array move helper and drag event handlers**

```tsx
const moveExercise = (items: IExercise[], fromIndex: number, toIndex: number) => {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);

  if (!movedItem) {
    return items;
  }

  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
};

const handleDragStart = (exerciseId: string) => {
  setDraggedExerciseId(exerciseId);
  setDropTargetExerciseId(exerciseId);
};

const handleDragEnter = (exerciseId: string) => {
  if (!draggedExerciseId || draggedExerciseId === exerciseId) {
    return;
  }

  setDropTargetExerciseId(exerciseId);
};

const handleDrop = (exerciseId: string) => {
  if (!draggedExerciseId || draggedExerciseId === exerciseId) {
    setDraggedExerciseId(null);
    setDropTargetExerciseId(null);
    return;
  }

  const fromIndex = exercises.findIndex((exercise) => exercise.id === draggedExerciseId);
  const toIndex = exercises.findIndex((exercise) => exercise.id === exerciseId);
  const nextExercises = moveExercise(exercises, fromIndex, toIndex);

  onReorderExercises(nextExercises);
  setDraggedExerciseId(null);
  setDropTargetExerciseId(null);
};

const handleDragEnd = () => {
  setDraggedExerciseId(null);
  setDropTargetExerciseId(null);
};
```

- [ ] **Step 3: Render the table with a left drag handle column**

```tsx
<table className="min-w-full border-collapse">
  <thead>
    <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
      <th className="w-12 px-2 py-2" />
      <th className="w-[260px] px-2 py-2">{t('exerciseName')}</th>
      <th className="w-24 px-2 py-2">{t('sets')}</th>
      <th className="w-28 px-2 py-2">{t('repetitions')}</th>
      <th className="w-28 px-2 py-2">{t('weight')}</th>
      <th className="w-14 px-2 py-2" />
    </tr>
  </thead>
  <tbody>
    {exercises.map((exercise, index) => {
      const isDragged = draggedExerciseId === exercise.id;
      const isDropTarget = dropTargetExerciseId === exercise.id && draggedExerciseId !== exercise.id;

      return (
        <tr
          key={exercise.id}
          className={[
            'border-b border-slate-100 align-top transition-colors',
            isDragged ? 'opacity-50' : '',
            isDropTarget ? 'bg-slate-50' : '',
          ].join(' ')}
          onDragEnter={() => handleDragEnter(exercise.id)}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => handleDrop(exercise.id)}
        >
          <td className="px-2 py-2">
            <button
              type="button"
              draggable
              onDragStart={() => handleDragStart(exercise.id)}
              onDragEnd={handleDragEnd}
              className="flex h-10 w-10 cursor-grab items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 active:cursor-grabbing"
              aria-label={t('reorderExercises')}
            >
              <GripVertical className="size-4" />
            </button>
          </td>
          <td className="w-[260px] px-2 py-2">
            <ExerciseSelector
              value={exercise.name}
              onChange={(nameKey) => onExerciseFieldChange(index, 'name', nameKey)}
              placeholder={t('enterExerciseName')}
              className="w-[260px] max-w-[260px]"
            />
          </td>
          <td className="px-2 py-2">
            <Input
              id={`sets-${index}`}
              type="text"
              value={exercise.sets}
              onChange={(event) => onExerciseFieldChange(index, 'sets', event.target.value)}
              aria-label={t('sets')}
            />
          </td>
          <td className="px-2 py-2">
            <Input
              id={`reps-${index}`}
              type="text"
              value={exercise.reps || ''}
              onChange={(event) => onExerciseFieldChange(index, 'reps', event.target.value)}
              aria-label={t('repetitions')}
            />
          </td>
          <td className="px-2 py-2">
            <Input
              id={`weight-${index}`}
              type="number"
              value={exercise.weight}
              onChange={(event) => onExerciseFieldChange(index, 'weight', Number(event.target.value))}
              aria-label={t('weight')}
            />
          </td>
          <td className="px-2 py-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => onRemoveExercise(index)}
              disabled={exercises.length <= 1}
            >
              <X className="size-4" />
            </Button>
          </td>
        </tr>
      );
    })}
    <tr>
      <td className="px-2 py-3" colSpan={6}>
        <Button
          type="button"
          variant="outline"
          onClick={onAddExercise}
          className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          {t('addExercise')}
        </Button>
      </td>
    </tr>
  </tbody>
</table>
```

- [ ] **Step 4: Replace duplicated table markup in the dialogs**

```tsx
<ExerciseListEditor
  exercises={exercises}
  onExerciseFieldChange={updateExerciseField}
  onAddExercise={addExercise}
  onRemoveExercise={removeExercise}
  onReorderExercises={setExercises}
/>
```

```tsx
<ExerciseListEditor
  exercises={workoutExercises}
  onExerciseFieldChange={updateExerciseField}
  onAddExercise={addExercise}
  onRemoveExercise={removeExercise}
  onReorderExercises={setWorkoutExercises}
/>
```

- [ ] **Step 5: Run targeted typecheck**

Run: `pnpm --filter @repo/web typecheck`
Expected: PASS with no TypeScript errors from the new shared component usage

### Task 2: Add Smooth Open and Close Transitions to Shared Dialog

**Files:**
- Modify: `packages/ui/src/components/dialog.tsx`

- [ ] **Step 1: Update overlay classes to animate both open and closed states**

```tsx
className={cn(
  'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0',
  'duration-200 motion-reduce:transition-none',
  className,
)}
```

- [ ] **Step 2: Update content classes to animate both open and closed states**

```tsx
className={cn(
  'fixed left-[50%] top-[50%] z-50 grid w-full max-h-[90vh] max-w-lg',
  'translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg',
  'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
  'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
  'duration-200 motion-reduce:transition-none',
  className,
)}
```

- [ ] **Step 3: Run UI package typecheck**

Run: `pnpm --filter @repo/ui typecheck`
Expected: PASS with no component type regressions

### Task 3: Verify the End-to-End Behavior

**Files:**
- Verify: `apps/web/app/components/exercise-list-editor.tsx`
- Verify: `apps/web/app/components/template-editor-dialog.tsx`
- Verify: `apps/web/app/components/workout-session-dialog.tsx`
- Verify: `packages/ui/src/components/dialog.tsx`

- [ ] **Step 1: Run lint/typecheck for the touched app and package**

Run: `pnpm --filter @repo/ui typecheck && pnpm --filter @repo/web typecheck`
Expected: PASS

- [ ] **Step 2: Perform a quick manual verification in the app**

Run: `pnpm --filter @repo/web dev`
Expected:
- template editor modal opens with smooth fade/scale animation
- workout session modal opens with smooth fade/scale animation
- closing either modal also animates smoothly
- drag handle is visible on the left of each exercise row
- drag handle shows `grab`/`grabbing` cursor behavior
- dragging from the handle reorders rows without losing field values
- typing in the inputs still works normally

- [ ] **Step 3: Commit**

```bash
git add apps/web/app/components/exercise-list-editor.tsx apps/web/app/components/template-editor-dialog.tsx apps/web/app/components/workout-session-dialog.tsx packages/ui/src/components/dialog.tsx docs/superpowers/specs/2026-04-19-exercise-list-dnd-design.md docs/superpowers/plans/2026-04-19-exercise-list-dnd.md
git commit -m "feat: add drag and drop exercise reordering"
```
