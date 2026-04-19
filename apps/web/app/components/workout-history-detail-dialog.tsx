import { Button } from '@repo/ui/components/button';
import { ConfirmDialog } from '@repo/ui/components/confirm-dialog';
import { DatePicker } from '@repo/ui/components/date-picker';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui/components/dialog';
import { Input } from '@repo/ui/components/input';
import { NumberInput } from '@repo/ui/components/number-input';
import { toast } from '@repo/ui/toast';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { type IExercise } from '../interfaces/exercise';
import { type IWorkoutHistory } from '../interfaces/workout-history';
import { useModalStore } from '../stores/modal-store';
import { useWorkoutHistoryStore } from '../stores/workout-history-store';
import { formatDateDDMMYYYY } from '../utils/workout-text-generator';
import { ExerciseSelector } from './exercise-selector';
import { WorkoutPreview } from './workout-preview';

export function WorkoutHistoryDetailDialog() {
  const { t } = useTranslation('common');
  const isOpen = useModalStore((state) => state.isActive('workoutHistoryDetail'));
  const { activeModal, closeModal } = useModalStore();
  const { updateWorkoutInHistory, deleteWorkoutFromHistory } = useWorkoutHistoryStore();

  const workoutHistory = activeModal.data?.workoutHistory as IWorkoutHistory;
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedDate, setEditedDate] = useState('');
  const [editedExercises, setEditedExercises] = useState<IExercise[]>([]);

  const createEmptyExercise = (): IExercise => ({
    id: Math.random().toString(36).substr(2, 9),
    name: '',
    sets: '3',
    reps: '10',
    weight: 0,
  });

  useEffect(() => {
    if (!workoutHistory) return;

    setEditedName(workoutHistory.templateName || '');
    setEditedDate(workoutHistory.date || '');
    setEditedExercises(
      (workoutHistory.exercises || []).length > 0
        ? workoutHistory.exercises.map((exercise) => ({
            ...exercise,
            sets: exercise.sets?.toString() || '',
            reps: exercise.reps?.toString() || '',
            weight: Number(exercise.weight) || 0,
          }))
        : [createEmptyExercise()],
    );
    setIsEditing(false);
  }, [workoutHistory?.id]);

  const updateExerciseField = (index: number, field: keyof IExercise, value: string | number) => {
    const updatedExercises = [...editedExercises];
    const currentExercise = updatedExercises[index];
    if (!currentExercise) return;

    if (field === 'id') {
      updatedExercises[index] = { ...currentExercise, id: value as string };
    } else if (field === 'name') {
      updatedExercises[index] = { ...currentExercise, name: value as string };
    } else if (field === 'sets') {
      updatedExercises[index] = { ...currentExercise, sets: value as string };
    } else if (field === 'reps') {
      updatedExercises[index] = { ...currentExercise, reps: value as string };
    } else if (field === 'weight') {
      updatedExercises[index] = { ...currentExercise, weight: Number(value) };
    } else {
      return;
    }

    setEditedExercises(updatedExercises);
  };

  const addExercise = () => {
    setEditedExercises([...editedExercises, createEmptyExercise()]);
  };

  const removeExercise = (index: number) => {
    if (editedExercises.length <= 1) {
      toast.error(t('atLeastOneExerciseIsRequired'));
      return;
    }

    const updatedExercises = [...editedExercises];
    updatedExercises.splice(index, 1);
    setEditedExercises(updatedExercises);
  };

  const handleSaveWorkout = () => {
    if (!workoutHistory) return;
    if (!editedName.trim()) {
      toast.error(t('workoutNameIsRequired'));
      return;
    }

    updateWorkoutInHistory(workoutHistory.id, {
      date: editedDate,
      templateName: editedName.trim(),
      exercises: editedExercises.map((exercise) => ({
        ...exercise,
        sets: exercise.sets || '',
        reps: exercise.reps || '',
        weight: Number(exercise.weight) || 0,
      })),
    });

    toast.success(t('workoutUpdatedSuccessfully'));
    setIsEditing(false);
  };

  const handleDeleteWorkout = () => {
    if (!workoutHistory) return;

    deleteWorkoutFromHistory(workoutHistory.id);
    toast.success(t('workoutDeletedSuccessfully'));
    closeModal();
  };

  const previewExercises = isEditing ? editedExercises : (workoutHistory?.exercises ?? []);
  const previewName = isEditing ? editedName : editedName || (workoutHistory?.templateName ?? '');

  return (
    <Dialog open={isOpen && !!workoutHistory} onOpenChange={closeModal}>
      <DialogContent className="grid max-h-[90vh] max-w-[1200px] grid-cols-[1.5fr_1fr] gap-6 overflow-y-auto">
        <div className="space-y-4">
          <DialogHeader>
            <DialogTitle>
              {t('workoutSession')}: {previewName}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {!isEditing ? (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">{t('date')}:</h3>
                {workoutHistory?.date && (
                  <span className="pt-0.5 text-slate-700">
                    {formatDateDDMMYYYY(workoutHistory.date, t)}
                  </span>
                )}
              </div>
            ) : null}

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <h3 className="mb-2 text-lg font-medium">{t('workoutName')}</h3>
                  <Input value={editedName} onChange={(e) => setEditedName(e.target.value)} />
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-medium">{t('date')}</h3>
                  <DatePicker
                    value={editedDate}
                    onChange={setEditedDate}
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
                      {editedExercises.map((exercise, index) => (
                        <tr
                          key={exercise.id || index}
                          className="border-b border-slate-100 align-top"
                        >
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
                              type="text"
                              value={exercise.sets}
                              onChange={(e) => updateExerciseField(index, 'sets', e.target.value)}
                              aria-label={t('sets')}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <Input
                              type="text"
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
                              disabled={editedExercises.length <= 1}
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
            ) : (
              <div>
                <h3 className="text-lg font-medium">{t('exercises')}:</h3>
                <div className="mt-2 space-y-4">
                  {(workoutHistory?.exercises || []).map((exercise, index) => (
                    <div
                      key={exercise.id || index}
                      className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 p-3"
                    >
                      <div className="min-w-[200px] flex-1">
                        <span className="font-medium">{t(exercise.name)}</span>
                      </div>

                      <div className="w-24 text-center whitespace-nowrap">
                        <span className="text-sm text-slate-600">{t('sets')}: </span>
                        <span className="font-medium">{exercise.sets}</span>
                      </div>

                      <div className="w-36 text-center whitespace-nowrap">
                        <span className="text-sm text-slate-600">{t('repetitions')}: </span>
                        <span className="font-medium">{exercise.reps || '-'}</span>
                      </div>

                      <div className="w-24 text-center whitespace-nowrap">
                        <span className="text-sm text-slate-600">{t('weight')}: </span>
                        <span className="font-medium">
                          {exercise.weight} {t('kg')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="sticky top-0 h-full max-h-[calc(100vh-16rem)] border-l border-slate-200 pl-6">
          <h3 className="mb-4 text-lg font-medium">{t('preview')}</h3>
          <WorkoutPreview
            exercises={previewExercises}
            description=""
            templateName={previewName}
            useWeekdayPrefix={false}
          />
          <p className="mt-2 text-xs text-slate-500">{t('historicalWorkoutPreview')}</p>

          <div className="sticky bottom-0 mt-4 grid grid-cols-2 gap-2 pt-3">
            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="w-full"
                >
                  {t('cancel')}
                </Button>
                <Button
                  onClick={handleSaveWorkout}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  {t('save')}
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(true)}
                  className="w-full"
                >
                  {t('edit')}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="w-full"
                >
                  {t('delete')}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title={t('areYouSureYouWantToDeleteThisWorkout')}
        description={t('deleteWorkoutConfirmationDescription')}
        cancelText={t('cancel')}
        confirmText={t('delete')}
        confirmVariant="destructive"
        onConfirm={handleDeleteWorkout}
      />
    </Dialog>
  );
}
