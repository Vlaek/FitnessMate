'use client';

import { Button } from '@repo/ui/components/button';
import { Checkbox } from '@repo/ui/components/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/index';
import { Label } from '@repo/ui/components/label';
import { Textarea } from '@repo/ui/components/textarea';
import { Exercise } from '../interfaces/exercise';

interface WorkoutSessionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  activeWorkout: any;
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
}: WorkoutSessionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto border border-slate-200 shadow-2xl">
        <DialogHeader
          className="-m-6 mb-6 rounded-t-xl bg-blue-600 p-5"
          style={{ borderRadius: '0.5rem 0.5rem 0 0' }}
        >
          <DialogTitle className="text-2xl font-bold text-white">
            Workout: {activeWorkout?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="mb-6">
          <Label className="text-slate-700">Description</Label>
          <Textarea
            value={workoutDescription}
            onChange={(e) => setWorkoutDescription(e.target.value)}
            placeholder="How did your workout go?"
            className="mt-1 min-h-25 w-full rounded-lg border border-slate-300 p-3"
          />
        </div>

        <div className="mb-6 flex items-center rounded-lg bg-blue-50 p-4">
          <Checkbox
            id="weekday-prefix"
            checked={useWeekdayPrefix}
            onCheckedChange={(checked) => setUseWeekdayPrefix(!!checked)}
          />
          <Label htmlFor="weekday-prefix" className="ml-2 text-slate-700">
            Include weekday in post title ({getWeekdayName()})
          </Label>
        </div>

        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <Label className="text-lg text-slate-700">Exercises</Label>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addExercise}
              className="border-slate-300 text-slate-700"
            >
              Add Exercise
            </Button>
          </div>

          {workoutExercises.map((exercise, index) => (
            <div
              key={index}
              className="mb-4 grid grid-cols-12 items-center gap-3 rounded-lg bg-slate-50 p-3"
            >
              <div className="col-span-5">
                <Input
                  value={exercise.name}
                  onChange={(e) => updateExerciseField(index, 'name', e.target.value)}
                  placeholder="Exercise name"
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={exercise.sets}
                  onChange={(e) =>
                    updateExerciseField(index, 'sets', parseInt(e.target.value) || 0)
                  }
                  placeholder="Sets"
                  className="w-full"
                />
              </div>
              <div className="col-span-3">
                <Input
                  type="number"
                  value={exercise.weight}
                  onChange={(e) =>
                    updateExerciseField(index, 'weight', parseFloat(e.target.value) || 0)
                  }
                  placeholder="Weight (kg)"
                  className="w-full"
                />
              </div>
              <div className="col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => removeExercise(index)}
                  disabled={workoutExercises.length <= 1}
                  className="flex h-10 w-full items-center justify-center border-slate-300 text-slate-600 hover:bg-red-50 hover:text-red-600"
                >
                  ×
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-slate-300 px-6 py-2 text-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={handleEndWorkout}
            className="bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Finish & Send Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
