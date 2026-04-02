'use client';

import { Button } from '@repo/ui/components/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Exercise } from '../interfaces/exercise';
import { WorkoutTemplate } from '../interfaces/workout-template';

interface WorkoutSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkout: WorkoutTemplate | null;
  workoutExercises: Exercise[];
  workoutDescription: string;
  useWeekdayPrefix: boolean;
  setWorkoutDescription: (desc: string) => void;
  setUseWeekdayPrefix: (use: boolean) => void;
  updateExerciseField: (index: number, field: keyof Exercise, value: string | number) => void;
  addExercise: () => void;
  removeExercise: (index: number) => void;
  handleEndWorkout: () => void;
  getWeekdayName: () => string;
  t: (key: string) => string;
}

export function WorkoutSessionDialog({
  isOpen,
  onClose,
  activeWorkout,
  workoutExercises,
  workoutDescription,
  useWeekdayPrefix,
  setWorkoutDescription,
  setUseWeekdayPrefix,
  updateExerciseField,
  addExercise,
  removeExercise,
  handleEndWorkout,
  getWeekdayName,
  t,
}: WorkoutSessionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto sm:max-w-md lg:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {t('workoutSession')}: {activeWorkout?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="workout-description">{t('workoutDescription')}</Label>
            <Textarea
              id="workout-description"
              value={workoutDescription}
              onChange={(e) => setWorkoutDescription(e.target.value)}
              placeholder={t('describeYourWorkout')}
              className="mt-1 min-h-25"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="use-weekday-prefix"
              checked={useWeekdayPrefix}
              onChange={(e) => setUseWeekdayPrefix(e.target.checked)}
              className="mr-2 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="use-weekday-prefix">
              {t('addWeekdayPrefix')} ({getWeekdayName()})
            </Label>
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t('exercises')}</h3>
              <Button
                type="button"
                variant="outline"
                onClick={addExercise}
                className="border-slate-300 text-slate-700 hover:bg-slate-50"
              >
                {t('addExercise')}
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {workoutExercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor={`exercise-name-${index}`}>{t('exerciseName')}</Label>
                      <Input
                        id={`exercise-name-${index}`}
                        value={exercise.name}
                        onChange={(e) => updateExerciseField(index, 'name', e.target.value)}
                        placeholder={t('enterExerciseName')}
                      />
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Label htmlFor={`sets-${index}`}>{t('sets')}</Label>
                        <Input
                          id={`sets-${index}`}
                          type="number"
                          value={exercise.sets}
                          onChange={(e) =>
                            updateExerciseField(index, 'sets', parseInt(e.target.value))
                          }
                          min="1"
                        />
                      </div>

                      <div className="flex-1">
                        <Label htmlFor={`weight-${index}`}>{t('weight')}</Label>
                        <Input
                          id={`weight-${index}`}
                          type="number"
                          value={exercise.weight}
                          onChange={(e) =>
                            updateExerciseField(index, 'weight', parseInt(e.target.value))
                          }
                          min="0"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => removeExercise(index)}
                      disabled={workoutExercises.length <= 1}
                      className="text-xs"
                    >
                      {t('delete')}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            onClick={handleEndWorkout}
            className="flex-1 bg-green-600 text-white hover:bg-green-700"
          >
            {t('sendReport')}
          </Button>
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            {t('endWorkout')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
