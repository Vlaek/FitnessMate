import { Button } from '@repo/ui/components/button';
import { DatePicker } from '@repo/ui/components/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { NumberInput } from '@repo/ui/components/number-input';
import { toast } from '@repo/ui/toast';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type IExercise } from '../interfaces/exercise';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';
import { ExerciseSelector } from './exercise-selector';

export function WorkoutHistoryCreateDialog() {
  const { t } = useTranslation('common');
  const isOpen = useModalStore((state) => state.isActive('workoutHistoryCreate'));
  const { closeModal } = useModalStore();
  const { addWorkoutToHistory } = useWorkoutHistoryStore();

  const createEmptyExercise = (): IExercise => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    sets: '3',
    reps: '10',
    weight: 0,
  });

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState<IExercise[]>([createEmptyExercise()]);

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setDate(new Date().toISOString().split('T')[0] || '');
    setExercises([createEmptyExercise()]);
  }, [isOpen]);

  const updateExerciseField = (index: number, field: keyof IExercise, value: string | number) => {
    const updated = [...exercises];
    const current = updated[index];
    if (!current) return;

    if (field === 'name') {
      updated[index] = { ...current, name: value as string };
    } else if (field === 'sets') {
      updated[index] = { ...current, sets: value as string };
    } else if (field === 'reps') {
      updated[index] = { ...current, reps: value as string };
    } else if (field === 'weight') {
      updated[index] = { ...current, weight: Number(value) };
    } else {
      return;
    }

    setExercises(updated);
  };

  const addExercise = () => {
    setExercises([...exercises, createEmptyExercise()]);
  };

  const removeExercise = (index: number) => {
    if (exercises.length <= 1) {
      toast.error(t('atLeastOneExerciseIsRequired'));
      return;
    }

    const updated = [...exercises];
    updated.splice(index, 1);
    setExercises(updated);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error(t('workoutNameIsRequired'));
      return;
    }
    if (!date) {
      toast.error(t('selectDate'));
      return;
    }

    const normalizedExercises = exercises
      .filter((exercise) => exercise.name.trim().length > 0)
      .map((exercise) => ({
        ...exercise,
        sets: exercise.sets || '',
        reps: exercise.reps || '',
        weight: Number(exercise.weight) || 0,
      }));

    if (normalizedExercises.length === 0) {
      toast.error(t('atLeastOneExerciseIsRequired'));
      return;
    }

    addWorkoutToHistory({
      date,
      templateName: name.trim(),
      exercises: normalizedExercises,
    });

    toast.success(t('workoutAddedSuccessfully'));
    closeModal();
  };

  return (
    <Dialog open={isOpen} onOpenChange={closeModal}>
      <DialogContent className="grid max-h-[90vh] max-w-[1200px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>{t('addWorkout')}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Input
                id="history-workout-name"
                label={t('workoutName')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('enterWorkoutName')}
              />
            </div>

            <div>
              <Label>{t('date')}</Label>
              <DatePicker
                value={date}
                onChange={setDate}
                placeholder={t('selectDate')}
                todayLabel={t('today')}
                clearLabel={t('clear')}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-sm font-medium text-slate-600">
                    <th className="w-[260px] px-2 py-2">{t('exerciseName')}</th>
                    <th className="w-24 px-2 py-2">{t('sets')}</th>
                    <th className="w-28 px-2 py-2">{t('repetitions')}</th>
                    <th className="w-28 px-2 py-2">{t('weight')}</th>
                    <th className="w-14 px-2 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {exercises.map((exercise, index) => (
                    <tr key={exercise.id} className="border-b border-slate-100 align-top">
                      <td className="w-[260px] px-2 py-2">
                        <ExerciseSelector
                          value={exercise.name}
                          onChange={(nameKey) => updateExerciseField(index, 'name', nameKey)}
                          placeholder={t('enterExerciseName')}
                          className="w-[260px] max-w-[260px]"
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={exercise.sets}
                          onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                          aria-label={t('sets')}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Input
                          value={exercise.reps || ''}
                          onChange={(e) => updateExerciseField(index, 'reps', e.target.value)}
                          aria-label={t('repetitions')}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <NumberInput
                          value={exercise.weight}
                          onChange={(e) =>
                            updateExerciseField(index, 'weight', Number(e.target.value))
                          }
                          aria-label={t('weight')}
                        />
                      </td>
                      <td className="px-2 py-2">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={() => removeExercise(index)}
                          disabled={exercises.length <= 1}
                        >
                          <X className="size-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td colSpan={5} className="px-2 py-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={addExercise}
                        className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                      >
                        {t('addExercise')}
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
          <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
            {t('workoutWillBeAddedToHistory')}
          </div>

          <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 pt-3">
            <Button type="button" variant="outline" onClick={closeModal} className="w-full">
              {t('cancel')}
            </Button>
            <Button type="button" onClick={handleSave} className="w-full">
              {t('save')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
