'use client';

import { Button } from '@repo/ui/components/button';
import { Input } from '@repo/ui/components/input';
import { NumberInput } from '@repo/ui/components/number-input';
import { GripVertical, X } from 'lucide-react';
import { type DragEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type IExercise } from '../interfaces/exercise';
import { ExerciseSelector } from './exercise-selector';

type ExerciseListEditorProps = {
  exercises: IExercise[];
  onExerciseFieldChange: (index: number, field: keyof IExercise, value: string | number) => void;
  onAddExercise: () => void;
  onRemoveExercise: (index: number) => void;
  onReorderExercises: (nextExercises: IExercise[]) => void;
};

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

  const resetDragState = () => {
    setDraggedExerciseId(null);
    setDropTargetExerciseId(null);
  };

  const handleDragStart = (event: DragEvent<HTMLButtonElement>, exerciseId: string) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', exerciseId);
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
      resetDragState();
      return;
    }

    const fromIndex = exercises.findIndex((exercise) => exercise.id === draggedExerciseId);
    const toIndex = exercises.findIndex((exercise) => exercise.id === exerciseId);
    const nextExercises = moveExercise(exercises, fromIndex, toIndex);

    onReorderExercises(nextExercises);
    resetDragState();
  };

  return (
    <div className="overflow-x-auto">
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
            const isDropTarget =
              dropTargetExerciseId === exercise.id && draggedExerciseId !== exercise.id;

            return (
              <tr
                key={exercise.id}
                className={[
                  'border-b border-slate-100 align-top transition-colors',
                  isDragged ? 'opacity-50' : '',
                  isDropTarget ? 'bg-slate-50' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onDragEnter={() => handleDragEnter(exercise.id)}
                onDragOver={(event) => event.preventDefault()}
                onDrop={() => handleDrop(exercise.id)}
              >
                <td className="px-2 py-2">
                  <button
                    type="button"
                    draggable
                    onDragStart={(event) => handleDragStart(event, exercise.id)}
                    onDragEnd={resetDragState}
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
                  <NumberInput
                    id={`weight-${index}`}
                    value={exercise.weight}
                    onChange={(event) =>
                      onExerciseFieldChange(index, 'weight', Number(event.target.value))
                    }
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
    </div>
  );
}
